export type PredictionOutcome = "home" | "away" | "draw";

export type PredictionStatus = "upcoming" | "in_progress" | "won" | "lost" | "void";

export type MatchStatus = "scheduled" | "live" | "completed";

export interface PredictionLeagueSummary {
  id: string;
  name: string;
  country: string;
}

export interface PredictionMatchSummary {
  id: string;
  date: string;
  status: MatchStatus;
  league: PredictionLeagueSummary;
  homeTeam: string;
  awayTeam: string;
}

export interface PredictionModelSummary {
  id: string;
  name: string;
  version: string;
  isShadowMode: boolean;
}

export interface PredictionForecast {
  outcome: PredictionOutcome;
  confidence: number;
  homeScore?: number | null;
  awayScore?: number | null;
  bothTeamsToScore?: boolean | null;
  overUnder?: string | null;
  css?: number | null;
  factors?: string[];
}

export interface PredictionActual {
  outcome?: PredictionOutcome | "void" | null;
  wasCorrect?: boolean | null;
  homeScore?: number | null;
  awayScore?: number | null;
  evaluatedAt?: string | null;
}

export interface PredictionMetrics {
  calibrationError?: number | null;
}

export interface PredictionRecord {
  id: string;
  createdAt: string;
  status: PredictionStatus;
  match: PredictionMatchSummary;
  model: PredictionModelSummary;
  forecast: PredictionForecast;
  actual: PredictionActual;
  metrics: PredictionMetrics;
}

export interface PredictionsFilterState {
  search?: string;
  status?: PredictionStatus | "all";
  league?: string | "all";
  from?: string | null;
  to?: string | null;
}

export interface PredictionsPaginationState {
  page: number;
  pageSize: number;
}
