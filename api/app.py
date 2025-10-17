import os
from functools import lru_cache
from typing import Any, Dict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .schemas import HealthResponse, PredictRequest, PredictResponse
from .services import PredictionService

app = FastAPI(title="Spanish Liga Pattern Prediction API", version="mvp-pattern-v1")

_default_origins = {"http://localhost:3000", "http://127.0.0.1:3000"}
_env_origins = {
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "").split(",")
    if origin.strip()
}
allowed_origins = list(_default_origins.union(_env_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@lru_cache(maxsize=1)
def get_prediction_service() -> PredictionService:
    return PredictionService()


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest) -> PredictResponse:
    service = get_prediction_service()
    if request.league.lower() != "spanish":
        raise HTTPException(status_code=422, detail="Only Spanish league is supported")

    try:
        result: Dict[str, Any] = service.predict(
            home_team=request.home_team,
            away_team=request.away_team,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))

    return PredictResponse(**result)
