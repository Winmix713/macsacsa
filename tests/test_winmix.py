import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from winmix.data_generator import generate_multi_season_csv
from winmix.cli import load_and_prepare_data, run_backtest


def test_data_ingestion_and_normalization(tmp_path):
    input_file = tmp_path / "multi_season.csv"
    generate_multi_season_csv(num_seasons=2, output_path=input_file, seed=42)

    matches = load_and_prepare_data(str(input_file), num_seasons=2)
    assert len(matches) > 0
    
    # Check directed pair keys
    for match in matches:
        assert match['directed_pair'] == f"{match['home_team']}_HOME_vs_{match['away_team']}_AWAY"
        assert match['reverse_pair'] == f"{match['away_team']}_HOME_vs_{match['home_team']}_AWAY"


def test_backtesting(tmp_path):
    input_file = tmp_path / "multi_season.csv"
    generate_multi_season_csv(num_seasons=3, output_path=input_file, seed=42)

    matches = load_and_prepare_data(str(input_file), num_seasons=3)
    predictions, distributions, metrics_data = run_backtest(matches, seed=42)

    assert len(predictions) == len(matches)
    assert metrics_data['total_predictions'] == len(matches)
    assert metrics_data['correct_predictions'] <= len(matches)
    
    # Ensure metrics include confusion matrix
    assert 'confusion_matrix' in metrics_data
    
    # Check distribution keys
    for pair, dist in distributions.items():
        assert 'total_samples' in dist
        assert abs(dist['H'] + dist['D'] + dist['A'] - 1) < 1e-6
