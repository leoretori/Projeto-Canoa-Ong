---
name: agents-md
description: "Configura o ecossistema de agentes do projeto. Pergunta a quantidade e função de cada agente (com opções pré-setadas), define fronteiras de escopo, cria AGENTS.md, MEMORY.md, cofre do Obsidian e sincroniza a extensão Pixel Agents (comando squad)."
risk: safe
source: community
---

# Configuração e Orquestração de Agentes (agents-md)

Esta skill é global e se adapta a qualquer projeto. Ao ser executada, ela realiza a orquestração inicial do repositório, colhe as definições de agentes do usuário, define fronteiras rígidas de escopo e provisiona os arquivos de governança: `AGENTS.md`, `MEMORY.md`, o cofre do Obsidian (`/<NomeDoProjeto>/`) e a ponte para a extensão **Pixel Agents** no VS Code (`scripts/pixel_agents_bridge.js`).

---

## 🎯 Quando Executar Esta Skill

- Início de um novo projeto ou repositório.
- Usuário pede para "configurar agentes", "criar AGENTS.md", "organizar subagentes", "configurar memória do projeto" ou "atualizar agentes no pixel squad".
- Quando o projeto precisa de divisão clara de responsabilidades entre múltiplos papéis de IA.

---

## 📋 Fluxo de Execução Obrigatório

Siga rigorosamente as etapas abaixo em sequência:

### Etapa 1: Coleta Interativa (Perguntas ao Usuário)

Identifique o nome da pasta raiz do projeto atual. Em seguida, utilize a ferramenta `ask_question` ou pergunte no chat para coletar as definições:

1. **Quantidade e Papéis dos Agentes:**
   Apresente o catálogo pré-setado e pergunte quais números/funções o usuário deseja ativar para o projeto:
   - `[1] Arquiteto / Tech Lead:` Planejamento, definição de contratos de API, schemas e divisão de escopo.
   - `[2] Backend & Banco de Dados:` Lógica de negócio, endpoints, ORM/DAL, transações atômicas e prevenção de race conditions.
   - `[3] Frontend & UI/UX:` Interfaces, componentes, navegação e consumo de endpoints (dumb client).
   - `[4] DevOps & Infraestrutura:` IaC (SAM, Terraform, Docker), CI/CD, segurança e monitoramento de custos/budgets.
   - `[5] QA & Auditor de Testes:` Testes unitários/integração, simulação de concorrência/threads e auditoria de código.
   - `[6] Vault Guardian / Documentador:` Gestão da base de conhecimento no Obsidian, diagramas e atualização do `MEMORY.md`.
   - `[Customizado]:` O usuário pode adicionar qualquer papel específico para o projeto.

---

### Etapa 2: Análise Rápida do Repositório

Faça uma leitura rápida dos arquivos da raiz para identificar:
- **Stack & Gerenciador de Pacotes:** `package.json` (npm/pnpm/yarn/bun), `poetry.lock`, `Pipfile`, `requirements.txt`, `go.mod`, `Cargo.toml`.
- **Linters & Formatadores:** `.eslintrc`, `biome.json`, `ruff.toml`, `prettierrc`.
- **Comandos de Teste e Build:** scripts no package.json, Makefile, etc.
- **Arquivos-chave de cada domínio** para vincular às ações dos agentes (ex: rotas de backend, componentes de front, scripts de teste).

---

### Etapa 3: Criação do `AGENTS.md` (e symlink `CLAUDE.md`)

Crie o arquivo `AGENTS.md` na raiz do projeto contendo:

1. **Visão Geral do Projeto:** Nome, stack principal e arquitetura (ex: SaaS Serverless, Monorepo, SPA).
2. **Diretrizes Gerais:** Regras inegociáveis do repositório (ex: tipagem estrita, budgets de nuvem, nunca quebrar contratos de API).
3. **Divisão de Domínios dos Agentes Escolhidos:**
   Para **CADA** agente configurado, defina explicitamente:
   - **Missão:** Responsabilidade principal do agente.
   - **Escopo Permitido (Pode alterar):** Pastas e arquivos permitidos (ex: `/backend/**`).
   - **Fronteira Rígida (PROIBIDO alterar):** Diretórios e lógicas restritas fora de seu domínio (ex: Front-end proibido de criar lógica de banco; QA não implementa regras de negócio).
4. **Comandos Escopados por Arquivo (`File-Scoped Commands`):** Comandos rápidos de lint, test e typecheck.
5. **Commit Attribution:** Padrão de commit com atribuição de IA (`Co-Authored-By`).

*Nota:* No Windows/Linux, crie também uma cópia ou symlink `CLAUDE.md` apontando para `AGENTS.md` para suporte multiplataforma.

---

### Etapa 4: Criação do `MEMORY.md` (Memória de Longo Prazo)

Crie o arquivo `MEMORY.md` na raiz do repositório com o seguinte template estruturado:

```markdown
# 🧠 Memory Bank — <NomeDoProjeto>

Documento de memória persistente entre sessões de agentes. Deve ser consultado no início de tarefas complexas e atualizado após entregas críticas.

## 📌 Estado Atual do Projeto
- **Fase Atual:** [Ex: MVP / Desenvolvimento Inicial / Refatoração]
- **Última Entrega Relevante:** [Resumo breve da última tarefa concluída]
- **Foco Imediato:** [Próxima prioridade técnica]

## 🔒 Decisões Travadas (Locked Decisions)
Decisões de arquitetura e tecnologia que NÃO devem ser rediscutidas ou alteradas sem consentimento explícito do usuário:
- [Data] - Decisão 1 (Ex: Uso estrito de Single Table Design no DynamoDB)

## ⚠️ Gotchas & Lições Aprendidas
Armadilhas e erros que já foram superados e não devem se repetir:
- [Gotcha 1]: Detalhe de sintaxe, import ou comportamento assíncrono.

## 📋 Backlog & Débito Técnico de Agente
Itens identificados durante o desenvolvimento que precisam de atenção futura:
- [ ] Item 1
```

---

### Etapa 5: Criação do Cofre do Obsidian (`/<NomeDoProjeto>/`)

Crie o diretório com o nome exato do projeto na raiz (ex: `/Va'aFlow/` ou `/MeuProjeto/`).
Inicialize o cofre com uma estrutura modular, respeitando a **regra de até 200 linhas por arquivo** para garantir atomicidade e leitura leve pelas IAs:

1. **`00 - Índice.md` (Map of Content):**
   - Página principal com links internos em formato wiki `[[...]]`.
   - Visão geral do produto e índice de navegação do cofre.

2. **Subpastas e Documentos Iniciais:**
   - `<NomeDoProjeto>/01 - Arquitetura/`
     - `Visão Geral.md`: Stack, fluxos de dados e diagrama de serviços.
   - `<NomeDoProjeto>/02 - Decisões (ADRs)/`:
     - `ADR-001 - Padrões Iniciais.md`: Primeiras decisões de tecnologia.
   - `<NomeDoProjeto>/03 - Agentes & Manuais/`:
     - `Agente - <Nome>.md`: Um manual de instruções detalhado para cada subagente selecionado.
   - `<NomeDoProjeto>/04 - Runbooks/`:
     - `Setup Local.md`: Como rodar o projeto localmente.

---

### Etapa 6: Sincronização da Extensão Pixel Agents (`squad`)

Para que o comando `squad` da extensão **Pixel Agents** no VS Code exiba os agentes reais deste projeto, gere ou atualize o arquivo:
`scripts/pixel_agents_bridge.js`

O arquivo deve exportar um array `SQUAD` contendo exatamente os agentes configurados na Etapa 1, mapeados para arquivos e ações reais do projeto:

```javascript
/**
 * Pixel Agents Bridge Local
 * Localizado em: scripts/pixel_agents_bridge.js
 * Executado automaticamente pelo comando 'squad' no terminal.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const VAULT_DIR = path.join(ROOT_DIR, '<NomeDoProjeto>');

// Assegura sincronização do MAIN.md no Obsidian se existir
function ensureObsidianGovernance() {
  if (!fs.existsSync(VAULT_DIR)) return;
  const metaDir = path.join(VAULT_DIR, '00 - Meta');
  if (!fs.existsSync(metaDir)) fs.mkdirSync(metaDir, { recursive: true });
  const mainPath = path.join(metaDir, 'MAIN.md');
  if (!fs.existsSync(mainPath)) {
    fs.writeFileSync(mainPath, `# 🧠 Central de Governança & MAIN Context\n\n[[00 - Índice]]\n`, 'utf8');
  }
}

ensureObsidianGovernance();

// Agentes reais configurados para este projeto
const SQUAD = [
  // Exemplo para cada agente selecionado:
  {
    id: 'squad-infra',
    name: 'Infra & DevOps (AWS SAM & Cloud)',
    actions: [
      { tool: 'Edit', input: { file_path: 'template.yaml' }, desc: 'Ajustando recursos e budgets AWS' },
      { tool: 'Bash', input: { command: 'sam validate' }, desc: 'Validando template de infraestrutura' }
    ]
  },
  {
    id: 'squad-backend',
    name: 'Backend & API (Lambda & DynamoDB)',
    actions: [
      { tool: 'Edit', input: { file_path: 'backend/common/models.py' }, desc: 'Atualizando schemas Pydantic' },
      { tool: 'Read', input: { file_path: 'backend/common/dynamo_dal.py' }, desc: 'Verificando transações atômicas no DynamoDB' }
    ]
  },
  {
    id: 'squad-frontend',
    name: 'Frontend (Expo & NativeWind)',
    actions: [
      { tool: 'Edit', input: { file_path: 'frontend/src/app/index.tsx' }, desc: 'Construindo telas e componentes UI' },
      { tool: 'Read', input: { file_path: 'frontend/package.json' }, desc: 'Verificando dependências do app' }
    ]
  },
  {
    id: 'squad-qa',
    name: 'QA (Pytest & Concorrência)',
    actions: [
      { tool: 'Bash', input: { command: 'pytest' }, desc: 'Executando suíte de testes de concorrência' },
      { tool: 'Read', input: { file_path: 'tests/test_race_conditions.py' }, desc: 'Auditando cenários de overbooking' }
    ]
  },
  {
    id: 'squad-doc',
    name: 'Vault Guardian (Obsidian & Memória)',
    actions: [
      { tool: 'Write', input: { file_path: 'MEMORY.md' }, desc: 'Registrando aprendizados e decisões' },
      { tool: 'Edit', input: { file_path: '<NomeDoProjeto>/00 - Índice.md' }, desc: 'Atualizando base de conhecimento' }
    ]
  }
];

module.exports = { SQUAD };
```

---

## 🛡️ Regras e Boas Práticas

- **Atomicidade no Obsidian:** Nenhuma nota de conhecimento deve ultrapassar 200 linhas. Se crescer além disso, divida em tópicos menores e ligue com `[[links]]`.
- **Fronteiras sem Ambiguidade:** A separação de responsabilidades no `AGENTS.md` deve ser clara o suficiente para que dois agentes possam trabalhar no mesmo projeto sem colisões de código.
- **Memória Viva:** O `MEMORY.md` é atualizado dinamicamente pelos agentes conforme o projeto evolui.
- **Pixel Squad em Tempo Real:** Ao rodar `squad` no terminal integrado do VS Code, a extensão Pixel Agents lerá automaticamente `scripts/pixel_agents_bridge.js` e renderizará no escritório virtual exatamente os agentes ativos do projeto.
