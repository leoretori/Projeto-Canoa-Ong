# 🧠 MEMORY.md — Memória de Contexto dos Agentes (Va'aFlow)

> **Documento Vivo de Contexto e Governança para Antigravity & Subagents**  
> **Projeto:** SaaS Serverless Va'aFlow — *Projeto Canoa Para Todos (CPT)*  
> **Instituição:** Extensão Universitária UniSENAI / SENAI São Caetano do Sul  
> **Orientação:** Prof. Dr. Fabio Xavier de Melo  

---

## 🎯 1. Visão do Produto & Missão Social
O **Va'aFlow** é uma solução de software desenvolvida no escopo do Programa "Incluir para Evoluir" (ODS 10 - Redução das Desigualdades e ODS 3 - Saúde e Bem-Estar).
- **Objetivo Principal:** Agendamento inclusivo de remadas esportivas e terapêuticas de canoa havaiana (Va'a) em São Sebastião/SP.
- **Diferencial de Domínio:** Controle rigoroso de vagas adaptadas para remadores cadeirantes ou com mobilidade reduzida, evitando overbooking e garantindo a alocação de assentos especiais (ex: 2 assentos adaptados por canoa OC6 de 6 lugares).

---

## 🏗️ 2. Stack Tecnológica Obrigatória
- **Nuvem:** AWS Serverless otimizada para o Free Tier.
- **IaC:** AWS SAM (`template.yaml`) com orçamento rígido via AWS Budgets (**US$ 1,00/mês**).
- **Autenticação:** Amazon Cognito (User Pool + Client com atributos customizados de acessibilidade).
- **Roteamento API:** Amazon API Gateway (REST API integrada ao Cognito Authorizer).
- **Back-End (FaaS):** AWS Lambda rodando Python 3.12+ com validação de contratos estritos via **Pydantic v2**.
- **Banco de Dados:** Amazon DynamoDB modelado em **Single Table Design** via `boto3`.
- **Front-End Multiplataforma:** React Native + Expo Router + NativeWind (Tailwind CSS) compilado para Web e Mobile.
- **Testes & QA:** `pytest` + `moto` com testes de concorrência multithread para simulação de race conditions.
- **Documentação:** Cofre Obsidian (`/Va'aFlow/`) com notas curtas (< 200 linhas por arquivo).

---

## 🤖 3. Divisão de Domínios & Subagents (Orquestração)

| Subagent | Domínio | Escopo & Responsabilidade |
| :--- | :--- | :--- |
| **Subagent 1** | Infra/Líder | AWS SAM (`template.yaml`), Cognito, API Gateway, Budget Alert (US$ 1,00) e guardião dos contratos. |
| **Subagent 2** | Front-End/UI | React Native + Expo + Expo Router + NativeWind. **Regra:** Proibido implementar regras de negócio no front-end (dumb client). |
| **Subagent 3** | Back-End/API | Funções Lambdas Python 3.12+, validação estrita de payloads JSON via Pydantic v2 e respostas REST semânticas. |
| **Subagent 4** | Banco de Dados | Amazon DynamoDB, Single Table Design e **travas atômicas contra overbooking** via `TransactWriteItems` ou `ConditionExpression`. |
| **Subagent 5** | QA & Testes | Suíte automatizada com `pytest`, simulação multithread para disputa concorrente da última vaga adaptada e validação de contratos. |
| **Subagent 6** | Documentação | Manuais de teste, relatório técnico da extensão UniSENAI e manutenção do cofre Obsidian (`/Va'aFlow/`). |

---

## 🔒 4. Regras Invioláveis de Arquitetura
1. **Trava de Custo:** O `BudgetAlertEmail` e o recurso `VaaFlowMonthlyBudget` de US$ 1,00 **NUNCA** podem ser removidos do `template.yaml`.
2. **Front-End "Burro" (Dumb Client):** O app móvel/web não calcula disponibilidade, conflitos de horário ou regras de acessibilidade. Apenas envia intenções e consome APIs via hooks.
3. **Validação Pydantic:** Nenhuma entrada atinge a camada de persistência sem validação prévia de tipo, intervalo e acessibilidade.
4. **Proteção Atômica contra Overbooking:** A reserva de assentos (convencionais e adaptados) deve ser gravada no DynamoDB em transações atômicas com `ConditionExpression` (`booked_seats < total_capacity` e `booked_adapted_seats < max_adapted_seats`). Conflitos concorrentes disparam HTTP `409 Conflict`.
5. **Obsidian Vault:** Todos os arquivos de documentação no cofre devem respeitar o limite estrito de **200 linhas** por arquivo.

---

## 🗺️ 5. Modelo de Dados DynamoDB (Single Table)
- **Tabela:** `VaaFlow-dev` (On-Demand / Pay-Per-Request)
- **Chaves Primárias:** `PK` (Partition Key - String), `SK` (Sort Key - String)
- **Índice Global Secundário:** `GSI1` (`GSI1PK`, `GSI1SK`)

### Padrões de Acesso (Access Patterns):
- **Perfil do Usuário:** `PK: USER#{userId}`, `SK: PROFILE`
- **Sessão / Remada:** `PK: SESSION#{sessionId}`, `SK: METADATA`, `GSI1PK: SESSIONS`, `GSI1SK: {date}#{time}`
- **Reserva do Atleta:** `PK: SESSION#{sessionId}`, `SK: RES#{userId}`, `GSI1PK: USER#{userId}`, `GSI1SK: RES#{sessionId}`
