"""Command-line interface for winmix backtesting."""

import argparse
import os
from typing import List

from .ingestion import CSVIngestor
from .normalization import normalize_match
from .backtesting import WalkForwardBacktester
from .metrics import MetricsCalculator


OUTPUT_METRICS_JSON = 'metrics.json'
OUTPUT_CONFUSION_CSV = 'confusion_matrix.csv'
OUTPUT_SEASON_CSV = 'season_reports.csv'


def parse_arguments() -> argparse.Namespace:
    """Parse CLI arguments."""
    parser = argparse.ArgumentParser(description='Winmix Pattern-First Backtester')
    parser.add_argument('--input', required=True, help='Path to input CSV file')
    parser.add_argument('--seasons', type=int, default=10, help='Number of seasons to process')
    parser.add_argument('--seed', type=int, default=42, help='Random seed for reproducibility')
    parser.add_argument('--output-dir', default='.', help='Output directory for reports')
    return parser.parse_args()


def load_and_prepare_data(input_path: str, num_seasons: int) -> List[dict]:
    """Load matches from CSV and normalize."""
    ingestor = CSVIngestor()
    matches = ingestor.read_csv(input_path)
    
    # Filter for requested number of seasons
    filtered_matches = [m for m in matches if m.season <= num_seasons]
    
    # Normalize matches
    normalized_matches = [normalize_match(match) for match in filtered_matches]
    
    return normalized_matches


def run_backtest(matches: List[dict], seed: int):
    """Run walk-forward backtest."""
    backtester = WalkForwardBacktester(seed=seed)
    return backtester.run(matches)


def main():
    args = parse_arguments()
    
    if not os.path.exists(args.input):
        raise FileNotFoundError(f"Input file not found: {args.input}")
    
    os.makedirs(args.output_dir, exist_ok=True)
    
    matches = load_and_prepare_data(args.input, args.seasons)
    predictions, distributions, metrics_data = run_backtest(matches, args.seed)
    
    metrics = MetricsCalculator.calculate_metrics(metrics_data)
    
    MetricsCalculator.save_metrics_json(metrics, os.path.join(args.output_dir, OUTPUT_METRICS_JSON))
    MetricsCalculator.save_confusion_matrix(metrics_data, os.path.join(args.output_dir, OUTPUT_CONFUSION_CSV))
    MetricsCalculator.save_season_reports(predictions, os.path.join(args.output_dir, OUTPUT_SEASON_CSV))
    
    print(f"Backtesting completed. Metrics saved to {args.output_dir}")


if __name__ == '__main__':
    main()
