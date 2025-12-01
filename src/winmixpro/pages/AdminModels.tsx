import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import WinmixProMetricCard from "@/winmixpro/components/MetricCard";
import WinmixProPage from "@/winmixpro/components/Page";
import WinmixProLoadingGrid from "@/winmixpro/components/LoadingGrid";
import { supabase } from "@/integrations/supabase/client";

interface ModelPerformanceSummary {
  model_version: string;
  period_start: string;
  period_end: string;
  total_predictions: number;
  accuracy_overall: number;
  confidence_calibration_score: number;
}

interface ModelPerformancePoint {
  date: string;
  overall: number;
  home_win: number;
  draw: number;
  away_win: number;
}

interface ModelPerformanceResponse {
  summary: ModelPerformanceSummary;
  timeseries: ModelPerformancePoint[];
}

interface ModelRegistryRow {
  id: string;
  model_name: string;
  model_version: string;
  model_type: string;
  algorithm?: string | null;
  hyperparameters?: Record<string, unknown> | null;
  traffic_allocation?: number | null;
  total_predictions?: number | null;
  accuracy?: number | null;
  is_active?: boolean | null;
  description?: string | null;
  registered_at?: string | null;
  updated_at?: string | null;
}

const typeLabels: Record<string, string> = {
  champion: "Champion",
  challenger: "Challenger",
  shadow: "Shadow",
  retired: "Retired",
};

const typeColors: Record<string, string> = {
  champion: "bg-emerald-500/10 text-emerald-200",
  challenger: "bg-sky-500/10 text-sky-200",
  shadow: "bg-white/10 text-white/70",
  retired: "bg-white/10 text-white/70",
};

const formatPercent = (value?: number | null, fractionDigits = 1) => {
  if (typeof value !== "number") return "—";
  return `${value.toFixed(fractionDigits)}%`;
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

const fetchModelPerformance = async (): Promise<ModelPerformanceResponse> => {
  const { data, error } = await supabase.functions.invoke<ModelPerformanceResponse>("models-performance", {
    method: "GET",
  });

  if (error || !data) {
    throw new Error(error?.message ?? "Nem sikerült betölteni a modell teljesítmény adatokat");
  }

  return data;
};

const fetchModelRegistry = async (): Promise<ModelRegistryRow[]> => {
  const { data, error } = await supabase
    .from("model_registry")
    .select("*")
    .order("registered_at", { ascending: false });

  if (error) {
    throw new Error(error.message ?? "Nem sikerült betölteni a model registry-t");
  }

  return data ?? [];
};

const AdminModels = () => {
  const performanceQuery = useQuery({
    queryKey: ["winmixpro", "models", "performance"],
    queryFn: fetchModelPerformance,
    refetchInterval: 60_000,
  });

  const modelsQuery = useQuery({
    queryKey: ["winmixpro", "models", "registry"],
    queryFn: fetchModelRegistry,
    refetchInterval: 60_000,
  });

  const performance = performanceQuery.data;
  const models = modelsQuery.data ?? [];

  const champion = useMemo(
    () => models.find((model) => model.model_type === "champion"),
    [models],
  );

  const topChallenger = useMemo(() => {
    return models
      .filter((model) => model.model_type === "challenger")
      .sort((a, b) => (b.accuracy ?? 0) - (a.accuracy ?? 0))[0];
  }, [models]);

  const shadowRuns = useMemo(() => {
    return models
      .filter((model) => model.model_type === "shadow")
      .reduce((sum, model) => sum + (model.total_predictions ?? 0), 0);
  }, [models]);

  const chartData = useMemo(() => {
    if (!performance) return [];
    return (performance.timeseries ?? []).map((point) => ({
      week: point.date,
      champion: Math.round(point.overall ?? 0),
      challenger: Math.round(point.home_win ?? 0),
      market: Math.round(point.away_win ?? 0),
    }));
  }, [performance]);

  const sortedModels = useMemo(() => {
    return [...models].sort((a, b) => (b.accuracy ?? 0) - (a.accuracy ?? 0));
  }, [models]);

  const championAccuracy = champion?.accuracy ?? null;
  const challengerDiff = championAccuracy !== null && topChallenger?.accuracy !== undefined
    ? (topChallenger.accuracy ?? 0) - championAccuracy
    : null;

  const isLoading = performanceQuery.isLoading || modelsQuery.isLoading;
  const hasError = performanceQuery.isError || modelsQuery.isError;

  return (
    <WinmixProPage
      title="Model vezérlő"
      description="Champion vs challenger teljesítmények, piaci összevetés és trafikelosztás – valós Supabase adatokkal."
    >
      {isLoading ? (
        <WinmixProLoadingGrid />
      ) : hasError ? (
        <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-100">
          <p className="font-semibold">Nem sikerült betölteni a modell adatokat.</p>
          <p className="mt-2 text-sm opacity-80">
            {(performanceQuery.error as Error)?.message ?? (modelsQuery.error as Error)?.message ?? "Ismeretlen hiba"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <WinmixProMetricCard
              label="Champion pontosság"
              value={formatPercent(championAccuracy)}
              hint={champion ? `${champion.model_name} v${champion.model_version}` : "Nincs champion"}
              trend={performance ? `${performance.summary.total_predictions} predikció` : "—"}
              intent="positive"
            />
            <WinmixProMetricCard
              label="Challenger difi"
              value={challengerDiff !== null ? `${challengerDiff.toFixed(2)}%` : "—"}
              hint={topChallenger ? `${topChallenger.model_name} v${topChallenger.model_version}` : "Nincs challenger"}
              trend={challengerDiff !== null ? (challengerDiff >= 0 ? "Közelít" : "Elmarad") : ""}
              intent={challengerDiff !== null && challengerDiff < 0 ? "warning" : "neutral"}
            />
            <WinmixProMetricCard
              label="Shadow logok"
              value={shadowRuns.toLocaleString("hu-HU")}
              hint="Összesített futások"
              trend={`${models.filter((model) => model.model_type === "shadow").length} shadow modell`}
              intent="neutral"
            />
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/50 p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/40">Pontosság trend</p>
                <p className="text-lg font-semibold text-white">Hét napos csúszó átlag</p>
              </div>
              <div className="flex gap-4 text-xs text-white/70">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-8 rounded-full bg-emerald-400" /> Champion
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-8 rounded-full bg-sky-400" /> Challenger
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-8 rounded-full bg-white/60" /> Piaci baseline
                </div>
              </div>
            </div>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="week" stroke="#94a3b8" fontSize={12} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} tickFormatter={(value) => `${value}%`} />
                  <Tooltip contentStyle={{ background: "rgba(2,6,23,0.95)", borderRadius: 12 }} />
                  <Line type="monotone" dataKey="champion" stroke="#34d399" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="challenger" stroke="#38bdf8" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="market" stroke="#e2e8f0" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {sortedModels.map((model) => {
              const type = typeLabels[model.model_type] ?? model.model_type;
              const badgeClass = typeColors[model.model_type] ?? "bg-white/10 text-white";
              const traffic = model.traffic_allocation ?? 0;
              const accuracy = model.accuracy ?? 0;

              return (
                <div key={model.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-white">{model.model_name}</p>
                      <p className="text-xs uppercase tracking-[0.45em] text-white/40">v{model.model_version}</p>
                    </div>
                    <Badge className={badgeClass}>{type}</Badge>
                  </div>
                  <div className="mt-4 grid gap-4 text-sm text-white/80 lg:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase text-white/50">Pontosság</p>
                      <p className="text-xl font-semibold text-white">{formatPercent(accuracy)}</p>
                      <p className="text-xs text-white/60">Futások: {model.total_predictions ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-white/50">Regisztráció</p>
                      <p className="text-sm text-white">{formatDate(model.registered_at)}</p>
                      <p className="text-xs text-white/60">Forgalom: {traffic}%</p>
                    </div>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                      style={{ width: `${Math.min(traffic, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </WinmixProPage>
  );
};

export default AdminModels;
