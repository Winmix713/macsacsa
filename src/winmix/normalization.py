"""Normalization utilities."""

from typing import Dict

from .ingestion import Match


RESULT_HOME = "H"
RESULT_DRAW = "D"
RESULT_AWAY = "A"


def determine_result(match: Match) -> str:
    """Determine result (H/D/A) based on goals."""
    if match.home_goals > match.away_goals:
        return RESULT_HOME
    elif match.home_goals < match.away_goals:
        return RESULT_AWAY
    return RESULT_DRAW


def directed_pair_key(home_team: str, away_team: str) -> str:
    """Generate directed pair key."""
    return f"{home_team}_HOME_vs_{away_team}_AWAY"


def normalize_match(match: Match) -> Dict:
    """Normalize match to dictionary with directed pair key and result."""
    result = determine_result(match)
    pair_key = directed_pair_key(match.home_team, match.away_team)
    reverse_pair_key = directed_pair_key(match.away_team, match.home_team)
    
    return {
        "season": match.season,
        "round": match.round,
        "home_team": match.home_team,
        "away_team": match.away_team,
        "home_goals": match.home_goals,
        "away_goals": match.away_goals,
        "result": result,
        "directed_pair": pair_key,
        "reverse_pair": reverse_pair_key,
        "league": match.league
    }
