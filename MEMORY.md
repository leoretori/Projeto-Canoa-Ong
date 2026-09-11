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

---

## 🎨 6. Design System Náutico & Acessibilidade (Canoa Para Todos)
- **Logo Oficial:** Imagem oficial fornecida pela ONG integrada em `frontend/assets/images/cpt-logo.png` (círculo com remadores estilizados e tipografia da marca).
- **Sede Operacional:** Praia Grande • São Sebastião - SP (DDD 12).
- **Origem dos Protótipos:** Projeto Google Stitch `projects/16899639216138351319` (armazenados em `stitch_designs/`).
- **Paleta de Tokens Náuticos:**
  - `Ocean Blue`: `#00687a`
  - `Dark Teal`: `#004e68`
  - `Warm Amber`: `#793200`
  - `Surface Water`: `#ebf5ff` / `#f8fafc`
- **Recursos de Acessibilidade Cidadã (WCAG 2.1 AAA & LIBRAS):**
  - **Escala Dinâmica de Texto:** Botões `A-` e `A+` com 4 níveis (`85%`, `100%`, `115%`, `130%`).
  - **Modo Escuro (Dark Mode):** Alternância completa com tema noturno oceânico (`#0b1320`, `#111c2e`), títulos em ciano claro (`#38bdf8`) e sincronização no `localStorage`.
  - **Modo Alto Contraste (WCAG AAA):** Fundo preto absoluto (`#000000`), textos e bordas em amarelo `#ffff00` e textos secundários em branco puro (`#ffffff`).
  - **VLibras Oficial:** Injeção dinâmica do script e do container do Governo Federal (`https://vlibras.gov.br/app/vlibras-plugin.js`) ativando o avatar 3D interativo na tela.
  - **Central de Acolhimento em LIBRAS:** Modal com glossário náutico (*Canoa*, *Remo*, *Mar*, *Colete*).
  - **Ergonomia Náutica:** Cartão de embarque náutico com sinalização de esteira de areia e cadeira anfíbia para paratletas.
- **Telas em Produção:**
  1. `src/app/index.tsx` (Portal Institucional, Barra WCAG 2.1 AA, Hero Responsiva, Bento, Modais de Aluno/Voluntário/PIX e LIBRAS)
  2. `src/app/login.tsx` (Login Cognito com logo oficial, Dark Mode e retorno ao portal)
  3. `src/app/(tabs)/index.tsx` (Calendário de Remadas com badges e modal de reserva)
  4. `src/app/(tabs)/my-reservations.tsx` (Métricas do remador, Cartão de Embarque Náutico, cancelamento atômico)
  5. `src/app/(tabs)/profile.tsx` (Prontuário de acessibilidade do atleta e contato de emergência)
  6. `src/app/(tabs)/admin.tsx` (Painel do Instrutor, frota, feed de atividade recente e roster com exportação CSV)

---

## 💻 7. Ambiente Local e Servidor de Desenvolvimento
- **Servidor Local Mock:** `backend/dev_server.py` utiliza `moto` para emular o DynamoDB em memória e carrega os handlers Lambda nativamente.
- **Porta do Servidor:** Padrão `8000`, configurável via variável de ambiente `PORT` (ex: `PORT=8001`).
- **Front-End:** Executado via Expo Metro (`npx expo start --web` ou `npm run dev`), porta padrão `8081`.

---

## 🏁 8. Status Atual de Entregas
- **Fase 1 (Back-End & DynamoDB):** Concluída com contratos Pydantic v2 e transações atômicas.
- **Fase 2 (QA & Testes):** Concluída com 9/9 testes unitários e de concorrência multithread passando (`pytest`).
- **Fase 3 (Front-End & Stitch UI):** Concluída com 6 telas compilando sem erros (`npx tsc --noEmit` = 0 erros; `expo export` = 13 rotas estáticas).
- **Fase 4 (Deploy SAM & Entregáveis):** Pronta para provisionamento e empacotamento final de documentação acadêmica.


