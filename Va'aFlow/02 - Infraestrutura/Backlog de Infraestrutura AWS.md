# 📋 Backlog de Infraestrutura AWS

As configurações finais da AWS (credenciais, contas, domínios e e-mails reais) ainda **não estão prontas** e foram isoladas no backlog para a fase final de deploy (ou para repasse à gestão do Va'aFlow).

---

## 📌 Pendências para o Deploy em Nuvem

### 1. Parâmetros do AWS SAM (`template.yaml` e `samconfig.toml`)
- [ ] **BudgetAlertEmail:** Preencher com o e-mail real do gestor financeiro do Va'aFlow no parâmetro `BudgetAlertEmail` do arquivo `samconfig.toml`. O limite já está cravado em US$ 1,00, mas os alertas precisam de um destinatário válido.
- [ ] **Region e Conta AWS:** Configurar as credenciais da AWS CLI (`aws configure`) na máquina que fará o `sam deploy`. A região sugerida é `us-east-1` (Virginia) ou `sa-east-1` (São Paulo).

### 2. Amazon Cognito
- [ ] **Domínio do Cognito:** Escolher e configurar um domínio personalizado (ex: `auth.vaaflow.com.br`) ou prefixo gerado pela AWS para a página de login hospedada (Hosted UI).
- [ ] **E-mails Transacionais:** Configurar o Amazon SES (Simple Email Service) se o Va'aFlow desejar enviar e-mails de recuperação de senha com remetente próprio (atualmente usa o default do Cognito).

### 3. Integração com o Front-End
- [ ] **Variáveis de Ambiente (.env):** O Subagent 2 precisará das saídas do SAM (Outputs) geradas após o deploy:
  - `EXPO_PUBLIC_API_URL` (URL base do API Gateway, ex: `/dev`)
  - `EXPO_PUBLIC_USER_POOL_ID` (ID do Cognito)
  - `EXPO_PUBLIC_CLIENT_ID` (ID do App Client)
- [ ] **Endpoints Implementados e Prontos para Consumo:**
  - `GET /users/me` e `PUT /users/me` (Gestão de perfil e necessidades adaptadas)
  - `GET /sessions` e `POST /sessions` (Calendário e criação de remadas)
  - `GET /sessions/{sessionId}` e `PATCH /sessions/{sessionId}/status`
  - `POST /sessions/{sessionId}/reservations` (Reserva atômica com trava de concorrência)
  - `GET /reservations/me` (Listagem das remadas do remador)
  - `DELETE /sessions/{sessionId}/reservations/{userId}` (Cancelamento atômico)

---

## 🔗 Links Relacionados
- [[02 - Infraestrutura/Infraestrutura e SAM|Infraestrutura e SAM]]
- [[00 - Meta/Índice Geral|Índice Geral]]

