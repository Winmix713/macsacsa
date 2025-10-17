import json
import os
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict

from .validators import TeamValidator

DEFAULT_DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DEFAULT_PATTERN_FILE = DEFAULT_DATA_DIR / "spanish_league_patterns.json"


def _resolve_pattern_file() -> Path:
    env_path = os.getenv("PATTERN_DATA_FILE")
    if env_path:
        custom_path = Path(env_path).expanduser().resolve()
        if custom_path.exists():
            return custom_path
        raise FileNotFoundError(f"Custom pattern data file not found: {custom_path}")
    return DEFAULT_PATTERN_FILE


class PredictionService:
    def __init__(self):
        self.team_validator = TeamValidator()
        self.pattern_file = _resolve_pattern_file()
        self.pattern_data = self._load_pattern_data()

    def _load_pattern_data(self) -> Dict[str, Any]:
        if not self.pattern_file.exists():
            raise FileNotFoundError(f"Pattern data file not found: {self.pattern_file}")

        with self.pattern_file.open("r", encoding="utf-8") as file:
            return json.load(file)

    def _get_directed_pair_key(self, home_team: str, away_team: str) -> str:
        normalized_home = self.team_validator.normalize_team(home_team)
        normalized_away = self.team_validator.normalize_team(away_team)

        if normalized_home == normalized_away:
            raise ValueError("Home and away teams must be different")

        directed_pair = f"{normalized_home}_HOME_vs_{normalized_away}_AWAY"

        if directed_pair not in self.pattern_data:
            raise ValueError(f"Directed pair not found: {directed_pair}")

        return directed_pair

    @lru_cache(maxsize=512)
    def predict(self, home_team: str, away_team: str) -> Dict[str, Any]:
        directed_pair = self._get_directed_pair_key(home_team, away_team)
        data = self.pattern_data[directed_pair]

        hist_distribution = data["pattern_distribution"]
        curr_distribution = data["current_pattern_distribution"]

        pattern_1_score = (hist_distribution["pattern_1"] * 0.6) + (
            curr_distribution["pattern_1"] * 0.4
        )

        probs = {
            "H": (hist_distribution["pattern_1"] * 0.6) + (curr_distribution["pattern_1"] * 0.4),
            "D": (hist_distribution["pattern_2"] * 0.6) + (curr_distribution["pattern_2"] * 0.4),
            "A": (hist_distribution["pattern_3"] * 0.6) + (curr_distribution["pattern_3"] * 0.4),
        }

        tip = max(probs, key=probs.get)

        return {
            "tip": tip,
            "probs": probs,
            "pattern_1_score (H)": pattern_1_score,
            "confidence": probs[tip],
            "rationale": {
                "directed_pair": directed_pair,
                "hist_n": data.get("historical_matches", 0),
                "curr_n": data.get("current_season_matches", 0),
                "weights": {
                    "hist": 0.6,
                    "curr": 0.4,
                },
            },
            "version": "mvp-pattern-v1",
        }
