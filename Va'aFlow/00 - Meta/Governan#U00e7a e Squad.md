# 👥 Governança e Papéis do Squad (6 Subagents)

Este documento estabelece o modelo operacional e as barreiras de domínio para o desenvolvimento do **Va'aFlow**.

---

## 🎯 Modelo de Orquestração
O desenvolvimento é coordenado pelo **Antigravity Orchestrator**, garantindo que as fronteiras técnicas sejam respeitadas e que o contrato central de integração seja rigorosamente seguido.

---

## 🤖 Papéis e Atribuições dos Subagents

### 🔹 SUBAGENT 1 (Infra/Líder)
- **Escopo:** Infraestrutura como Código (IaC) via AWS SAM (`template.yaml`).
- **Recursos:** Amazon Cognito (Auth), Amazon API Gateway, AWS Lambda e Amazon DynamoDB.
- **Regra Mandatória:** Definir **AWS Budget Alert de US$ 1,00** para proteção de custos do protótipo.
- **Governança:** Guardião do contrato central de rotas e schemas.

### 🔹 SUBAGENT 2 (Front-End/UI)
- **Escopo:** Single Codebase em React Native com Expo, Expo Router (Web e Mobile) e NativeWind.
- **Comunicação:** Consome exclusivamente APIs via custom hooks RESTful.
- **Barreira Estrita:** PROIBIDO implementar regras de negócio ou validações de domínio no Front-end.

### 🔹 SUBAGENT 3 (Back-End/API)
- **Escopo:** Funções AWS Lambda em Python 3.12+.
- **Validação:** Validação estrita de contratos e payloads JSON via **Pydantic v2** (ex: acessibilidade, agendamentos).
- **Padronização:** Respostas e códigos HTTP RESTful (200, 201, 400, 404, 409, 500).

### 🔹 SUBAGENT 4 (Banco de Dados)
- **Escopo:** Amazon DynamoDB via Boto3 utilizando **Single Table Design**.
- **Concorrência:** Travas lógicas de concorrência com *Conditional Writes* e *Optimistic Locking* para impedir overbooking.
- **Contrato:** Definição de PKs, SKs, GSIs e padrões de acesso (Access Patterns).

### 🔹 SUBAGENT 5 (QA & Testes)
- **Escopo:** Testes unitários e de integração automatizados em **pytest**.
- **Cenários Críticos:** Simulação de condições de corrida (*race conditions*) em reservas concorrentes de canoas.
- **Qualidade:** Validações de estresse e resiliência de payload.

### 🔹 SUBAGENT 6 (Documentação Acadêmica)
- **Escopo:** Entregáveis acadêmicos em Markdown.
- **Artefatos:** Relatório técnico final, procedimentos de teste e manual de uso seguro.

---

## 🔗 Links Relacionados
- [[00 - Meta/Contrato de Integração|Contrato Central de Integração]]
- [[00 - Meta/Índice Geral|Índice Geral]]

