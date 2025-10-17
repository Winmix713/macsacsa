from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class HealthResponse(BaseModel):
    status: str


class PredictRequest(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "league": "Spanish",
                "home_team": "Barcelona",
                "away_team": "Valencia"
            }
        }
    )

    league: str = Field(..., description="League name, must be 'Spanish'")
    home_team: str = Field(..., description="Home team name (virtual name)")
    away_team: str = Field(..., description="Away team name (virtual name)")


class Probabilities(BaseModel):
    H: float = Field(..., description="Home win probability")
    D: float = Field(..., description="Draw probability")
    A: float = Field(..., description="Away win probability")


class Weights(BaseModel):
    hist: float = Field(0.6, description="Historical data weight")
    curr: float = Field(0.4, description="Current season weight")


class Rationale(BaseModel):
    directed_pair: str = Field(..., description="Directed pair identifier")
    hist_n: int = Field(..., description="Number of historical matches")
    curr_n: int = Field(..., description="Number of current season matches")
    weights: Weights


class PredictResponse(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "tip": "H",
                "probs": {
                    "H": 0.68,
                    "D": 0.22,
                    "A": 0.10
                },
                "pattern_1_score (H)": 0.656,
                "confidence": 0.68,
                "rationale": {
                    "directed_pair": "Barcelona_HOME_vs_Valencia_AWAY",
                    "hist_n": 150,
                    "curr_n": 4,
                    "weights": {
                        "hist": 0.6,
                        "curr": 0.4
                    }
                },
                "version": "mvp-pattern-v1"
            }
        },
    )

    tip: Literal["H", "D", "A"] = Field(..., description="Prediction tip: H=Home, D=Draw, A=Away")
    probs: Probabilities
    pattern_1_score: float = Field(..., description="Pattern 1 score for home team", alias="pattern_1_score (H)")
    confidence: float = Field(..., description="Confidence level of prediction")
    rationale: Rationale
    version: str = Field("mvp-pattern-v1", description="API version")
