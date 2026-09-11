# ☁️ Subagent 1: Infraestrutura como Código (AWS SAM)

Este documento descreve os padrões de IaC e provisionamento gerenciados pelo **Subagent 1 (Infra/Líder)**.
Este documento descreve os padrões de IaC e provisionamento gerenciados pelo **Subagent 1 (Infra/Líder)** no arquivo central [`template.yaml`](file:///f:/Faculdade/Projetos/Va'aFlow/template.yaml).

---

## 🛠️ Stack e Recursos Gerenciados
## 🛠️ Recursos Provisionados no `template.yaml`

- **Framework:** AWS Serverless Application Model (AWS SAM).
- **Arquivo Principal:** `template.yaml` na raiz do projeto.
- **Serviços AWS Provisionados:**
  - `AWS::Cognito::UserPool` e `AWS::Cognito::UserPoolClient` para autenticação.
  - `AWS::Serverless::Api` para API Gateway HTTP/REST.
  - `AWS::Serverless::Function` para os microsserviços Lambda.
  - `AWS::DynamoDB::Table` configurada em modo On-Demand (`PAY_PER_REQUEST`).
  - `AWS::Budgets::Budget` para contenção de custos.
1. **Amazon Cognito (Identidade & Acessibilidade):**
   - `VaaFlowUserPool`: Cadastro com validação de e-mail e atributos customizados essenciais:
     - `custom:role`: Papel de acesso (`ATHLETE`, `INSTRUCTOR`, `ADMIN`).
     - `custom:accessibility_needs`: Registro prévio de deficiência ou suporte especial.
   - `VaaFlowUserPoolClient`: Autenticação sem segredo de cliente para consumo direto pelo app móvel/web via SRP (`ALLOW_USER_SRP_AUTH`).

2. **Amazon DynamoDB (Single Table Design):**
   - `VaaFlowTable`: Tabela única em modo On-Demand (`PAY_PER_REQUEST`).
   - Chave Primária: `PK` (String) e `SK` (String).
   - Índice Global Secundário: `GSI1` (`GSI1PK`, `GSI1SK`) com projeção total (`ALL`).
   - Criptografia em repouso ativada via AWS KMS (`SSESpecification: SSEEnabled`).

3. **Amazon API Gateway (REST HTTP API):**
   - `VaaFlowApi`: Roteamento central com autorizador padrão `CognitoAuth`.
   - Headers CORS globais padronizados (`AllowMethods: GET, POST, PUT, PATCH, DELETE, OPTIONS`).
   - Rota pública desprotegida `GET /health` (`Auth: Authorizer: NONE`) para monitoramento de disponibilidade.

4. **Funções AWS Lambda (Python 3.12 Runtime):**
   - `UsersFunction`: Perfil do remador e prontuário de acessibilidade.
   - `SessionsFunction`: Calendário náutico e healthcheck.
   - `ReservationsFunction`: Alocação atômica com travamento de concorrência.
   - `AdminFunction`: Gestão de roles restrita a administradores.
   - `KillSwitchFunction`: Bloqueador emergencial acionado via SNS.

---

## 💰 AWS Budget Alert Mandatório
Para resguardar o protótipo acadêmico contra cobranças inesperadas:
- **Limite Orçamentário:** US$ 1,00 mensal.
- **Tipo de Orçamento:** `COST`.
- **Notificações:** Alertas acionados em 80% e 100% da previsão de gastos (*Forecasted*) e gastos reais (*Actual*).
## 💰 Governança FinOps & Parâmetros Obrigatórios

```yaml
# Exemplo de configuração de Budget Alert no template.yaml
VaaFlowBudgetAlert:
  Type: AWS::Budgets::Budget
  Properties:
    Budget:
      BudgetName: VaaFlowMonthlyBudget
      BudgetLimit:
        Amount: 1.00
        Unit: USD
      TimeUnit: MONTHLY
      BudgetType: COST
    NotificationsWithSubscribers:
      - Notification:
          NotificationType: ACTUAL
          ComparisonOperator: GREATER_THAN
          Threshold: 80
        Subscribers:
          - SubscriptionType: EMAIL
            Address: dev@vaaflow.local
- **Parâmetro `BudgetAlertEmail`:** Endereço de e-mail obrigatório configurado em `samconfig.toml` para envio dos alertas do AWS Budgets.
- **Orçamento Travado:** Limite de **US$ 1,00/mês**. Ao estourar 100%, o SNS dispara a contenção imediata via kill-switch.

---

## 🚀 Comandos de Ciclo de Vida do AWS SAM

```bash
# Validar sintaxe e conformidade do template.yaml
sam validate --lint

# Compilar dependências e empacotar funções Lambda
sam build

# Deploy guiado para a nuvem AWS
sam deploy --guided
```

---

## 🔗 Links Relacionados
- [[00 - Meta/Governança e Squad|Governança e Squad]]
- [[00 - Meta/Contrato de Integração|Contrato de Integração]]
- [[00 - Meta/Índice Geral|Índice Geral]]
## 🔗 Navegação
- [[02 - Infraestrutura/Orçamento e Kill-Switch FinOps|Orçamento FinOps e Kill-Switch]]
- [[02 - Infraestrutura/Backlog de Infraestrutura AWS|Backlog de Infraestrutura AWS]]
- [[01 - Visão Geral/Visão Geral da Arquitetura|Visão Geral da Arquitetura]]
- [[00 - Meta/MAIN|Central de Governança]]


