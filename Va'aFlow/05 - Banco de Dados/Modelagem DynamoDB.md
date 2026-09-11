# 🗄️ Subagent 4: Banco de Dados & Single Table Design

Este documento documenta os padrões de modelagem no Amazon DynamoDB pelo **Subagent 4 (Banco de Dados)**.
Este documento documenta os padrões de modelagem no **Amazon DynamoDB** pelo **Subagent 4 (Banco de Dados)** implementados na camada [`backend/common/dynamo_dal.py`](file:///f:/Faculdade/Projetos/Va'aFlow/backend/common/dynamo_dal.py).

---

## 🛠️ Stack e Estratégia
## 🛠️ Stack e Princípios de Modelagem
- **SDK:** `boto3` para Python 3.12+.
- **Padrão:** Single Table Design (uma única tabela servindo todas as entidades).
- **Chaves Primárias Genéricas:** `PK` (Partition Key - String) e `SK` (Sort Key - String).
- **Global Secondary Indexes (GSIs):** `GSI1PK` / `GSI1SK` para consultas invertidas.
- **Tabela:** `VaaFlow-${Stage}` (ou `VaaFlow-dev` localmente) em modo On-Demand.
- **Padrão:** Single Table Design (uma única tabela servindo usuários, sessões e reservas).
- **Chaves Primárias Compostas:** `PK` (Partition Key - String) e `SK` (Sort Key - String).
- **Índice Global Secundário:** `GSI1` com `GSI1PK` e `GSI1SK` com projeção total (`ALL`).

---

## 🔒 Travas Lógicas de Concorrência (Optimistic Locking)
Para prevenir condições de corrida em reservas (ex: dois atletas tentando reservar a mesma canoa no mesmo horário):
- Uso mandatório de `ConditionExpression` do Boto3:
  - `attribute_not_exists(PK)` para novas reservas no slot.
  - `attribute_exists(PK) AND #version = :current_version` para atualizações concorrentes.
- Tratamento de exceção: Capturar `botocore.exceptions.ClientError` (`ConditionalCheckFailedException`) e sinalizar conflito (`409 Conflict`) ao Lambda.
## 🗺️ Mapa Completo de Chaves e Entidades

```python
# Exemplo de gravação com trava de concorrência
try:
    table.put_item(
        Item={
            "PK": f"SLOT#{canoe_id}#{timestamp}",
            "SK": f"RESERVATION#{reservation_id}",
            "UserId": user_id,
            "Status": "CONFIRMED",
            "Version": 1
        },
        ConditionExpression="attribute_not_exists(PK)"
    )
except client.exceptions.ConditionalCheckFailedException:
    raise ReservationConflictError("Horário já reservado por outro usuário.")
```
| Entidade | `PK` | `SK` | `GSI1PK` | `GSI1SK` | Atributos Principais |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Perfil de Usuário** | `USER#{userId}` | `PROFILE` | - | - | `name`, `email`, `role`, `accessibility_needs`, `created_at` |
| **Sessão / Remada** | `SESSION#{sessionId}`| `METADATA` | `SESSIONS` | `{date}#{time}` | `location`, `total_capacity`, `booked_seats`, `max_adapted_seats`, `booked_adapted_seats`, `status` |
| **Reserva do Atleta** | `SESSION#{sessionId}`| `RES#{userId}` | `USER#{userId}` | `RES#{sessionId}` | `user_name`, `needs_adapted_seat`, `seat_number`, `status`, `created_at` |

---

## 🔗 Links Relacionados
## ⚡ Padrões de Consulta Rápidos (Queries Otimizadas)

1. **Buscar Agenda de Remadas Futuras:**
   - `Query` em `GSI1` com `GSI1PK = "SESSIONS"` ordenado por `GSI1SK` (combinação ISO de data e horário `YYYY-MM-DD#HH:MM`).
   - Retorna todas as remadas cronologicamente em uma única leitura indexada.
2. **Buscar Histórico e Próximas Remadas de um Remador:**
   - `Query` em `GSI1` com `GSI1PK = "USER#{userId}"`.
   - Retorna todas as reservas confirmadas e passadas do atleta sem varredura (`Scan`) na tabela.
3. **Tripulação Confirmada na Guarderia (Lista de Chamada):**
   - `Query` na tabela principal com `PK = "SESSION#{sessionId}"` e `begins_with(SK, "RES#")`.
   - Retorna todos os atletas inscritos na canoa instantaneamente para o timoneiro.

---

## 🔒 Travas de Integridade e Atomicidade
- Nenhuma reserva pode existir sem uma sessão válida.
- Operações de reserva e estorno utilizam **`TransactWriteItems`**, garantindo consistência estrita (ACID) entre o contador de vagas ocupadas na sessão e o item da reserva individual.

---

## 🔗 Navegação
- [[05 - Banco de Dados/Padrões de Acesso e Travas Atômicas|Padrões de Acesso e Travas Atômicas]]
- [[04 - Back-End/Back-End e Microsserviços|Back-End e Microsserviços]]
- [[06 - QA e Testes/Estratégia de QA e Testes|Estratégia de QA e Testes]]
- [[00 - Meta/Índice Geral|Índice Geral]]
- [[06 - QA e Testes/Testes de Concorrência e Race Conditions|Testes de Concorrência]]
- [[00 - Meta/MAIN|Central de Governança]]


