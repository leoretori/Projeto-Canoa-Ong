"""
Camada de Acesso a Dados (DAL) do Amazon DynamoDB - Single Table Design.
Gerenciado pelo Subagent 4 (Banco de Dados).
Regra Crítica: Travas contra Overbooking (Cadeiras Convencionais e Adaptadas)
implementadas via Transações Atômicas (TransactWriteItems / ConditionExpression).
"""

import os
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import boto3
from botocore.exceptions import ClientError


class DALException(Exception):
    """Exceção base da DAL."""
    pass


class ResourceNotFoundError(DALException):
    """Recurso não encontrado."""
    pass


class DuplicateReservationError(DALException):
    """Usuário já possui reserva confirmada nesta sessão."""
    pass


class OverbookingError(DALException):
    """Capacidade esgotada (vagas gerais ou assentos adaptados)."""
    pass


class SessionClosedError(DALException):
    """Sessão não está aberta para agendamentos."""
    pass


class DynamoDAL:
    def __init__(
        self, 
        table_name: Optional[str] = None, 
        dynamodb_resource: Optional[Any] = None,
        region_name: Optional[str] = None
    ):
        self.table_name = table_name or os.environ.get("TABLE_NAME", "VaaFlow-dev")
        self.region_name = region_name or os.environ.get("AWS_REGION") or os.environ.get("AWS_DEFAULT_REGION") or "us-east-1"
        if dynamodb_resource:
            self.dynamodb = dynamodb_resource
            self.table = self.dynamodb.Table(self.table_name)
            self.client = self.dynamodb.meta.client
        else:
            self.dynamodb = boto3.resource("dynamodb", region_name=self.region_name)
            self.table = self.dynamodb.Table(self.table_name)
            self.client = boto3.client("dynamodb", region_name=self.region_name)

    # ========================================================================
    # 1. GESTÃO DE PERFIS DE USUÁRIOS
    # ========================================================================

    def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        pk = f"USER#{user_id}"
        sk = "PROFILE"
        response = self.table.get_item(Key={"PK": pk, "SK": sk})
        return response.get("Item")

    def upsert_user_profile(self, user_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        pk = f"USER#{user_id}"
        sk = "PROFILE"
        now = datetime.now(timezone.utc).isoformat()
        
        item = {
            "PK": pk,
            "SK": sk,
            "user_id": user_id,
            "updated_at": now,
            **profile_data
        }
        if "created_at" not in item:
            item["created_at"] = now

        self.table.put_item(Item=item)
        return item

    # ========================================================================
    # 2. GESTÃO DE SESSÕES / REMADAS
    # ========================================================================

    def create_session(self, session_data: Dict[str, Any]) -> Dict[str, Any]:
        session_id = session_data.get("session_id") or str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        
        pk = f"SESSION#{session_id}"
        sk = "METADATA"
        gsi1_pk = "SESSIONS"
        gsi1_sk = f"{session_data['date']}#{session_data['time']}"

        item = {
            "PK": pk,
            "SK": sk,
            "GSI1PK": gsi1_pk,
            "GSI1SK": gsi1_sk,
            "session_id": session_id,
            "date": session_data["date"],
            "time": session_data["time"],
            "location": session_data.get("location", "Praia Grande - São Sebastião"),
            "canoe_type": session_data.get("canoe_type", "OC6"),
            "total_capacity": int(session_data.get("total_capacity", 6)),
            "booked_seats": 0,
            "max_adapted_seats": int(session_data.get("max_adapted_seats", 2)),
            "booked_adapted_seats": 0,
            "status": session_data.get("status", "OPEN"),
            "instructor_name": session_data.get("instructor_name"),
            "notes": session_data.get("notes"),
            "created_at": now
        }

        self.table.put_item(Item=item)
        return item

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        pk = f"SESSION#{session_id}"
        sk = "METADATA"
        response = self.table.get_item(Key={"PK": pk, "SK": sk})
        return response.get("Item")

    def list_sessions(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Lista próximas sessões ordenadas por Data#Hora via GSI1."""
        response = self.table.query(
            IndexName="GSI1",
            KeyConditionExpression="GSI1PK = :gsi1pk",
            ExpressionAttributeValues={":gsi1pk": "SESSIONS"},
            ScanIndexForward=True,
            Limit=limit
        )
        return response.get("Items", [])

    def update_session_status(self, session_id: str, new_status: str) -> Dict[str, Any]:
        pk = f"SESSION#{session_id}"
        sk = "METADATA"
        try:
            response = self.table.update_item(
                Key={"PK": pk, "SK": sk},
                UpdateExpression="SET #s = :status",
                ExpressionAttributeNames={"#s": "status"},
                ExpressionAttributeValues={":status": new_status},
                ConditionExpression="attribute_exists(PK)",
                ReturnValues="ALL_NEW"
            )
            return response.get("Attributes", {})
        except ClientError as e:
            if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
                raise ResourceNotFoundError(f"Sessão {session_id} não encontrada.")
            raise e

    # ========================================================================
    # 3. TRANSAÇÃO ATÔMICA DE RESERVA (CONTROLE DE OVERBOOKING)
    # ========================================================================

    def create_reservation_atomic(
        self,
        session_id: str,
        user_id: str,
        user_name: str,
        user_email: str,
        requires_adapted_seat: bool = False,
        notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executa reserva atômica via TransactWriteItems:
        1. Cria item de reserva garantindo que o usuário não esteja duplicado.
        2. Incrementa booked_seats (e booked_adapted_seats se aplicável) condicionado a:
           - Sessão aberta (status = OPEN)
           - booked_seats < total_capacity
           - booked_adapted_seats < max_adapted_seats (caso seja vaga adaptada)
        """
        reservation_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        
        session_pk = f"SESSION#{session_id}"
        session_sk = "METADATA"
        res_pk = f"SESSION#{session_id}"
        res_sk = f"RES#{user_id}"

        res_item = {
            "PK": {"S": res_pk},
            "SK": {"S": res_sk},
            "GSI1PK": {"S": f"USER#{user_id}"},
            "GSI1SK": {"S": f"RES#{session_id}"},
            "reservation_id": {"S": reservation_id},
            "session_id": {"S": session_id},
            "user_id": {"S": user_id},
            "user_name": {"S": user_name},
            "user_email": {"S": user_email},
            "requires_adapted_seat": {"BOOL": bool(requires_adapted_seat)},
            "status": {"S": "CONFIRMED"},
            "created_at": {"S": now}
        }
        if notes:
            res_item["notes"] = {"S": notes}

        # Configuração da transação
        put_reservation_action = {
            "Put": {
                "TableName": self.table_name,
                "Item": res_item,
                "ConditionExpression": "attribute_not_exists(PK)"
            }
        }

        if requires_adapted_seat:
            update_session_action = {
                "Update": {
                    "TableName": self.table_name,
                    "Key": {"PK": {"S": session_pk}, "SK": {"S": session_sk}},
                    "UpdateExpression": "SET booked_seats = booked_seats + :inc, booked_adapted_seats = booked_adapted_seats + :inc",
                    "ConditionExpression": (
                        "attribute_exists(PK) AND #st = :open AND "
                        "booked_seats < total_capacity AND "
                        "booked_adapted_seats < max_adapted_seats"
                    ),
                    "ExpressionAttributeNames": {"#st": "status"},
                    "ExpressionAttributeValues": {
                        ":inc": {"N": "1"},
                        ":open": {"S": "OPEN"}
                    }
                }
            }
        else:
            update_session_action = {
                "Update": {
                    "TableName": self.table_name,
                    "Key": {"PK": {"S": session_pk}, "SK": {"S": session_sk}},
                    "UpdateExpression": "SET booked_seats = booked_seats + :inc",
                    "ConditionExpression": (
                        "attribute_exists(PK) AND #st = :open AND "
                        "booked_seats < total_capacity"
                    ),
                    "ExpressionAttributeNames": {"#st": "status"},
                    "ExpressionAttributeValues": {
                        ":inc": {"N": "1"},
                        ":open": {"S": "OPEN"}
                    }
                }
            }

        try:
            self.client.transact_write_items(
                TransactItems=[put_reservation_action, update_session_action]
            )
        except ClientError as e:
            if e.response["Error"]["Code"] == "TransactionCanceledException":
                reasons = e.response.get("CancellationReasons", [])
                # Verifica razão 0: Put da reserva (duplicidade)
                if reasons and len(reasons) > 0 and reasons[0].get("Code") == "ConditionalCheckFailed":
                    raise DuplicateReservationError(f"Usuário {user_id} já possui vaga reservada nesta sessão.")
                
                # Verifica razão 1: Update da sessão (capacidade ou status)
                if reasons and len(reasons) > 1 and reasons[1].get("Code") == "ConditionalCheckFailed":
                    session = self.get_session(session_id)
                    if not session:
                        raise ResourceNotFoundError(f"Sessão {session_id} não encontrada.")
                    if session.get("status") != "OPEN":
                        raise SessionClosedError(f"Sessão não está aberta (Status atual: {session.get('status')}).")
                    if session.get("booked_seats", 0) >= session.get("total_capacity", 0):
                        raise OverbookingError("Não há vagas convencionais disponíveis nesta canoa.")
                    if requires_adapted_seat and session.get("booked_adapted_seats", 0) >= session.get("max_adapted_seats", 0):
                        raise OverbookingError("Cota de assentos adaptados esgotada para esta remada.")
                    raise OverbookingError("Não foi possível confirmar reserva devido a restrições de capacidade.")

                raise DALException(f"Transação cancelada: {reasons}")
            raise e

        return {
            "reservation_id": reservation_id,
            "session_id": session_id,
            "user_id": user_id,
            "user_name": user_name,
            "user_email": user_email,
            "requires_adapted_seat": requires_adapted_seat,
            "status": "CONFIRMED",
            "notes": notes,
            "created_at": now
        }

    # ========================================================================
    # 4. CANCELAMENTO ATÔMICO DE RESERVA
    # ========================================================================

    def cancel_reservation_atomic(self, session_id: str, user_id: str) -> bool:
        """Remove a reserva e decrementa atomicamente os contadores da sessão."""
        session_pk = f"SESSION#{session_id}"
        session_sk = "METADATA"
        res_pk = f"SESSION#{session_id}"
        res_sk = f"RES#{user_id}"

        # Verifica dados da reserva para saber se ocupava assento adaptado
        existing_res = self.table.get_item(Key={"PK": res_pk, "SK": res_sk}).get("Item")
        if not existing_res:
            raise ResourceNotFoundError(f"Reserva do usuário {user_id} para a sessão {session_id} não encontrada.")

        is_adapted = existing_res.get("requires_adapted_seat", False)

        delete_reservation_action = {
            "Delete": {
                "TableName": self.table_name,
                "Key": {"PK": {"S": res_pk}, "SK": {"S": res_sk}},
                "ConditionExpression": "attribute_exists(PK)"
            }
        }

        if is_adapted:
            update_session_action = {
                "Update": {
                    "TableName": self.table_name,
                    "Key": {"PK": {"S": session_pk}, "SK": {"S": session_sk}},
                    "UpdateExpression": "SET booked_seats = booked_seats - :dec, booked_adapted_seats = booked_adapted_seats - :dec",
                    "ConditionExpression": "attribute_exists(PK) AND booked_seats > :zero AND booked_adapted_seats > :zero",
                    "ExpressionAttributeValues": {
                        ":dec": {"N": "1"},
                        ":zero": {"N": "0"}
                    }
                }
            }
        else:
            update_session_action = {
                "Update": {
                    "TableName": self.table_name,
                    "Key": {"PK": {"S": session_pk}, "SK": {"S": session_sk}},
                    "UpdateExpression": "SET booked_seats = booked_seats - :dec",
                    "ConditionExpression": "attribute_exists(PK) AND booked_seats > :zero",
                    "ExpressionAttributeValues": {
                        ":dec": {"N": "1"},
                        ":zero": {"N": "0"}
                    }
                }
            }

        try:
            self.client.transact_write_items(
                TransactItems=[delete_reservation_action, update_session_action]
            )
            return True
        except ClientError as e:
            if e.response["Error"]["Code"] == "TransactionCanceledException":
                raise DALException("Falha ao cancelar reserva: inconsistência de estado concorrente.")
            raise e

    # ========================================================================
    # 5. LISTAGEM DE RESERVAS POR USUÁRIO (GSI1)
    # ========================================================================

    def list_user_reservations(self, user_id: str) -> List[Dict[str, Any]]:
        response = self.table.query(
            IndexName="GSI1",
            KeyConditionExpression="GSI1PK = :gsi1pk AND begins_with(GSI1SK, :gsi1sk)",
            ExpressionAttributeValues={
                ":gsi1pk": f"USER#{user_id}",
                ":gsi1sk": "RES#"
            }
        )
        return response.get("Items", [])
