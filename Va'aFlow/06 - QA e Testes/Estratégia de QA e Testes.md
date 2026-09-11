# 🧪 Subagent 5: Estratégia de QA & Testes de Concorrência

Este documento define o plano de validação, qualidade de software e testes automatizados conduzido pelo **Subagent 5 (QA & Testes)** no diretório [`tests/`](file:///f:/Faculdade/Projetos/Va'aFlow/tests/).

---

## 🛠️ Stack e Ferramental de Teste
- **Framework de Testes:** `pytest` 9.1+ com `moto` (mock oficial in-memory do Amazon DynamoDB).
- **Simulação Concorrente:** Módulo padrão `threading` do Python simulando múltiplos paratletas simultâneos.
- **Auditoria de Interface & Performance:** Google Chrome DevTools MCP & Lighthouse 13.4.
- **Tipagem Estática:** TypeScript Compiler (`npx tsc --noEmit`).
- **Empacotamento Web:** Expo Static Export (`npx expo export --platform web`).

---

## 📂 Organização dos Arquivos de Teste

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

---

## ⚡ Comandos de Verificação Contínua

```bash
# Executar todos os testes de unidade e concorrência
pytest tests/ -v

# Verificar ausência de erros de tipagem TypeScript no Front-End
cd frontend && npx tsc --noEmit

# Testar build estático das 14 rotas web
cd frontend && npx expo export --platform web
```

---

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


