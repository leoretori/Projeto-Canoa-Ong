"""
Identidade do usuário que fez a requisição — ÚNICA fonte para todos os handlers.

Regra de segurança: quando a requisição passou pelo Cognito Authorizer (há claims),
a identidade e o perfil vêm SÓ do token assinado. Cabeçalhos X-User-* enviados
pelo navegador são ignorados — senão qualquer remador poderia mandar
"X-User-Role: ADMIN" e ganhar permissões.

Cabeçalhos só são aceitos quando não há authorizer algum, ou seja, chamadas
diretas ao backend/dev_server.py local.
"""

from typing import Any, Dict


def get_identity(event: Dict[str, Any]) -> Dict[str, str]:
    authorizer = (event.get("requestContext") or {}).get("authorizer") or {}
    claims = authorizer.get("claims") or {}

    if claims:
        return {
            "user_id": claims.get("sub", ""),
            "email": claims.get("email", ""),
            "name": claims.get("name") or claims.get("email", "Remador"),
            "role": claims.get("custom:role") or "ATHLETE",
        }

    # Sem authorizer: só existe no servidor local de desenvolvimento.
    headers = {k.lower(): v for k, v in (event.get("headers") or {}).items()}
    return {
        "user_id": headers.get("x-user-id") or "mock-user-123",
        "email": headers.get("x-user-email") or "remador@vaaflow.org",
        "name": headers.get("x-user-name") or "Remador CPT",
        "role": headers.get("x-user-role") or "ATHLETE",
    }
