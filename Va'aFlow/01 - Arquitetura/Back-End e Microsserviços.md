# ⚡ Subagent 3: Back-End & Microsserviços Serverless

Este documento define as diretrizes de implementação das APIs e funções Lambdas mantidas pelo **Subagent 3 (Back-End/API)**.

---

## 🛠️ Stack Tecnológico
- **Runtime:** Python 3.12+ no AWS Lambda.
- **Modelagem de Dados & Validação:** Pydantic v2.
- **SDK AWS:** Boto3.
- **Padrão de Resposta:** RESTful com JSON schema estrito.

---

## 🛡️ Validação Estrita com Pydantic
Toda requisição HTTP recebida pelo Lambda passa obrigatoriamente por um modelo Pydantic antes de qualquer processamento:
- Validação de tipos primitivos e formatos (ex: UUIDs, datas ISO 8601, emails).
- Validação de regras de acessibilidade e requisitos de equipamentos.
- Sanitização de inputs para prevenção de injeções.

```python
from pydantic import BaseModel, Field
from datetime import datetime

class ReservationCreateRequest(BaseModel):
    canoe_id: str = Field(..., description="Identificador único da canoa")
    user_id: str = Field(..., description="Identificador do usuário solicitante")
    slot_start: datetime = Field(..., description="Início da sessão de remada")
    slot_end: datetime = Field(..., description="Fim da sessão de remada")
    has_accessibility_needs: bool = Field(default=False)
```

---

## 🌐 Tratamento Padronizado de Respostas HTTP
- `200 OK` / `201 Created`: Sucesso na operação.
- `400 Bad Request`: Payload rejeitado pelo Pydantic (detalhes retornados no corpo).
- `401 Unauthorized` / `403 Forbidden`: Problemas de token Cognito.
- `404 Not Found`: Recurso inexistente.
- `409 Conflict`: Conflito de concorrência ou reserva duplicada.
- `500 Internal Server Error`: Erro não esperado (com logs no CloudWatch).

---

## 🔗 Links Relacionados
- [[01 - Arquitetura/Modelagem DynamoDB|Modelagem DynamoDB]]
- [[00 - Meta/Contrato de Integração|Contrato de Integração]]
- [[00 - Meta/Índice Geral|Índice Geral]]

