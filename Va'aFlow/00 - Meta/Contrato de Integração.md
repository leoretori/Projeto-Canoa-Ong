# 📜 Contrato Central de Integração & Barreiras de Domínio

Este documento dita as normas invioláveis de integração entre Front-end, Back-end, Banco de Dados e Infraestrutura do **Va'aFlow**.

---

## 🔒 Princípios de Governança
1. **Autoridade do Contrato:** Nenhum agente tem permissão para alterar rotas HTTP, parâmetros de query, cabeçalhos, payloads JSON ou estrutura de tabelas DynamoDB sem que o **Subagent 1 (Infra/Líder)** atualize e aprove o contrato formal no `template.yaml`.
2. **RESTful Estrito:** A comunicação Front-End $\rightarrow$ API Gateway $\rightarrow$ Lambdas deve seguir o padrão RESTful:
   - `GET`: Idempotente e seguro, busca de recursos.
   - `POST`: Criação de recursos, retornando `201 Created` e cabeçalho `Location` ou payload representativo.
   - `PUT` / `PATCH`: Atualização total ou parcial idempotente.
   - `DELETE`: Remoção de recurso.
   - Respostas de erro padronizadas com objeto JSON (`error`, `message`, `details`).

---

## 🛑 Barreiras de Domínio (Boundary Rules)

```
[ FRONT-END (Subagent 2) ]
        │  (Apenas Apresentação & Chamadas REST via Hooks)
        ▼
[ API GATEWAY + COGNITO (Subagent 1) ]
        │  (Autenticação, Rate Limiting & Roteamento)
        ▼
[ LAMBDA / BACK-END (Subagent 3) ]
        │  (Validação Pydantic + Regras de Negócio)
        ▼
[ DYNAMODB / DATA LAYER (Subagent 4) ]
           (Single Table Design + Travas Concorrentes Boto3)
```

- **Front-End:** Não contém cálculos de disponibilidade, regras de negócio ou lógicas de cancelamento. Apenas exibe e submete intenções do usuário.
- **Back-End:** Não assume integridade de dados sem validar no Pydantic. Retorna erros HTTP semânticos (ex: `409 Conflict` em caso de falha de concorrência).
- **Banco de Dados:** Garante que operações de reserva concorrentes falhem de forma limpa via *Conditional Check Failed Exception*.

---

## 🔗 Links Relacionados
- [[00 - Meta/Governança e Squad|Governança e Squad]]
- [[00 - Meta/Índice Geral|Índice Geral]]

