"""
Handler Lambda para Gestão do Calendário e Sessões de Remadas.
Gerenciado pelo Subagent 3 (Back-End/API).
"""

import json
import logging
from typing import Any, Dict
from pydantic import ValidationError

from common.models import SessionCreateRequest, SessionStatusUpdate, SessionUpdateRequest, SessionResponse
from common.responses import success_response, error_response, validation_error_response
from common.dynamo_dal import DynamoDAL, ResourceNotFoundError, DALException

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dal = DynamoDAL()

PRIVILEGED_ROLES = {"INSTRUCTOR", "ADMIN"}


def get_user_role(event: Dict[str, Any]) -> str:
    """Extrai o role do usuário a partir dos claims do Cognito (custom:role)."""
    authorizer = event.get("requestContext", {}).get("authorizer", {})
    claims = authorizer.get("claims", {})
    headers = event.get("headers") or {}
    return claims.get("custom:role") or headers.get("X-User-Role") or "ATHLETE"


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    http_method = event.get("httpMethod", "").upper()
    resource = event.get("resource", "")
    path_params = event.get("pathParameters") or {}
    session_id = path_params.get("sessionId")

    # Criar, editar ou alterar status de sessão exige role de Instrutor ou Admin.
    if http_method in ("POST", "PATCH", "PUT") and get_user_role(event) not in PRIVILEGED_ROLES:
        return error_response(
            "Apenas instrutores ou administradores podem gerenciar sessões.",
            status_code=403,
            error_code="FORBIDDEN",
        )

    try:
        # GET /sessions/{sessionId}
        if http_method == "GET" and session_id:
            session = dal.get_session(session_id)
            if not session:
                return error_response(f"Sessão {session_id} não encontrada.", status_code=404, error_code="NOT_FOUND")
            return success_response(session, status_code=200)

        # GET /sessions
        elif http_method == "GET":
            query_params = event.get("queryStringParameters") or {}
            try:
                limit = int(query_params.get("limit", 50))
            except (TypeError, ValueError):
                limit = 50
            sessions = dal.list_sessions(limit=limit)
            return success_response(sessions, status_code=200)

        # POST /sessions
        elif http_method == "POST":
            body_raw = event.get("body") or "{}"
            body_json = json.loads(body_raw) if isinstance(body_raw, str) else body_raw

            validated = SessionCreateRequest.model_validate(body_json)
            created_session = dal.create_session(validated.model_dump())
            return success_response(created_session, status_code=201)

        # PATCH /sessions/{sessionId}/status
        elif http_method == "PATCH" and session_id:
            body_raw = event.get("body") or "{}"
            body_json = json.loads(body_raw) if isinstance(body_raw, str) else body_raw

            validated = SessionStatusUpdate.model_validate(body_json)
            updated = dal.update_session_status(session_id, validated.status.value)
            return success_response(updated, status_code=200)

        # PUT /sessions/{sessionId} — edição de dados cadastrais (não mexe em ocupação)
        elif http_method == "PUT" and session_id:
            body_raw = event.get("body") or "{}"
            body_json = json.loads(body_raw) if isinstance(body_raw, str) else body_raw

            validated = SessionUpdateRequest.model_validate(body_json)
            updates = validated.model_dump(exclude_unset=True, exclude_none=True)
            updated = dal.update_session_fields(session_id, updates)
            return success_response(updated, status_code=200)

        else:
            return error_response(f"Rota ou método {http_method} não suportado.", status_code=404, error_code="NOT_FOUND")

    except ValidationError as e:
        return validation_error_response(e, "Payload de sessão inválido.")
    except ResourceNotFoundError as e:
        return error_response(str(e), status_code=404, error_code="NOT_FOUND")
    except DALException as e:
        return error_response(str(e), status_code=400, error_code="INVALID_UPDATE")
    except Exception as e:
        logger.exception("Erro interno no SessionsFunction")
        return error_response("Erro interno no servidor.", status_code=500, error_code="INTERNAL_ERROR", details=str(e))

