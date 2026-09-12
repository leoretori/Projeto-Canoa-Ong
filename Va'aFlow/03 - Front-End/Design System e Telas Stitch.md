# 🎨 Design System Náutico e Telas Integradas via Google Stitch

Este documento registra o processo de migração visual e implementação das telas do **Canoa Para Todos (Va'aFlow)** a partir dos protótipos de alta fidelidade desenhados no **Google Stitch**.

---

## 🌊 1. Integração com o Google Stitch via MCP

A comunicação e extração dos componentes foi realizada diretamente através do servidor **Stitch MCP** (`call_mcp_tool`), conectando ao projeto Stitch ID `projects/16899639216138351319`. Todos os artefatos originais (arquivos HTML e capturas visuais PNG) estão preservados na pasta do repositório:
- Diretório de designs brutos: `stitch_designs/`

---

## 🎨 2. Paleta de Cores e Tokens Náuticos (Material 3)

O sistema utiliza tokens baseados na semântica oceânica da canoa havaiana e no design system do Stitch:

| Token Semântico | Valor Hex | Aplicação no App |
| :--- | :--- | :--- |
| **Primary (Ocean Blue)** | `#00687a` / `#0284c7` | Botões de ação, links principais e marcas |
| **Secondary (Dark Teal)** | `#004e68` / `#0369a1` | Cabeçalhos de tabela, cards secundários |
| **Stitch Abyss / Dark**   | `#07151f` / `#0a1824` | Background oceânico imersivo no tema escuro |
| **Stitch Surface / Card** | `#102231` / `#152d3f` | Contêineres e cartões elevados com borda `#24425a` |
| **Stitch Accent Coral**   | `#ff7849`             | Botões de ação principal (ex: Agendar Minha Vaga) |
| **Stitch Accent Teal**    | `#2ec4b6`             | Indicadores de assentos adaptados e tags de status |
| **High Contrast Yellow** | `#ffff00`             | Bordas e textos no modo WCAG AAA |
| **Success / Confirmada** | `#16a34a` / `#059669` | Vagas abertas, confirmação de presença |
| **Alert / Últimas Vagas** | `#d97706` / `#b45309` | Sessões com 1 vaga restante |
| **Critical / Cancelada** | `#dc2626` / `#991b1b` | Remadas suspensas por condições do mar |

---

## 📱 3. As Telas Oficiais em Produção

1. **Portal Institucional & Landing Page (`frontend/src/app/index.tsx`):**
   - Barra de Acessibilidade Cidadã no topo (escala de texto A+/A-, Dark mode, Alto Contraste e LIBRAS).
   - Navbar com Logo Oficial do CPT e botão direto da Comunidade WhatsApp.
   - Hero responsiva com slogan oficial, botões de ação e moldura náutica sem corte lateral.
   - Mosaico de impacto social com indicadores de acessibilidade.
   - Modais de inscrição de alunos, voluntários, doações PIX e central LIBRAS.

2. **Tela de Login Redesenhada (Stitch Split Hero - `frontend/src/app/login.tsx`):**
   - Extraída das telas Stitch `08_login_dark` e `09_login_redesenhada`.
   - Layout responsivo split em 12 colunas no desktop:
     - **Coluna Esquerda (5 cols):** Hero fotográfica autêntica da canoa havaiana em São Sebastião, badge luminoso de "Projeto Canoa Para Todos", tipografia de impacto ("A água não impõe barreiras. Ela liberta.") e cartão náutico de depoimento real com avaliação 5 estrelas.
     - **Coluna Direita (7 cols):** Card de autenticação com logo CPT, badge de acesso unificado (Atletas, Instrutores, Voluntários), inputs acessíveis com toggle de visibilidade de senha, checkbox "Lembrar dados", botão de submissão e modal PIX integrado.
   - Autenticação real com AWS Cognito via SRP (`frontend/src/services/auth.ts`) e barra de acessibilidade integrada.

3. **Calendário de Remadas Dark Theme (`frontend/src/app/(tabs)/index.tsx`):**
   - Extraída da tela Stitch `07_calendario_dark`.
   - Paleta escura oceânica `#07151f` com cartões `#102231`/`#152d3f`.
   - Botões de reserva com gradiente/cor Coral Náutico `#ff7849`.
   - Barra de progresso de ocupação e pill de assentos adaptados em Verde Náutico `#2ec4b6`.
   - Filtros dinâmicos rápidos e modal de confirmação atômica contra overbooking.

4. **Minhas Remadas (`frontend/src/app/(tabs)/my-reservations.tsx`):**
   - Mosaico de conquistas náuticas do remador (quilômetros remados, assiduidade).
   - Cartão Náutico de Embarque com indicação de esteira de areia e cadeira anfíbia.
   - Guia rápido de embarque em 4 passos e cancelamento de vaga seguro.

5. **Meu Perfil de Atleta (`frontend/src/app/(tabs)/profile.tsx`):**
   - Prontuário de acessibilidade (cadeirante, mobilidade reduzida, visual).
   - Chave seletora para pré-alocação automática de assento adaptado.
   - Registro confidencial de contato de emergência e histórico médico.

6. **Painel Operacional do Instrutor (`frontend/src/app/(tabs)/admin.tsx`):**
   - Gestão de frota, feed de atividade recente em tempo real.
   - Accordion de remadas com lista de chamada e exportação instantânea em CSV.
   - Gestão de papéis Cognito (promoção de usuários para `INSTRUCTOR` ou `ADMIN`).

---

## 🔗 Navegação
- [[03 - Front-End/Front-End Multiplataforma|Front-End Multiplataforma]]
- [[03 - Front-End/Acessibilidade WCAG e VLibras|Acessibilidade WCAG e VLibras]]
- [[06 - QA e Testes/Relatório de Auditoria Lighthouse|Relatório Lighthouse]]
