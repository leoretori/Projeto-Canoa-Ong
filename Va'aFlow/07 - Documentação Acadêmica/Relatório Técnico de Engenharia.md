# 🎓 Relatório Técnico de Engenharia de Software

> **Projeto de Extensão Universitária 2026 — UniSENAI São Caetano do Sul**  
> **Iniciativa Parceira:** Projeto Canoa Para Todos (CPT) — São Sebastião/SP  
> **Docente Responsável:** Prof. Dr. Fabio Xavier de Melo  
> **Frente 4:** Aplicativo de Agendamento Inclusivo de Remadas Va'a (Carga Horária: 40h)  
> **Docente Orientador:** Prof. Dr. Fabio Xavier de Melo  
> **Autores / Discentes:** Leonardo Retori Apolonio e Murilo Lameira  
> **Frente de Trabalho:** SaaS Inclusivo de Agendamento de Remadas Va'a (Carga Horária: 40h)  

---

## 1. Contexto, Justificativa e Missão Social
O Projeto Canoa Para Todos (fundado em 2015) promove a prática inclusiva da canoa havaiana (Va'a) no litoral norte paulista, integrando pessoas com deficiência física e mobilidade reduzida ao ambiente náutico.
A movimentação de canoas de grande porte (como modelos OC6 de ~150 kg) e o embarque seguro de atletas cadeirantes exigem coordenação prévia de voluntários, preparação de assentos adaptados e rígido controle de lotação.

O **Projeto Canoa Para Todos** (fundado em 2015 em São Sebastião - SP, Base Náutica da Praia Grande) promove a inclusão social e esportiva através da Canoa Polinésia (Va'a), permitindo que paratletas cadeirantes, amputados, neurodivergentes e idosos tenham acesso seguro ao mar.

### Alinhamento aos Objetivos de Desenvolvimento Sustentável (ODS da ONU):
- **ODS 10 (Redução das Desigualdades):** Democratização do esporte náutico com reserva prioritária de assentos adaptados.
- **ODS 3 (Saúde e Bem-Estar):** Reabilitação psicomotora, convívio comunitário e bem-estar físico.
- **ODS 10 (Redução das Desigualdades):** Democratização do esporte com reserva prioritária de assentos adaptados e acessibilidade digital irrestrita.
- **ODS 3 (Saúde e Bem-Estar):** Reabilitação psicomotora, melhora do tônus muscular e saúde mental pelo contato com a natureza marinha.

---

## 2. Decisões de Arquitetura e Engenharia

### 2.1 Modelo SaaS 100% Serverless (Custo Zero)
Para viabilizar a sustentabilidade da iniciativa sem custos fixos de servidores:
- **AWS Lambda (Python 3.12+):** Execução sob demanda tarifada em milissegundos, operando integralmente na faixa gratuita (Free Tier).
- **Amazon DynamoDB (Single Table Design):** Modo sob demanda (`PAY_PER_REQUEST`), com baixa latência e alta disponibilidade.
- **AWS Budgets Alert Mandatório:** Trava orçamentária rígida de **US$ 1,00/mês** provisionada via AWS SAM, prevenindo qualquer cobrança inesperada para a instituição.
### 2.1 Modelo SaaS 100% Serverless (FinOps & Custo Zero)
- **AWS Lambda (Python 3.12+):** Microsserviços executados sob demanda com tarifação por milissegundos dentro do AWS Free Tier.
- **Amazon DynamoDB (Single Table Design):** Modo sob demanda (`PAY_PER_REQUEST`), com latência de resposta em milissegundos e alta disponibilidade regional.
- **Governança de Custos Inviolável:** AWS Budgets com trava rígida de **US$ 1,00/mês** e kill-switch autônomo via SNS (`killswitch.py`), que corta o throttling da API ao estourar o orçamento, impedindo qualquer custo para a faculdade.

### 2.2 Desacoplamento Estrito (Front-End Dumb Client)
- A interface (React Native + Expo) atua exclusivamente como cliente de apresentação.
- Toda regra de elegibilidade, cálculo de vagas e concorrência é centralizada nos microsserviços.
- Aplicativo multiplataforma em **React Native + Expo Router + NativeWind** compilado para Web, iOS e Android.
- O Front-end atua estritamente na apresentação. Toda validação de negócio, elegibilidade de vagas e cotas é processada nas Lambdas com **Pydantic v2**.

### 2.3 Design System Inclusivo & Acessibilidade (Google Stitch & WCAG 2.1 AA)
Para garantir usabilidade irrestrita para remadores com deficiência e baixa visão:
- **Design System Marítimo:** Identidade visual concebida no Google Stitch com tokens náuticos de alto contraste (`#00687a`, `#004e68`, `#793200`).
- **Barra de Acessibilidade Assistiva:** Ferramentas nativas no topo para redimensionamento escalável de fonte (`A-` / `A+`) e ativação do modo Alto Contraste com relação de luminância $\ge 7:1$.
- **Ergonomia do Embarque Náutico:** O cartão de embarque digital sinaliza a presença de esteiras de areia plana e cadeiras anfíbias até a lâmina d'água, reduzindo a ansiedade do paratleta no dia da atividade.
### 2.3 Acessibilidade Universal & Google Stitch (WCAG 2.1 AAA & LIBRAS)
- Layouts de alta fidelidade extraídos do **Google Stitch** via MCP.
- Barra de Acessibilidade Cidadã com redimensionamento de fonte (`A-`/`A+`), Modo Escuro Oceânico persistente, Alto Contraste amarelo/preto (`#ffff00` / `#000000`, razão 19.5:1) e integração oficial com o avatar 3D do **VLibras**.

---

## 3. Prevenção de Overbooking e Concorrência Atômica
A maior criticidade do sistema reside na garantia de que múltiplos atletas disputando a última vaga adaptada não gerem overbooking no mar.

- **Mecanismo:** Transações atômicas via `TransactWriteItems` com `ConditionExpression` do DynamoDB:
  $$\text{booked\_seats} < \text{total\_capacity} \quad \land \quad \text{booked\_adapted\_seats} < \text{max\_adapted\_seats}$$
- **Resultados de QA:** Em testes com 10 threads concorrentes disputando 1 única vaga adaptada, o sistema obteve $100\%$ de precisão: exatamente 1 confirmação (`201 Created`) e 9 rejeições controladas (`409 Conflict`), mantendo a cota exata da canoa.

---

## 4. Prontidão para Produção e Auditoria de Qualidade

Na fase final de engenharia, foram implementadas as diretrizes de produção e conformidade:
1. **Auditoria Lighthouse:** **SEO: 100/100**, **Acessibilidade: 96/100**, **Boas Práticas: 83/100**.
2. **SEO & Indexação:** OpenGraph, Twitter Cards, `sitemap.xml`, `robots.txt` e `llms.txt`.
3. **Privacidade & LGPD:** Banner de consentimento de cookies com segregação de analíticos (`CookieBanner.tsx`).
4. **Monitoramento:** Endpoint público `GET /health` pronto para monitores de Uptime sintéticos.
5. **Auditoria de Segredos:** Varredura em todo o repositório confirmando zero credenciais ou chaves expostas.
6. **Redesign Visual & Stitch MCP:** Tema escuro oceânico com tokens Stitch e tela de login split hero responsiva com foto real de São Sebastião e depoimento comunitário.

---

## 🔗 Navegação
- [[01 - Visão Geral/Visão Geral da Arquitetura|Visão Geral da Arquitetura]]
- [[05 - Banco de Dados/Modelagem DynamoDB|Modelagem DynamoDB]]
- [[06 - QA e Testes/Estratégia de QA e Testes|Estratégia de QA e Testes]]
- [[00 - Meta/Índice Geral|Índice Geral]]
- [[05 - Banco de Dados/Padrões de Acesso e Travas Atômicas|Travas Atômicas DynamoDB]]
- [[06 - QA e Testes/Relatório de Auditoria Lighthouse|Relatório Lighthouse]]
- [[07 - Documentação Acadêmica/Guia de Produção e Google Search Console|Guia de Produção e GSC]]
- [[00 - Meta/MAIN|Central de Governança]]


