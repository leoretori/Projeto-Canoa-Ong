# 💻 Servidor de Desenvolvimento Local e Emulação Moto

> **Princípio de Autonomia de Desenvolvimento:** O desenvolvedor deve ser capaz de programar, testar e simular 100% da aplicação sem precisar de internet, sem credenciais ativas da AWS e com custo financeiro zero.

---

## 🛠️ 1. Arquitetura do `backend/dev_server.py`

O script `backend/dev_server.py` funciona como um substituto local do **Amazon API Gateway** e do **Amazon DynamoDB**:

```
[ Frontend Expo (Metro - :8081) ]
                │  HTTP / CORS
                ▼
[ Python Local Dev Server (dev_server.py - :8000 / :3333) ]
   ├── Roteamento de rotas REST (/sessions, /users, /reservations, /health)
   ├── Decodificação de Claims JWT / Mock de Headers (X-User-Id, X-User-Role)
   ├── Moto In-Memory DynamoDB Context (mock_aws())
   └── Handlers Lambda Nativos (handlers.sessions, handlers.reservations...)
```

---

## ⚙️ 2. Como o Moto Emula o DynamoDB

1. O script inicia o contexto `moto_context = mock_aws()`.
2. Cria a tabela `VaaFlow-dev` em memória com a mesma chave primária composta (`PK`, `SK`) e o mesmo índice global secundário (`GSI1`) do template de produção do SAM.
3. Executa um **seed de dados demonstrativo**:
   - Cria remadas de nascer do sol e treino técnico inclusivo na Praia Grande de São Sebastião.
   - Pré-configura assentos adaptados disponíveis para teste imediato.

---

## 🔐 3. Extração e Emulação de Identidade (Cognito Local)

O dev server implementa um extrator inteligente de credenciais:
- Se a requisição contiver um cabeçalho `Authorization: Bearer <jwt>`, ele decodifica o payload sem exigir verificação de assinatura criptográfica remota, extraindo `sub`, `email`, `name` e `custom:role`.
- Se não houver token, ele utiliza os cabeçalhos de fallback `X-User-Id` e `X-User-Role`.
- Usuário padrão emulador: `atleta-local-001` com papel `ATHLETE`.

---

## 🚀 4. Comandos de Execução

Para iniciar o servidor local de desenvolvimento:
```bash
# Execução direta via npm no root
npm run server

# Ou execução via terminal Python
python backend/dev_server.py
```

Para customizar a porta caso haja conflito local:
```bash
$env:PORT="8001"; python backend/dev_server.py
```

---

## 🔗 Navegação
- [[04 - Back-End/Back-End e Microsserviços|Back-End e Microsserviços]]
- [[04 - Back-End/Contratos Pydantic e Endpoints REST|Contratos Pydantic e Endpoints REST]]
- [[06 - QA e Testes/Estratégia de QA e Testes|Estratégia de QA e Testes]]
