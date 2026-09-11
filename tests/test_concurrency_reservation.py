"""
Suíte de Testes Automatizados de Concorrência & Overbooking (Va'aFlow).
Gerenciado pelo Subagent 5 (QA e Testes).
Uso obrigatório de Threads para validação de Race Conditions e atomicidade no DynamoDB.
"""

import sys
import os

# Configura ambiente dummy para testes com moto
os.environ["AWS_ACCESS_KEY_ID"] = "testing"
os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
os.environ["AWS_SECURITY_TOKEN"] = "testing"
os.environ["AWS_SESSION_TOKEN"] = "testing"
os.environ["AWS_DEFAULT_REGION"] = "us-east-1"

import pytest
import boto3
from concurrent.futures import ThreadPoolExecutor, as_completed
from moto import mock_aws

# Garante importação dos módulos do backend
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from common.dynamo_dal import (
    DynamoDAL, 
    OverbookingError, 
    DuplicateReservationError,
    ResourceNotFoundError
)
from common.models import SessionCreateRequest, ReservationCreateRequest


TABLE_NAME = "VaaFlow-TestTable"


@pytest.fixture
def dynamodb_table():
    """Cria tabela DynamoDB mockada com Single Table Design e GSI1."""
    with mock_aws():
        dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
        table = dynamodb.create_table(
            TableName=TABLE_NAME,
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


def test_single_reservation_flow(dynamodb_table):
    """Testa criação de sessão e reserva única (convencional e adaptada)."""
    dal = DynamoDAL(table_name=TABLE_NAME)

    # Cria sessão com 6 vagas totais e 2 adaptadas
    session = dal.create_session({
        "date": "2026-10-25",
        "time": "06:00",
        "total_capacity": 6,
        "max_adapted_seats": 2,
        "location": "Praia Grande - São Sebastião"
    })
    session_id = session["session_id"]

    # Reserva adaptada para atleta cadeirante
    res_adapted = dal.create_reservation_atomic(
        session_id=session_id,
        user_id="user-cadeirante-01",
        user_name="Carlos Silva",
        user_email="carlos@cpt.org",
        requires_adapted_seat=True
    )
    assert res_adapted["status"] == "CONFIRMED"
    assert res_adapted["requires_adapted_seat"] is True

    # Verifica ocupação atualizada na sessão
    updated_session = dal.get_session(session_id)
    assert updated_session["booked_seats"] == 1
    assert updated_session["booked_adapted_seats"] == 1


def test_duplicate_user_reservation_prevention(dynamodb_table):
    """Garante que o mesmo usuário não consiga reservar duas vezes na mesma remada."""
    dal = DynamoDAL(table_name=TABLE_NAME)

    session = dal.create_session({
        "date": "2026-10-25",
        "time": "08:00",
        "total_capacity": 6,
        "max_adapted_seats": 2
    })
    session_id = session["session_id"]

    # Primeira reserva com sucesso
    dal.create_reservation_atomic(
        session_id=session_id,
        user_id="user-duplicado-01",
        user_name="Ana Souza",
        user_email="ana@cpt.org",
        requires_adapted_seat=False
    )

    # Segunda tentativa para o mesmo usuário deve falhar
    with pytest.raises(DuplicateReservationError):
        dal.create_reservation_atomic(
            session_id=session_id,
            user_id="user-duplicado-01",
            user_name="Ana Souza",
            user_email="ana@cpt.org",
            requires_adapted_seat=False
        )


def test_concurrency_race_condition_overbooking(dynamodb_table):
    """
    TESTE DE FOGO CRÍTICO (SUBAGENT 5):
    Simula 10 requisições simultâneas via Threads concorrentes disputando
    EXATAMENTE 1 VAGA ADAPTADA em uma canoa.
    
    Critério de Aceite Inegociável:
    - Exatamente 1 thread obtém confirmação (201 Created / CONFIRMED).
    - Exatamente 9 threads recebem OverbookingError (HTTP 409 Conflict).
    - O banco nunca ultrapassa booked_adapted_seats == 1.
    """
    dal = DynamoDAL(table_name=TABLE_NAME)

    # Cria sessão com apenas 1 assento adaptado disponível
    session = dal.create_session({
        "date": "2026-10-25",
        "time": "10:00",
        "total_capacity": 6,
        "max_adapted_seats": 1  # APENAS 1 VAGA ADAPTADA
    })
    session_id = session["session_id"]

    success_count = 0
    overbooking_count = 0
    errors = []

    def attempt_reservation(user_index: int):
        try:
            # DAL isolada por thread
            local_dal = DynamoDAL(table_name=TABLE_NAME)
            res = local_dal.create_reservation_atomic(
                session_id=session_id,
                user_id=f"concurrent-user-{user_index}",
                user_name=f"Atleta Concorrente {user_index}",
                user_email=f"atleta{user_index}@cpt.org",
                requires_adapted_seat=True  # Todos disputando a mesma vaga adaptada
            )
            return "SUCCESS", res
        except OverbookingError as oe:
            return "OVERBOOKING", str(oe)
        except Exception as e:
            return "ERROR", str(e)

    # Dispara 10 threads concorrentes simultaneamente
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(attempt_reservation, i) for i in range(10)]
        for future in as_completed(futures):
            status, payload = future.result()
            if status == "SUCCESS":
                success_count += 1
            elif status == "OVERBOOKING":
                overbooking_count += 1
            else:
                errors.append(payload)

    # Validações estritas de concorrência
    assert errors == [], f"Erros inesperados nas threads: {errors}"
    assert success_count == 1, f"Esperado exatamente 1 sucesso, mas obteve {success_count}!"
    assert overbooking_count == 9, f"Esperados 9 conflitos de overbooking, mas obteve {overbooking_count}!"

    # Verifica integridade atômica da sessão no DynamoDB
    final_session = dal.get_session(session_id)
    assert final_session["booked_seats"] == 1
    assert final_session["booked_adapted_seats"] == 1
    assert final_session["booked_adapted_seats"] <= final_session["max_adapted_seats"]


def test_cancellation_and_seat_release(dynamodb_table):
    """Testa cancelamento atômico e liberação de vaga adaptada para novo remador."""
    dal = DynamoDAL(table_name=TABLE_NAME)

    session = dal.create_session({
        "date": "2026-10-26",
        "time": "07:00",
        "total_capacity": 6,
        "max_adapted_seats": 1
    })
    session_id = session["session_id"]

    # Atleta 1 reserva o único assento adaptado
    dal.create_reservation_atomic(
        session_id=session_id,
        user_id="user-inicial",
        user_name="Remador 1",
        user_email="remador1@cpt.org",
        requires_adapted_seat=True
    )
    s1 = dal.get_session(session_id)
    assert s1["booked_adapted_seats"] == 1

    # Atleta 2 tenta reservar e deve tomar Overbooking
    with pytest.raises(OverbookingError):
        dal.create_reservation_atomic(
            session_id=session_id,
            user_id="user-segundo",
            user_name="Remador 2",
            user_email="remador2@cpt.org",
            requires_adapted_seat=True
        )

    # Atleta 1 cancela a reserva
    cancelled = dal.cancel_reservation_atomic(session_id=session_id, user_id="user-inicial")
    assert cancelled is True

    s2 = dal.get_session(session_id)
    assert s2["booked_adapted_seats"] == 0
    assert s2["booked_seats"] == 0

    # Agora Atleta 2 consegue reservar a vaga liberada
    res2 = dal.create_reservation_atomic(
        session_id=session_id,
        user_id="user-segundo",
        user_name="Remador 2",
        user_email="remador2@cpt.org",
        requires_adapted_seat=True
    )
    assert res2["status"] == "CONFIRMED"
