# 🛶 Va'aFlow — Gestão Inclusiva de Remadas Va'a (Canoa Havaiana)

[![Python 3.12+](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org/)
[![AWS Serverless](https://img.shields.io/badge/AWS-Serverless%20SAM-orange.svg)](https://aws.amazon.com/serverless/)
[![React Native Expo](https://img.shields.io/badge/FrontEnd-React%20Native%20%2B%20Expo-black.svg)](https://expo.dev/)
[![DynamoDB Single Table](https://img.shields.io/badge/Database-Amazon%20DynamoDB-4B275F.svg)](https://aws.amazon.com/dynamodb/)
[![Tests pytest](https://img.shields.io/badge/Tests-pytest%20100%25-brightgreen.svg)](https://pytest.org/)

Sistema SaaS Serverless de agendamento de remadas inclusivas para o **Projeto Canoa Para Todos (CPT)**, extensão universitária do **UniSENAI / SENAI São Caetano do Sul** sob orientação do **Prof. Dr. Fabio Xavier de Melo**.

O sistema prioriza **acessibilidade** (controle rigoroso de assentos adaptados para atletas cadeirantes e pessoas com mobilidade reduzida) com **garantia de atomicidade e proteção contra overbooking** em ambiente Serverless.

---

## 🏛️ Arquitetura do Sistema

```
[ Usuário: Web / iOS / Android ]
               │  (HTTPS / REST)
               ▼
   [ Amazon API Gateway + AWS Cognito Authorizer ]
               │  (Auth JWT / Rate Limit / CORS)
               ▼
[ AWS Lambda Functions (Python 3.12 + Pydantic v2) ]
  ├── UsersFunction: /users/me
  ├── SessionsFunction: /sessions, /sessions/{id}, /sessions/{id}/status
  ├── ReservationsFunction: /sessions/{id}/reservations, /reservations/me, /reservations/recent
  ├── AdminFunction: /admin/users (gestão de roles — só ADMIN)
  └── KillSwitchFunction: acionada via SNS quando o budget estoura
               │
               ▼
   [ Amazon DynamoDB (Single Table Design) ]
   └── TransactWriteItems (Travas Atômicas de Assentos Adaptados)
```

---

## ✨ Funcionalidades

- **Autenticação real via Cognito:** login, cadastro com confirmação por e-mail, recuperação de senha
- **Controle de acesso por role:** `ATHLETE` / `INSTRUCTOR` / `ADMIN`, aplicado tanto na UI quanto na API
- **Painel do Instrutor:** criar, editar e cancelar/reabrir remadas; ver quem se inscreveu; exportar lista em CSV
- **Gestão de usuários (Admin):** promover/rebaixar roles direto pelo app, sem precisar do Console AWS
- **Perfil do atleta:** necessidades de acessibilidade pré-preenchidas automaticamente no agendamento
- **Busca e paginação** no calendário de remadas
- **Dark mode** e identidade visual própria
- **Contenção de custos automática:** AWS Budget de US$1 + kill-switch que bloqueia a API sozinho

---

## 📁 Estrutura de Pastas

```text
.
├── AGENTS.md                  # Diretrizes técnicas do projeto
├── README.md                  # Guia geral de inicialização do projeto
├── template.yaml              # Infraestrutura como Código (AWS SAM)
├── samconfig.toml             # Parâmetros de deploy do AWS SAM
├── pyproject.toml             # Config de pytest, black e ruff
├── Makefile                   # Comandos padronizados (test, build, deploy...)
├── .env.example                # Modelo de variáveis de ambiente locais
├── .github/workflows/          # CI: testes + validação do template.yaml
├── infra/
│   └── killswitch/
│       └── killswitch.py      # Lambda que zera a API ao estourar o budget de US$1
├── backend/                   # Microsserviços e lógica de domínio
│   ├── common/
│   │   ├── dynamo_dal.py      # Camada DAL DynamoDB (Single Table & Transações Atômicas)
│   │   ├── models.py          # Schemas Pydantic v2 (Acessibilidade, Sessões e Reservas)
│   │   └── responses.py       # Padronização de respostas REST com CORS
│   ├── handlers/
│   │   ├── users.py           # Handler Lambda de Usuários e Perfis
│   │   ├── sessions.py        # Handler Lambda de Calendário de Remadas (CRUD completo)
│   │   ├── reservations.py    # Handler Lambda de Reservas com travas 409 Conflict
│   │   └── admin.py           # Gestão de roles de usuário via Cognito (só ADMIN)
│   └── requirements.txt
├── frontend/                  # Aplicativo React Native (Expo)
│   ├── src/app/               # Rotas Expo Router (Login, Registro, Calendário, Perfil, Admin)
│   ├── src/services/
│   │   ├── api.ts             # Cliente HTTP da API
│   │   └── auth.ts            # Autenticação Cognito (login, cadastro, recuperação de senha)
│   ├── src/utils/alert.ts     # Helper de alerta cross-platform (web + mobile)
│   ├── package.json
│   └── tailwind.config.js
├── tests/                     # Suíte de testes de QA e Concorrência
│   ├── test_concurrency_reservation.py # Teste multithread de Race Conditions no DynamoDB
│   └── test_handlers_and_models.py     # Testes de integração dos handlers e Pydantic
└── Va'aFlow/                  # Cofre Obsidian (Organizado por Pastas e Cores de Domínio)
    ├── 00 - Meta/             # 🟣 Governança, Contratos e Roadmap
    ├── 01 - Visão Geral/      # ⚪ Visão Geral da Arquitetura
    ├── 02 - Infraestrutura/   # 🟠 AWS SAM, IaC e Backlog
    ├── 03 - Front-End/        # 🔷 React Native, Expo e UI/UX
    ├── 04 - Back-End/         # 🟢 Lambdas Python 3.12 e Pydantic v2
    ├── 05 - Banco de Dados/   # 🔵 DynamoDB Single Table e Concorrência
    ├── 06 - QA e Testes/      # 🔴 pytest e Simulações de Race Condition
    └── 07 - Documentação Acadêmica/ # 🟡 Entregáveis e Relatórios UniSENAI
```

---

## 🚀 Como Executar Localmente

### 1. Pré-requisitos
- Python 3.12+
- Node.js 20+ e npm
- AWS CLI e AWS SAM CLI (opcional para deploy)

### 2. Rodando os Testes do Back-End & Concorrência
```bash
make install   # instala dependências (Python + Node)
make test      # roda a suíte completa de testes
```

### 3. Executando o Front-End (Expo)
```bash
cd frontend

# Instalar dependências (caso não tenha instalado)
npm install

# Rodar em modo Web
npm run web

# Ou abrir no emulador Android / Expo Go
npm run android
```

---

## 🔒 Regras de Negócio Críticas
- **Capacidade da Canoa (OC6):** Padrão de até 6 remadores por sessão.
- **Controle de Assentos Adaptados:** Cota parametrizada (padrão até 2 assentos adaptados por canoa).
- **Sem Overbooking Concorrente:** Múltiplas requisições simultâneas disputando a última vaga são resolvidas atomicamente pelo DynamoDB. Uma requisição obtém `201 Created` e as demais recebem `409 Conflict`.
- **Controle de Custos:** Alerta do AWS Budgets cravado em **US$ 1,00/mês**, com kill-switch automático (`infra/killswitch/`) que zera o throttling da API ao atingir 100% do budget.

---

## 🤝 Colaboradores e Autores
- **Projeto de Extensão:** Canoa Para Todos (CPT) — UniSENAI São Caetano do Sul
- **Integrantes**  Leonardo Retori Apolonio e Murilo Lameira
- **Docente Responsável:** Prof. Dr. Fabio Xavier de Melo
- **Repositório:** [https://github.com/leoretori/Projeto-Canoa-Ong](https://github.com/leoretori/Projeto-Canoa-Ong)

