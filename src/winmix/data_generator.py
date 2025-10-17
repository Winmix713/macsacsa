"""Generate sample Spanish league data."""

import random
from typing import List


SPANISH_TEAMS = [
    "Alaves", "Barcelona", "Bilbao", "Getafe", "Girona", "Las Palmas",
    "Madrid Fehér", "Madrid Piros", "Mallorca", "Osasuna", "San Sebastian",
    "Sevilla Piros", "Sevilla Zöld", "Valencia", "Villarreal", "Vigo"
]


def generate_round_robin(teams: List[str]) -> List[tuple]:
    """Generate round-robin schedule for teams."""
    num_teams = len(teams)
    if num_teams % 2 != 0:
        teams = teams + ["BYE"]
        num_teams += 1
    
    matches = []
    for round_num in range(num_teams - 1):
        round_matches = []
        for i in range(num_teams // 2):
            home = teams[i]
            away = teams[num_teams - 1 - i]
            if "BYE" not in (home, away):
                round_matches.append((home, away))
        matches.append(round_matches)
        # Rotate teams (keep first team fixed)
        teams = [teams[0]] + [teams[-1]] + teams[1:-1]
    
    return matches


def generate_season_csv(season_num: int, seed: int) -> str:
    """Generate CSV data for one season."""
    random.seed(seed + season_num)
    
    # Create schedule: home and away for each pairing
    first_half_schedule = generate_round_robin(SPANISH_TEAMS.copy())
    second_half_schedule = [(away, home) for round_matches in first_half_schedule 
                           for home, away in round_matches]
    
    # Reorganize second half into rounds
    second_half_rounds = []
    matches_per_round = 8
    for i in range(0, len(second_half_schedule), matches_per_round):
        second_half_rounds.append(second_half_schedule[i:i+matches_per_round])
    
    all_rounds = first_half_schedule + second_half_rounds
    
    # Generate CSV
    lines = []
    lines.append("Round,Home,Away,FTHG,FTAG")
    
    for round_num, round_matches in enumerate(all_rounds[:30], start=1):  # 30 rounds
        for home, away in round_matches:
            # Generate realistic goals with home advantage
            # Use team-specific patterns for consistency
            pair_seed = hash(f"{home}_{away}_{season_num}") % 10000
            rng = random.Random(pair_seed)
            
            # Home advantage: slightly higher scoring
            home_goals = rng.choices([0, 1, 2, 3, 4], weights=[15, 30, 35, 15, 5])[0]
            away_goals = rng.choices([0, 1, 2, 3], weights=[20, 35, 30, 15])[0]
            
            lines.append(f"{round_num},{home},{away},{home_goals},{away_goals}")
    
    return "\n".join(lines)


def generate_multi_season_csv(num_seasons: int, output_path: str, seed: int = 42):
    """Generate CSV with multiple seasons."""
    all_lines = []
    
    for season in range(1, num_seasons + 1):
        if season > 1:
            # Add separator
            all_lines.append("")
            all_lines.append("-" * 40)
            all_lines.append("")
        
        season_csv = generate_season_csv(season, seed)
        all_lines.append(season_csv)
    
    with open(output_path, 'w') as f:
        f.write("\n".join(all_lines))
    
    return output_path


if __name__ == '__main__':
    import os
    os.makedirs('data', exist_ok=True)
    output_file = 'data/Spanish_multi_season.csv'
    generate_multi_season_csv(num_seasons=10, output_path=output_file, seed=42)
    print(f"Generated {output_file} with 10 seasons (~2400 matches)")
    print(f"Run: winmix-backtest --input {output_file} --seasons 10 --seed 42")
