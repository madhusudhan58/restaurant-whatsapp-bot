import sys
from pathlib import Path

import pytest

BASE_DIR = Path(__file__).resolve().parent.parent

sys.path.insert(
    0,
    str(BASE_DIR / "backend")
)

from app import app


@pytest.fixture
def client():

    app.config["TESTING"] = True

    with app.test_client() as client:

        yield client


def test_home(client):

    response = client.get("/")

    assert response.status_code == 200


def test_health(client):

    response = client.get("/health")

    assert response.status_code == 200

    data = response.get_json()

    assert data["status"] == "healthy"


def test_menu(client):

    response = client.get("/api/menu")

    assert response.status_code == 200

    data = response.get_json()

    assert isinstance(data, list)

    assert len(data) > 0