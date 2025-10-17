# Winmix Spanish League Pattern-First Backtesting

This project implements a pattern-first engine for the Spanish virtual football league using historical match data. Key features include:

- **CSV Ingestor**: Handles multi-season CSV files with multiple headers and separator rows. Each new header marks a new season. Supports 16-team leagues with 30 rounds per season.
- **Normalization**: Converts full-time goals into H (Home win), D (Draw), A (Away win) results and normalizes match data with directed pair keys (`{HOME}_HOME_vs_{AWAY}_AWAY`).
- **Pattern Distribution**: Supports Laplace/Wilson smoothing with minimum sample thresholds for robust probability estimates.
- **Walk-forward Backtesting**: Uses a 60/40 weighted blend of historical vs current season data. Predictions for season t always rely on data from prior seasons and earlier rounds within the same season (no leakage).
- **Reporting**: Generates accuracy, precision/recall per class, confusion matrix, and season-specific reports.
- **CLI Command**: `winmix-backtest --input input.csv --seasons 10 --seed 42`

## Getting Started

1. Install environment:
   ```bash
   pip install -e .
   ```

2. Generate sample data:
   ```bash
   python -m winmix.data_generator
   ```

3. Run backtester:
   ```bash
   # If using editable install (recommended)
   winmix-backtest --input data/Spanish_multi_season.csv --seasons 10 --seed 42 --output-dir reports
   ```

   If not installing the package, use:
   ```bash
   python -m winmix.cli --input data/Spanish_multi_season.csv --seasons 10 --seed 42 --output-dir reports
   ```

## Testing

Run tests using pytest (requires pytest installed):
```bash
python -m pytest --maxfail=1 --disable-warnings
```
