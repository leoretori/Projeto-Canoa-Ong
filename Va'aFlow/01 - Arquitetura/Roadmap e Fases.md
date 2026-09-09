# 🗺️ Roadmap e Fases de Desenvolvimento

Este documento estabelece as etapas do projeto **Va'aFlow** para a entrega da solução de agendamento inclusivo da canoa havaiana.

---

## 📅 Fases do Projeto

### Fase 1: Núcleo Back-End & Persistência Atômica (Subagents 3 e 4)
- [x] Especificação de contratos de dados em Pydantic v2 (`models.py`).
- [x] Padronização de respostas REST e CORS (`responses.py`).
- [x] Camada DAL no DynamoDB com Single Table Design e `TransactWriteItems` contra overbooking (`dynamo_dal.py`).
- [x] Handlers das Lambdas de Usuários, Sessões e Reservas (`handlers/`).

### Fase 2: QA & Testes de Concorrência (Subagent 5)
- [x] Ambiente de testes locais com `pytest` e `moto`.
- [x] Teste de corrida (Race Condition) com 10 threads concorrentes disputando 1 assento adaptado.
- [x] Validações de integridade de schemas e tratamento de `409 Conflict`.

### Fase 3: Integração do Front-End Multiplataforma (Subagent 2)
- [ ] Criação do cliente de API HTTP (`src/services/api.ts`).
- [ ] Hooks customizados (`useSessions`, `useReservations`, `useAuth`).
- [ ] Conexão das telas do Expo (Login, Registro com acessibilidade, Calendário e Painel Admin) aos microsserviços.
- [ ] Substituição do boilerplate de `explore.tsx` por Histórico de Remadas do remador.

### Fase 4: Infraestrutura em Nuvem & Entregáveis Acadêmicos (Subagents 1 e 6)
- [ ] Preenchimento do `BudgetAlertEmail` real no `samconfig.toml`.
- [ ] Deploy via AWS SAM (`sam build && sam deploy`).
- [ ] Extração de variáveis de ambiente para o aplicativo Expo.
- [ ] Relatório Técnico de Engenharia de Software da Extensão UniSENAI.
- [ ] Procedimentos de teste, manual de uso seguro e banner para o evento.

---

## 🔗 Links Relacionados
- [[00 - Meta/Governança e Squad|Governança e Squad]]
- [[00 - Meta/Contrato de Integração|Contrato de Integração]]
- [[01 - Arquitetura/Backlog de Infraestrutura AWS|Backlog de Infraestrutura AWS]]
- [[00 - Meta/Índice Geral|Índice Geral]]
