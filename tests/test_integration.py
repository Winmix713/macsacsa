from fastapi.testclient import TestClient

from api.app import app

client = TestClient(app)


def test_api_returns_proper_response_format():
    payload = {
        "league": "Spanish",
        "home_team": "Madrid Fehér",
        "away_team": "Valencia"
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "tip" in data
    assert data["tip"] in ["H", "D", "A"]
    assert "probs" in data
    assert "H" in data["probs"]
    assert "D" in data["probs"]
    assert "A" in data["probs"]
    assert "pattern_1_score (H)" in data
    assert "confidence" in data
    assert "rationale" in data
    assert "directed_pair" in data["rationale"]
    assert "hist_n" in data["rationale"]
    assert "curr_n" in data["rationale"]
    assert "weights" in data["rationale"]
    assert data["rationale"]["weights"]["hist"] == 0.6
    assert data["rationale"]["weights"]["curr"] == 0.4
    assert data["version"] == "mvp-pattern-v1"


def test_api_response_time():
    import time

    payload = {
        "league": "Spanish",
        "home_team": "Barcelona",
        "away_team": "Alaves"
    }

    start = time.time()
    response = client.post("/predict", json=payload)
    end = time.time()

    elapsed = end - start
    assert response.status_code == 200
    assert elapsed < 3, f"Response time {elapsed}s exceeds 3s requirement"


def test_cache_works():
    payload = {
        "league": "Spanish",
        "home_team": "Barcelona",
        "away_team": "Alaves"
    }

    response1 = client.post("/predict", json=payload)
    response2 = client.post("/predict", json=payload)

    assert response1.status_code == 200
    assert response2.status_code == 200
    assert response1.json() == response2.json()


def test_team_name_normalization():
    payload = {
        "league": "Spanish",
        "home_team": "madrid feher",
        "away_team": "Valencia"
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["rationale"]["directed_pair"] == "Madrid Fehér_HOME_vs_Valencia_AWAY"
