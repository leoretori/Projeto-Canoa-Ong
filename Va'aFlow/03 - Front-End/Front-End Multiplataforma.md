# 📱 Subagent 2: Front-End Multiplataforma (UI/UX)

Este documento estabelece as diretrizes de desenvolvimento da interface mantida pelo **Subagent 2 (Front-End/UI)**.

---

## 🛠️ Stack Tecnológico
- **Core:** React Native + Expo (SDK recente).
- **Roteamento:** Expo Router (File-based routing compatível com Web e Mobile).
- **Estilização:** NativeWind (Tailwind CSS adaptado para primitivos do React Native).
- **Design System:** Baseado em protótipos de alta fidelidade extraídos do **Google Stitch** via MCP.
- **Data Fetching:** Custom Hooks desacoplados (`useSessions`, `useReservations`, `useAuth`).

---

## 🎨 Design System & Tokens Náuticos (Google Stitch)
O projeto adota uma identidade visual marítima e acolhedora, com alto contraste e legibilidade:
- **Cores Primárias:**
  - Azul Oceano Principal: `#00687a` (`bg-[#00687a]`, `text-[#00687a]`)
  - Azul Petróleo Noturno: `#004e68`
  - Terracota / Âmbar Quente: `#793200`
  - Fundo & Superfície Náutica: `#ebf5ff` e `#f8fafc`
- **Tipografia e Ícones:** Vetoriais via `@expo/vector-icons` (Ionicons e FontAwesome5) para suportar leitores e escalabilidade de tela.

---

## ♿ Acessibilidade Universal (WCAG 2.1 AA)
A aplicação incorpora uma barra de ferramentas de acessibilidade persistente na Landing Page e cabeçalhos:
1. **Redimensionamento Dinâmico de Fontes:** Botões `A-` e `A+` para ampliação imediata de textos para atletas com baixa visão.
2. **Modo Alto Contraste:** Alternância para paleta com contraste $\ge 7:1$, atendendo ao nível AAA da WCAG em elementos de texto crítico.
3. **Semântica Assistiva:** Uso estrito de `accessibilityRole` e `accessibilityLabel` em botões, campos de entrada e cards náuticos.
4. **Alocação de Assentos Adaptados:** Badges com destaque de assentos livres e confirmação de suporte de solo (esteira de areia e cadeira anfíbia).

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

---

## 🚫 Restrições Rígidas de Camada (Dumb Client)
1. **Sem Regras de Negócio no Front-End:**
   - O Front-End não calcula elegibilidade de vaga nem resolução de conflitos.
   - Conflitos de overbooking recebem tratamento visual do erro HTTP `409 Conflict` vindo do DynamoDB.
2. **Desacoplamento RESTful:**
   - Consumo padronizado de endpoints via JSON.
   - Tratamento explícito de estados de requisição: `loading`, `error`, `success`, `idle`.

---

## 🔗 Links Relacionados
- [[00 - Meta/Governança e Squad|Governança e Squad]]
- [[00 - Meta/Contrato de Integração|Contrato de Integração]]
- [[07 - Documentação Acadêmica/Relatório Técnico de Engenharia|Relatório Técnico de Engenharia]]
- [[00 - Meta/Índice Geral|Índice Geral]]


