# 💰 Orçamento FinOps e Mecanismo de Kill-Switch Automático

> **Princípio Zero de Sustentabilidade Financeira:** Um projeto acadêmico ou social universitário nunca deve gerar faturas imprevistas na nuvem.

Este documento formaliza a arquitetura de governança financeira (**FinOps**) do **Va'aFlow**, desenhada para manter o custo total de infraestrutura em nuvem dentro do limite de **US$ 1,00 por mês** no AWS Free Tier.

---

## 🛡️ Camada 1: Alerta de Orçamento Rígido (AWS Budgets)

No arquivo de Infraestrutura como Código SAM (`template.yaml`), é provisionado o recurso `VaaFlowMonthlyBudget`:

```yaml
  VaaFlowMonthlyBudget:
    Type: AWS::Budgets::Budget
    Properties:
      Budget:
        BudgetName: !Sub "vaaflow-monthly-budget-${Stage}"
        BudgetLimit:
          Amount: 1
          Unit: USD
        TimeUnit: MONTHLY
        BudgetType: COST
      NotificationsWithSubscribers:
        - Notification:
            NotificationType: ACTUAL
            ComparisonOperator: GREATER_THAN
            Threshold: 80
            ThresholdType: PERCENTAGE
          Subscribers:
            - SubscriptionType: EMAIL
              Address: !Ref BudgetAlertEmail
        - Notification:
            NotificationType: ACTUAL
            ComparisonOperator: GREATER_THAN
            Threshold: 100
            ThresholdType: PERCENTAGE
          Subscribers:
            - SubscriptionType: EMAIL
              Address: !Ref BudgetAlertEmail
            - SubscriptionType: SNS
              Address: !Ref BudgetAlertTopic
```

### Regras de Notificação:
- **80% do Budget (US$ 0,80):** Envio de e-mail de alerta preventivo para o orientador e mantenedores.
- **100% do Budget (US$ 1,00):** Notificação crítica por e-mail e publicação imediata de mensagem no tópico SNS `BudgetAlertTopic`.

---

## ⚡ Camada 2: Kill-Switch Autônomo de Contenção (`killswitch.py`)

Ao atingir 100% do orçamento, o SNS dispara a função Lambda `KillSwitchFunction` (`infra/killswitch/killswitch.py`). 

### Lógica de Execução do Kill-Switch:
1. Recebe o evento SNS do AWS Budgets confirmando o estouro do limite de custo.
2. Utiliza a API do **Amazon API Gateway** para aplicar uma taxa de throttling nula (`rateLimit: 0`, `burstLimit: 0`) ou desabilitar os endpoints públicos da API.
3. Garante que requisições subsequentes recebam HTTP `429 Too Many Requests` imediatamente na borda da AWS, sem invocar funções Lambda pagas e sem consumir leituras/gravações adicionais no DynamoDB.
4. O kill-switch preserva a integridade de todos os dados já gravados no DynamoDB e os usuários no Cognito.

---

## 📊 Tabela de Custos do Free Tier AWS Utilizados

| Serviço AWS | Cota Mensal Gratuita | Consumo Estimado no Va'aFlow | Margem de Segurança |
| :--- | :--- | :--- | :--- |
| **AWS Lambda** | 1.000.000 requisições / mês | ~15.000 requisições / mês | 98,5% livre |
| **Amazon DynamoDB** | 25 GB de armazenamento + 25 WCU / 25 RCU | < 50 MB / On-Demand | 99,8% livre |
| **Amazon Cognito** | 50.000 usuários ativos por mês (MAU) | ~500 atletas e alunos | 99,0% livre |
| **Amazon API Gateway** | 1.000.000 chamadas REST / mês | ~25.000 chamadas / mês | 97,5% livre |

---

## 🔗 Navegação
- [[00 - Meta/MAIN|Central de Governança]]
- [[02 - Infraestrutura/Infraestrutura e SAM|Infraestrutura como Código (SAM)]]
- [[07 - Documentação Acadêmica/Relatório Técnico de Engenharia|Relatório Técnico de Engenharia]]
