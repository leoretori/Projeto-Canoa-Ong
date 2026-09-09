"""
Testes de Casos de Borda, Validação Pydantic e Lotação Mista.
Gerenciado pelo Subagent 5 (QA e Testes).
"""

import sys
import os
import pytest
from pydantic import ValidationError

os.environ["AWS_ACCESS_KEY_ID"] = "testing"
os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
os.environ["AWS_SECURITY_TOKEN"] = "testing"
os.environ["AWS_SESSION_TOKEN"] = "testing"
os.environ["AWS_DEFAULT_REGION"] = "us-east-1"
os.environ["TABLE_NAME"] = "VaaFlow-EdgeTable"

import boto3
from moto import mock_aws

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from common.dynamo_dal import DynamoDAL, OverbookingError, DuplicateReservationError
from common.models import SessionCreateRequest, UserProfileUpdate


@pytest.fixture
def edge_table():
    with mock_aws():
        dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
        table = dynamodb.create_table(
            TableName="VaaFlow-EdgeTable",
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
        yield table


def test_mixed_capacity_oc6_full_booking(edge_table):
    """Testa preenchimento total de uma OC6 com 4 vagas convencionais e 2 adaptadas."""
    dal = DynamoDAL(table_name="VaaFlow-EdgeTable")
    
    session = dal.create_session({
        "date": "2026-11-01",
        "time": "06:00",
        "total_capacity": 6,
        "max_adapted_seats": 2
    })
    session_id = session["session_id"]

    # 4 vagas convencionais
    for i in range(1, 5):
        res = dal.create_reservation_atomic(
            session_id=session_id,
            user_id=f"remador-convencional-{i}",
            user_name=f"Convencional {i}",
            user_email=f"conv{i}@cpt.org",
            requires_adapted_seat=False
        )
        assert res["status"] == "CONFIRMED"

    # 2 vagas adaptadas para cadeirantes
    for i in range(1, 3):
        res = dal.create_reservation_atomic(
            session_id=session_id,
            user_id=f"remador-adaptado-{i}",
            user_name=f"Adaptado {i}",
            user_email=f"adapt{i}@cpt.org",
            requires_adapted_seat=True
        )
        assert res["status"] == "CONFIRMED"

    # Verifica lotação exata da canoa (6/6 e 2/2)
    current = dal.get_session(session_id)
    assert current["booked_seats"] == 6
    assert current["booked_adapted_seats"] == 2

    # Tentativa de 7º remador convencional deve falhar
    with pytest.raises(OverbookingError):
        dal.create_reservation_atomic(
            session_id=session_id,
            user_id="remador-extra-7",
            user_name="Remador Extra",
            user_email="extra@cpt.org",
            requires_adapted_seat=False
        )

    # Tentativa de 7º remador adaptado deve falhar
    with pytest.raises(OverbookingError):
        dal.create_reservation_atomic(
            session_id=session_id,
            user_id="remador-extra-adapt-7",
            user_name="Remador Extra Adapt",
            user_email="extra_adapt@cpt.org",
            requires_adapted_seat=True
        )


def test_adapted_seat_limit_reached_with_general_seats_open(edge_table):
    """Garante que quando a cota adaptada esgota, apenas novas vagas adaptadas são bloqueadas."""
    dal = DynamoDAL(table_name="VaaFlow-EdgeTable")
    
    # Sessão com 6 vagas no total, mas apenas 1 assento adaptado
    session = dal.create_session({
        "date": "2026-11-02",
        "time": "08:00",
        "total_capacity": 6,
        "max_adapted_seats": 1
    })
    session_id = session["session_id"]

    # Remador 1 ocupa o único assento adaptado
    dal.create_reservation_atomic(
        session_id=session_id,
        user_id="atleta-cadeirante-1",
        user_name="Cadeirante 1",
        user_email="cad1@cpt.org",
        requires_adapted_seat=True
    )

    # Remador 2 tenta outro assento adaptado -> Bloqueado!
    with pytest.raises(OverbookingError) as exc_info:
        dal.create_reservation_atomic(
            session_id=session_id,
            user_id="atleta-cadeirante-2",
            user_name="Cadeirante 2",
            user_email="cad2@cpt.org",
            requires_adapted_seat=True
        )
    assert "adaptados" in str(exc_info.value).lower()

    # Remador 3 solicita vaga convencional -> DEVE PASSAR (ainda restam 5 vagas gerais)!
    res_conv = dal.create_reservation_atomic(
        session_id=session_id,
        user_id="atleta-convencional-3",
        user_name="Convencional 3",
        user_email="conv3@cpt.org",
        requires_adapted_seat=False
    )
    assert res_conv["status"] == "CONFIRMED"

    updated = dal.get_session(session_id)
    assert updated["booked_seats"] == 2
    assert updated["booked_adapted_seats"] == 1


def test_pydantic_schema_strict_validations():
    """Valida rejeição imediata de dados corrompidos pelo Pydantic."""
    # Data no formato errado
    with pytest.raises(ValidationError):
        SessionCreateRequest(
            date="25/10/2026", # Formato inválido (exige YYYY-MM-DD)
            time="06:00",
            location="Praia Grande",
            total_capacity=6,
            max_adapted_seats=2
        )

    # Capacidade zero ou negativa
    with pytest.raises(ValidationError):
        SessionCreateRequest(
            date="2026-10-25",
            time="06:00",
            location="Praia Grande",
            total_capacity=0, # ge=1 violado
            max_adapted_seats=2
        )

    # Campos extras proibidos em UserProfileUpdate
    with pytest.raises(ValidationError):
        UserProfileUpdate.model_validate({
            "name": "Nome Válido",
            "campo_proibido_injecao": "dados indevidos"
        })
