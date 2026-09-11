# Diretrizes Técnicas do Projeto (Va'aFlow)

Este projeto usa uma arquitetura **SaaS Serverless na AWS** com Front-end **Multiplataforma (Expo)**.
Ao modificar este projeto, uma IA (ou dev humano) deve obedecer estritamente às seguintes regras:

## 1. Infraestrutura
- O provisionamento é feito via AWS SAM (`template.yaml`).
- É OBRIGATÓRIO manter o AWS Budget Alert de US$ 1,00 para impedir custos inesperados para o projeto universitário.
- O kill-switch de custos (`infra/killswitch/killswitch.py`) zera automaticamente o throttling da API ao estourar 100% do budget. Não remover sem substituir por outro mecanismo de contenção equivalente.

## 2. Front-End
- Framework: React Native + Expo Router + NativeWind.
- Código reside em `/frontend/src/app`.
- **Regra:** PROIBIDO implementar regras de negócio, lógica de banco ou validações de domínio complexas no Front-end. O Front-end deve ser estúpido (dumb client) e apenas consumir a API.
- Autenticação real via AWS Cognito (`frontend/src/services/auth.ts`) — nunca reintroduzir headers mockados (`X-User-Id` etc.) como caminho principal; eles só existem como fallback para `backend/dev_server.py` local.

## 3. Back-End e API
- Funções: AWS Lambda (Python 3.12+).
- Validação: Toda entrada deve ser validada por schemas do **Pydantic** (`backend/common/models.py`).
- Autorização por role: `custom:role` do Cognito (`ATHLETE` / `INSTRUCTOR` / `ADMIN`) controla o que cada rota aceita — ver `PRIVILEGED_ROLES` em `backend/handlers/sessions.py` e o handler `backend/handlers/admin.py`.

## 4. Banco de Dados
- Banco: Amazon DynamoDB.
- Modelagem: **Single Table Design**.
- **Regra Crítica:** As travas contra overbooking (Cadeiras Convencionais e Adaptadas) DEVEM usar transações atômicas do Boto3 (`TransactWriteItems` ou `ConditionExpression`) na DAL (`backend/common/dynamo_dal.py`).
- Padrões de acesso: `USER#{userId}/PROFILE`, `SESSION#{sessionId}/METADATA`, `SESSION#{sessionId}/RES#{userId}` (GSI1 para listagem por usuário e por data).

## 5. QA e Testes
- Suíte automatizada com `pytest` na pasta `/tests`.
- Deve cobrir Race Conditions e concorrência no DynamoDB (uso obrigatório de Threads no Python para simular usuários simultâneos).

## 6. Documentação
- Documentação acadêmica (relatórios, manuais) fica no cofre Obsidian em `/Va'aFlow/`, com padrão de no máximo 200 linhas por nota.

---
**NOTA:** Qualquer Inteligência Artificial auxiliando neste repositório não deve remover o `BudgetAlertEmail`, o kill-switch de custos, ou sobrescrever regras Pydantic/autorização por role sem justificativa técnica plausível em relatório.
