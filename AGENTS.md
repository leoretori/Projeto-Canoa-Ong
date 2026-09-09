# Diretrizes para IA e Agentes (Va'aFlow)

Este projeto utiliza uma arquitetura **SaaS Serverless na AWS** com Front-end **Multiplataforma (Expo)** e o desenvolvimento foi dividido em 6 domínios. 

Ao modificar este projeto, a IA deve obedecer estritamente às seguintes fronteiras:

## 1. Infraestrutura (Subagent 1)
- O provisionamento é feito via AWS SAM (`template.yaml`).
- É OBRIGATÓRIO manter o AWS Budget Alert de US$ 1,00 para impedir custos inesperados para o projeto universitário.

## 2. Front-End (Subagent 2)
- Framework: React Native + Expo Router + NativeWind.
- Código reside em `/frontend/src/app`.
- **Regra:** PROIBIDO implementar regras de negócio, lógica de banco ou validações de domínio complexas no Front-end. O Front-end deve ser estúpido (dumb client) e apenas consumir a API.

## 3. Back-End e API (Subagent 3)
- Funções: AWS Lambda (Python 3.12+).
- Validação: Toda entrada deve ser validada por schemas do **Pydantic** (`backend/common/models.py`).
- Autenticação: AWS Cognito.

## 4. Banco de Dados (Subagent 4)
- Banco: Amazon DynamoDB.
- Modelagem: **Single Table Design**.
- **Regra Crítica:** As travas contra overbooking (Cadeiras Convencionais e Adaptadas) DEVEM usar transações atômicas do Boto3 (`TransactWriteItems` ou `ConditionExpression`) na DAL (`backend/common/dynamo_dal.py`).

## 5. QA e Testes (Subagent 5)
- Suíte automatizada com `pytest` na pasta `/tests`.
- Deve cobrir Race Conditions e concorrência no DynamoDB (uso obrigatório de Threads no Python para simular usuários simultâneos).

## 6. Documentação (Subagent 6)
- Todos os arquivos de documentação, decisões arquiteturais e manuais devem ser armazenados e atualizados no cofre do Obsidian (`/Va'aFlow/`). Respeite o limite de 200 linhas por arquivo de conhecimento.

---
**NOTA:** Qualquer Inteligência Artificial auxiliando neste repositório não deve remover o `BudgetAlertEmail` ou sobrescrever regras Pydantic sem justificativa técnica plausível em relatório.

