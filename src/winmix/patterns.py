"""Pattern distribution calculation with smoothing."""

from typing import Dict, List
from collections import defaultdict
import math

from .normalization import RESULT_HOME, RESULT_DRAW, RESULT_AWAY


class PatternCalculator:
    """Calculate pattern distributions for directed pairs."""
    
    def __init__(self, min_samples: int = 3, laplace_alpha: float = 1.0, 
                 use_wilson: bool = True, wilson_confidence: float = 0.95):
        """
        Initialize pattern calculator.
        
        Args:
            min_samples: Minimum number of samples required
            laplace_alpha: Laplace smoothing parameter
            use_wilson: Use Wilson score smoothing
            wilson_confidence: Wilson score confidence level
        """
        self.min_samples = min_samples
        self.laplace_alpha = laplace_alpha
        self.use_wilson = use_wilson
        self.wilson_confidence = wilson_confidence
    
    def calculate_distributions(self, matches: List[Dict]) -> Dict[str, Dict]:
        """
        Calculate pattern distributions for all directed pairs.
        
        Args:
            matches: List of normalized match dictionaries
        
        Returns:
            Dict mapping directed_pair -> {H: prob, D: prob, A: prob}
        """
        # Count results per directed pair
        pair_counts = defaultdict(lambda: {RESULT_HOME: 0, RESULT_DRAW: 0, RESULT_AWAY: 0})
        
        for match in matches:
            pair = match["directed_pair"]
            result = match["result"]
            pair_counts[pair][result] += 1
        
        # Calculate distributions with smoothing
        distributions = {}
        
        for pair, counts in pair_counts.items():
            total = sum(counts.values())
            
            if total < self.min_samples:
                # Insufficient data: use uniform distribution
                distributions[pair] = {
                    RESULT_HOME: 1/3,
                    RESULT_DRAW: 1/3,
                    RESULT_AWAY: 1/3,
                    "total_samples": total
                }
            else:
                if self.use_wilson:
                    # Wilson score smoothing
                    dist = self._wilson_smoothing(counts, total)
                else:
                    # Laplace smoothing
                    dist = self._laplace_smoothing(counts, total)
                
                dist["total_samples"] = total
                distributions[pair] = dist
        
        return distributions
    
    def _laplace_smoothing(self, counts: Dict[str, int], total: int) -> Dict[str, float]:
        """Apply Laplace smoothing."""
        num_classes = 3
        smoothed_total = total + self.laplace_alpha * num_classes
        
        return {
            RESULT_HOME: (counts[RESULT_HOME] + self.laplace_alpha) / smoothed_total,
            RESULT_DRAW: (counts[RESULT_DRAW] + self.laplace_alpha) / smoothed_total,
            RESULT_AWAY: (counts[RESULT_AWAY] + self.laplace_alpha) / smoothed_total
        }
    
    def _wilson_smoothing(self, counts: Dict[str, int], total: int) -> Dict[str, float]:
        """
        Apply Wilson score interval smoothing.
        
        For multi-class, we use a simplified approach:
        - Calculate Wilson lower bound for each class
        - Normalize to sum to 1.0
        """
        # Z-score for confidence level
        z = 1.96 if self.wilson_confidence == 0.95 else 1.645
        
        wilson_scores = {}
        
        for result in [RESULT_HOME, RESULT_DRAW, RESULT_AWAY]:
            p = counts[result] / total
            
            # Wilson score lower bound
            denominator = 1 + z**2 / total
            center = (p + z**2 / (2 * total)) / denominator
            margin = z * math.sqrt((p * (1 - p) / total + z**2 / (4 * total**2))) / denominator
            
            lower_bound = max(0, center - margin)
            wilson_scores[result] = lower_bound
        
        # Normalize
        total_score = sum(wilson_scores.values())
        if total_score > 0:
            for result in wilson_scores:
                wilson_scores[result] /= total_score
        else:
            # Fallback to uniform
            wilson_scores = {
                RESULT_HOME: 1/3,
                RESULT_DRAW: 1/3,
                RESULT_AWAY: 1/3
            }
        
        return wilson_scores
    
    def predict(self, distribution: Dict[str, float]) -> str:
        """Predict result based on distribution."""
        if not distribution:
            return RESULT_DRAW
        
        # Remove non-result keys
        probs = {k: v for k, v in distribution.items() 
                if k in [RESULT_HOME, RESULT_DRAW, RESULT_AWAY]}
        
        return max(probs, key=probs.get)
