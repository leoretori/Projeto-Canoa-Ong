# 🧪 Subagent 5: Estratégia de QA & Testes de Concorrência

Este documento define o plano de validação e garantia de qualidade conduzido pelo **Subagent 5 (QA & Testes)**.

---

## 🛠️ Stack e Ferramental
- **Framework:** `pytest` e plugins (`pytest-mock`, `pytest-asyncio`, `pytest-cov`).
- **Emulação AWS:** `moto` (mock do DynamoDB/Boto3 em memória) ou LocalStack.
- **Testes de Carga/Estresse:** Scripts Python concorrentes com `asyncio` / `concurrent.futures`.

---

## 🎯 Cenários Críticos de Teste

### 1. Teste de Condição de Corrida (Race Conditions)
- **Cenário:** Simular 10 requisições disparadas em paralelo para o mesmo `canoe_id` e mesmo `slot_start`.
- **Comportamento Esperado:** Exatamente 1 requisição deve retornar `201 Created` e 9 requisições devem retornar `409 Conflict`.
- **Critério de Aceite:** O banco DynamoDB deve manter integridade absoluta sem duplicidade.

### 2. Validações de Schema Pydantic
- Envio de campos ausentes, tipos incorretos, injeções em strings e formatos inválidos de data.
- Garantia de que nenhuma requisição inválida alcance a camada de persistência.

### 3. Testes de Idempotência e Rollback
- Repetição de requisições de cancelamento ou alteração com validação de status consistente.

### 4. Validação Contínua do Front-End & UI
- **Tipagem Estática:** `npx tsc --noEmit` para garantir zero anomalias de tipos no Expo/TypeScript.
- **Exportação Web Estática:** `npx expo export --platform web` para validar o empacotamento completo de rotas.
- **Validação de Responsividade e Overflow:** Testes visuais via Chrome DevTools cobrindo viewport Mobile (390px) e Desktop (1280px+).

---

## 🔗 Links Relacionados
- [[05 - Banco de Dados/Modelagem DynamoDB|Modelagem DynamoDB]]
- [[04 - Back-End/Back-End e Microsserviços|Back-End e Microsserviços]]
- [[00 - Meta/Índice Geral|Índice Geral]]

