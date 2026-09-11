# 🧠 Central de Governança & Bússola Operacional (MAIN)

> **Projeto:** SaaS Serverless Va'aFlow — *Canoa Para Todos (CPT)*  
> **Instituição:** Extensão Universitária UniSENAI / SENAI São Caetano do Sul  
> **Orientação:** Prof. Dr. Fabio Xavier de Melo  
> **Alunos Integrantes:** Leonardo Retori Apolonio e Murilo Lameira  
> **Local de Operação:** Base Náutica da Praia Grande • São Sebastião - SP  

---

## 🎯 Regras de Ouro da Documentação (AGENTS.md)
1. **Limite Estrito:** Nenhum arquivo `.md` no cofre `/Va'aFlow/` pode ultrapassar **200 linhas**.
2. **Encoding:** Salve sempre em UTF-8 sem BOM.
3. **Links Bidirecionais:** Use o padrão do Obsidian `[[Caminho/Arquivo|Rótulo]]`.
4. **Governança de Custos:** O alerta de US$ 1,00 no AWS Budgets e o kill-switch são invioláveis.
5. **Dumb Client:** O Front-end não implementa validações ou cálculos de disponibilidade.

---

## 🧭 Mapa Rápido dos Domínios de Conhecimento

| Domínio | Pasta no Cofre | Descrição do Conteúdo |
| :--- | :--- | :--- |
| **🟣 00 - Meta** | `00 - Meta/` | [[00 - Meta/Índice Geral|Índice Geral]], [[00 - Meta/Governança e Squad|Governança do Squad]], [[00 - Meta/Contrato de Integração|Contratos]] e [[00 - Meta/Roadmap e Fases|Roadmap]] |
| **⚪ 01 - Visão Geral** | `01 - Visão Geral/` | [[01 - Visão Geral/Visão Geral da Arquitetura|Arquitetura Serverless]] e [[01 - Visão Geral/Missão e Impacto Social CPT|Missão Social CPT]] |
| **🟠 02 - Infraestrutura** | `02 - Infraestrutura/` | [[02 - Infraestrutura/Infraestrutura e SAM|AWS SAM IaC]], [[02 - Infraestrutura/Orçamento e Kill-Switch FinOps|FinOps e Kill-Switch]] e [[02 - Infraestrutura/Backlog de Infraestrutura AWS|Backlog]] |
| **🔷 03 - Front-End** | `03 - Front-End/` | [[03 - Front-End/Front-End Multiplataforma|React Native Expo]], [[03 - Front-End/Design System e Telas Stitch|Design Stitch]] e [[03 - Front-End/Acessibilidade WCAG e VLibras|Acessibilidade & VLibras]] |
| **🟢 04 - Back-End** | `04 - Back-End/` | [[04 - Back-End/Back-End e Microsserviços|Microsserviços Lambda]], [[04 - Back-End/Contratos Pydantic e Endpoints REST|Pydantic & REST]] e [[04 - Back-End/Dev Server e Emulação Moto|Dev Server Moto]] |
| **🔵 05 - Banco de Dados** | `05 - Banco de Dados/` | [[05 - Banco de Dados/Modelagem DynamoDB|DynamoDB Single Table]] e [[05 - Banco de Dados/Padrões de Acesso e Travas Atômicas|Travas Atômicas]] |
| **🔴 06 - QA e Testes** | `06 - QA e Testes/` | [[06 - QA e Testes/Estratégia de QA e Testes|Estratégia pytest]], [[06 - QA e Testes/Testes de Concorrência e Race Conditions|Concorrência Multithread]] e [[06 - QA e Testes/Relatório de Auditoria Lighthouse|Lighthouse]] |
| **🟡 07 - Acadêmico** | `07 - Documentação Acadêmica/` | [[07 - Documentação Acadêmica/Relatório Técnico de Engenharia|Relatório de Engenharia]], [[07 - Documentação Acadêmica/Manual de Uso e Recomendações de Segurança|Manual de Segurança]], [[07 - Documentação Acadêmica/Entregáveis Acadêmicos|Entregáveis]], [[07 - Documentação Acadêmica/Guia de Produção e Google Search Console|Guia GSC]] e [[07 - Documentação Acadêmica/Auditoria de Segurança e LGPD|Segurança & LGPD]] |

---

## 🤖 Squad de Subagentes Especializados

- **Subagent 1 (Infra/Líder):** AWS SAM, API Gateway, Cognito, Budget FinOps US$ 1,00.
- **Subagent 2 (Front-End/UI):** React Native, Expo Router, NativeWind, Google Stitch, WCAG 2.1 AA.
- **Subagent 3 (Back-End/API):** Lambdas Python 3.12+, Pydantic v2, padronização RESTful.
- **Subagent 4 (Banco de Dados):** Amazon DynamoDB, Single Table Design e `TransactWriteItems`.
- **Subagent 5 (QA & Testes):** pytest, testes de concorrência multithread e auditoria Lighthouse.
- **Subagent 6 (Documentação):** Cofre Obsidian, relatórios técnicos e manuais de extensão UniSENAI.

---

## 🏆 Indicadores de Qualidade Atuais
- **Testes Backend:** 9/9 testes passando em 2.68s (`pytest`)
- **Tipagem Frontend:** 0 erros de compilação (`npx tsc --noEmit`)
- **Rotas Estáticas:** 14 rotas compiladas no build estático web (`dist/`)
- **Lighthouse Scores:** **SEO 100**, **Acessibilidade 96**, **Boas Práticas 83+**
- **Vazamento de Segredos:** **Zero** credenciais em histórico git ou pacotes públicos.

