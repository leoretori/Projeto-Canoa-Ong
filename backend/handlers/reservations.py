"""
Handler Lambda para Reservas Atômicas, Controle de Concorrência e Cancelamento.
Gerenciado pelo Subagent 3 (Back-End/API) em estrita colaboração com o Subagent 4.
Regra Crítica: Tratamento semântico de Overbooking retornando 409 Conflict.
"""

import json
import logging
from typing import Any, Dict
from pydantic import ValidationError

from common.models import ReservationCreateRequest, ReservationResponse
from common.responses import success_response, error_response
from common.dynamo_dal import (
    DynamoDAL, 
    OverbookingError, 
    DuplicateReservationError, 
    ResourceNotFoundError, 
    SessionClosedError,
    DALException
)

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dal = DynamoDAL()


def get_user_from_event(event: Dict[str, Any]) -> Dict[str, str]:
    """Extrai identidade do remador a partir dos claims do Amazon Cognito."""
    authorizer = event.get("requestContext", {}).get("authorizer", {})
    claims = authorizer.get("claims", {})
    
    headers = event.get("headers") or {}
    user_id = claims.get("sub") or headers.get("X-User-Id") or headers.get("x-user-id") or "mock-user-123"
    email = claims.get("email") or headers.get("X-User-Email") or headers.get("x-user-email") or "atleta@vaaflow.org"
    name = claims.get("name") or headers.get("X-User-Name") or headers.get("x-user-name") or "Atleta Va'a"
    
    return {"user_id": user_id, "email": email, "name": name}


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    http_method = event.get("httpMethod", "").upper()
    path = event.get("path", "")
    path_params = event.get("pathParameters") or {}
    session_id = path_params.get("sessionId")
    user_info = get_user_from_event(event)

    try:
        # POST /sessions/{sessionId}/reservations
        if http_method == "POST" and session_id:
            body_raw = event.get("body") or "{}"
            body_json = json.loads(body_raw) if isinstance(body_raw, str) else body_raw

            validated = ReservationCreateRequest.model_validate(body_json)

            reservation = dal.create_reservation_atomic(
                session_id=session_id,
                user_id=user_info["user_id"],
                user_name=user_info["name"],
                user_email=user_info["email"],
                requires_adapted_seat=validated.requires_adapted_seat,
                notes=validated.notes
            )
            return success_response(reservation, status_code=201)

        # GET /reservations/me
        elif http_method == "GET" and "/reservations/me" in path:
            reservations = dal.list_user_reservations(user_id=user_info["user_id"])
            return success_response(reservations, status_code=200)

        # DELETE /sessions/{sessionId}/reservations/{userId}
        elif http_method == "DELETE" and session_id:
            target_user_id = path_params.get("userId") or user_info["user_id"]
            dal.cancel_reservation_atomic(session_id=session_id, user_id=target_user_id)
            return success_response({"message": "Reserva cancelada com sucesso."}, status_code=200)

        else:
            return error_response(f"Rota ou método {http_method} não suportado.", status_code=404, error_code="NOT_FOUND")

    except ValidationError as e:
        return error_response("Payload de reserva inválido.", status_code=400, error_code="VALIDATION_ERROR", details=e.errors())
    except OverbookingError as e:
        # 409 Conflict crítico contra overbooking
        return error_response(str(e), status_code=409, error_code="OVERBOOKING_CONFLICT")
    except DuplicateReservationError as e:
        return error_response(str(e), status_code=409, error_code="DUPLICATE_RESERVATION")
    except SessionClosedError as e:
        return error_response(str(e), status_code=400, error_code="SESSION_CLOSED")
    except ResourceNotFoundError as e:
        return error_response(str(e), status_code=404, error_code="NOT_FOUND")
    except DALException as e:
        return error_response(str(e), status_code=409, error_code="TRANSACTION_FAILED")
    except Exception as e:
        logger.exception("Erro interno no ReservationsFunction")
        return error_response("Erro interno no servidor.", status_code=500, error_code="INTERNAL_ERROR", details=str(e))
