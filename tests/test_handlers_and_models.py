"""
Testes dos Handlers Lambda e Validação Estrita Pydantic.
Gerenciado pelo Subagent 5 (QA e Testes).
"""

import sys
import os
import json

os.environ["AWS_ACCESS_KEY_ID"] = "testing"
os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
os.environ["AWS_SECURITY_TOKEN"] = "testing"
os.environ["AWS_SESSION_TOKEN"] = "testing"
os.environ["AWS_DEFAULT_REGION"] = "us-east-1"
os.environ["TABLE_NAME"] = "VaaFlow-TestTable"

import pytest
import boto3
from moto import mock_aws

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from common.models import SessionCreateRequest, UserProfileUpdate
from handlers import users, sessions, reservations
from common.dynamo_dal import DynamoDAL


@pytest.fixture
def init_dynamo():
    with mock_aws():
        dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
        dynamodb.create_table(
            TableName="VaaFlow-TestTable",
            KeySchema=[
                {"AttributeName": "PK", "KeyType": "HASH"},
                {"AttributeName": "SK", "KeyType": "RANGE"}
            ],
            AttributeDefinitions=[
                {"AttributeName": "PK", "AttributeType": "S"},
                {"AttributeName": "SK", "AttributeType": "S"},
                {"AttributeName": "GSI1PK", "AttributeType": "S"},
                {"AttributeName": "GSI1SK", "AttributeType": "S"}
            ],
            GlobalSecondaryIndexes=[
                {
                    "IndexName": "GSI1",
                    "KeySchema": [
                        {"AttributeName": "GSI1PK", "KeyType": "HASH"},
                        {"AttributeName": "GSI1SK", "KeyType": "RANGE"}
                    ],
                    "Projection": {"ProjectionType": "ALL"}
                }
            ],
            BillingMode="PAY_PER_REQUEST"
        )
        # Aponta os handlers para a tabela deste teste. Sem isso, outro arquivo de
        # teste que mude TABLE_NAME antes (ex.: test_edge_cases) quebra estes testes
        # dependendo da ordem de execução.
        for module in (users, sessions, reservations):
            module.dal = DynamoDAL(table_name="VaaFlow-TestTable", region_name="us-east-1")
        yield dynamodb


def test_users_handler_get_and_put(init_dynamo):
    # GET Inicial
    event_get = {
        "httpMethod": "GET",
        "requestContext": {
            "authorizer": {
                "claims": {"sub": "user-test-1", "email": "teste@vaaflow.org", "name": "Remador Teste"}
            }
        }
    }
    resp_get = users.handler(event_get, None)
    assert resp_get["statusCode"] == 200
    body = json.loads(resp_get["body"])
    assert body["user_id"] == "user-test-1"

    # PUT Atualizando Necessidade de Acessibilidade
    event_put = {
        "httpMethod": "PUT",
        "requestContext": {
            "authorizer": {
                "claims": {"sub": "user-test-1", "email": "teste@vaaflow.org", "name": "Remador Teste"}
            }
        },
        "body": json.dumps({
            "name": "Remador Teste Alterado",
            "has_accessibility_needs": True,
            "accessibility_type": "WHEELCHAIR",
            "notes": "Necessita de apoio na escada de acesso e assento adaptado"
        })
    }
    resp_put = users.handler(event_put, None)
    assert resp_put["statusCode"] == 200
    updated_body = json.loads(resp_put["body"])
    assert updated_body["has_accessibility_needs"] is True
    assert updated_body["accessibility_type"] == "WHEELCHAIR"


def test_sessions_and_reservations_handlers(init_dynamo):
    # 1. Cria Sessão via POST /sessions
    event_create_session = {
        "httpMethod": "POST",
        "requestContext": {
            "authorizer": {
                "claims": {"sub": "user-instrutor-1", "email": "instrutor@vaaflow.org", "name": "Instrutor CPT", "custom:role": "INSTRUCTOR"}
            }
        },
        "body": json.dumps({
            "date": "2026-10-30",
            "time": "06:30",
            "location": "São Sebastião - Centro Histórico",
            "canoe_type": "OC6",
            "total_capacity": 6,
            "max_adapted_seats": 2,
            "instructor_name": "Mestre Navegador"
        })
    }
    resp_create = sessions.handler(event_create_session, None)
    assert resp_create["statusCode"] == 201
    created_session = json.loads(resp_create["body"])
    session_id = created_session["session_id"]

    # 2. Faz Reserva Adaptada via POST /sessions/{sessionId}/reservations
    event_res = {
        "httpMethod": "POST",
        "pathParameters": {"sessionId": session_id},
        "requestContext": {
            "authorizer": {
                "claims": {"sub": "user-atleta-1", "email": "atleta1@vaaflow.org", "name": "Atleta 1"}
            }
        },
        "body": json.dumps({
            "requires_adapted_seat": True,
            "notes": "Cadeirante, embarque com apoio"
        })
    }
    resp_res = reservations.handler(event_res, None)
    assert resp_res["statusCode"] == 201
    res_data = json.loads(resp_res["body"])
    assert res_data["requires_adapted_seat"] is True
    assert res_data["status"] == "CONFIRMED"

    # 3. Listar reservas do usuário via GET /reservations/me
    event_list_me = {
        "httpMethod": "GET",
        "path": "/reservations/me",
        "requestContext": {
            "authorizer": {
                "claims": {"sub": "user-atleta-1", "email": "atleta1@vaaflow.org", "name": "Atleta 1"}
            }
        }
    }
    resp_me = reservations.handler(event_list_me, None)
    assert resp_me["statusCode"] == 200
    my_res = json.loads(resp_me["body"])
    assert len(my_res) == 1



INSTRUCTOR_CTX = {
    "authorizer": {
        "claims": {"sub": "leme-1", "email": "leme@vaaflow.org", "name": "Leme CPT", "custom:role": "LEME"}
    }
}


def _create_session(date, time="07:00", capacity=6):
    event = {
        "httpMethod": "POST",
        "requestContext": INSTRUCTOR_CTX,
        "body": json.dumps({"date": date, "time": time, "total_capacity": capacity, "max_adapted_seats": 1}),
    }
    return sessions.handler(event, None)


def test_sessions_list_returns_created_session(init_dynamo):
    """Regressão: GET /sessions quebrava com NameError (session_id indefinido)
    e o front mostrava dados de exemplo no lugar das remadas reais."""
    created = _create_session("2099-01-10")
    assert created["statusCode"] == 201
    new_id = json.loads(created["body"])["session_id"]

    resp = sessions.handler({"httpMethod": "GET", "queryStringParameters": None}, None)
    assert resp["statusCode"] == 200
    ids = [s["session_id"] for s in json.loads(resp["body"])]
    assert new_id in ids


def test_sessions_list_from_date_hides_past(init_dynamo):
    _create_session("2000-01-01")
    future = json.loads(_create_session("2099-02-02")["body"])["session_id"]

    resp = sessions.handler(
        {"httpMethod": "GET", "queryStringParameters": {"from": "2026-01-01"}}, None
    )
    body = json.loads(resp["body"])
    assert resp["statusCode"] == 200
    assert [s["session_id"] for s in body] == [future]


def test_session_get_by_id_and_status_patch(init_dynamo):
    sid = json.loads(_create_session("2099-03-03")["body"])["session_id"]

    got = sessions.handler({"httpMethod": "GET", "pathParameters": {"sessionId": sid}}, None)
    assert got["statusCode"] == 200

    patched = sessions.handler({
        "httpMethod": "PATCH",
        "pathParameters": {"sessionId": sid},
        "requestContext": INSTRUCTOR_CTX,
        "body": json.dumps({"status": "CANCELLED"}),
    }, None)
    assert patched["statusCode"] == 200
    assert json.loads(patched["body"])["status"] == "CANCELLED"


def test_athlete_cannot_create_session(init_dynamo):
    event = {
        "httpMethod": "POST",
        "requestContext": {"authorizer": {"claims": {"sub": "a1", "custom:role": "ATHLETE"}}},
        "body": json.dumps({"date": "2099-01-01", "time": "07:00"}),
    }
    assert sessions.handler(event, None)["statusCode"] == 403


def test_athlete_cannot_escalate_role_via_header(init_dynamo):
    """Segurança: com token Cognito válido, o perfil vem SÓ do token.
    Um remador sem custom:role não pode virar ADMIN mandando X-User-Role."""
    event = {
        "httpMethod": "POST",
        "headers": {"X-User-Role": "ADMIN"},
        "requestContext": {"authorizer": {"claims": {"sub": "a1", "email": "a@x.org", "name": "Atleta"}}},
        "body": json.dumps({"date": "2099-01-01", "time": "07:00"}),
    }
    assert sessions.handler(event, None)["statusCode"] == 403


def test_athlete_cannot_read_roster_via_header(init_dynamo):
    sid = json.loads(_create_session("2099-04-04")["body"])["session_id"]
    event = {
        "httpMethod": "GET",
        "path": f"/sessions/{sid}/reservations",
        "pathParameters": {"sessionId": sid},
        "headers": {"X-User-Role": "LEME"},
        "requestContext": {"authorizer": {"claims": {"sub": "a1", "email": "a@x.org", "name": "Atleta"}}},
    }
    assert reservations.handler(event, None)["statusCode"] == 403


# ---------------------------------------------------------------------------
# Lemes múltiplos, convidados e retirada de participante pelo leme
# ---------------------------------------------------------------------------
LEME_CTX = {"authorizer": {"claims": {"sub": "leme-1", "email": "leme@x.org", "name": "Leme Um", "custom:role": "LEME"}}}
ATHLETE_CTX = {"authorizer": {"claims": {"sub": "ath-1", "email": "a@x.org", "name": "Atleta", "custom:role": "ATHLETE"}}}


def _guest(sid, ctx, name="Convidado Teste", adapted=False):
    return reservations.handler({
        "httpMethod": "POST",
        "path": f"/sessions/{sid}/guests",
        "pathParameters": {"sessionId": sid},
        "requestContext": ctx,
        "body": json.dumps({"name": name, "phone": "12999990000", "requires_adapted_seat": adapted}),
    }, None)


def test_session_with_multiple_lemes_and_edit(init_dynamo):
    created = sessions.handler({
        "httpMethod": "POST",
        "requestContext": LEME_CTX,
        "body": json.dumps({"date": "2099-05-05", "time": "07:00", "lemes": ["Ana", " ana ", "Bruno", ""]}),
    }, None)
    assert created["statusCode"] == 201
    body = json.loads(created["body"])
    assert body["lemes"] == ["Ana", "Bruno"]
    assert body["instructor_name"] == "Ana, Bruno"

    # Leme edita a remada já aberta
    edited = sessions.handler({
        "httpMethod": "PUT",
        "pathParameters": {"sessionId": body["session_id"]},
        "requestContext": LEME_CTX,
        "body": json.dumps({"lemes": ["Carla"], "time": "08:00"}),
    }, None)
    assert edited["statusCode"] == 200
    e = json.loads(edited["body"])
    assert e["lemes"] == ["Carla"] and e["instructor_name"] == "Carla" and e["time"] == "08:00"


def test_leme_adds_guest_and_guest_takes_a_seat(init_dynamo):
    sid = json.loads(_create_session("2099-06-06", capacity=2)["body"])["session_id"]

    r = _guest(sid, LEME_CTX)
    assert r["statusCode"] == 201
    g = json.loads(r["body"])
    assert g["is_guest"] is True and g["user_id"].startswith("GUEST-") and g["added_by"] == "Leme Um"

    _guest(sid, LEME_CTX, name="Outro Convidado")
    # Lotou: terceiro convidado é barrado pela mesma trava atômica
    assert _guest(sid, LEME_CTX, name="Terceiro")["statusCode"] == 409

    roster = json.loads(reservations.handler({
        "httpMethod": "GET", "path": f"/sessions/{sid}/reservations",
        "pathParameters": {"sessionId": sid}, "requestContext": LEME_CTX,
    }, None)["body"])
    assert len(roster) == 2 and all(x["is_guest"] for x in roster)


def test_athlete_cannot_add_guest(init_dynamo):
    sid = json.loads(_create_session("2099-07-07")["body"])["session_id"]
    assert _guest(sid, ATHLETE_CTX)["statusCode"] == 403


def test_leme_removes_guest_and_frees_seat(init_dynamo):
    sid = json.loads(_create_session("2099-08-08", capacity=1)["body"])["session_id"]
    gid = json.loads(_guest(sid, LEME_CTX)["body"])["user_id"]

    resp = reservations.handler({
        "httpMethod": "DELETE",
        "path": f"/sessions/{sid}/reservations/{gid}",
        "pathParameters": {"sessionId": sid, "userId": gid},
        "requestContext": LEME_CTX,
    }, None)
    assert resp["statusCode"] == 200
    session = json.loads(sessions.handler({"httpMethod": "GET", "pathParameters": {"sessionId": sid}}, None)["body"])
    assert session["booked_seats"] == 0


def test_athlete_cannot_remove_someone_else(init_dynamo):
    """Remador comum que manda o ID de outra pessoa na URL só consegue mexer na própria vaga."""
    sid = json.loads(_create_session("2099-09-09")["body"])["session_id"]
    gid = json.loads(_guest(sid, LEME_CTX)["body"])["user_id"]

    resp = reservations.handler({
        "httpMethod": "DELETE",
        "path": f"/sessions/{sid}/reservations/{gid}",
        "pathParameters": {"sessionId": sid, "userId": gid},
        "requestContext": ATHLETE_CTX,
    }, None)
    assert resp["statusCode"] == 404  # não tem vaga própria; o convidado continua lá
    session = json.loads(sessions.handler({"httpMethod": "GET", "pathParameters": {"sessionId": sid}}, None)["body"])
    assert session["booked_seats"] == 1


def test_any_leme_can_cancel_session(init_dynamo):
    sid = json.loads(_create_session("2099-10-10")["body"])["session_id"]
    other_leme = {"authorizer": {"claims": {"sub": "leme-2", "name": "Leme Dois", "custom:role": "LEME"}}}
    resp = sessions.handler({
        "httpMethod": "PATCH",
        "pathParameters": {"sessionId": sid},
        "requestContext": other_leme,
        "body": json.dumps({"status": "CANCELLED"}),
    }, None)
    assert resp["statusCode"] == 200


def test_leme_cancels_own_reservation_with_legacy_url(init_dynamo):
    """Versões antigas do app mandam 'user-demo-me' na URL; para o leme isso
    continua significando a própria vaga (não um terceiro)."""
    sid = json.loads(_create_session("2099-11-11")["body"])["session_id"]
    reservations.handler({
        "httpMethod": "POST", "path": f"/sessions/{sid}/reservations",
        "pathParameters": {"sessionId": sid}, "requestContext": LEME_CTX, "body": "{}",
    }, None)
    resp = reservations.handler({
        "httpMethod": "DELETE", "path": f"/sessions/{sid}/reservations/user-demo-me",
        "pathParameters": {"sessionId": sid, "userId": "user-demo-me"}, "requestContext": LEME_CTX,
    }, None)
    assert resp["statusCode"] == 200
