# 🏛️ Visão Geral da Arquitetura SaaS Serverless

O **Va'aFlow** é uma plataforma SaaS projetada para gestão e agendamento de canoas e remadas esportivas/recreativas, operando sob uma arquitetura 100% Serverless na AWS.

---

## 🎯 Pilares da Arquitetura

1. **Single Codebase Front-end:**
   - Interface única e unificada para Web e Mobile utilizando React Native, Expo e Expo Router.
   - Camada visual componentizada e responsiva com NativeWind (Tailwind).

2. **Event-Driven & FaaS Back-end:**
   - Microsserviços desacoplados e orientados a eventos executados em AWS Lambda com Python 3.12+.
   - Validação estrita de tipos e schemas com Pydantic v2.

3. **NoSQL Single Table Design:**
   - Amazon DynamoDB como fonte primária de dados.
   - Padrões de acesso otimizados, baixa latência e travas lógicas de concorrência.

4. **Infraestrutura como Código Declarativa:**
   - AWS SAM (`template.yaml`) para controle de versão, reprodutibilidade e conformidade orçamentária (Budget Alert de US$ 1,00).

---

## 🧭 Fluxo de Dados e Requisições

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
- [[02 - Infraestrutura/Infraestrutura e SAM|Infraestrutura e SAM]]
- [[03 - Front-End/Front-End Multiplataforma|Front-End Multiplataforma]]
- [[04 - Back-End/Back-End e Microsserviços|Back-End e Microsserviços]]
- [[05 - Banco de Dados/Modelagem DynamoDB|Modelagem DynamoDB]]
- [[00 - Meta/Índice Geral|Índice Geral]]

