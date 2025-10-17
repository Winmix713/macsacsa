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

### Fejlesztői mód

```bash
python main.py
```

vagy

```bash
uvicorn api.app:app --reload --host 0.0.0.0 --port 8000
```

### Éles mód

```bash
uvicorn api.app:app --host 0.0.0.0 --port 8000 --workers 4
```

A szolgáltatás a `http://localhost:8000` címen lesz elérhető.

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
