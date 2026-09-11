# ⚓ Padrões de Acesso e Travas Atômicas contra Overbooking

> **Regra Crítica de Segurança Náutica:** A integridade de alocação de assentos na canoa havaiana não pode depender de locks em memória de servidor, devendo ser resolvida por garantias transacionais ACID no banco de dados.

---

## 🧭 1. Tabela Única e Padrões de Acesso (Access Patterns)

Toda a persistência do **Va'aFlow** reside em uma única tabela do **Amazon DynamoDB** com cobrança sob demanda (Pay-Per-Request):

| Entidade | Chave Primária (`PK`) | Chave de Ordenação (`SK`) | GSI1PK | GSI1SK |
| :--- | :--- | :--- | :--- | :--- |
| **Perfil de Usuário** | `USER#{userId}` | `PROFILE` | - | - |
| **Sessão / Remada** | `SESSION#{sessionId}` | `METADATA` | `SESSIONS` | `{date}#{time}` |
| **Reserva do Atleta** | `SESSION#{sessionId}` | `RES#{userId}` | `USER#{userId}` | `RES#{sessionId}` |

### Vantagens do Single Table Design:
1. Uma única requisição transacional pode atualizar o contador de assentos da sessão e gravar a reserva do atleta de forma atômica.
2. Elimina a necessidade de múltiplos `JOINs` relacionais ou chaves estrangeiras lentas.
3. Consultas de alta performance para buscar a agenda da semana (`GSI1PK = "SESSIONS"`) ou o histórico de um remador específico (`GSI1PK = "USER#{userId}"`).

---

## 🔒 2. A Trava Atômica contra Overbooking (`TransactWriteItems`)

Quando um remador solicita uma vaga, a camada DAL (`backend/common/dynamo_dal.py`) executa uma operação transacional contendo duas ações inseparáveis:

### 1ª Ação: Gravação da Reserva com Proteção contra Duplicidade
- Item gravado: `PK = SESSION#{id}`, `SK = RES#{userId}`.
- `ConditionExpression = attribute_not_exists(PK)`: Se o atleta já possuir reserva nesta remada, a transação é abortada imediatamente com erro de duplicidade.

### 2ª Ação: Incremento Condicional de Vagas na Sessão
- Atualização em: `PK = SESSION#{id}`, `SK = METADATA`.
- Caso seja vaga convencional:
  - `UpdateExpression = "ADD booked_seats :inc"`
  - `ConditionExpression = "booked_seats < total_capacity"`
- Caso seja **vaga adaptada**:
  - `UpdateExpression = "ADD booked_seats :inc, booked_adapted_seats :inc"`
  - `ConditionExpression = "booked_seats < total_capacity AND booked_adapted_seats < max_adapted_seats"`

---

## ⚡ 3. Resolução de Condição de Corrida (Race Condition)

Se 10 atletas tentarem reservar simultaneamente a última vaga adaptada disponível:
1. O DynamoDB serializa internamente as requisições na partição de chave `SESSION#{sessionId}`.
2. A primeira requisição encontra a condição verdadeira (`booked_adapted_seats < 2`), efetua a transação com sucesso e incrementa o contador para `2`.
3. As 9 requisições restantes falham instantaneamente na verificação da `ConditionExpression` do DynamoDB (`TransactionCanceledException`).
4. A DAL captura a exceção e retorna HTTP `409 Conflict` informando amigavelmente que as vagas adaptadas foram esgotadas.
5. **Resultado:** Zero overbooking e zero inconsistência em ambiente concorrente serverless.

---

## 🔗 Navegação
- [[05 - Banco de Dados/Modelagem DynamoDB|Modelagem DynamoDB]]
- [[06 - QA e Testes/Testes de Concorrência e Race Conditions|Testes de Concorrência]]
- [[07 - Documentação Acadêmica/Relatório Técnico de Engenharia|Relatório Técnico de Engenharia]]
