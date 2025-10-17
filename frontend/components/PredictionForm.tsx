"use client";

import { FormEvent, useCallback, useMemo, useState } from "react";

import { SPANISH_TEAMS } from "@/lib/teams";

type PredictionResponse = {
  tip: "H" | "D" | "A";
  probs: {
    H: number;
    D: number;
    A: number;
  };
  "pattern_1_score (H)": number;
  confidence: number;
  rationale: {
    directed_pair: string;
    hist_n: number;
    curr_n: number;
    weights: {
      hist: number;
      curr: number;
    };
  };
  version: string;
};

const TIP_LABELS: Record<PredictionResponse["tip"], string> = {
  H: "Home Win",
  D: "Draw",
  A: "Away Win",
};

const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

export function PredictionForm() {
  const [homeTeam, setHomeTeam] = useState<string>(SPANISH_TEAMS[0]);
  const [awayTeam, setAwayTeam] = useState<string>(SPANISH_TEAMS[1]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);

  const backendUrl = useMemo(() => {
    return process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
  }, []);

  const canSubmit = homeTeam !== awayTeam && !isLoading;

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (homeTeam === awayTeam) {
        setError("A hazai és vendég csapat nem lehet azonos.");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${backendUrl}/predict`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            league: "Spanish",
            home_team: homeTeam,
            away_team: awayTeam,
          }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          const message = payload?.detail ?? "Ismeretlen hiba történt.";
          throw new Error(message);
        }

        const data = (await response.json()) as PredictionResponse;
        setPrediction(data);
      } catch (fetchError) {
        console.error(fetchError);
        setPrediction(null);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Nem sikerült előrejelzést kérni."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [awayTeam, backendUrl, homeTeam]
  );

  return (
    <div className="container">
      <header>
        <h1>Spanish Liga Pattern Predictor</h1>
        <p>Pattern-first előrejelzések a virtuális spanyol liga mérkőzéseire.</p>
      </header>

      <form onSubmit={handleSubmit} className="card">
        <fieldset disabled={isLoading}>
          <label>
            Hazai csapat
            <select
              value={homeTeam}
              onChange={(event) => setHomeTeam(event.target.value)}
            >
              {SPANISH_TEAMS.map((team) => (
                <option key={`home-${team}`} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </label>

          <label>
            Vendég csapat
            <select
              value={awayTeam}
              onChange={(event) => setAwayTeam(event.target.value)}
            >
              {SPANISH_TEAMS.map((team) => (
                <option key={`away-${team}`} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </label>
        </fieldset>

        <button type="submit" disabled={!canSubmit}>
          {isLoading ? "Előrejelzés folyamatban..." : "Előrejelzés kérése"}
        </button>
      </form>

      {error ? <p className="error">⚠️ {error}</p> : null}

      {prediction ? (
        <section className="result">
          <h2>Előrejelzés</h2>
          <div className="grid">
            <div className={`tip tip-${prediction.tip.toLowerCase()}`}>
              <span>Ajánlás</span>
              <strong>
                {TIP_LABELS[prediction.tip]} ({formatPercent(prediction.confidence)})
              </strong>
            </div>
            <div className="probabilities">
              <span>Valószínűségek</span>
              <div className="prob-row">
                <span>H</span>
                <span>{formatPercent(prediction.probs.H)}</span>
              </div>
              <div className="prob-row">
                <span>D</span>
                <span>{formatPercent(prediction.probs.D)}</span>
              </div>
              <div className="prob-row">
                <span>A</span>
                <span>{formatPercent(prediction.probs.A)}</span>
              </div>
            </div>
            <div className="rationale">
              <span>Indoklás</span>
              <p>
                Directed pair: <strong>{prediction.rationale.directed_pair}</strong>
              </p>
              <p>
                Historikus: <strong>{prediction.rationale.hist_n}</strong> mérkőzés
              </p>
              <p>
                Aktuális szezon: <strong>{prediction.rationale.curr_n}</strong> mérkőzés
              </p>
              <p>
                Súlyok: hist {prediction.rationale.weights.hist}, curr {prediction.rationale.weights.curr}
              </p>
            </div>
          </div>
          <footer>
            <small>Pattern 1 Score (H): {formatPercent(prediction["pattern_1_score (H)"])}</small>
            <small>Verzió: {prediction.version}</small>
          </footer>
        </section>
      ) : null}
    </div>
  );
}
