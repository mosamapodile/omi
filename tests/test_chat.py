import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.config import get_settings

@pytest.fixture(autouse=True)
def demo_mode(monkeypatch):
    monkeypatch.setenv("DEMO_MODE", "true")
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()

client = TestClient(app)

def test_health():
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json()["application"] == "omi"

def test_chat():
    response = client.post(
        "/api/chat",
        json={"message": "Hello omi"}
    )

    assert response.status_code == 200
    assert response.json()["mode"] == "demo"
    assert response.json()["conversation_id"]
    assert "Hello omi" in response.json()["reply"]

def test_empty_message():
    response = client.post(
        "/api/chat",
        json={"message": ""}
    )

    assert response.status_code == 422
