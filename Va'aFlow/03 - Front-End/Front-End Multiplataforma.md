# 📱 Subagent 2: Front-End Multiplataforma (UI/UX)

Este documento estabelece as diretrizes de desenvolvimento da interface mantida pelo **Subagent 2 (Front-End/UI)**.

---

## 🛠️ Stack Tecnológico
- **Core:** React Native + Expo (SDK recente).
- **Roteamento:** Expo Router (File-based routing compatível com Web e Mobile).
- **Estilização:** NativeWind (Tailwind CSS adaptado para primitivos do React Native).
- **Data Fetching:** TanStack Query / Custom Fetch Hooks.

---

## 🚫 Restrições Rígidas de Camada
1. **Sem Regras de Negócio:**
   - O Front-End não calcula elegibilidade de vaga, horários disponíveis ou regras de cobrança.
   - Toda verificação de concorrência ou conflito é delegada à resposta do Back-End.
2. **Desacoplamento RESTful:**
   - Consumo padronizado de endpoints via JSON.
   - Tratamento explícito de estados de requisição: `loading`, `error`, `success`, `idle`.

---

## ♿ Acessibilidade e Design System
- Componentes com suporte nativo a leitores de tela (`accessibilityRole`, `accessibilityLabel`).
- Feedback visual e tátil intuitivo para estados de reserva e confirmação.
- Interface responsiva adaptável de telas mobile compactas até navegadores desktop modernos.

---

## 🔗 Links Relacionados
- [[00 - Meta/Governança e Squad|Governança e Squad]]
- [[00 - Meta/Contrato de Integração|Contrato de Integração]]
- [[00 - Meta/Índice Geral|Índice Geral]]

