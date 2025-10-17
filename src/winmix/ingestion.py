"""
CSV Ingestion module for Spanish league data with multiple seasons.

Handles:
- Multiple CSV headers (each marking a new season)
- Separator rows between seasons
- 16 teams → 8 matches/round
- 30 rounds/season
"""

import csv
from typing import List, Dict, Tuple
from dataclasses import dataclass


@dataclass
class Match:
    """Represents a single match."""
    season: int
    round: int
    home_team: str
    away_team: str
    home_goals: int
    away_goals: int
    league: str = "Spanish"


class CSVIngestor:
    """Ingest CSV data with multiple seasons and headers."""
    
    def __init__(self, expected_teams_per_season: int = 16, 
                 expected_rounds_per_season: int = 30,
                 expected_matches_per_round: int = 8):
        self.expected_teams = expected_teams_per_season
        self.expected_rounds = expected_rounds_per_season
        self.expected_matches_per_round = expected_matches_per_round
    
    def read_csv(self, filepath: str) -> List[Match]:
        """
        Read CSV file with multiple seasons.
        
        Each season starts with a CSV header row.
        Separator rows (empty or dashes) mark season boundaries.
        
        Returns:
            List of Match objects
        """
        matches = []
        current_season = 0
        current_round = 0
        matches_in_round = 0
        
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        header_fields = None
        i = 0
        
        while i < len(lines):
            line = lines[i].strip()
            
            # Skip empty lines and separator lines
            if not line or line.startswith('-') or line.startswith('='):
                i += 1
                continue
            
            # Check if this is a header line
            if self._is_header_line(line):
                # New season starts
                current_season += 1
                current_round = 0
                matches_in_round = 0
                header_fields = line.split(',')
                i += 1
                continue
            
            # Parse match data
            if header_fields:
                parts = line.split(',')
                if len(parts) >= len(header_fields):
                    match = self._parse_match_line(parts, header_fields, 
                                                   current_season, current_round)
                    if match:
                        matches.append(match)
                        matches_in_round += 1
                        
                        # Check if round is complete
                        if matches_in_round >= self.expected_matches_per_round:
                            current_round += 1
                            matches_in_round = 0
            
            i += 1
        
        # Validate
        self._validate_data(matches)
        
        return matches
    
    def _is_header_line(self, line: str) -> bool:
        """Check if line is a CSV header."""
        lower_line = line.lower()
        # Common header patterns
        header_indicators = ['round', 'home', 'away', 'team', 'result', 'goals']
        return any(indicator in lower_line for indicator in header_indicators)
    
    def _parse_match_line(self, parts: List[str], header_fields: List[str], 
                         season: int, round_num: int) -> Match:
        """Parse a single match line."""
        # Build field mapping
        field_map = {}
        for idx, field in enumerate(header_fields):
            field_lower = field.strip().lower()
            field_map[field_lower] = idx
        
        # Extract fields
        try:
            round_idx = self._find_field_index(field_map, ['round', 'runde', 'forduló'])
            home_idx = self._find_field_index(field_map, ['home', 'home_team', 'hazai'])
            away_idx = self._find_field_index(field_map, ['away', 'away_team', 'vendég'])
            
            # Try to find goals
            home_goals_idx = self._find_field_index(field_map, 
                ['home_goals', 'fthg', 'hazai_gól', 'home_score'])
            away_goals_idx = self._find_field_index(field_map, 
                ['away_goals', 'ftag', 'vendég_gól', 'away_score'])
            
            # Extract round if available
            if round_idx is not None and parts[round_idx].strip().isdigit():
                round_num = int(parts[round_idx].strip())
            
            home_team = parts[home_idx].strip() if home_idx is not None else ""
            away_team = parts[away_idx].strip() if away_idx is not None else ""
            
            # Parse goals
            home_goals = int(parts[home_goals_idx].strip()) if home_goals_idx is not None else 0
            away_goals = int(parts[away_goals_idx].strip()) if away_goals_idx is not None else 0
            
            if home_team and away_team:
                return Match(
                    season=season,
                    round=round_num,
                    home_team=home_team,
                    away_team=away_team,
                    home_goals=home_goals,
                    away_goals=away_goals
                )
        except (ValueError, IndexError):
            pass
        
        return None
    
    def _find_field_index(self, field_map: Dict[str, int], field_names: List[str]) -> int:
        """Find index of field by trying multiple names."""
        for name in field_names:
            if name in field_map:
                return field_map[name]
        return None
    
    def _validate_data(self, matches: List[Match]):
        """Validate ingested data."""
        if not matches:
            raise ValueError("No matches found in CSV")
        
        # Group by season
        seasons = {}
        for match in matches:
            if match.season not in seasons:
                seasons[match.season] = []
            seasons[match.season].append(match)
        
        # Validate each season
        for season_num, season_matches in seasons.items():
            # Count rounds
            rounds = set(m.round for m in season_matches)
            
            # Relaxed validation: at least some rounds
            if len(rounds) < 10:
                print(f"Warning: Season {season_num} has only {len(rounds)} rounds "
                      f"(expected ~{self.expected_rounds})")
            
            # Count unique teams
            teams = set()
            for match in season_matches:
                teams.add(match.home_team)
                teams.add(match.away_team)
            
            if len(teams) < 10:
                print(f"Warning: Season {season_num} has only {len(teams)} teams "
                      f"(expected {self.expected_teams})")
