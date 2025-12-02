import { supabase, supabaseProjectId } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { mockPredictions } from "@/mocks/predictions";
import type {
  MatchStatus,
  PredictionOutcome,
  PredictionRecord,
  PredictionStatus,
  PredictionsFilterState,
} from "@/types/predictions";

type SupabasePredictionRow = Database["public"]["Tables"]["predictions"]["Row"] & {
  match: (Database["public"]["Tables"]["matches"]["Row"] & {
    home_team: { id: string; name: string } | null;
    away_team: { id: string; name: string } | null;
    league: { id: string; name: string; country: string | null } | null;
  }) | null;
};

const matchStatusMap: Record<string, MatchStatus> = {
  completed: "completed",
  finished: "completed",
  final: "completed",
  full_time: "completed",
  live: "live",
  running: "live",
  in_progress: "live",
  halftime: "live",
  scheduled: "scheduled",
  upcoming: "scheduled",
  pending: "scheduled",
  planned: "scheduled",
};

const parseMatchStatus = (status: string | null | undefined): MatchStatus => {
  if (!status) {
    return "scheduled";
  }

  const key = status.toLowerCase();
  return matchStatusMap[key] ?? "scheduled";
};

const normaliseConfidence = (value: number | null): number => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 0;
  }

  if (value > 1) {
    return Math.round(value);
  }

  return Math.round(value * 100);
};

const normaliseFactors = (input: unknown): string[] => {
  if (!input) {
    return [];
  }

  if (Array.isArray(input)) {
    return input.map((item) => {
      if (typeof item === "string") {
        return item;
      }
      if (typeof item === "number" || typeof item === "boolean") {
        return String(item);
      }
      try {
        return JSON.stringify(item);
      } catch (error) {
        console.warn("[predictionsService] Failed to stringify array factor", error);
        return "";
      }
    }).filter(Boolean);
  }

  if (typeof input === "string") {
    return [input];
  }

  if (typeof input === "object") {
    return Object.entries(input as Record<string, unknown>).map(([key, value]) => {
      if (typeof value === "string") {
        return `${key}: ${value}`;
      }
      try {
        return `${key}: ${JSON.stringify(value)}`;
      } catch (error) {
        console.warn("[predictionsService] Failed to stringify factor value", error);
        return key;
      }
    });
  }

  return [];
};

const deriveStatus = (row: SupabasePredictionRow, matchStatus: MatchStatus): PredictionStatus => {
  const actualOutcome = row.actual_outcome?.toLowerCase?.() ?? null;

  if (actualOutcome === "void") {
    return "void";
  }

  if (row.was_correct === true) {
    return "won";
  }

  if (row.was_correct === false) {
    return "lost";
  }

  if (matchStatus === "live") {
    return "in_progress";
  }

  if (matchStatus === "completed") {
    return "void";
  }

  return "upcoming";
};

const mapSupabasePrediction = (row: SupabasePredictionRow): PredictionRecord => {
  const matchStatus = parseMatchStatus(row.match?.status);

  const matchLeague = row.match?.league ?? null;
  const matchDate = row.match?.match_date ?? row.created_at ?? new Date().toISOString();

  return {
    id: row.id,
    createdAt: row.created_at ?? matchDate,
    status: deriveStatus(row, matchStatus),
    match: {
      id: row.match?.id ?? `match-${row.id}`,
      date: matchDate,
      status: matchStatus,
      league: {
        id: matchLeague?.id ?? "unknown-league",
        name: matchLeague?.name ?? "Unknown League",
        country: matchLeague?.country ?? "Unknown",
      },
      homeTeam: row.match?.home_team?.name ?? "Home TBD",
      awayTeam: row.match?.away_team?.name ?? "Away TBD",
    },
    model: {
      id: row.model_id ?? "unknown-model",
      name: row.model_name ?? "Unknown Model",
      version: row.model_version ?? "N/A",
      isShadowMode: row.is_shadow_mode ?? false,
    },
    forecast: {
      outcome: (row.predicted_outcome as PredictionOutcome) ?? "home",
      confidence: normaliseConfidence(row.confidence_score ?? null),
      homeScore: row.predicted_home_score ?? null,
      awayScore: row.predicted_away_score ?? null,
      bothTeamsToScore: row.btts_prediction ?? null,
      overUnder: row.over_under_prediction ?? null,
      css: row.css_score ?? null,
      factors: normaliseFactors(row.prediction_factors),
    },
    actual: {
      outcome: (row.actual_outcome as PredictionOutcome | "void" | null) ?? null,
      wasCorrect: row.was_correct ?? null,
      homeScore: row.match?.home_score ?? null,
      awayScore: row.match?.away_score ?? null,
      evaluatedAt: row.evaluated_at ?? null,
    },
    metrics: {
      calibrationError: row.calibration_error ?? null,
    },
  };
};

const clonePrediction = (prediction: PredictionRecord): PredictionRecord => ({
  ...prediction,
  match: {
    ...prediction.match,
    league: { ...prediction.match.league },
  },
  model: { ...prediction.model },
  forecast: {
    ...prediction.forecast,
    factors: [...(prediction.forecast.factors ?? [])],
  },
  actual: { ...prediction.actual },
  metrics: { ...prediction.metrics },
});

const clonePredictions = (predictions: PredictionRecord[]): PredictionRecord[] => predictions.map(clonePrediction);

const isSupabaseConfigured = Boolean(supabaseProjectId);
export const isPredictionsSupabaseEnabled = isSupabaseConfigured;

const fetchSupabasePredictions = async (): Promise<PredictionRecord[]> => {
  const { data, error } = await supabase
    .from("predictions")
    .select(
      `
        id,
        created_at,
        evaluated_at,
        predicted_outcome,
        predicted_home_score,
        predicted_away_score,
        over_under_prediction,
        btts_prediction,
        confidence_score,
        css_score,
        calibration_error,
        actual_outcome,
        was_correct,
        model_id,
        model_name,
        model_version,
        is_shadow_mode,
        prediction_factors,
        match:matches(
          id,
          match_date,
          status,
          home_score,
          away_score,
          home_team:teams!matches_home_team_id_fkey(id, name),
          away_team:teams!matches_away_team_id_fkey(id, name),
          league:leagues(id, name, country)
        )
      `,
    )
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapSupabasePrediction(row as SupabasePredictionRow));
};

const getFallbackPredictions = (): PredictionRecord[] => clonePredictions(mockPredictions);

export const getPredictionsDataset = async (): Promise<PredictionRecord[]> => {
  if (!isSupabaseConfigured) {
    return getFallbackPredictions();
  }

  try {
    const predictions = await fetchSupabasePredictions();
    return predictions;
  } catch (error) {
    console.warn("[predictionsService] Falling back to mock predictions due to Supabase error", error);
    return getFallbackPredictions();
  }
};

export interface PaginatedPredictionsResult {
  data: PredictionRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const applyPredictionFilters = (
  predictions: PredictionRecord[],
  { search, status, league, from, to }: PredictionsFilterState,
): PredictionRecord[] => {
  const trimmedSearch = search?.trim().toLowerCase() ?? "";
  const fromTimestampValue = from ? Date.parse(from) : Number.NaN;
  const toTimestampValue = to ? Date.parse(to) : Number.NaN;
  const fromTimestamp = Number.isNaN(fromTimestampValue) ? null : fromTimestampValue;
  const toTimestamp = Number.isNaN(toTimestampValue) ? null : toTimestampValue + 86_399_999; // inclusive end-of-day

  return predictions.filter((prediction) => {
    if (status && status !== "all" && prediction.status !== status) {
      return false;
    }

    if (league && league !== "all" && prediction.match.league.id !== league) {
      return false;
    }

    const matchTime = Date.parse(prediction.match.date);
    if (fromTimestamp && matchTime < fromTimestamp) {
      return false;
    }

    if (toTimestamp && matchTime > toTimestamp) {
      return false;
    }

    if (trimmedSearch) {
      const haystack = [
        prediction.match.homeTeam,
        prediction.match.awayTeam,
        prediction.match.league.name,
        prediction.match.league.country,
        prediction.model.name,
        prediction.model.version,
        prediction.status,
        prediction.forecast.outcome,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(trimmedSearch)) {
        return false;
      }
    }

    return true;
  });
};

export const paginatePredictions = (
  predictions: PredictionRecord[],
  page = 1,
  pageSize = 10,
): PaginatedPredictionsResult => {
  const safePageSize = Math.max(1, pageSize);
  const total = predictions.length;
  const totalPages = total > 0 ? Math.ceil(total / safePageSize) : 1;
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (safePage - 1) * safePageSize;
  const endIndex = startIndex + safePageSize;

  return {
    data: predictions.slice(startIndex, endIndex),
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages,
  };
};

export interface PredictionQueryOptions extends PredictionsFilterState {
  page?: number;
  pageSize?: number;
}

export const fetchPredictions = async (
  options: PredictionQueryOptions = {},
): Promise<PaginatedPredictionsResult> => {
  const dataset = await getPredictionsDataset();
  const filtered = applyPredictionFilters(dataset, options);
  return paginatePredictions(filtered, options.page ?? 1, options.pageSize ?? 10);
};
