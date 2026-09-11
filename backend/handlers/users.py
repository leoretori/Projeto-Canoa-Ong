"""
Handler Lambda para Gestão de Perfis de Usuários e Necessidades de Acessibilidade.
Gerenciado pelo Subagent 3 (Back-End/API).
"""

import json
import logging
from typing import Any, Dict
from pydantic import ValidationError

from common.models import UserProfileUpdate, UserProfileResponse, AccessibilityType, UserRole
from common.responses import success_response, error_response, validation_error_response
from common.dynamo_dal import DynamoDAL

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dal = DynamoDAL()


def get_user_from_event(event: Dict[str, Any]) -> Dict[str, str]:
    """Extrai informações do usuário a partir dos claims do Amazon Cognito."""
    authorizer = event.get("requestContext", {}).get("authorizer", {})
    claims = authorizer.get("claims", {})
    
    # Fallback para desenvolvimento / testes locais
    headers = event.get("headers") or {}
    user_id = claims.get("sub") or headers.get("X-User-Id") or headers.get("x-user-id") or "mock-user-123"
    email = claims.get("email") or headers.get("X-User-Email") or headers.get("x-user-email") or "remador@vaaflow.org"
    name = claims.get("name") or headers.get("X-User-Name") or headers.get("x-user-name") or "Remador CPT"
    
    return {"user_id": user_id, "email": email, "name": name}


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    http_method = event.get("httpMethod", "").upper()
    user_info = get_user_from_event(event)
    user_id = user_info["user_id"]

    try:
        if http_method == "GET":
            profile = dal.get_user_profile(user_id)
            if not profile:
                # Retorna perfil padrão inicial se não registrado na tabela
                profile = {
                    "user_id": user_id,
                    "email": user_info["email"],
                    "name": user_info["name"],
                    "phone": None,
                    "has_accessibility_needs": False,
                    "accessibility_type": AccessibilityType.NONE.value,
                    "role": UserRole.ATHLETE.value,
                    "notes": None,
                    "created_at": "2026-09-09T00:00:00Z"
                }
            return success_response(profile, status_code=200)

        elif http_method == "PUT":
            body_raw = event.get("body") or "{}"
            if isinstance(body_raw, str):
                body_json = json.loads(body_raw)
            else:
                body_json = body_raw

            validated = UserProfileUpdate.model_validate(body_json)
            update_data = validated.model_dump(exclude_unset=True)
            update_data["email"] = user_info["email"]
            update_data["name"] = validated.name or user_info["name"]

            saved_profile = dal.upsert_user_profile(user_id, update_data)
            return success_response(saved_profile, status_code=200)

        else:
            return error_response(f"Método {http_method} não suportado.", status_code=405, error_code="METHOD_NOT_ALLOWED")

    except ValidationError as e:
        return validation_error_response(e, "Payload de usuário inválido.")
    except Exception as e:
        logger.exception("Erro interno no UsersFunction")
        return error_response("Erro interno no servidor.", status_code=500, error_code="INTERNAL_ERROR", details=str(e))

