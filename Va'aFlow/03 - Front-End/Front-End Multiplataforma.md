# 📱 Subagent 2: Front-End Multiplataforma (UI/UX)

Este documento estabelece as diretrizes de desenvolvimento da interface mantida pelo **Subagent 2 (Front-End/UI)**.

---

## 🛠️ Stack Tecnológico
- **Core:** React Native + Expo (SDK recente).
- **Roteamento:** Expo Router (File-based routing compatível com Web e Mobile).
- **Estilização:** NativeWind (Tailwind CSS adaptado para primitivos do React Native).
- **Data Fetching:** TanStack Query / Custom Fetch Hooks.
- **Design System:** Baseado em protótipos de alta fidelidade extraídos do **Google Stitch** via MCP.
- **Data Fetching:** Custom Hooks desacoplados (`useSessions`, `useReservations`, `useAuth`).

## 🎨 Design System & Identidade Visual (Canoa Para Todos)
- **Logo Oficial:** Imagem oficial da ONG integrada em `assets/images/cpt-logo.png` (círculo com remadores e tipografia náutica).
- **Sede Operacional:** Praia Grande • São Sebastião - SP (DDD 12).
- **Cores Primárias:**
  - Azul Oceano Principal: `#00687a` (`bg-[#00687a]`, `text-[#00687a]`)
  - Azul Petróleo Noturno: `#004e68`
  - Terracota / Âmbar Quente: `#793200`
  - Fundo & Superfície Náutica: `#ebf5ff` e `#f8fafc`
- **Tipografia e Ícones:** Vetoriais via `@expo/vector-icons` (Ionicons e FontAwesome5) e Google Fonts ("Plus Jakarta Sans").

---

## ♿ Acessibilidade Universal (WCAG 2.1 AAA & LIBRAS)
A aplicação incorpora uma barra de ferramentas de acessibilidade persistente na Landing Page e cabeçalhos:
1. **Redimensionamento Dinâmico de Fontes:** Botões `A-` e `A+` com 4 escalas (`85%`, `100%`, `115%`, `130%`).
2. **Modo Escuro Oceânico (Dark Mode):** Alternância completa para paleta noturna oceânica profunda (`#0b1320`, `#111c2e`) com títulos em ciano luminoso (`#38bdf8`) e persistência no `localStorage`.
3. **Modo Alto Contraste (WCAG 2.1 AAA):** Padrão internacional de acessibilidade com fundo preto absoluto (`#000000`), textos e bordas em amarelo vibrante (`#ffff00`) e textos secundários em branco (`#ffffff`), com contraste $\ge 15:1$.
4. **LIBRAS (Língua Brasileira de Sinais):**
   - Injeção dinâmica do widget governamental oficial **VLibras** (`https://vlibras.gov.br/app/vlibras-plugin.js`) com avatar 3D interativo na tela.
   - Modal da Central de Acolhimento em LIBRAS com glossário náutico (*Canoa*, *Remo*, *Mar*, *Colete*).
5. **Semântica Assistiva:** Uso estrito de `accessibilityRole` e `accessibilityLabel` em botões, inputs e cards náuticos.

---

## 📱 Arquitetura das 6 Telas de Produção

| Rota / Arquivo | Função / Propósito | Componentes-Chave |
| :--- | :--- | :--- |
| `src/app/index.tsx` | Portal Institucional & Conversão | Barra WCAG 2.1 AA, Hero responsivo, Bento de métricas, 3 pilares de impacto, jornada de 4 passos, modais (Aluno, Voluntário, Doação PIX). |
| `src/app/login.tsx` | Autenticação & Entrada Segura | Formulário com Cognito, tratamento de erros, retorno rápido ao portal. |
| `src/app/(tabs)/index.tsx` | Calendário de Remadas | Banner Guarderia Raia 1, filtros rápidos (♿ Adaptados, Fim de Semana), cards com progresso de ocupação e modal de agendamento atômico. |
| `src/app/(tabs)/my-reservations.tsx` | Minhas Remadas (Histórico & Ativas) | Mosaico do atleta (km remados, assiduidade), Cartão de Embarque Náutico, modal com Guia de Embarque e cancelamento seguro. |
| `src/app/(tabs)/profile.tsx` | Prontuário & Perfil do Paratleta | Contatos de emergência, toggle de vaga adaptada pré-alocada, seletor de mobilidade e experiência aquática. |
| `src/app/(tabs)/admin.tsx` | Painel Operacional do Timoneiro | Cards de frota ativa, feed de atividade recente, roster expansível com download de chamada em CSV e gestão de papéis ADMIN. |
| `src/app/+not-found.tsx` | Página 404 Náutica | "Remada Fora de Rota", logo oficial, retorno à base e suporte WhatsApp. |
| `src/app/error.tsx` | Error Boundary (500) | Captura de falhas não tratadas, tentativa de reconexão e relato ao suporte. |
| `src/app/+html.tsx` | Shell HTML & SEO Head | Tags OpenGraph, Twitter Cards, idioma pt-BR e verificação do Search Console. |
| `src/components/CookieBanner.tsx` | Consentimento LGPD | Escolha entre Essenciais e Analíticos, injeção GA4 e persistência em storage. |

---

## 🚫 Restrições Rígidas de Camada (Dumb Client)
1. **Sem Regras de Negócio no Front-End:**
   - O Front-End não calcula elegibilidade de vaga nem resolução de conflitos.
   - Conflitos de overbooking recebem tratamento visual do erro HTTP `409 Conflict` vindo do DynamoDB.
2. **Desacoplamento RESTful:**
   - Consumo padronizado de endpoints via JSON.
   - Tratamento explícito de estados de requisição: `loading`, `error`, `success`, `idle`.

---

## 🔗 Navegação
- [[03 - Front-End/Design System e Telas Stitch|Design System e Telas Stitch]]
- [[03 - Front-End/Acessibilidade WCAG e VLibras|Acessibilidade WCAG e VLibras]]
- [[06 - QA e Testes/Relatório de Auditoria Lighthouse|Relatório Lighthouse]]
- [[00 - Meta/MAIN|Central de Governança]]


