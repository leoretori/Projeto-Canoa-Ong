"""
Formatadores de respostas HTTP REST padronizados para o AWS API Gateway.
Gerenciado pelo Subagent 3 (Back-End/API).
Garante conformidade estrita com o Contrato Central de Integração.
"""

import json
from decimal import Decimal
from typing import Any, Dict, Optional
from pydantic import BaseModel


DEFAULT_CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS"
}


def _serialize(obj: Any) -> Any:
    if isinstance(obj, BaseModel):
        return obj.model_dump(mode="json")
    if isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    if isinstance(obj, list):
        return [_serialize(item) for item in obj]
    if isinstance(obj, dict):
        return {k: _serialize(v) for k, v in obj.items()}
    return obj


def api_response(
    status_code: int, 
    body: Any, 
    extra_headers: Optional[Dict[str, str]] = None
) -> Dict[str, Any]:
    """Retorna dicionário compatível com o AWS Lambda Proxy Integration."""
    headers = {**DEFAULT_CORS_HEADERS}
    if extra_headers:
        headers.update(extra_headers)

    serialized = _serialize(body)
    return {
        "statusCode": status_code,
        "headers": headers,
        "body": json.dumps(serialized, ensure_ascii=False)
    }


def success_response(data: Any, status_code: int = 200) -> Dict[str, Any]:
    """Retorna sucesso com payload JSON."""
    return api_response(status_code=status_code, body=data)


def error_response(
    message: str, 
    status_code: int = 400, 
    error_code: str = "BAD_REQUEST", 
    details: Any = None
) -> Dict[str, Any]:
    """Retorna erro padronizado para consumo transparente do Front-End."""
    payload = {
        "error": error_code,
        "message": message,
    }
    if details is not None:
        payload["details"] = details
    return api_response(status_code=status_code, body=payload)

