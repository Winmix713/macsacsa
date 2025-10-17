feature-spanish-liga-predict-api-pattern-mvp
# Spanish Liga Pattern Prediction API

Minimális FastAPI szolgáltatás a spanyol liga pattern-first aggregációi fölé.

## Funkciók

- **POST /predict**: Pattern-alapú mérkőzés előrejelzés
- **GET /health**: Szolgáltatás állapot ellenőrzés

## Követelmények

- Python 3.8+
- FastAPI
- Uvicorn

## Telepítés

```bash
pip install -r requirements.txt
```

## Környezeti változók

Másold át a `.env.example` fájlt `.env` névre (opcionális):

```bash
cp .env.example .env
```

## Futtatás

### Backend (FastAPI)

#### Fejlesztői mód

```bash
python main.py
```

vagy

```bash
uvicorn api.app:app --reload --host 0.0.0.0 --port 8000
```

#### Éles mód

```bash
uvicorn api.app:app --host 0.0.0.0 --port 8000 --workers 4
```

A szolgáltatás a `http://localhost:8000` címen lesz elérhető.

### Frontend (Next.js + React)

```bash
cd frontend
npm install
cp .env.local.example .env.local  # opcionális, ha más backend URL-t használsz
npm run dev
```

A frontend a `http://localhost:3000` címen fut, és a `.env.local`-ban megadott FastAPI backendhez küldi a kéréseket (alapértelmezés szerint `http://localhost:8000`).

## API Dokumentáció

Miután elindult a szolgáltatás, az OpenAPI/Swagger dokumentáció elérhető:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Használat

### Health check

```bash
curl http://localhost:8000/health
```

Válasz:
```json
{
  "status": "ok"
}
```

### Predict endpoint

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "league": "Spanish",
    "home_team": "Barcelona",
    "away_team": "Alaves"
  }'
```

Példa válasz:
```json
{
  "tip": "H",
  "probs": {
    "H": 0.74,
    "D": 0.18,
    "A": 0.08
  },
  "pattern_1_score (H)": 0.74,
  "confidence": 0.74,
  "rationale": {
    "directed_pair": "Barcelona_HOME_vs_Alaves_AWAY",
    "hist_n": 150,
    "curr_n": 4,
    "weights": {
      "hist": 0.6,
      "curr": 0.4
    }
  },
  "version": "mvp-pattern-v1"
}
```

### Webes felület (PWA)

A repó `static/` mappájában egy mobil-first, PWA-képes frontend érhető el, amely a fenti `POST /predict` végpontra épít. 
A felület ugyanazon az originön futtatva (pl. `uvicorn` + egyszerű statikus kiszolgáló) automatikusan meghívja az API-t.

Gyors próba helyben:

```bash
# indítsd az API-t az alap 8000-es porton
uvicorn api.app:app --reload

# külön terminálban szerváld ki a statikus fájlokat
python -m http.server --directory static 8080
```

Nyisd meg a `http://localhost:8080` címet mobil vagy desktop böngészőből.

## Tesztelés

```bash
pytest tests/ -v
```

## Architektúra

### Irányított párok kezelése

Az API szigorúan különválasztja az irányított párokat:

- `Barcelona (H) vs Alaves (A)` ≠ `Alaves (H) vs Barcelona (A)`
- Minden irányított pár külön statisztikai profillal rendelkezik
- A hazai pálya előny mindig figyelembe van véve

### Pattern scoring

A Pattern 1 score számítása:
```
Pattern 1 Score = (Historikus % × 0.6) + (Aktuális szezon % × 0.4)
```

### Memória cache

Az API beépített memória cache-t használ:
- `@lru_cache` dekorátorok a gyors válaszidőhöz (<3s)
- 512 mérkőzés cache a prediction szolgáltatásban
- Singleton pattern a service instance-hoz

## Hibakezelés

- **422 Unprocessable Entity**: Nem támogatott liga
- **404 Not Found**: Érvénytelen csapatnév vagy hiányzó irányított pár
- **500 Internal Server Error**: Szerver oldali hiba

## Virtuális csapatnevek (Spanyol Liga)

Csak virtuális neveket használj:

- Alaves
- Barcelona
- Bilbao
- Getafe
- Girona
- Las Palmas
- Madrid Fehér
- Madrid Piros
- Mallorca
- Osasuna
- San Sebastian
- Sevilla Piros
- Sevilla Zöld
- Valencia
- Villarreal
- Vigo

## Licenc

MIT

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
 main
