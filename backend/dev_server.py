"""
Servidor de Desenvolvimento Local do Va'aFlow.
Emula o AWS API Gateway e Amazon DynamoDB localmente em memória via Moto.
Permite desenvolvimento e testes 100% offline do Front-End sem credenciais AWS.
"""

import sys
import os
import json
import re
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# Configurações AWS de desenvolvimento em memória
os.environ["AWS_ACCESS_KEY_ID"] = "testing-local"
os.environ["AWS_SECRET_ACCESS_KEY"] = "testing-local"
os.environ["AWS_DEFAULT_REGION"] = "us-east-1"
os.environ["TABLE_NAME"] = "VaaFlow-dev"

import boto3
from moto import mock_aws

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from common.dynamo_dal import DynamoDAL
from handlers import users, sessions, reservations

PORT = int(os.environ.get("PORT", 3333))

# Contexto global mock_aws mantido ativo durante a execução do servidor
moto_context = mock_aws()
moto_context.start()

# Inicializa tabela DynamoDB
dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
table = dynamodb.create_table(
    TableName="VaaFlow-dev",
    KeySchema=[
        {"AttributeName": "PK", "KeyType": "HASH"},
        {"AttributeName": "SK", "KeyType": "RANGE"}
    ],
    AttributeDefinitions=[
        {"AttributeName": "PK", "AttributeType": "S"},
        {"AttributeName": "SK", "AttributeType": "S"},
        {"AttributeName": "GSI1PK", "AttributeType": "S"},
        {"AttributeName": "GSI1SK", "AttributeType": "S"}
    ],
    GlobalSecondaryIndexes=[
        {
            "IndexName": "GSI1",
            "KeySchema": [
                {"AttributeName": "GSI1PK", "KeyType": "HASH"},
                {"AttributeName": "GSI1SK", "KeyType": "RANGE"}
            ],
            "Projection": {"ProjectionType": "ALL"}
        }
    ],
    BillingMode="PAY_PER_REQUEST"
)

# Seed de dados iniciais para testes locais
dal = DynamoDAL(table_name="VaaFlow-dev")
dal.create_session({
    "session_id": "session-seed-1",
    "date": "2026-10-25",
    "time": "06:00",
    "location": "Praia Grande - São Sebastião",
    "canoe_type": "OC6",
    "total_capacity": 6,
    "max_adapted_seats": 2,
    "instructor_name": "Mestre Kaique",
    "notes": "Remada de nascer do sol com suporte a cadeirantes."
})
dal.create_session({
    "session_id": "session-seed-2",
    "date": "2026-10-25",
    "time": "08:30",
    "location": "Praia Grande - São Sebastião",
    "canoe_type": "OC6",
    "total_capacity": 6,
    "max_adapted_seats": 1,
    "instructor_name": "Instrutora Fernanda",
    "notes": "Treino técnico de remada havaiana inclusiva."
})


class LocalGatewayHandler(BaseHTTPRequestHandler):
    def _send_cors(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-User-Id, X-User-Name, X-User-Email, X-User-Role")
        self.end_headers()

    def do_OPTIONS(self):
        self._send_cors()

    def _handle_request(self, method: str):
        parsed = urlparse(self.path)
        path = parsed.path
        query_params = {k: v[0] for k, v in parse_qs(parsed.query).items()}

        content_length = int(self.headers.get("Content-Length", 0))
        body_raw = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else ""

        # Identidade mockada do usuário autenticado via Cognito/Headers
        user_id = self.headers.get("X-User-Id", "atleta-local-001")
        user_name = self.headers.get("X-User-Name", "Atleta UniSENAI")
        user_email = self.headers.get("X-User-Email", "atleta@cpt.org")
        user_role = self.headers.get("X-User-Role", "ATHLETE")

        # Se houver token JWT na Authorization, tenta extrair claims locais
        auth_header = self.headers.get("Authorization", "")
        if auth_header and "." in auth_header:
            try:
                import base64
                parts = auth_header.split(".")
                if len(parts) >= 2:
                    padding = "=" * ((4 - len(parts[1]) % 4) % 4)
                    payload_raw = base64.urlsafe_b64decode(parts[1] + padding)
                    payload = json.loads(payload_raw.decode("utf-8"))
                    user_id = payload.get("sub", user_id)
                    user_name = payload.get("name", user_name)
                    user_email = payload.get("email", user_email)
                    user_role = payload.get("custom:role", user_role)
            except Exception:
                pass

        event = {
            "httpMethod": method,
            "path": path,
            "queryStringParameters": query_params,
            "headers": dict(self.headers),
            "body": body_raw,
            "pathParameters": {},
            "requestContext": {
                "authorizer": {
                    "claims": {
                        "sub": user_id,
                        "name": user_name,
                        "email": user_email,
                        "custom:role": user_role
                    }
                }
            }
        }

        # Roteamento RESTful
        response = None

        # 0. Rota Raiz e Healthcheck
        if path in ["/", "/health"] and method == "GET":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            welcome = {
                "service": "Va'aFlow Local Dev Server (Serverless Emulation)",
                "status": "ONLINE",
                "message": "Servidor de backend local ativo. O aplicativo Expo deve ser acessado no navegador pela porta do Metro (geralmente http://localhost:8081).",
                "endpoints": [
                    "GET  /sessions - Listar remadas",
                    "POST /sessions - Criar nova remada",
                    "GET  /sessions/{sessionId} - Detalhes da remada",
                    "PATCH /sessions/{sessionId}/status - Atualizar status",
                    "POST /sessions/{sessionId}/reservations - Agendamento atomico de vaga",
                    "GET  /reservations/me - Listar minhas reservas",
                    "GET  /reservations/recent - Feed de atividade recente",
                    "DELETE /sessions/{sessionId}/reservations/{userId} - Cancelar reserva",
                    "GET  /users/me - Perfil do remador",
                    "PUT  /users/me - Atualizar necessidades de acessibilidade",
                    "GET  /admin/users - Gestão de usuários (Admin)",
                    "PATCH /admin/users/{userId}/role - Alterar role (Admin)"
                ]
            }
            self.wfile.write(json.dumps(welcome, ensure_ascii=False, indent=2).encode("utf-8"))
            return

        # 1. Rota de Usuário
        elif path == "/users/me":
            response = users.handler(event, None)

        # 2. Rota de Reservas do Usuário
        elif path == "/reservations/me" and method == "GET":
            response = reservations.handler(event, None)

        # 2b. Atividade Recente
        elif path == "/reservations/recent" and method == "GET":
            response = reservations.handler(event, None)

        # 3. Rota de Criação de Reserva e Listagem de Inscritos: /sessions/{sessionId}/reservations
        elif match := re.match(r"^/sessions/([^/]+)/reservations$", path):
            event["pathParameters"] = {"sessionId": match.group(1)}
            response = reservations.handler(event, None)

        # 4. Rota de Cancelamento de Reserva: DELETE /sessions/{sessionId}/reservations/{userId}
        elif match := re.match(r"^/sessions/([^/]+)/reservations/([^/]+)$", path):
            event["pathParameters"] = {"sessionId": match.group(1), "userId": match.group(2)}
            response = reservations.handler(event, None)

        # 5. Rota de Sessões: GET /sessions e POST /sessions
        elif path == "/sessions":
            response = sessions.handler(event, None)

        # 6. Rota de Status da Sessão: PATCH /sessions/{sessionId}/status
        elif match := re.match(r"^/sessions/([^/]+)/status$", path):
            event["pathParameters"] = {"sessionId": match.group(1)}
            response = sessions.handler(event, None)

        # 7. Rota de Detalhes da Sessão: GET ou PUT /sessions/{sessionId}
        elif match := re.match(r"^/sessions/([^/]+)$", path):
            event["pathParameters"] = {"sessionId": match.group(1)}
            response = sessions.handler(event, None)

        # 8. Rota de Usuários Admin: GET /admin/users
        elif path == "/admin/users" and method == "GET":
            mock_admin_users = [
                {"user_id": "user-local-admin", "name": "Coordenador Geral", "email": "admin@cpt.org", "role": "ADMIN", "status": "CONFIRMED", "enabled": True},
                {"user_id": "user-local-instrutor", "name": "Mestre Kaique", "email": "instrutor@cpt.org", "role": "INSTRUCTOR", "status": "CONFIRMED", "enabled": True},
                {"user_id": "user-local-atleta", "name": "Remador UniSENAI", "email": "remador@cpt.org", "role": "ATHLETE", "status": "CONFIRMED", "enabled": True}
            ]
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(mock_admin_users).encode("utf-8"))
            return

        # 9. Rota de Alteração de Role Admin: PATCH /admin/users/{userId}/role
        elif match := re.match(r"^/admin/users/([^/]+)/role$", path):
            body_json = json.loads(body_raw) if body_raw else {}
            new_role = body_json.get("role", "ATHLETE")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"user_id": match.group(1), "role": new_role}).encode("utf-8"))
            return

        else:
            self.send_response(404)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "NOT_FOUND", "message": f"Rota {path} não encontrada."}).encode("utf-8"))
            return

        # Responde ao cliente
        status_code = response.get("statusCode", 200)
        self.send_response(status_code)
        
        headers = response.get("headers", {})
        headers["Access-Control-Allow-Origin"] = "*"
        for k, v in headers.items():
            self.send_header(k, v)
        self.end_headers()

        resp_body = response.get("body", "{}")
        self.wfile.write(resp_body.encode("utf-8"))

    def do_GET(self):
        self._handle_request("GET")

    def do_POST(self):
        self._handle_request("POST")

    def do_PUT(self):
        self._handle_request("PUT")

    def do_PATCH(self):
        self._handle_request("PATCH")

    def do_DELETE(self):
        self._handle_request("DELETE")


def run():
    candidate_ports = [PORT, 3334, 4000, 5000, 8001] if PORT == 3333 else [PORT]
    httpd = None
    active_port = PORT

    for port in candidate_ports:
        try:
            server_address = ("127.0.0.1", port)
            httpd = HTTPServer(server_address, LocalGatewayHandler)
            active_port = port
            break
        except (PermissionError, OSError) as e:
            print(f"[AVISO] Porta {port} indisponivel ou bloqueada pelo Windows ({e}). Tentando proxima porta...")

    if not httpd:
        print("[ERRO] Nao foi possivel iniciar o servidor em nenhuma das portas candidatas.")
        return

    print(f"\n=======================================================")
    print(f">> Va'aFlow Backend API ativo em http://127.0.0.1:{active_port}")
    print(f">> Emulacao DynamoDB (Moto) e Handlers Lambda carregados")
    print(f">> [FRONT-END]: Abra outro terminal e rode 'npm run web'")
    print(f">>              O app abrira no navegador em http://localhost:8081")
    print(f">> Pressione Ctrl+C para encerrar o backend.")
    print(f"=======================================================\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nEncerrando Dev Server...")
    finally:
        moto_context.stop()


if __name__ == "__main__":
    run()

