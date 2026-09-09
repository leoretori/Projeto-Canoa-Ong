# 🎓 Relatório Técnico de Engenharia de Software

> **Projeto de Extensão Universitária 2026 — UniSENAI São Caetano do Sul**  
> **Iniciativa Parceira:** Projeto Canoa Para Todos (CPT) — São Sebastião/SP  
> **Docente Responsável:** Prof. Dr. Fabio Xavier de Melo  
> **Frente 4:** Aplicativo de Agendamento Inclusivo de Remadas Va'a (Carga Horária: 40h)  

---

## 1. Contexto, Justificativa e Missão Social
O Projeto Canoa Para Todos (fundado em 2015) promove a prática inclusiva da canoa havaiana (Va'a) no litoral norte paulista, integrando pessoas com deficiência física e mobilidade reduzida ao ambiente náutico.
A movimentação de canoas de grande porte (como modelos OC6 de ~150 kg) e o embarque seguro de atletas cadeirantes exigem coordenação prévia de voluntários, preparação de assentos adaptados e rígido controle de lotação.

### Alinhamento aos Objetivos de Desenvolvimento Sustentável (ODS da ONU):
- **ODS 10 (Redução das Desigualdades):** Democratização do esporte náutico com reserva prioritária de assentos adaptados.
- **ODS 3 (Saúde e Bem-Estar):** Reabilitação psicomotora, convívio comunitário e bem-estar físico.

---

## 2. Decisões de Arquitetura e Engenharia

### 2.1 Modelo SaaS 100% Serverless (Custo Zero)
Para viabilizar a sustentabilidade da iniciativa sem custos fixos de servidores:
- **AWS Lambda (Python 3.12+):** Execução sob demanda tarifada em milissegundos, operando integralmente na faixa gratuita (Free Tier).
- **Amazon DynamoDB (Single Table Design):** Modo sob demanda (`PAY_PER_REQUEST`), com baixa latência e alta disponibilidade.
- **AWS Budgets Alert Mandatório:** Trava orçamentária rígida de **US$ 1,00/mês** provisionada via AWS SAM, prevenindo qualquer cobrança inesperada para a instituição.

### 2.2 Desacoplamento Estrito (Front-End Dumb Client)
- A interface (React Native + Expo) atua exclusivamente como cliente de apresentação.
- Toda regra de elegibilidade, cálculo de vagas e concorrência é centralizada nos microsserviços.

---

## 3. Prevenção de Overbooking e Concorrência Atômica
A maior criticidade do sistema reside na garantia de que múltiplos atletas disputando a última vaga adaptada não gerem overbooking no mar.
- **Mecanismo:** Transações atômicas via `TransactWriteItems` com `ConditionExpression` do DynamoDB:
  $$\text{booked\_seats} < \text{total\_capacity} \quad \land \quad \text{booked\_adapted\_seats} < \text{max\_adapted\_seats}$$
- **Resultados de QA:** Em testes com 10 threads concorrentes simultâneas disputando 1 única vaga adaptada, o sistema obteve $100\%$ de precisão: exatamente 1 confirmação (`201 Created`) e 9 rejeições semânticas (`409 Conflict`), preservando a integridade da frota.

---

## 🔗 Links Relacionados
- [[01 - Visão Geral/Visão Geral da Arquitetura|Visão Geral da Arquitetura]]
- [[05 - Banco de Dados/Modelagem DynamoDB|Modelagem DynamoDB]]
- [[06 - QA e Testes/Estratégia de QA e Testes|Estratégia de QA e Testes]]
- [[00 - Meta/Índice Geral|Índice Geral]]

