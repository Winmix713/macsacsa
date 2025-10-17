import json
from fastapi.testclient import TestClient

from api.app import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_predict_success():
    payload = {
        "league": "Spanish",
        "home_team": "Barcelona",
        "away_team": "Alaves"
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["tip"] == "H"
    assert "probs" in data
    assert data["probs"]["H"] > data["probs"]["D"]
    assert data["probs"]["H"] > data["probs"]["A"]
    assert data["rationale"]["directed_pair"] == "Barcelona_HOME_vs_Alaves_AWAY"
    assert data["version"] == "mvp-pattern-v1"


def test_predict_invalid_league():
    payload = {
        "league": "English",
        "home_team": "Barcelona",
        "away_team": "Alaves"
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 422


def test_predict_invalid_team():
    payload = {
        "league": "Spanish",
        "home_team": "Real Madrid",
        "away_team": "Barcelona"
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 404
    assert "Invalid team name" in response.json()["detail"]


def test_predict_same_team():
    payload = {
        "league": "Spanish",
        "home_team": "Barcelona",
        "away_team": "Barcelona"
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 404
    assert "must be different" in response.json()["detail"]


def test_predict_missing_directed_pair():
    payload = {
        "league": "Spanish",
        "home_team": "Barcelona",
        "away_team": "Madrid Fehér"
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 404
    assert "Directed pair not found" in response.json()["detail"]


def test_predict_directed_pair_matters():
    payload_home = {
        "league": "Spanish",
        "home_team": "Barcelona",
        "away_team": "Alaves"
    }
    response_home = client.post("/predict", json=payload_home)
    assert response_home.status_code == 200
    data_home = response_home.json()

    payload_away = {
        "league": "Spanish",
        "home_team": "Alaves",
        "away_team": "Barcelona"
    }
    response_away = client.post("/predict", json=payload_away)
    assert response_away.status_code == 200
    data_away = response_away.json()

    assert data_home["rationale"]["directed_pair"] != data_away["rationale"]["directed_pair"]
    assert data_home["rationale"]["directed_pair"] == "Barcelona_HOME_vs_Alaves_AWAY"
    assert data_away["rationale"]["directed_pair"] == "Alaves_HOME_vs_Barcelona_AWAY"
