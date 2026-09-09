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

PORT = int(os.environ.get("PORT", 8000))

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
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-User-Id, X-User-Name, X-User-Email")
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
                        "email": user_email
                    }
                }
            }
        }

        # Roteamento RESTful
        response = None

        # 1. Rota de Usuário
        if path == "/users/me":
            response = users.handler(event, None)

        # 2. Rota de Reservas do Usuário
        elif path == "/reservations/me" and method == "GET":
            response = reservations.handler(event, None)

        # 3. Rota de Criação de Reserva: POST /sessions/{sessionId}/reservations
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

        # 7. Rota de Detalhes da Sessão: GET /sessions/{sessionId}
        elif match := re.match(r"^/sessions/([^/]+)$", path):
            event["pathParameters"] = {"sessionId": match.group(1)}
            response = sessions.handler(event, None)

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
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, LocalGatewayHandler)
    print(f"\n=======================================================")
    print(f"🚀 Va'aFlow Local Dev Server ativo em http://localhost:{PORT}")
    print(f"📦 Emulação DynamoDB (Moto) e Handlers Lambda carregados")
    print(f"🌊 Dados de demonstração semeados para testes offline")
    print(f"Pressione Ctrl+C para encerrar.")
    print(f"=======================================================\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nEncerrando Dev Server...")
    finally:
        moto_context.stop()


if __name__ == "__main__":
    run()
