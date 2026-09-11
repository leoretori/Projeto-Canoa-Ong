# ♿ Acessibilidade Universal: WCAG 2.1 AA/AAA e Integração VLibras

> **Diretriz Constitucional e Cidadã:** O Va'aFlow foi projetado desde a primeira linha de código para atender pessoas com diferentes graus de deficiência visual, auditiva, motora e cognitiva.

---

## 🎛️ 1. Barra de Acessibilidade Cidadã

Localizada no topo de todas as páginas públicas e áreas autenticadas, oferece controles imediatos sem depender de extensões de terceiros no navegador:

### A. Escala Dinâmica de Tipografia (`A-` / `A+`):
- 4 patamares de escala: **85%**, **100% (Padrão)**, **115%** e **130%**.
- Redimensionamento vetorial em cascata de todos os textos e botões, prevenindo truncamento ou sobreposição de linhas.

### B. Modo Noturno Oceânico (Dark Mode):
- Alternância instantânea com classe CSS `.dark` aplicada na raiz HTML.
- Transforma fundos em azul-marinho profundo (`#0b1320` e `#111c2e`), tipografia principal em ciano claro (`#38bdf8`) e bordas atenuadas, reduzindo fadiga ocular e fotofobia.
- Preferência gravada de forma persistente no `localStorage`.

### C. Modo Alto Contraste (WCAG 2.1 Nível AAA):
- Fundo totalmente preto `#000000` (zero emissão em telas OLED).
- Tipografia primária e contornos de botões em amarelo ouro de alto contraste `#ffff00` (razão de contraste de 19.5:1, superando a exigência de 7:1 do nível AAA).
- Textos secundários em branco puro `#ffffff`.

---

## 🤟 2. Integração com o VLibras (Língua Brasileira de Sinais)

Para garantir acesso a atletas da comunidade surda e ensurdecida, o Va'aFlow implementa duas camadas de suporte em LIBRAS:

1. **Avatar 3D do VLibras (Governo Federal):**
   - Injeção dinâmica do script oficial `https://vlibras.gov.br/app/vlibras-plugin.js`.
   - Criação automática dos containers `<div vw class="enabled">` e `<div vw-access-button>` no DOM.
   - Ativação imediata dos intérpretes 3D virtuais (Ícaro ou Hozana) ao clicar no botão **"🤟 VLibras"** da barra.
2. **Central de Acolhimento em LIBRAS:**
   - Modal dedicado com vídeo descritivo e glossário náutico traduzido para termos de canoagem polinésia (*Canoa*, *Remo*, *Mar*, *Colete*, *Guarderia*).

---

## 📱 3. Acessibilidade Motora e Semântica de Leitores de Tela

- **Alvos de Toque (Touch Targets):** Todos os botões, links e campos de formulário possuem dimensões mínimas de **48 x 48 px**, em conformidade com as diretrizes do Google Material 3 e Apple HIG.
- **Marcação ARIA e Semântica:**
  - `role="main"` atribuído ao container de conteúdo principal.
  - `accessibilityRole="button"`, `accessibilityRole="link"` e rótulos explícitos `accessibilityLabel` em todos os elementos interativos.
  - Navegação fluida por teclado (`Tab`, `Shift+Tab`, `Enter`, `Space`) com anéis de foco visíveis (`focus:ring-2 focus:ring-primary`).

---

## 🔗 Navegação
- [[00 - Meta/MAIN|Central de Governança]]
- [[03 - Front-End/Design System e Telas Stitch|Design System e Telas Stitch]]
- [[06 - QA e Testes/Relatório de Auditoria Lighthouse|Relatório Lighthouse]]
