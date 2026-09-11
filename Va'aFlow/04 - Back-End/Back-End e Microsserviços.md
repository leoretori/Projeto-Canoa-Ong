# ⚡ Subagent 3: Back-End & Microsserviços Serverless

Este documento define as diretrizes de implementação das APIs e funções Lambdas mantidas pelo **Subagent 3 (Back-End/API)**.
Este documento define as diretrizes de implementação das APIs e funções Lambdas mantidas pelo **Subagent 3 (Back-End/API)** no diretório [`backend/`](file:///f:/Faculdade/Projetos/Va'aFlow/backend/).

---

## 🛠️ Stack Tecnológico
- **Runtime:** Python 3.12+ no AWS Lambda.
- **Modelagem de Dados & Validação:** Pydantic v2.
- **Validação de Contratos:** Pydantic v2 (`backend/common/models.py`).
- **Camada de Acesso a Dados:** DynamoDAL desacoplada (`backend/common/dynamo_dal.py`).
- **Respostas e Headers:** Padronização RESTful com CORS (`backend/common/responses.py`).
- **SDK AWS:** Boto3.
- **Padrão de Resposta:** RESTful com JSON schema estrito.

---

## 🛡️ Validação Estrita com Pydantic
Toda requisição HTTP recebida pelo Lambda passa obrigatoriamente por um modelo Pydantic antes de qualquer processamento:
- Validação de tipos primitivos e formatos (ex: UUIDs, datas ISO 8601, emails).
- Validação de regras de acessibilidade e requisitos de equipamentos.
- Sanitização de inputs para prevenção de injeções.
## 📦 Estrutura dos Handlers Lambda

```python
from pydantic import BaseModel, Field
from datetime import datetime
1. **`handlers/sessions.py` (Gestão do Calendário & Healthcheck):**
   - `GET /health`: Endpoint público de status operacional (retorna 200).
   - `GET /sessions`: Listagem com filtro e paginação de remadas abertas.
   - `POST /sessions`: Criação de nova remada com cotas de vagas (exclusivo `INSTRUCTOR`/`ADMIN`).
   - `GET /sessions/{id}`: Detalhes da sessão e ocupação em tempo real.
   - `PATCH /sessions/{id}/status`: Alteração de status (`OPEN`, `CANCELLED`, `COMPLETED`).
2. **`handlers/reservations.py` (Agendamento Atômico & Feed):**
   - `POST /sessions/{id}/reservations`: Reserva atômica via `TransactWriteItems` com resposta 201 ou 409.
   - `GET /reservations/me`: Minhas remadas agendadas e histórico do atleta.
   - `GET /reservations/recent`: Feed de inscrições recentes para o painel operacional.
   - `DELETE /sessions/{id}/reservations/{userId}`: Cancelamento seguro e estorno de vaga.
3. **`handlers/users.py` (Prontuário do Atleta):**
   - `GET /users/me`: Leitura de preferências, contatos de emergência e histórico médico.
   - `PUT /users/me`: Atualização de requisitos de acessibilidade pré-alocados.
4. **`handlers/admin.py` (Controle de Acessos):**
   - `GET /admin/users`: Listagem de remadores cadastrados no Cognito.
   - `PATCH /admin/users/{userId}/role`: Alteração de papel do usuário (`ATHLETE`, `INSTRUCTOR`, `ADMIN`).

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
## 🌐 Tratamento Padronizado de Respostas HTTP (`responses.py`)
- `200 OK` / `201 Created`: Sucesso com envelope `{ "data": ... }`.
- `400 Bad Request`: Payload rejeitado pelo Pydantic com campos inválidos listados.
- `401 Unauthorized` / `403 Forbidden`: Role insuficiente ou token ausente/expirado.
- `404 Not Found`: Sessão, usuário ou reserva inexistente.
- `409 Conflict`: Vaga adaptada ou geral esgotada concorrentemente (`OVERBOOKING_PREVENTED`).
- `500 Internal Error`: Erro inesperado capturado com log estruturado no CloudWatch.

---

## 🔗 Links Relacionados
- [[05 - Banco de Dados/Modelagem DynamoDB|Modelagem DynamoDB]]
- [[00 - Meta/Contrato de Integração|Contrato de Integração]]
- [[00 - Meta/Índice Geral|Índice Geral]]
## 🔗 Navegação
- [[04 - Back-End/Contratos Pydantic e Endpoints REST|Contratos Pydantic e Endpoints REST]]
- [[04 - Back-End/Dev Server e Emulação Moto|Dev Server e Emulação Moto]]
- [[05 - Banco de Dados/Padrões de Acesso e Travas Atômicas|Padrões de Acesso DynamoDB]]
- [[00 - Meta/MAIN|Central de Governança]]


