# Guia de Prontidão em Produção, SEO e Google Search Console

Este guia detalha os procedimentos para indexação oficial no Google, monitoramento de saúde operacional e boas práticas de segurança para o **Canoa Para Todos (Va'aFlow)**.

---

## 1. Cadastro no Google Search Console (GSC)

### Passo a Passo de Verificação:
1. Acesse o [Google Search Console](https://search.google.com/search-console).
2. Adicione uma nova propriedade escolhendo **Prefixo do URL**: `https://canoaparatodos.org` (ou seu domínio de produção).
3. **Método de Verificação por Tag HTML**:
   - Copie o token de verificação fornecido pelo Google.
   - O arquivo `frontend/src/app/+html.tsx` já possui a tag preparada:
     ```html
     <meta name="google-site-verification" content="COLOQUE_SEU_TOKEN_AQUI" />
     ```
   - Alternativamente, use a verificação via **Registro DNS TXT** no seu provedor de domínio (Route 53, Cloudflare ou Registro.br).
4. Clique em **Verificar**.

### Envio do Sitemap:
1. No menu lateral do GSC, selecione **Sitemaps**.
2. No campo "Adicionar um novo sitemap", digite: `sitemap.xml`.
3. Clique em **Enviar**. O Google iniciará o rastreamento das rotas públicas (`/`, `/login`, `/register`).

---

## 2. Arquivos de Indexação e Agentes de IA

- **`robots.txt`** (`frontend/public/robots.txt`): Permite indexação de rotas públicas e bloqueia áreas sensíveis (`/(tabs)/`, `/admin/`), apontando para o sitemap oficial.
- **`sitemap.xml`** (`frontend/public/sitemap.xml`): Declara URLs canônicas, prioridades e frequências de atualização.
- **`llms.txt`** (`frontend/public/llms.txt`): Documentação estruturada para agentes autônomos e assistentes de IA que consom a plataforma.

---

## 3. Monitoramento de Erros e Disponibilidade (Uptime)

### Healthcheck Nativo (`GET /health`)
- Rota pública e sem autenticação provisionada no AWS SAM (`template.yaml`) e emulada no dev server (`backend/dev_server.py`).
- Retorna `HTTP 200` com `{ "status": "HEALTHY", "service": "Va'aFlow API", "version": "1.0.0" }`.

### Configuração de Alerta de Uptime (UptimeRobot / Better Stack):
1. Crie um monitor HTTP(s) apontando para `https://api.canoaparatodos.org/health`.
2. Defina intervalo de checagem de 1 a 5 minutos.
3. Configure notificações para o WhatsApp ou e-mail institucional dos instrutores em caso de inatividade.

---

## 4. Testes de Responsividade em Celular Real

Para testar o layout em smartphones físicos na mesma rede Wi-Fi:
1. Certifique-se de que o computador e o celular estão na mesma rede local.
2. Inicie o Expo com o comando:
   ```bash
   cd frontend
   npx expo start --host lan
   ```
3. Abra a câmera do celular (iOS) ou o app Expo Go (Android) e escaneie o QR Code gerado no terminal.
4. Para acessar diretamente no navegador mobile, digite o IP indicado (ex: `http://192.168.1.X:8081`).

---

## 5. Auditoria de Segredos e LGPD

- **Segurança**: Chaves de API e segredos AWS (`AWS_SECRET_ACCESS_KEY`) nunca são expostos no front-end; todas as operações autenticadas passam pelo Amazon Cognito e API Gateway.
- **LGPD**: O banner `CookieBanner.tsx` armazena a preferência de cookies em `localStorage` e só injeta scripts de telemetria/Google Analytics após consentimento explícito do usuário.
