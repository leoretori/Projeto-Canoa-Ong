# 🧪 Subagent 5: Estratégia de QA & Testes de Concorrência

Este documento define o plano de validação e garantia de qualidade conduzido pelo **Subagent 5 (QA & Testes)**.
Este documento define o plano de validação, qualidade de software e testes automatizados conduzido pelo **Subagent 5 (QA & Testes)** no diretório [`tests/`](file:///f:/Faculdade/Projetos/Va'aFlow/tests/).

---

## 🛠️ Stack e Ferramental
- **Framework:** `pytest` e plugins (`pytest-mock`, `pytest-asyncio`, `pytest-cov`).
- **Emulação AWS:** `moto` (mock do DynamoDB/Boto3 em memória) ou LocalStack.
- **Testes de Carga/Estresse:** Scripts Python concorrentes com `asyncio` / `concurrent.futures`.
## 🛠️ Stack e Ferramental de Teste
- **Framework de Testes:** `pytest` 9.1+ com `moto` (mock oficial in-memory do Amazon DynamoDB).
- **Simulação Concorrente:** Módulo padrão `threading` do Python simulando múltiplos paratletas simultâneos.
- **Auditoria de Interface & Performance:** Google Chrome DevTools MCP & Lighthouse 13.4.
- **Tipagem Estática:** TypeScript Compiler (`npx tsc --noEmit`).
- **Empacotamento Web:** Expo Static Export (`npx expo export --platform web`).

---

## 🎯 Cenários Críticos de Teste
## 📂 Organização dos Arquivos de Teste

### 1. Teste de Condição de Corrida (Race Conditions)
- **Cenário:** Simular 10 requisições disparadas em paralelo para o mesmo `canoe_id` e mesmo `slot_start`.
- **Comportamento Esperado:** Exatamente 1 requisição deve retornar `201 Created` e 9 requisições devem retornar `409 Conflict`.
- **Critério de Aceite:** O banco DynamoDB deve manter integridade absoluta sem duplicidade.
1. **`tests/test_concurrency_reservation.py` (Concorrência Multithread):**
   - Disputa atômica de 10 threads paralelas para a última vaga adaptada.
   - Prevenção de reserva duplicada para o mesmo usuário.
   - Cancelamento e devolução segura de assento adaptado.
2. **`tests/test_edge_cases.py` (Casos Extremos & Limites):**
   - Lotação mista de canoa OC6 (4 convencionais + 2 adaptadas).
   - Tentativa de agendamento adaptado quando a cota adaptada esgota, mas ainda restam vagas convencionais.
   - Rejeição de payloads maliciosos, datas passadas e nomes nulos via Pydantic.
3. **`tests/test_handlers_and_models.py` (Integração dos Handlers):**
   - Ciclo de vida completo das rotas `/users/me`, `/sessions` e `/reservations`.
   - Verificação de controle de acesso RBAC (`custom:role`).

### 2. Validações de Schema Pydantic
- Envio de campos ausentes, tipos incorretos, injeções em strings e formatos inválidos de data.
- Garantia de que nenhuma requisição inválida alcance a camada de persistência.
---

### 3. Testes de Idempotência e Rollback
- Repetição de requisições de cancelamento ou alteração com validação de status consistente.
## ⚡ Comandos de Verificação Contínua

### 4. Validação Contínua do Front-End & UI
- **Tipagem Estática:** `npx tsc --noEmit` para garantir zero anomalias de tipos no Expo/TypeScript.
- **Exportação Web Estática:** `npx expo export --platform web` para validar o empacotamento completo de rotas.
- **Validação de Responsividade e Overflow:** Testes visuais via Chrome DevTools cobrindo viewport Mobile (390px) e Desktop (1280px+).
```bash
# Executar todos os testes de unidade e concorrência
pytest tests/ -v

# Verificar ausência de erros de tipagem TypeScript no Front-End
cd frontend && npx tsc --noEmit

# Testar build estático das 14 rotas web
cd frontend && npx expo export --platform web
```

---

## 🔗 Links Relacionados
- [[05 - Banco de Dados/Modelagem DynamoDB|Modelagem DynamoDB]]
- [[04 - Back-End/Back-End e Microsserviços|Back-End e Microsserviços]]
- [[00 - Meta/Índice Geral|Índice Geral]]
## 📊 Status Atual da Suíte de Qualidade
- **Cobertura Backend:** **9 de 9 testes aprovados (100% pass)** em **2.68s**.
- **Front-End TypeScript:** **0 erros** de compilação.
- **Lighthouse Scores:** **SEO 100**, **Acessibilidade 96**, **Boas Práticas 83+**.

---

## 🔗 Navegação
- [[06 - QA e Testes/Testes de Concorrência e Race Conditions|Testes de Concorrência Multithread]]
- [[06 - QA e Testes/Relatório de Auditoria Lighthouse|Relatório Lighthouse]]
- [[05 - Banco de Dados/Padrões de Acesso e Travas Atômicas|Padrões de Acesso DynamoDB]]
- [[00 - Meta/MAIN|Central de Governança]]


