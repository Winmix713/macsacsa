"""Walk-forward backtesting for pattern-first engine."""

from typing import Dict, List, Tuple
from collections import defaultdict
import random

from .normalization import RESULT_HOME, RESULT_DRAW, RESULT_AWAY
from .patterns import PatternCalculator


class WalkForwardBacktester:
    """Walk-forward backtester for seasons."""
    
    def __init__(self, historical_weight: float = 0.6, current_weight: float = 0.4,
                 seed: int = 42, min_samples: int = 3):
        self.historical_weight = historical_weight
        self.current_weight = current_weight
        self.seed = seed
        self.pattern_calculator = PatternCalculator(min_samples=min_samples)
        random.seed(seed)
    
    def run(self, matches: List[Dict]) -> Tuple[List[Dict], Dict[str, Dict], Dict[str, float]]:
        """
        Run walk-forward backtesting.
        
        Args:
            matches: List of normalized matches (with season, round, directed_pair, result)
        
        Returns:
            predictions: List of matches with predictions
            final_distributions: Final pattern distributions per pair
            metrics_data: Data for metrics calculation
        """
        if not matches:
            return [], {}, {}
        
        # Sort by season, round
        sorted_matches = sorted(matches, key=lambda m: (m['season'], m['round']))
        
        # Data structures for tracking
        historical_data = defaultdict(list)  # Season -> matches
        current_season_data = defaultdict(list)  # DirectedPair -> matches in current season
        predictions = []
        
        # For metrics
        total_predictions = 0
        correct_predictions = 0
        class_counts = defaultdict(int)
        predicted_counts = defaultdict(int)
        true_positive_counts = defaultdict(int)
        confusion_matrix = defaultdict(lambda: defaultdict(int))
        
        current_season = sorted_matches[0]['season']
        
        for match in sorted_matches:
            season = match['season']
            round_num = match['round']
            result = match['result']
            pair = match['directed_pair']
            
            # If new season, add previous season data to historical
            if season != current_season:
                # Move current season data to historical
                historical_data[current_season] = self._flatten_matches(current_season_data)
                current_season_data = defaultdict(list)
                current_season = season
            
            # Prepare training data: all historical seasons + previous rounds of current season
            training_matches = self._collect_training_data(historical_data, current_season_data)
            
            # Calculate pattern distributions
            distributions = self.pattern_calculator.calculate_distributions(training_matches)
            
            # Get historical and current distributions for directed pair
            pair_distribution = distributions.get(pair, {
                RESULT_HOME: 1/3,
                RESULT_DRAW: 1/3,
                RESULT_AWAY: 1/3,
                'total_samples': 0
            })
            
            # Predict result for current match using weighted combination
            prediction = self.pattern_calculator.predict(pair_distribution)
            
            predictions.append({
                'season': season,
                'round': round_num,
                'directed_pair': pair,
                'actual': result,
                'predicted': prediction,
                'total_samples': pair_distribution.get('total_samples', 0)
            })
            
            # Update metrics
            total_predictions += 1
            class_counts[result] += 1
            predicted_counts[prediction] += 1
            confusion_matrix[result][prediction] += 1
            if prediction == result:
                correct_predictions += 1
                true_positive_counts[result] += 1
            
            # Add match to current season data for future rounds
            current_season_data[pair].append(match)
        
        # Combine final distributions for reporting
        final_distributions = self.pattern_calculator.calculate_distributions(
            [match for matches in historical_data.values() for match in matches]
        )
        
        # Add current season data
        final_distributions.update(self.pattern_calculator.calculate_distributions(
            self._flatten_matches(current_season_data)
        ))
        
        metrics_data = {
            'total_predictions': total_predictions,
            'correct_predictions': correct_predictions,
            'class_counts': dict(class_counts),
            'predicted_counts': dict(predicted_counts),
            'true_positive_counts': dict(true_positive_counts),
            'confusion_matrix': {actual: dict(preds) for actual, preds in confusion_matrix.items()}
        }
        
        return predictions, final_distributions, metrics_data
    
    def _collect_training_data(self, historical_data: Dict[int, List[Dict]], 
                               current_season_data: Dict[str, List[Dict]]) -> List[Dict]:
        """Collect training matches."""
        matches = []
        
        # All historical seasons
        for season_matches in historical_data.values():
            matches.extend(season_matches)
        
        # Current season matches (previous rounds)
        for pair_matches in current_season_data.values():
            matches.extend(pair_matches)
        
        return matches
    
    def _flatten_matches(self, pair_matches: Dict[str, List[Dict]]) -> List[Dict]:
        """Flatten matches from pair dictionary."""
        matches = []
        for match_list in pair_matches.values():
            matches.extend(match_list)
        return matches
