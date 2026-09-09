"""
Handler Lambda para Gestão do Calendário e Sessões de Remadas.
Gerenciado pelo Subagent 3 (Back-End/API).
"""

import json
import logging
from typing import Any, Dict
from pydantic import ValidationError

from common.models import SessionCreateRequest, SessionStatusUpdate, SessionResponse
from common.responses import success_response, error_response
from common.dynamo_dal import DynamoDAL, ResourceNotFoundError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dal = DynamoDAL()


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    http_method = event.get("httpMethod", "").upper()
    resource = event.get("resource", "")
    path_params = event.get("pathParameters") or {}
    session_id = path_params.get("sessionId")

    try:
        # GET /sessions/{sessionId}
        if http_method == "GET" and session_id:
            session = dal.get_session(session_id)
            if not session:
                return error_response(f"Sessão {session_id} não encontrada.", status_code=404, error_code="NOT_FOUND")
            return success_response(session, status_code=200)

        # GET /sessions
        elif http_method == "GET":
            sessions = dal.list_sessions()
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

        else:
            return error_response(f"Rota ou método {http_method} não suportado.", status_code=404, error_code="NOT_FOUND")

    except ValidationError as e:
        return error_response("Payload de sessão inválido.", status_code=400, error_code="VALIDATION_ERROR", details=e.errors())
    except ResourceNotFoundError as e:
        return error_response(str(e), status_code=404, error_code="NOT_FOUND")
    except Exception as e:
        logger.exception("Erro interno no SessionsFunction")
        return error_response("Erro interno no servidor.", status_code=500, error_code="INTERNAL_ERROR", details=str(e))
