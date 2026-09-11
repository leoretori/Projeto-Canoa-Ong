# 🏛️ Visão Geral da Arquitetura SaaS Serverless

O **Va'aFlow** é uma plataforma SaaS projetada para gestão e agendamento de canoas e remadas esportivas/recreativas, operando sob uma arquitetura 100% Serverless na AWS.
O **Va'aFlow** é uma plataforma SaaS projetada para gestão e agendamento inclusivo de canoas havaianas (Va'a), operando sob uma arquitetura **100% Serverless** na Amazon Web Services (AWS) com custo sob demanda e tolerância a falhas.

---

## 🎯 Pilares da Arquitetura
## 🎯 Pilares Estratégicos da Arquitetura

1. **Single Codebase Front-end:**
   - Interface única e unificada para Web e Mobile utilizando React Native, Expo e Expo Router.
   - Camada visual componentizada e responsiva com NativeWind (Tailwind).
1. **Cliente Estúpido (Dumb Client Multiplataforma):**
   - Código único compilado para Web, iOS e Android via **React Native + Expo Router + NativeWind**.
   - O Front-end não detém regras de domínio, limiares de assentos ou cálculos de disponibilidade.
2. **Back-End FaaS com Validação Estrita:**
   - AWS Lambda executando Python 3.12 com validação profunda por contratos **Pydantic v2**.
   - Tratamento estruturado de exceções e respostas REST padronizadas.
3. **Persistência Concorrente Atômica:**
   - **Amazon DynamoDB** em Single Table Design.
   - Travas atômicas contra overbooking (`TransactWriteItems`) de assentos adaptados e convencionais.
4. **Governança FinOps & Kill-Switch:**
   - Infraestrutura como Código via AWS SAM (`template.yaml`).
   - Orçamento mensal travado em **US$ 1,00** com desligamento autônomo da API ao atingir 100%.

2. **Event-Driven & FaaS Back-end:**
   - Microsserviços desacoplados e orientados a eventos executados em AWS Lambda com Python 3.12+.
   - Validação estrita de tipos e schemas com Pydantic v2.
---

3. **NoSQL Single Table Design:**
   - Amazon DynamoDB como fonte primária de dados.
   - Padrões de acesso otimizados, baixa latência e travas lógicas de concorrência.
## 🧭 Diagrama Arquitetural de Ponta a Ponta

4. **Infraestrutura como Código Declarativa:**
   - AWS SAM (`template.yaml`) para controle de versão, reprodutibilidade e conformidade orçamentária (Budget Alert de US$ 1,00).
```mermaid
flowchart TD
    subgraph ClientLayer["Camada de Apresentação (Multiplataforma)"]
        Web["Navegador Web (PWA / SEO / A11y)"]
        Mobile["Smartphone Físico (iOS / Android Expo)"]
    end

---
    subgraph SecurityEdge["Borda de Rede e Segurança"]
        APIGW["Amazon API Gateway (REST HTTP + CORS)"]
        Cognito["Amazon Cognito (User Pool + SRP Auth)"]
        Uptime["Monitor de Uptime / Healthcheck"]
    end

## 🧭 Fluxo de Dados e Requisições
    subgraph ComputeLayer["Microsserviços FaaS (AWS Lambda Python 3.12)"]
        HF_Sessions["SessionsFunction (/sessions, /health)"]
        HF_Res["ReservationsFunction (/reservations)"]
        HF_Users["UsersFunction (/users/me)"]
        HF_Admin["AdminFunction (/admin/users)"]
        HF_Kill["KillSwitchFunction (Contenção de Custo)"]
    end

    subgraph DataLayer["Persistência & FinOps"]
        Dynamo[("Amazon DynamoDB (VaaFlow Single Table)")]
        Budgets["AWS Budgets ($1.00/mês)"]
        SNS["Tópico SNS de Alerta"]
    end

    Web -->|HTTPS / JWT| APIGW
    Mobile -->|HTTPS / JWT| APIGW
    Uptime -->|GET /health| APIGW
    APIGW -.->|Validação de Token| Cognito
    
    APIGW --> HF_Sessions
    APIGW --> HF_Res
    APIGW --> HF_Users
    APIGW --> HF_Admin

    HF_Sessions -->|Query / Put| Dynamo
    HF_Res -->|TransactWriteItems Atômico| Dynamo
    HF_Users -->|Get / Update| Dynamo
    HF_Admin -->|List / Alter Role| Cognito

    Budgets -->|Estouro 100%| SNS
    SNS --> HF_Kill
    HF_Kill -->|Throttling = 0| APIGW
```
[ Usuário: Web / Mobile ]
           │  (HTTPS / REST)
           ▼
[ Amazon API Gateway + Cognito User Pool ]
           │
           ▼
[ AWS Lambda Functions (Python 3.12 + Pydantic) ]
           │
           ▼
[ Amazon DynamoDB (Single Table Design) ]
```

---

## 🔗 Links Relacionados
## 🔐 Fluxo de Autenticação e Autorização por Papéis

1. O atleta ou instrutor autentica-se diretamente contra o **Amazon Cognito User Pool**.
2. O Cognito emite tokens JWT (`id_token`, `access_token`) contendo a claim personalizada `custom:role`:
   - `ATHLETE`: Visualiza remadas, agenda vagas e atualiza seu prontuário de acessibilidade.
   - `INSTRUCTOR`: Cria remadas, altera status de sessões e visualiza lista de chamada na guarderia.
   - `ADMIN`: Promove e rebaixa papéis de usuários e audita permissões do sistema.
3. O API Gateway valida a assinatura criptográfica do JWT antes de repassar o evento às funções Lambda.

---

## 🔗 Navegação
- [[01 - Visão Geral/Missão e Impacto Social CPT|Missão Social CPT]]
- [[02 - Infraestrutura/Infraestrutura e SAM|Infraestrutura e SAM]]
- [[03 - Front-End/Front-End Multiplataforma|Front-End Multiplataforma]]
- [[04 - Back-End/Back-End e Microsserviços|Back-End e Microsserviços]]
- [[05 - Banco de Dados/Modelagem DynamoDB|Modelagem DynamoDB]]
- [[00 - Meta/Índice Geral|Índice Geral]]
- [[05 - Banco de Dados/Padrões de Acesso e Travas Atômicas|Padrões de Acesso DynamoDB]]
- [[00 - Meta/MAIN|Central de Governança]]


