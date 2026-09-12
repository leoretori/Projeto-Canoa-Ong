# 🧪 Testes de Concorrência Multithread e Simulação de Race Conditions

> **Princípio de Verificação Concorrente:** Provar a ausência de overbooking exige simular cargas reais de usuários simultâneos no nível de milissegundos.

---

## 🔬 1. Arquitetura do Teste (`tests/test_concurrency_reservation.py`)

Para comprovar a robustez do DynamoDB e das regras da DAL contra race conditions, desenvolvemos testes automatizados utilizando a biblioteca padrão `threading` do Python em conjunto com o framework `pytest`.

```
[ Test Runner: 10 Threads Concorrentes ]
   ├── Thread 0: Reserva vaga adaptada -> [ DynamoDB TransactWriteItems ]
   ├── Thread 1: Reserva vaga adaptada -> [ DynamoDB TransactWriteItems ]
   ├── Thread 2: Reserva vaga adaptada -> [ DynamoDB TransactWriteItems ]
   │   ...
   └── Thread 9: Reserva vaga adaptada -> [ DynamoDB TransactWriteItems ]
```

---

## 🎯 2. Cenários Testados na Suíte

### Cenário A: Disputa da Última Vaga Adaptada (Race Condition)
- **Configuração da Sessão:** Canoa OC6 com capacidade total para 6 pessoas, mas com cota de apenas **1 assento adaptado** disponível (`max_adapted_seats: 1`).
- **Ação:** 10 threads concorrentes de atletas com necessidade adaptada disparam requisições atômicas simultaneamente no mesmo instante (`barrier` ou `start` conjunto).
- **Resultado Esperado e Validado:**
  - Exatamente **1 thread** obtém sucesso (`success_count == 1`).
  - Exatamente **9 threads** recebem erro controlado de conflito de overbooking (`error_count == 9`).
  - O estado final da sessão no DynamoDB registra rigorosamente: `booked_seats = 1` e `booked_adapted_seats = 1`.

### Cenário B: Prevenção de Reserva Duplicada pelo Mesmo Usuário
- O mesmo atleta tenta enviar duas requisições paralelas para a mesma remada.
- A trava de unicidade `attribute_not_exists(PK)` garante que apenas uma reserva seja persistida.

### Cenário C: Cancelamento e Liberação Atômica de Assento
- O cancelamento de uma reserva decrementa atômica e confiavelmente os contadores `booked_seats` e `booked_adapted_seats` com validação de que não fiquem negativos (`booked_seats >= 1`), liberando a vaga para o próximo remador.

---

## 🚀 3. Execução dos Testes

Para executar toda a suíte de testes de concorrência e handlers:
```bash
pytest tests/ -v
```

Resultado atual da suíte: **9 de 9 testes aprovados (100% pass)** em **2.68 segundos**.

---

## 🔗 Navegação
- [[06 - QA e Testes/Estratégia de QA e Testes|Estratégia de QA e Testes]]
- [[05 - Banco de Dados/Padrões de Acesso e Travas Atômicas|Padrões de Acesso e Travas Atômicas]]
- [[07 - Documentação Acadêmica/Relatório Técnico de Engenharia|Relatório Técnico de Engenharia]]
