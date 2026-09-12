# 🔐 Auditoria de Segurança, Proteção de Dados e Conformidade com a LGPD

> **Lei Geral de Proteção de Dados (Lei nº 13.709/2018):** Como o projeto lida com informações sensíveis de saúde e acessibilidade de paratletas, a governança de dados deve ser rígida por desenho (Privacy by Design).

---

## 🍪 1. Mecanismo de Consentimento LGPD (`CookieBanner.tsx`)

O aplicativo web implementa um modal de consentimento em conformidade com as diretrizes da Autoridade Nacional de Proteção de Dados (ANPD):

### Opções Disponíveis ao Remador:
1. **"Apenas Essenciais":**
   - Armazena apenas cookies de autenticação do Amazon Cognito e preferências de acessibilidade (tema escuro, contraste e tamanho da fonte).
   - Bloqueia a execução de qualquer script analítico externo ou de rastreamento.
2. **"Aceitar Todos":**
   - Habilita os cookies essenciais e carrega assincronamente a tag do Google Analytics 4 (`gtag.js`) com anonimização obrigatória de endereço IP (`anonymize_ip: true`).

### Persistência de Consentimento:
- A decisão do usuário é registrada sob a chave `vaaflow-lgpd-consent` no `localStorage`.
- O banner não é reapresentado até que o usuário limpe os dados do navegador ou solicite redefinição.

---

## 🏥 2. Tratamento de Dados Sensíveis de Saúde (Prontuário Náutico)

- **Classificação:** As informações de deficiência motora, necessidade de cadeira anfíbia e observações de saúde são tratadas como **dados sensíveis** (Art. 11 da LGPD).
- **Finalidade Exclusiva:** O armazenamento dessas informações atende estritamente à segurança do atleta durante a vivência náutica no mar (evitar acidentes, planejamento de resgate na água e balanceamento da canoa OC6).
- **Controle de Acesso por Papel (RBAC):** Somente o próprio atleta e instrutores credenciados com papel `INSTRUCTOR` ou `ADMIN` no Amazon Cognito têm permissão para visualizar o prontuário. A rota `/admin/users` é protegida com HTTP `403 Forbidden` para atletas convencionais.

---

## 🛡️ 3. Segregação de Credenciais e Proteção de Chaves

1. **Zero Credenciais no Front-End:** O cliente web/mobile consome a API através de tokens JWT emitidos pelo Cognito via SRP (Secure Remote Password). Chaves AWS IAM (`SecretAccessKey`) operam apenas internamente nas Lambdas.
2. **Controle de Vazamentos:** Arquivos `.env` protegidos pelo `.gitignore` com exclusão recursiva (`**/.env*`).
3. **CORS Restritivo:** Cabeçalhos `Access-Control-Allow-Origin` e `Access-Control-Allow-Methods` controlados no API Gateway e na padronização de respostas REST (`backend/common/responses.py`).

---

## 🔗 Navegação
- [[07 - Documentação Acadêmica/Relatório Técnico de Engenharia|Relatório Técnico de Engenharia]]
- [[07 - Documentação Acadêmica/Manual de Uso e Recomendações de Segurança|Manual de Segurança]]
- [[00 - Meta/MAIN|Central de Governança]]
