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

