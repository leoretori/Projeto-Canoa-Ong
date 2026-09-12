# 🛶 Va'aFlow — Gestão Inclusiva de Remadas Va'a (Canoa Havaiana)

> **"A água não impõe barreiras. Ela liberta."**  
> Plataforma SaaS Serverless para agendamento inclusivo de remadas oceânicas e controle de assentos adaptados para o **Projeto Canoa Para Todos (CPT)**.

[![Python 3.12+](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org/)
[![AWS Serverless](https://img.shields.io/badge/AWS-Serverless%20SAM-orange.svg)](https://aws.amazon.com/serverless/)
[![React Native Expo](https://img.shields.io/badge/FrontEnd-React%20Native%20%2B%20Expo-black.svg)](https://expo.dev/)
[![DynamoDB Single Table](https://img.shields.io/badge/Database-Amazon%20DynamoDB-4B275F.svg)](https://aws.amazon.com/dynamodb/)
[![Tests pytest](https://img.shields.io/badge/Tests-pytest%20100%25-brightgreen.svg)](https://pytest.org/)
[![Lighthouse SEO](https://img.shields.io/badge/Lighthouse%20SEO-100%2F100-brightgreen.svg)](https://developer.chrome.com/docs/lighthouse/)
[![WCAG 2.1 AAA](https://img.shields.io/badge/Acessibilidade-WCAG%202.1%20AAA-blue.svg)](https://www.w3.org/WAI/standards-guidelines/wcag/)

Sistema SaaS Serverless de agendamento de remadas inclusivas para o **Projeto Canoa Para Todos (CPT)**, extensão universitária do **UniSENAI / SENAI São Caetano do Sul** sob orientação do **Prof. Dr. Fabio Xavier de Melo**.
Desenvolvido no âmbito do programa de extensão universitária do **UniSENAI / SENAI São Caetano do Sul**, sob orientação do **Prof. Dr. Fabio Xavier de Melo**.  
**Autores / Discentes:** Leonardo Retori Apolonio e Murilo Lameira  
**Base Náutica:** Praia Grande • São Sebastião - SP (DDD 12)  
**Canal Oficial:** [Comunidade WhatsApp do CPT](https://chat.whatsapp.com/GR1tEIaQrurAatkbZdYpbv?mode=ac_t)

O sistema prioriza **acessibilidade** (controle rigoroso de assentos adaptados para atletas cadeirantes e pessoas com mobilidade reduzida) com **garantia de atomicidade e proteção contra overbooking** em ambiente Serverless.

---

## 🏛️ Arquitetura do Sistema

```
O Va'aFlow opera sob uma arquitetura **100% Serverless** desenhada para custo zero no Free Tier e escalabilidade elástica:

```text
[ Usuário: Web / iOS / Android ]
               │  (HTTPS / REST)
               │  (HTTPS / REST / JWT SRP)
               ▼
   [ Amazon API Gateway + AWS Cognito Authorizer ]
               │  (Auth JWT / Rate Limit / CORS)
   ├── Rate Limiting & Throttling
   ├── CORS Habilitado
   └── Validação de Claims (custom:role: ATHLETE | INSTRUCTOR | ADMIN)
               │
               ▼
[ AWS Lambda Functions (Python 3.12 + Pydantic v2) ]
  ├── UsersFunction: /users/me
  ├── SessionsFunction: /sessions, /sessions/{id}, /sessions/{id}/status
  ├── ReservationsFunction: /sessions/{id}/reservations, /reservations/me, /reservations/recent
  ├── AdminFunction: /admin/users (gestão de roles — só ADMIN)
  └── KillSwitchFunction: acionada via SNS quando o budget estoura
   ├── SessionsFunction:    /sessions, /sessions/{id}, /sessions/{id}/status, /health
   ├── ReservationsFunction:/sessions/{id}/reservations, /reservations/me, /reservations/recent
   ├── UsersFunction:       /users/me (perfil e prontuário de acessibilidade)
   ├── AdminFunction:       /admin/users (gestão de papéis no Cognito — exclusivo ADMIN)
   └── KillSwitchFunction:  Acionada via SNS para desligar a API ao atingir 100% do budget de US$ 1,00
               │
               ▼
   [ Amazon DynamoDB (Single Table Design) ]
   └── TransactWriteItems (Travas Atômicas de Assentos Adaptados)
   └── TransactWriteItems (Travas Atômicas contra Overbooking de Vagas Adaptadas e Gerais)
```

---

## ✨ Funcionalidades
## ✨ Funcionalidades Principais

- **Autenticação real via Cognito:** login, cadastro com confirmação por e-mail, recuperação de senha
- **Controle de acesso por role:** `ATHLETE` / `INSTRUCTOR` / `ADMIN`, aplicado tanto na UI quanto na API
- **Painel do Instrutor:** criar, editar e cancelar/reabrir remadas; ver quem se inscreveu; exportar lista em CSV
- **Gestão de usuários (Admin):** promover/rebaixar roles direto pelo app, sem precisar do Console AWS
- **Perfil do atleta:** necessidades de acessibilidade pré-preenchidas automaticamente no agendamento
- **Busca e paginação** no calendário de remadas
- **Dark mode** e identidade visual própria
- **Contenção de custos automática:** AWS Budget de US$1 + kill-switch que bloqueia a API sozinho
- **Autenticação Segura via Amazon Cognito:** Login, cadastro com e-mail verificado, recuperação de senha e fluxo SRP seguro sem expor credenciais.
- **Controle de Acesso por Papel (RBAC):**
  - `ATHLETE`: Agenda remadas, escolhe vaga adaptada e consulta histórico náutico.
  - `INSTRUCTOR`: Gerencia o calendário de expedições, consulta lista de chamada e exporta presenças em CSV.
  - `ADMIN`: Promove e rebaixa papéis de usuários direto pelo aplicativo.
- **Prevenção Atômica de Overbooking:** Operação ACID `TransactWriteItems` no DynamoDB. Caso múltiplos atletas disputem a última vaga simultaneamente, apenas um obtém `201 Created` e os demais recebem `409 Conflict`.
- **Acessibilidade Cidadã Completa (WCAG 2.1 AA/AAA & LIBRAS):**
  - Barra superior assistiva com redimensionamento dinâmico de texto (`A-` / `A+`).
  - Modo Escuro Oceânico profundo com persistência em `localStorage`.
  - Modo Alto Contraste (fundo `#000000` e tipografia `#ffff00`, contraste 19.5:1).
  - Integração nativa com o avatar 3D do **VLibras** (Governo Federal) e Central de Acolhimento em LIBRAS.
- **Ergonomia Náutica no Cartão de Embarque:**
  - Identificação de esteira de areia plana e cadeira anfíbia para transbordo até a lâmina d'água.
  - Guia de embarque em 4 passos.
- **FinOps & Sustentabilidade Financeira:** Alerta do AWS Budgets travado em **US$ 1,00/mês** com kill-switch autônomo.

---

## 📁 Estrutura de Pastas
## 🎨 Telas em Produção (Google Stitch Design System)

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
Os protótipos de alta fidelidade foram extraídos do **Google Stitch** via MCP (`stitch_designs/`) e transformados em componentes nativos:

| Rota / Arquivo | Tela / Propósito | Destaques de Implementação |
| :--- | :--- | :--- |
| `src/app/index.tsx` | **Portal Institucional** | Hero responsivo, Bento de métricas, modais de aluno/voluntário/PIX, barra WCAG 2.1 AA. |
| `src/app/login.tsx` | **Acesso do Remador** | Login com Cognito, Dark Mode e retorno rápido ao portal. |
| `src/app/(tabs)/index.tsx` | **Calendário de Remadas** | Banner Guarderia Raia 1, filtro rápido de assentos adaptados livres e modal de agendamento atômico. |
| `src/app/(tabs)/my-reservations.tsx` | **Minhas Remadas** | Mosaico de conquistas náuticas, Cartão Náutico de Embarque e cancelamento seguro. |
| `src/app/(tabs)/profile.tsx` | **Prontuário do Atleta** | Contatos de emergência, toggle de vaga adaptada pré-alocada e histórico médico. |
| `src/app/(tabs)/admin.tsx` | **Painel do Instrutor** | Feed em tempo real, gestão de frota, roster com exportação CSV e gestão de permissões. |
| `src/app/+not-found.tsx` | **Página 404** | *"Remada Fora de Rota"*, logo oficial e suporte WhatsApp. |
| `src/app/error.tsx` | **Error Boundary (500)** | Captura de falhas não tratadas, tentativa de reconexão e relato ao suporte. |

---

## 🚀 Como Executar Localmente

### 1. Pré-requisitos
- Python 3.12+
- Node.js 20+ e npm
- AWS CLI e AWS SAM CLI (opcional para deploy)

### 2. Rodando os Testes do Back-End & Concorrência
### 2. Rodar a Suíte de Testes de Concorrência (pytest)
```bash
make install   # instala dependências (Python + Node)
make test      # roda a suíte completa de testes
# Executa todos os testes de unidade, schemas Pydantic e corrida multithread
pytest tests/ -v
```

### 3. Executando o Front-End (Expo)
### 3. Iniciar o Servidor Local de Desenvolvimento (Offline / Moto)
O servidor local emula o Amazon API Gateway e o DynamoDB em memória sem exigir credenciais da AWS:
```bash
# Iniciar o servidor local (porta padrão 8000)
npm run server
```

### 4. Executar o Aplicativo Front-End (Expo)
```bash
cd frontend

# Instalar dependências (caso não tenha instalado)
# Instalar dependências
npm install

# Rodar em modo Web
npm run web
# Iniciar o servidor de desenvolvimento web (porta padrão 8081)
npx expo start --web

# Ou abrir no emulador Android / Expo Go
npm run android
# Testar no celular físico na mesma rede Wi-Fi (abre QR Code e IP da LAN)
npx expo start --host lan
```

---

## 🔒 Regras de Negócio Críticas
- **Capacidade da Canoa (OC6):** Padrão de até 6 remadores por sessão.
- **Controle de Assentos Adaptados:** Cota parametrizada (padrão até 2 assentos adaptados por canoa).
- **Sem Overbooking Concorrente:** Múltiplas requisições simultâneas disputando a última vaga são resolvidas atomicamente pelo DynamoDB. Uma requisição obtém `201 Created` e as demais recebem `409 Conflict`.
- **Controle de Custos:** Alerta do AWS Budgets cravado em **US$ 1,00/mês**, com kill-switch automático (`infra/killswitch/`) que zera o throttling da API ao atingir 100% do budget.
## 📁 Estrutura de Pastas

```text
.
├── AGENTS.md                  # Diretrizes e regras invioláveis do projeto
├── README.md                  # Apresentação geral do projeto
├── template.yaml              # Infraestrutura como Código (AWS SAM)
├── samconfig.toml             # Parâmetros de deploy do AWS SAM
├── pyproject.toml             # Configurações do pytest
├── infra/
│   └── killswitch/
│       └── killswitch.py      # Lambda de contenção acionada via SNS (Budget US$ 1,00)
├── backend/                   # Microsserviços e lógica de domínio
│   ├── dev_server.py          # Emulador local in-memory com Moto e dados de demonstração
│   ├── common/
│   │   ├── dynamo_dal.py      # DAL DynamoDB (Single Table e TransactWriteItems)
│   │   ├── models.py          # Schemas Pydantic v2 (Validação estrita)
│   │   └── responses.py       # Padronização RESTful com CORS
│   └── handlers/
│       ├── sessions.py        # Gestão de sessões, calendário e healthcheck (/health)
│       ├── reservations.py    # Alocação atômica e cancelamento de vagas
│       ├── users.py           # Perfil e prontuário de acessibilidade
│       └── admin.py           # Gestão de papéis de usuários (Cognito RBAC)
├── frontend/                  # Aplicativo React Native (Expo Router + NativeWind)
│   ├── public/
│   │   ├── robots.txt         # Diretivas para mecanismos de busca
│   │   ├── sitemap.xml        # Mapa do site indexável
│   │   └── llms.txt           # Documentação para agentes de IA e web crawlers
│   ├── src/app/               # Rotas Expo Router (Páginas, Tabs, 404, Error Boundary)
│   ├── src/components/        # Componentes reutilizáveis (CookieBanner, Skeletons)
│   ├── src/services/          # Cliente API, autenticação Cognito e telemetria
│   └── global.css             # Configurações CSS de Dark Mode e Alto Contraste
├── tests/                     # Suíte de testes de concorrência e integração
│   ├── test_concurrency_reservation.py # Testes com 10 threads concorrentes no DynamoDB
│   ├── test_edge_cases.py              # Testes de limites de lotação e schemas Pydantic
│   └── test_handlers_and_models.py     # Integração dos handlers Lambda
└── Va'aFlow/                  # Cofre Obsidian (Documentação Acadêmica e Arquitetura)
    ├── 00 - Meta/             # Governança, Contratos, Roadmap e MAIN
    ├── 01 - Visão Geral/      # Arquitetura Serverless e Missão Social CPT
    ├── 02 - Infraestrutura/   # AWS SAM IaC, Orçamento FinOps e Backlog
    ├── 03 - Front-End/        # React Native, Design Stitch e Acessibilidade WCAG
    ├── 04 - Back-End/         # Microsserviços Lambda, Pydantic e Dev Server Moto
    ├── 05 - Banco de Dados/   # DynamoDB Single Table e Travas Atômicas
    ├── 06 - QA e Testes/      # Suíte pytest, Concorrência e Relatório Lighthouse
    └── 07 - Documentação Acadêmica/ # Relatório de Engenharia, Manual de Segurança e LGPD
```

---

## 🤝 Colaboradores e Autores
- **Projeto de Extensão:** Canoa Para Todos (CPT) — UniSENAI São Caetano do Sul
- **Integrantes**  Leonardo Retori Apolonio e Murilo Lameira
- **Docente Responsável:** Prof. Dr. Fabio Xavier de Melo
- **Repositório:** [https://github.com/leoretori/Projeto-Canoa-Ong](https://github.com/leoretori/Projeto-Canoa-Ong)
## 🏆 Indicadores de Qualidade e Prontidão

- **Testes Backend:** **9 de 9 testes aprovados (100% pass)** em **2.68s** (`pytest`).
- **Tipagem Estática:** **0 erros** no TypeScript Compiler (`npx tsc --noEmit`).
- **Exportação Web:** **14 rotas estáticas** geradas com sucesso (`npx expo export --platform web`).
- **Auditoria Google Lighthouse:**
  - **SEO: 100 / 100**
  - **Acessibilidade: 96 / 100**
  - **Boas Práticas: 83+ / 100**
- **Auditoria de Segredos:** Histórico git inspecionado (`git log -p -S "AKIA"`) comprovando **zero credenciais expostas**.

---

## 🤝 Autores e Agradecimentos

- **Projeto de Extensão Universitária:** Programa "Incluir para Evoluir" (ODS 10 e ODS 3)
- **Instituição:** UniSENAI / SENAI São Caetano do Sul
- **Alunos Integrantes:** Leonardo Retori Apolonio e Murilo Lameira
- **Docente Orientador:** Prof. Dr. Fabio Xavier de Melo
- **Iniciativa Parceira:** Projeto Canoa Para Todos (CPT) • São Sebastião - SP
