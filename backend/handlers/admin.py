"""
Handler Lambda para Administração de Usuários (gestão de roles via Cognito).
Gerenciado pelo Subagent 3 (Back-End/API).
Acesso restrito a role ADMIN — permite promover/rebaixar Instrutores e Atletas
sem precisar entrar no Console AWS.
"""

import json
import logging
import os
from typing import Any, Dict

import boto3
from botocore.exceptions import ClientError

from common.responses import success_response, error_response

logger = logging.getLogger()
logger.setLevel(logging.INFO)

cognito = boto3.client("cognito-idp")
USER_POOL_ID = os.environ["USER_POOL_ID"]

VALID_ROLES = {"ATHLETE", "INSTRUCTOR", "ADMIN"}


def get_user_role(event: Dict[str, Any]) -> str:
    authorizer = event.get("requestContext", {}).get("authorizer", {})
    claims = authorizer.get("claims", {})
    headers = event.get("headers") or {}
    return claims.get("custom:role") or headers.get("X-User-Role") or "ATHLETE"


def _map_cognito_user(user: Dict[str, Any]) -> Dict[str, Any]:
    attrs = {a["Name"]: a["Value"] for a in user.get("Attributes", [])}
    return {
        "user_id": attrs.get("sub"),
        "email": attrs.get("email"),
        "name": attrs.get("name"),
        "role": attrs.get("custom:role") or "ATHLETE",
        "status": user.get("UserStatus"),
        "enabled": user.get("Enabled", True),
    }


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    if get_user_role(event) != "ADMIN":
        return error_response(
            "Apenas administradores podem gerenciar usuários.",
            status_code=403,
            error_code="FORBIDDEN",
        )

    http_method = event.get("httpMethod", "").upper()
    path_params = event.get("pathParameters") or {}
    target_user_id = path_params.get("userId")

    try:
        # GET /admin/users
        if http_method == "GET":
            response = cognito.list_users(UserPoolId=USER_POOL_ID, Limit=60)
            users = [_map_cognito_user(u) for u in response.get("Users", [])]
            return success_response(users, status_code=200)

        # PATCH /admin/users/{userId}/role
        elif http_method == "PATCH" and target_user_id:
            body_raw = event.get("body") or "{}"
            body_json = json.loads(body_raw) if isinstance(body_raw, str) else body_raw
            new_role = (body_json.get("role") or "").upper()

            if new_role not in VALID_ROLES:
                return error_response(
                    f"Role inválido. Use um de: {', '.join(sorted(VALID_ROLES))}.",
                    status_code=400,
                    error_code="VALIDATION_ERROR",
                )

            cognito.admin_update_user_attributes(
                UserPoolId=USER_POOL_ID,
                Username=target_user_id,
                UserAttributes=[{"Name": "custom:role", "Value": new_role}],
            )
            return success_response({"user_id": target_user_id, "role": new_role}, status_code=200)

        else:
            return error_response(f"Rota ou método {http_method} não suportado.", status_code=404, error_code="NOT_FOUND")

    except ClientError as e:
        logger.exception("Erro do Cognito no AdminFunction")
        return error_response(
            e.response.get("Error", {}).get("Message", "Erro ao comunicar com o Cognito."),
            status_code=400,
            error_code="COGNITO_ERROR",
        )
    except Exception as e:
        logger.exception("Erro interno no AdminFunction")
        return error_response("Erro interno no servidor.", status_code=500, error_code="INTERNAL_ERROR", details=str(e))
