import { useCallback, useEffect, useMemo, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { unparse } from "papaparse";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Activity,
  CalendarDays,
  Download,
  Loader2,
  Radio,
  RefreshCcw,
  Search,
  Target,
  Gauge as GaugeIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  applyPredictionFilters,
  getPredictionsDataset,
  isPredictionsSupabaseEnabled,
  paginatePredictions,
} from "@/features/predictions/predictionsService";
import type {
  PredictionRecord,
  PredictionStatus,
  PredictionsPaginationState,
} from "@/types/predictions";

const statusDisplay: Record<PredictionStatus, { label: string; className: string }> = {
  won: { label: "Won", className: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" },
  lost: { label: "Lost", className: "bg-rose-500/10 text-rose-500 border border-rose-500/20" },
  in_progress: { label: "In play", className: "bg-amber-500/10 text-amber-500 border border-amber-500/20" },
  upcoming: { label: "Upcoming", className: "bg-sky-500/10 text-sky-500 border border-sky-500/20" },
  void: { label: "Void", className: "bg-slate-500/20 text-slate-300 border border-slate-500/30" },
};

const streamingMessages = [
  "Streaming fresh fixtures",
  "Aggregating model calibrations",
  "Blending confidence signals",
  "Updating league baselines",
];

type FiltersState = {
  search: string;
  status: PredictionStatus | "all";
  league: string | "all";
  from: string | null;
  to: string | null;
};

type ConfidenceMeta = {
  barClass: string;
  textClass: string;
};

const clampConfidence = (value: number | null | undefined): number => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, Math.round(value)));
};

const getConfidenceMeta = (confidence: number): ConfidenceMeta => {
  if (confidence >= 80) {
    return { barClass: "bg-emerald-500", textClass: "text-emerald-500" };
  }
  if (confidence >= 65) {
    return { barClass: "bg-sky-500", textClass: "text-sky-500" };
  }
  if (confidence >= 50) {
    return { barClass: "bg-amber-500", textClass: "text-amber-500" };
  }
  return { barClass: "bg-rose-500", textClass: "text-rose-500" };
};

const formatDateSafe = (value: string, pattern = "MMM d, yyyy • HH:mm"): string => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return format(date, pattern);
};

const formatPredictionOutcome = (prediction: PredictionRecord): string => {
  switch (prediction.forecast.outcome) {
    case "home":
      return `${prediction.match.homeTeam} win`;
    case "away":
      return `${prediction.match.awayTeam} win`;
    case "draw":
      return "Draw";
    default:
      return prediction.forecast.outcome ?? "";
  }
};

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  accentClassName: string;
}

const StatCard = ({ title, value, subtitle, icon: Icon, accentClassName }: StatCardProps) => (
  <Card>
    <CardContent className="flex items-center justify-between p-5">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className={cn("rounded-full p-3", accentClassName)}>
        <Icon className="h-5 w-5" />
      </div>
    </CardContent>
  </Card>
);

interface PredictionCardProps {
  prediction: PredictionRecord;
}

const PredictionCard = ({ prediction }: PredictionCardProps) => {
  const confidence = clampConfidence(prediction.forecast.confidence);
  const confidenceMeta = getConfidenceMeta(confidence);
  const statusMeta = statusDisplay[prediction.status];
  const factors = prediction.forecast.factors?.slice(0, 3) ?? [];

  return (
    <Card className="transition duration-200 hover:border-primary/50">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg leading-snug">
              {prediction.match.homeTeam} vs {prediction.match.awayTeam}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {formatDateSafe(prediction.match.date)} · {prediction.match.league.name}
            </p>
          </div>
          <Badge className={cn("text-xs", statusMeta.className)}>{statusMeta.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted/60 p-3">
          <p className="text-xs uppercase text-muted-foreground">Model</p>
          <p className="text-sm font-semibold text-foreground">
            {prediction.model.name}
            <span className="text-muted-foreground"> · v{prediction.model.version}</span>
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs uppercase text-muted-foreground">
            <span>Confidence</span>
            <span className={cn("font-semibold", confidenceMeta.textClass)}>
              {confidence}% · {formatPredictionOutcome(prediction)}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className={cn("h-2 rounded-full transition-all", confidenceMeta.barClass)}
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>
        {factors.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {factors.map((factor) => (
              <span
                key={factor}
                className="rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground"
              >
                {factor}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const PredictionTable = ({
  predictions,
}: {
  predictions: PredictionRecord[];
}) => (
  <div className="overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[220px]">Match</TableHead>
          <TableHead className="min-w-[160px]">Model</TableHead>
          <TableHead className="min-w-[160px]">Prediction</TableHead>
          <TableHead className="min-w-[120px] text-center">Confidence</TableHead>
          <TableHead className="min-w-[120px] text-center">Status</TableHead>
          <TableHead className="min-w-[160px]">Actual</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {predictions.map((prediction) => {
          const confidence = clampConfidence(prediction.forecast.confidence);
          const confidenceMeta = getConfidenceMeta(confidence);
          const statusMeta = statusDisplay[prediction.status];
          const completed = prediction.status === "won" || prediction.status === "lost";
          const actualLabel = completed
            ? prediction.actual.outcome === "draw"
              ? "Draw"
              : `${prediction.actual.outcome === "home" ? prediction.match.homeTeam : prediction.match.awayTeam} win`
            : "Pending";
          const actualScore =
            completed && prediction.actual.homeScore !== null && prediction.actual.awayScore !== null
              ? `${prediction.actual.homeScore}-${prediction.actual.awayScore}`
              : null;
          const resultMetaClass = prediction.actual.wasCorrect === null
            ? "text-muted-foreground"
            : prediction.actual.wasCorrect
              ? "text-emerald-500"
              : "text-rose-500";

          return (
            <TableRow key={prediction.id}>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <p className="font-medium text-foreground">
                    {prediction.match.homeTeam} vs {prediction.match.awayTeam}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateSafe(prediction.match.date)} · {prediction.match.league.name}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col text-sm">
                  <span className="font-medium text-foreground">{prediction.model.name}</span>
                  <span className="text-xs text-muted-foreground">v{prediction.model.version}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1 text-sm">
                  <span className="font-medium text-foreground">{formatPredictionOutcome(prediction)}</span>
                  {prediction.forecast.homeScore !== null && prediction.forecast.awayScore !== null && (
                    <span className="text-xs text-muted-foreground">
                      Projected score {prediction.forecast.homeScore}-{prediction.forecast.awayScore}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col items-center gap-1">
                  <span className={cn("text-sm font-semibold", confidenceMeta.textClass)}>
                    {confidence}%
                  </span>
                  <div className="h-1.5 w-full rounded-full bg-muted">
                    <div
                      className={cn("h-1.5 rounded-full transition-all", confidenceMeta.barClass)}
                      style={{ width: `${confidence}%` }}
                    />
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge className={cn("text-xs", statusMeta.className)}>{statusMeta.label}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-col text-sm">
                  <span className="font-medium text-foreground">{actualLabel}</span>
                  {actualScore && <span className="text-xs text-muted-foreground">Score {actualScore}</span>}
                  {completed && (
                    <span className={cn("text-xs font-medium", resultMetaClass)}>
                      {prediction.actual.wasCorrect ? "Prediction matched" : "Prediction missed"}
                    </span>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </div>
);

const chartPalette = ["#22c55e", "#3b82f6", "#a855f7", "#f97316", "#ef4444", "#14b8a6"];

const statusOptions: Array<{ value: PredictionStatus | "all"; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
  { value: "in_progress", label: "In play" },
  { value: "upcoming", label: "Upcoming" },
  { value: "void", label: "Void" },
];

const pageSizeOptions = [10, 20, 50];

const initialFilters: FiltersState = {
  search: "",
  status: "all",
  league: "all",
  from: null,
  to: null,
};

const PredictionsPage = () => {
  const [allPredictions, setAllPredictions] = useState<PredictionRecord[]>([]);
  const [filters, setFilters] = useState<FiltersState>(initialFilters);
  const [pagination, setPagination] = useState<PredictionsPaginationState>({ page: 1, pageSize: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [refreshTicker, setRefreshTicker] = useState(0);
  const [streamBatchCount, setStreamBatchCount] = useState(0);

  const loadPredictions = useCallback(async () => {
    try {
      setLoading(true);
      const dataset = await getPredictionsDataset();
      setAllPredictions(dataset);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to load predictions", err);
      setError("Unable to load predictions at the moment. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPredictions();
  }, [loadPredictions]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTicker((value) => value + 1);
    }, 15_000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isPredictionsSupabaseEnabled) {
      const interval = setInterval(() => {
        setStreamBatchCount((count) => count + 1);
        setLastUpdated(new Date());
      }, 20_000);

      return () => clearInterval(interval);
    }
  }, []);

  const filteredPredictions = useMemo(
    () => applyPredictionFilters(allPredictions, filters),
    [allPredictions, filters],
  );

  const paginated = useMemo(
    () => paginatePredictions(filteredPredictions, pagination.page, pagination.pageSize),
    [filteredPredictions, pagination.page, pagination.pageSize],
  );

  useEffect(() => {
    if (pagination.page !== paginated.page) {
      setPagination((prev) => ({ ...prev, page: paginated.page }));
    }
  }, [paginated.page, pagination.page]);

  useEffect(() => {
    setPagination((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }));
  }, [filters.search, filters.status, filters.league, filters.from, filters.to]);

  const leagueOptions = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    allPredictions.forEach((prediction) => {
      map.set(prediction.match.league.id, {
        id: prediction.match.league.id,
        name: prediction.match.league.name,
      });
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [allPredictions]);

  const stats = useMemo(() => {
    let wins = 0;
    let losses = 0;
    let inProgress = 0;
    let upcoming = 0;
    let voided = 0;
    let confidenceSum = 0;

    filteredPredictions.forEach((prediction) => {
      confidenceSum += clampConfidence(prediction.forecast.confidence);
      switch (prediction.status) {
        case "won":
          wins += 1;
          break;
        case "lost":
          losses += 1;
          break;
        case "in_progress":
          inProgress += 1;
          break;
        case "upcoming":
          upcoming += 1;
          break;
        case "void":
          voided += 1;
          break;
        default:
          break;
      }
    });

    const completed = wins + losses;
    const overallAccuracy = completed > 0 ? Math.round((wins / completed) * 100) : 0;
    const averageConfidence = filteredPredictions.length > 0
      ? Math.round(confidenceSum / filteredPredictions.length)
      : 0;

    return {
      wins,
      losses,
      inProgress,
      upcoming,
      voided,
      overallAccuracy,
      averageConfidence,
      completed,
    };
  }, [filteredPredictions]);

  const accuracyTrendData = useMemo(() => {
    const map = new Map<string, { date: string; wins: number; total: number }>();
    filteredPredictions
      .filter((prediction) => prediction.status === "won" || prediction.status === "lost")
      .forEach((prediction) => {
        const key = formatDateSafe(prediction.match.date, "yyyy-MM-dd");
        if (!map.has(key)) {
          map.set(key, { date: key, wins: 0, total: 0 });
        }
        const entry = map.get(key)!;
        entry.total += 1;
        if (prediction.status === "won") {
          entry.wins += 1;
        }
      });

    return Array.from(map.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((entry) => ({
        date: entry.date,
        accuracy: entry.total > 0 ? Number(((entry.wins / entry.total) * 100).toFixed(1)) : 0,
      }));
  }, [filteredPredictions]);

  const confidenceDistribution = useMemo(() => {
    const buckets = [
      { label: "50-59", min: 50, max: 59 },
      { label: "60-69", min: 60, max: 69 },
      { label: "70-79", min: 70, max: 79 },
      { label: "80-89", min: 80, max: 89 },
      { label: "90-100", min: 90, max: 100 },
    ];

    return buckets.map((bucket) => {
      const count = filteredPredictions.reduce((acc, prediction) => {
        const confidence = clampConfidence(prediction.forecast.confidence);
        if (confidence >= bucket.min && confidence <= bucket.max) {
          return acc + 1;
        }
        return acc;
      }, 0);

      return { bucket: bucket.label, count };
    });
  }, [filteredPredictions]);

  const modelComparison = useMemo(() => {
    const map = new Map<string, { model: string; wins: number; total: number }>();

    filteredPredictions.forEach((prediction) => {
      const key = prediction.model.id || prediction.model.name;
      if (!map.has(key)) {
        map.set(key, { model: prediction.model.name, wins: 0, total: 0 });
      }
      const entry = map.get(key)!;
      if (prediction.status === "won" || prediction.status === "lost") {
        entry.total += 1;
        if (prediction.status === "won") {
          entry.wins += 1;
        }
      }
    });

    return Array.from(map.values())
      .map((entry) => ({
        model: entry.model,
        accuracy: entry.total > 0 ? Number(((entry.wins / entry.total) * 100).toFixed(1)) : 0,
        total: entry.total,
      }))
      .sort((a, b) => b.accuracy - a.accuracy);
  }, [filteredPredictions]);

  const leagueBreakdown = useMemo(() => {
    const map = new Map<string, { name: string; wins: number; total: number }>();

    filteredPredictions.forEach((prediction) => {
      const key = prediction.match.league.id;
      if (!map.has(key)) {
        map.set(key, {
          name: prediction.match.league.name,
          wins: 0,
          total: 0,
        });
      }
      const entry = map.get(key)!;
      if (prediction.status === "won" || prediction.status === "lost") {
        entry.total += 1;
        if (prediction.status === "won") {
          entry.wins += 1;
        }
      }
    });

    return Array.from(map.values()).map((entry) => ({
      name: entry.name,
      accuracy: entry.total > 0 ? Number(((entry.wins / entry.total) * 100).toFixed(1)) : 0,
      total: entry.total,
    }));
  }, [filteredPredictions]);

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({ ...prev, status: value as PredictionStatus | "all" }));
  };

  const handleLeagueChange = (value: string) => {
    setFilters((prev) => ({ ...prev, league: value }));
  };

  const handleFromChange = (value: string) => {
    setFilters((prev) => ({ ...prev, from: value || null }));
  };

  const handleToChange = (value: string) => {
    setFilters((prev) => ({ ...prev, to: value || null }));
  };

  const handlePageSizeChange = (value: string) => {
    const size = Number(value) || pagination.pageSize;
    setPagination({ page: 1, pageSize: size });
  };

  const handlePageChange = (direction: "prev" | "next") => {
    setPagination((prev) => {
      const nextPage = direction === "prev" ? prev.page - 1 : prev.page + 1;
      return { ...prev, page: Math.max(1, Math.min(nextPage, paginated.totalPages)) };
    });
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  const handleRefresh = () => {
    loadPredictions();
  };

  const handleExport = useCallback(() => {
    if (typeof window === "undefined" || filteredPredictions.length === 0) {
      return;
    }

    const rows = filteredPredictions.map((prediction) => ({
      id: prediction.id,
      match_date: formatDateSafe(prediction.match.date, "yyyy-MM-dd HH:mm"),
      league: prediction.match.league.name,
      home_team: prediction.match.homeTeam,
      away_team: prediction.match.awayTeam,
      predicted_outcome: prediction.forecast.outcome,
      predicted_score: `${prediction.forecast.homeScore ?? "-"}:${prediction.forecast.awayScore ?? "-"}`,
      confidence: clampConfidence(prediction.forecast.confidence),
      status: prediction.status,
      model: prediction.model.name,
      model_version: prediction.model.version,
      actual_outcome: prediction.actual.outcome ?? "",
      was_correct: prediction.actual.wasCorrect ?? "",
    }));

    const csv = unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.setAttribute("download", `predictions-${Date.now()}.csv`);
    anchor.click();
    window.URL.revokeObjectURL(url);
  }, [filteredPredictions]);

  const lastUpdatedLabel = useMemo(() => {
    return formatDistanceToNow(lastUpdated, { addSuffix: true });
  }, [lastUpdated, refreshTicker]);

  const streamingMessage = streamingMessages[streamBatchCount % streamingMessages.length];

  const totalRecords = filteredPredictions.length;
  const startRecord = totalRecords === 0 ? 0 : (paginated.page - 1) * paginated.pageSize + 1;
  const endRecord = totalRecords === 0 ? 0 : Math.min(startRecord + paginated.data.length - 1, totalRecords);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Predictions intelligence</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Explore AI-generated match predictions, track accuracy trends, and export insights for your analysis flow.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>{streamingMessage}</span>
            <span className="text-muted-foreground">• {lastUpdatedLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
              Refresh data
            </Button>
            <Button size="sm" onClick={handleExport} disabled={filteredPredictions.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </section>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="md:col-span-2">
              <Label htmlFor="prediction-search">Search</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="prediction-search"
                  placeholder="Search teams, leagues or models"
                  value={filters.search}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label>League</Label>
              <Select value={filters.league} onValueChange={handleLeagueChange}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="All leagues" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All leagues</SelectItem>
                  {leagueOptions.map((league) => (
                    <SelectItem key={league.id} value={league.id}>
                      {league.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>From</Label>
                <Input
                  type="date"
                  value={filters.from ?? ""}
                  onChange={(event) => handleFromChange(event.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>To</Label>
                <Input
                  type="date"
                  value={filters.to ?? ""}
                  onChange={(event) => handleToChange(event.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Radio className="h-4 w-4" />
              <span>
                Source: {isPredictionsSupabaseEnabled ? "Supabase live data" : "Deterministic mock dataset"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Page size</span>
                <Select value={String(pagination.pageSize)} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="w-[90px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizeOptions.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                Reset filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">Predictions table</CardTitle>
            <p className="text-sm text-muted-foreground">
              Showing {totalRecords === 0 ? 0 : `${startRecord}-${endRecord}`} of {totalRecords} predictions
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : paginated.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <p className="text-lg font-semibold text-foreground">No predictions found</p>
              <p className="max-w-md text-sm text-muted-foreground">
                Try adjusting your filters or refresh the data stream to discover more predictions.
              </p>
            </div>
          ) : (
            <>
              <PredictionTable predictions={paginated.data} />
              <div className="flex flex-col gap-3 border-t pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Page {paginated.page} of {paginated.totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange("prev")}
                    disabled={paginated.page <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange("next")}
                    disabled={paginated.page >= paginated.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {!loading && paginated.data.length > 0 && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {paginated.data.map((prediction) => (
            <PredictionCard key={prediction.id} prediction={prediction} />
          ))}
        </section>
      )}

      <section className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Overall accuracy"
            value={`${stats.overallAccuracy}%`}
            subtitle={`${stats.wins} wins over ${stats.completed} evaluated predictions`}
            icon={Target}
            accentClassName="bg-emerald-500/10 text-emerald-500"
          />
          <StatCard
            title="Average confidence"
            value={`${stats.averageConfidence}%`}
            subtitle="Across filtered predictions"
            icon={GaugeIcon}
            accentClassName="bg-sky-500/10 text-sky-500"
          />
          <StatCard
            title="Live predictions"
            value={String(stats.inProgress)}
            subtitle="Currently in play"
            icon={Activity}
            accentClassName="bg-amber-500/10 text-amber-500"
          />
          <StatCard
            title="Upcoming fixtures"
            value={String(stats.upcoming)}
            subtitle="Scheduled in the timeline"
            icon={CalendarDays}
            accentClassName="bg-purple-500/10 text-purple-500"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Accuracy trend</CardTitle>
            </CardHeader>
            <CardContent className="h-[280px]">
              <ResponsiveContainer>
                <LineChart data={accuracyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tickLine={false} />
                  <YAxis unit="%" stroke="hsl(var(--muted-foreground))" tickLine={false} domain={[0, 100]} />
                  <RechartsTooltip formatter={(value: number) => `${value}%`} />
                  <Line type="monotone" dataKey="accuracy" stroke="#22c55e" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Confidence histogram</CardTitle>
            </CardHeader>
            <CardContent className="h-[280px]">
              <ResponsiveContainer>
                <BarChart data={confidenceDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="bucket" stroke="hsl(var(--muted-foreground))" tickLine={false} />
                  <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" tickLine={false} />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Model comparison</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer>
                <BarChart data={modelComparison} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" tickLine={false} />
                  <YAxis type="category" dataKey="model" stroke="hsl(var(--muted-foreground))" tickLine={false} width={120} />
                  <RechartsTooltip formatter={(value: number, name: string, props) => [`${value}%`, `${props?.payload?.total ?? 0} samples`]} />
                  <Bar dataKey="accuracy" radius={[0, 6, 6, 0]}>
                    {modelComparison.map((entry, index) => (
                      <Cell key={entry.model} fill={chartPalette[index % chartPalette.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">League breakdown</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={leagueBreakdown} dataKey="accuracy" nameKey="name" outerRadius={90} label>
                    {leagueBreakdown.map((entry, index) => (
                      <Cell key={entry.name} fill={chartPalette[index % chartPalette.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number, name: string, props) => [`${value}%`, `${props?.payload?.total ?? 0} matches`]} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default PredictionsPage;
