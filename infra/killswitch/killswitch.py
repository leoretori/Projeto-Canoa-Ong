"""
Kill-switch de contenção de custos do Va'aFlow.
Gerenciado pelo Subagent 1 (Infra/Líder).

Disparado via SNS quando o AWS Budget (US$ 1,00/mês) atinge 100%.
Ao ser acionado, zera o rate limit (throttling) do estágio do API Gateway,
bloqueando novas requisições sem deletar nenhum recurso provisionado.
"""

import json
import logging
import os

import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)

apigateway = boto3.client("apigateway")

API_ID = os.environ["API_ID"]
STAGE_NAME = os.environ["STAGE_NAME"]


def handler(event, context):
    message = event["Records"][0]["Sns"]["Message"]
    logger.info("Budget alert recebido: %s", message)

    apigateway.update_stage(
        restApiId=API_ID,
        stageName=STAGE_NAME,
        patchOperations=[
            {"op": "replace", "path": "/*/*/throttling/rateLimit", "value": "0"},
            {"op": "replace", "path": "/*/*/throttling/burstLimit", "value": "0"},
        ],
    )

    logger.info("API throttling zerado. Requisições bloqueadas.")
    return {
        "statusCode": 200,
        "body": json.dumps("Kill-switch ativado: API bloqueada por estouro de budget."),
    }
