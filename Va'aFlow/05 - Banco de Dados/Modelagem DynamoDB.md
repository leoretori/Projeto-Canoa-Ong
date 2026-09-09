# 🗄️ Subagent 4: Banco de Dados & Single Table Design

Este documento documenta os padrões de modelagem no Amazon DynamoDB pelo **Subagent 4 (Banco de Dados)**.

---

## 🛠️ Stack e Estratégia
- **SDK:** `boto3` para Python 3.12+.
- **Padrão:** Single Table Design (uma única tabela servindo todas as entidades).
- **Chaves Primárias Genéricas:** `PK` (Partition Key - String) e `SK` (Sort Key - String).
- **Global Secondary Indexes (GSIs):** `GSI1PK` / `GSI1SK` para consultas invertidas.

---

## 🔒 Travas Lógicas de Concorrência (Optimistic Locking)
Para prevenir condições de corrida em reservas (ex: dois atletas tentando reservar a mesma canoa no mesmo horário):
- Uso mandatório de `ConditionExpression` do Boto3:
  - `attribute_not_exists(PK)` para novas reservas no slot.
  - `attribute_exists(PK) AND #version = :current_version` para atualizações concorrentes.
- Tratamento de exceção: Capturar `botocore.exceptions.ClientError` (`ConditionalCheckFailedException`) e sinalizar conflito (`409 Conflict`) ao Lambda.

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

---

## 🔗 Links Relacionados
- [[04 - Back-End/Back-End e Microsserviços|Back-End e Microsserviços]]
- [[06 - QA e Testes/Estratégia de QA e Testes|Estratégia de QA e Testes]]
- [[00 - Meta/Índice Geral|Índice Geral]]

