# 📜 Contratos Pydantic v2 e Catálogo de Endpoints REST

> **Princípio de Validação Estrita:** Nenhuma informação atinge a camada de negócios ou o banco de dados sem validação prévia de tipo, intervalo e sanitização via **Pydantic v2**.

---

## 🛡️ 1. Schemas de Dados Pydantic (`backend/common/models.py`)

### A. Criação de Remada (`SessionCreateRequest`):
```python
class SessionCreateRequest(BaseModel):
    date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")  # YYYY-MM-DD
    time: str = Field(pattern=r"^\d{2}:\d{2}$")        # HH:MM
    location: str = Field(min_length=3, max_length=120)
    canoe_type: str = Field(default="OC6")
    total_capacity: int = Field(ge=1, le=12, default=6)
    max_adapted_seats: int = Field(ge=0, le=6, default=2)
    instructor_name: str = Field(min_length=2, max_length=100)
    notes: Optional[str] = Field(default="", max_length=500)
```

### B. Solicitação de Reserva de Vaga (`ReservationCreateRequest`):
```python
class ReservationCreateRequest(BaseModel):
    user_id: str = Field(min_length=1)
    user_name: str = Field(min_length=2, max_length=120)
    needs_adapted_seat: bool = Field(default=False)
    accessibility_notes: Optional[str] = Field(default="", max_length=300)
```

---

## 🌐 2. Catálogo Oficial de Endpoints da API REST

| Método | Endpoint | Autenticação / Role | Descrição e Comportamento |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Pública (`NONE`) | Verificação de disponibilidade para monitores externos (retorna 200). |
| `GET` | `/sessions` | Autenticado | Listagem de remadas futuras e abertas, com paginação via query `limit`. |
| `POST` | `/sessions` | `INSTRUCTOR` / `ADMIN` | Criação de nova sessão na guarderia. |
| `GET` | `/sessions/{id}` | Autenticado | Obtenção de detalhes de uma remada e ocupação atual. |
| `PATCH` | `/sessions/{id}/status` | `INSTRUCTOR` / `ADMIN` | Atualiza status (`OPEN`, `CANCELLED`, `COMPLETED`). |
| `POST` | `/sessions/{id}/reservations` | Autenticado | Agendamento atômico de vaga convencional ou adaptada (201 ou 409). |
| `GET` | `/reservations/me` | Autenticado | Listagem de remadas agendadas do remador logado. |
| `GET` | `/reservations/recent` | Autenticado | Feed de atividades recentes para o painel de controle. |
| `DELETE`| `/sessions/{id}/reservations/{userId}` | Autenticado | Cancelamento de reserva com devolução atômica de vaga. |
| `GET` | `/users/me` | Autenticado | Consulta de prontuário e requisitos de acessibilidade do remador. |
| `PUT` | `/users/me` | Autenticado | Atualização de contato de emergência e necessidades posturais. |
| `GET` | `/admin/users` | `ADMIN` | Listagem administrativa de usuários cadastrados no Cognito. |
| `PATCH`| `/admin/users/{userId}/role` | `ADMIN` | Promoção/rebaixamento de papel (`ATHLETE`, `INSTRUCTOR`, `ADMIN`). |

---

## 🚦 3. Respostas REST Padronizadas (`responses.py`)

- **200 OK / 201 Created:** `{ "data": { ... }, "message": "Sucesso" }`
- **400 Bad Request:** Validação de formato Pydantic inválido (`INVALID_PAYLOAD`).
- **403 Forbidden:** Tentativa de acesso a rota privilegiada por usuário sem o role requerido.
- **404 Not Found:** Sessão ou perfil inexistente no DynamoDB (`NOT_FOUND`).
- **409 Conflict:** Vaga adaptada ou convencional esgotada no momento da transação (`OVERBOOKING_PREVENTED`).
- **500 Internal Error:** Falhas não mapeadas capturadas com log estruturado (`INTERNAL_ERROR`).

---

## 🔗 Navegação
- [[04 - Back-End/Back-End e Microsserviços|Back-End e Microsserviços]]
- [[04 - Back-End/Dev Server e Emulação Moto|Dev Server e Emulação Moto]]
- [[05 - Banco de Dados/Padrões de Acesso e Travas Atômicas|Padrões de Acesso e Travas Atômicas]]
