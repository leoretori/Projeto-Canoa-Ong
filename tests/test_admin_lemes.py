"""GET /lemes: lista de lemes cadastrados para escolher na remada."""
import json
import os
import sys
from unittest.mock import patch

os.environ.setdefault("AWS_DEFAULT_REGION", "us-east-1")
os.environ.setdefault("USER_POOL_ID", "us-east-1_TEST")
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from handlers import admin  # noqa: E402


def _user(sub, name, role, enabled=True):
    attrs = [{"Name": "sub", "Value": sub}, {"Name": "email", "Value": f"{sub}@x.org"}, {"Name": "name", "Value": name}]
    if role:
        attrs.append({"Name": "custom:role", "Value": role})
    return {"Attributes": attrs, "Enabled": enabled, "UserStatus": "CONFIRMED"}


PAGES = [
    {"Users": [_user("1", "Bruno", "LEME"), _user("2", "Zé Remador", None)], "PaginationToken": "p2"},
    {"Users": [_user("3", "Ana", "ADMIN"), _user("4", "Inativo", "LEME", enabled=False)]},
]


def _event(role):
    return {"httpMethod": "GET", "path": "/lemes",
            "requestContext": {"authorizer": {"claims": {"sub": "x", "custom:role": role}}}}


def test_leme_lists_lemes_sorted_without_emails():
    with patch.object(admin.cognito, "list_users", side_effect=PAGES):
        resp = admin.handler(_event("LEME"), None)
    assert resp["statusCode"] == 200
    body = json.loads(resp["body"])
    assert [u["name"] for u in body] == ["Ana", "Bruno"]
    assert all("email" not in u for u in body)


def test_athlete_cannot_list_lemes():
    assert admin.handler(_event("ATHLETE"), None)["statusCode"] == 403
