"""Metrics calculation and reporting."""

import json
import csv
from typing import Dict, List
from collections import defaultdict

from .normalization import RESULT_HOME, RESULT_DRAW, RESULT_AWAY


class MetricsCalculator:
    """Calculate and report backtesting metrics."""
    
    @staticmethod
    def calculate_metrics(metrics_data: Dict) -> Dict:
        """
        Calculate evaluation metrics.
        
        Returns:
            Dict with accuracy, precision, recall, f1 per class
        """
        total_predictions = metrics_data['total_predictions']
        correct_predictions = metrics_data['correct_predictions']
        class_counts = metrics_data['class_counts']
        predicted_counts = metrics_data['predicted_counts']
        true_positive_counts = metrics_data['true_positive_counts']
        
        # Overall accuracy
        accuracy = correct_predictions / total_predictions if total_predictions > 0 else 0
        
        # Per-class metrics
        per_class_metrics = {}
        
        for class_label in [RESULT_HOME, RESULT_DRAW, RESULT_AWAY]:
            true_count = class_counts.get(class_label, 0)
            predicted_count = predicted_counts.get(class_label, 0)
            true_positive = true_positive_counts.get(class_label, 0)
            
            # Precision: TP / (TP + FP)
            precision = true_positive / predicted_count if predicted_count > 0 else 0
            
            # Recall: TP / (TP + FN)
            recall = true_positive / true_count if true_count > 0 else 0
            
            # F1 score
            f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
            
            per_class_metrics[class_label] = {
                'precision': precision,
                'recall': recall,
                'f1': f1,
                'support': true_count
            }
        
        return {
            'accuracy': accuracy,
            'total_predictions': total_predictions,
            'correct_predictions': correct_predictions,
            'per_class': per_class_metrics
        }
    
    @staticmethod
    def save_metrics_json(metrics: Dict, filepath: str):
        """Save metrics to JSON."""
        with open(filepath, 'w') as f:
            json.dump(metrics, f, indent=2)
    
    @staticmethod
    def save_confusion_matrix(metrics_data: Dict, filepath: str):
        """Save confusion matrix to CSV."""
        confusion = metrics_data['confusion_matrix']
        classes = [RESULT_HOME, RESULT_DRAW, RESULT_AWAY]
        
        with open(filepath, 'w', newline='') as f:
            writer = csv.writer(f)
            
            # Header
            writer.writerow(['Actual\\Predicted'] + classes)
            
            # Rows
            for actual in classes:
                row = [actual]
                for predicted in classes:
                    count = confusion.get(actual, {}).get(predicted, 0)
                    row.append(count)
                writer.writerow(row)
    
    @staticmethod
    def save_season_reports(predictions: List[Dict], filepath: str):
        """Save per-season performance reports."""
        # Group predictions by season
        season_results = defaultdict(lambda: {
            'total': 0,
            'correct': 0,
            'class_counts': defaultdict(int),
            'predicted_counts': defaultdict(int)
        })
        
        for pred in predictions:
            season = pred['season']
            actual = pred['actual']
            predicted = pred['predicted']
            
            season_results[season]['total'] += 1
            season_results[season]['class_counts'][actual] += 1
            season_results[season]['predicted_counts'][predicted] += 1
            
            if actual == predicted:
                season_results[season]['correct'] += 1
        
        # Write CSV
        with open(filepath, 'w', newline='') as f:
            writer = csv.writer(f)
            
            # Header
            writer.writerow([
                'Season', 'Total Matches', 'Correct', 'Accuracy',
                'Actual H', 'Actual D', 'Actual A',
                'Predicted H', 'Predicted D', 'Predicted A'
            ])
            
            # Rows
            for season in sorted(season_results.keys()):
                data = season_results[season]
                accuracy = data['correct'] / data['total'] if data['total'] > 0 else 0
                
                writer.writerow([
                    season,
                    data['total'],
                    data['correct'],
                    f"{accuracy:.4f}",
                    data['class_counts'].get(RESULT_HOME, 0),
                    data['class_counts'].get(RESULT_DRAW, 0),
                    data['class_counts'].get(RESULT_AWAY, 0),
                    data['predicted_counts'].get(RESULT_HOME, 0),
                    data['predicted_counts'].get(RESULT_DRAW, 0),
                    data['predicted_counts'].get(RESULT_AWAY, 0)
                ])
