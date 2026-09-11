# 🗺️ Roadmap e Fases de Desenvolvimento

Este documento estabelece o ciclo de vida e a evolução do projeto **Va'aFlow** para a entrega da solução de agendamento inclusivo da canoa havaiana.

---

## 📅 Fases do Projeto

### Fase 1: Núcleo Back-End & Persistência Atômica (Subagents 3 e 4)
- [x] Especificação de contratos de dados em Pydantic v2 (`models.py`).
- [x] Padronização de respostas REST e cabeçalhos CORS (`responses.py`).
- [x] Camada DAL no DynamoDB com Single Table Design e `TransactWriteItems` contra overbooking (`dynamo_dal.py`).
- [x] Handlers das Lambdas de Usuários, Sessões, Reservas e Admin (`handlers/`).

### Fase 2: QA & Testes de Concorrência (Subagent 5)
- [x] Ambiente de testes locais com `pytest` e emulação `moto`.
- [x] Teste de corrida (Race Condition) com 10 threads concorrentes disputando a última vaga adaptada.
- [x] Validações de integridade de schemas e tratamento semântico de `409 Conflict`.
- [x] Cobertura de testes passando em 100% (9 de 9 testes aprovados).

### Fase 3: Front-End Multiplataforma & Design System Stitch (Subagent 2)
- [x] Extração e download dos layouts originais via Google Stitch MCP (`stitch_designs/`).
- [x] Implementação do Design System náutico em React Native, Expo Router e NativeWind.
- [x] Entrega das 6 telas completas: Portal Institucional, Login, Calendário, Minhas Remadas, Perfil e Admin.
- [x] Acessibilidade Cidadã: Escala dinâmica de texto (A+/A-), Dark Mode, Alto Contraste (AAA) e VLibras 3D.
- [x] Canal oficial comunitário com a coordenação via WhatsApp (`chat.whatsapp.com`).

### Fase 4: Infraestrutura em Nuvem, FinOps & Entregáveis (Subagents 1 e 6)
- [x] Template SAM (`template.yaml`) com Cognito, DynamoDB, API Gateway e Lambdas Python 3.12.
- [x] Alerta de Orçamento AWS Budgets de **US$ 1,00/mês** com Kill-Switch autônomo (`killswitch.py`).
- [x] Servidor local de emulação serverless em memória (`backend/dev_server.py`).
- [x] Relatórios técnicos de engenharia de software e manuais de operação para a extensão UniSENAI.

### Fase 5: Prontidão para Produção, SEO & Monitoramento (Todos os Subagents)
- [x] Página 404 personalizada náutica (`+not-found.tsx`).
- [x] OpenGraph e Metadata completos para SEO (`+html.tsx` e `<Head>`).
- [x] Geração automática de `sitemap.xml`, `robots.txt` e `llms.txt`.
- [x] Banner de consentimento LGPD e injeção assíncrona do Google Analytics 4 (`CookieBanner.tsx`).
- [x] Auditoria Lighthouse alcançando **SEO: 100** e **Acessibilidade: 96**.
- [x] Endpoint público de disponibilidade `GET /health` para monitoramento de Uptime.
- [x] Error Boundary global (500) com retry e componentes de skeleton loading.
- [x] Auditoria rigorosa de histórico git confirmando zero vazamento de credenciais.

---

## 🔗 Navegação
- [[00 - Meta/Governança e Squad|Governança e Squad]]
- [[00 - Meta/Contrato de Integração|Contrato de Integração]]
- [[00 - Meta/Índice Geral|Índice Geral]]


