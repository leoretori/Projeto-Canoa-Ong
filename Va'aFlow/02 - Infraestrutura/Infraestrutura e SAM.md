# ☁️ Subagent 1: Infraestrutura como Código (AWS SAM)

Este documento descreve os padrões de IaC e provisionamento gerenciados pelo **Subagent 1 (Infra/Líder)**.

---

## 🛠️ Stack e Recursos Gerenciados

- **Framework:** AWS Serverless Application Model (AWS SAM).
- **Arquivo Principal:** `template.yaml` na raiz do projeto.
- **Serviços AWS Provisionados:**
  - `AWS::Cognito::UserPool` e `AWS::Cognito::UserPoolClient` para autenticação.
  - `AWS::Serverless::Api` para API Gateway HTTP/REST.
  - `AWS::Serverless::Function` para os microsserviços Lambda.
  - `AWS::DynamoDB::Table` configurada em modo On-Demand (`PAY_PER_REQUEST`).
  - `AWS::Budgets::Budget` para contenção de custos.

---

## 💰 AWS Budget Alert Mandatório
Para resguardar o protótipo acadêmico contra cobranças inesperadas:
- **Limite Orçamentário:** US$ 1,00 mensal.
- **Tipo de Orçamento:** `COST`.
- **Notificações:** Alertas acionados em 80% e 100% da previsão de gastos (*Forecasted*) e gastos reais (*Actual*).

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
```

---

## 🔗 Links Relacionados
- [[00 - Meta/Governança e Squad|Governança e Squad]]
- [[00 - Meta/Contrato de Integração|Contrato de Integração]]
- [[00 - Meta/Índice Geral|Índice Geral]]

