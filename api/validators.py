from typing import Set


class TeamValidator:
    SPANISH_TEAMS: Set[str] = {
        "Alaves",
        "Barcelona",
        "Bilbao",
        "Getafe",
        "Girona",
        "Las Palmas",
        "Madrid Fehér",
        "Madrid Piros",
        "Mallorca",
        "Osasuna",
        "San Sebastian",
        "Sevilla Piros",
        "Sevilla Zöld",
        "Valencia",
        "Villarreal",
        "Vigo",
    }

    NAME_ALIASES = {
        "madrid feher": "Madrid Fehér",
        "madrid piros": "Madrid Piros",
        "sevilla piros": "Sevilla Piros",
        "sevilla zold": "Sevilla Zöld",
    }

    def normalize_team(self, team_name: str) -> str:
        team_name = team_name.strip()

        if team_name in self.SPANISH_TEAMS:
            return team_name

        team_name_lower = team_name.lower()
        if team_name_lower in self.NAME_ALIASES:
            return self.NAME_ALIASES[team_name_lower]

        for valid_team in self.SPANISH_TEAMS:
            if valid_team.lower() == team_name_lower:
                return valid_team

        raise ValueError(
            f"Invalid team name: {team_name}. Must be a valid Spanish league virtual team name."
        )
