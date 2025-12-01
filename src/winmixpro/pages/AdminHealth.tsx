import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import WinmixProMetricCard from "@/winmixpro/components/MetricCard";
import WinmixProPage from "@/winmixpro/components/Page";
import WinmixProLoadingGrid from "@/winmixpro/components/LoadingGrid";
import { supabase } from "@/integrations/supabase/client";

interface SystemComponent {
  id: string;
  component_name: string;
  component_type: string;
  status: "healthy" | "degraded" | "down" | string;
  response_time_ms: number | null;
  error_rate: number | null;
  cpu_usage: number | null;
  memory_usage: number | null;
  checked_at: string;
}

interface MonitoringHealthResponse {
  components: SystemComponent[];
  status_counts: {
    healthy: number;
    degraded: number;
    down: number;
    unknown?: number;
  };
  updated_at: string;
}

interface PerformanceMetric {
  id: string;
  metric_name: string;
  metric_type: string;
  metric_category: string;
  value: number;
  unit: string;
  component: string;
  timestamp: string;
}

interface MonitoringMetricsResponse {
  metrics: PerformanceMetric[];
}

const levelClasses: Record<string, string> = {
  ok: "bg-emerald-500/10 text-emerald-200",
  warning: "bg-amber-500/10 text-amber-200",
  critical: "bg-rose-500/10 text-rose-200",
};

const metricColumns = [
  { key: "response_time_ms", label: "Latency" },
  { key: "error_rate", label: "Hibaarány" },
  { key: "cpu_usage", label: "CPU" },
  { key: "memory_usage", label: "Memória" },
] as const;


const formatPercent = (value?: number | null, fractionDigits = 1) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${value.toFixed(fractionDigits)}%`;
};

const fetchHealth = async (): Promise<MonitoringHealthResponse> => {
  const { data, error } = await supabase.functions.invoke<MonitoringHealthResponse>("monitoring-health", {
    method: "GET",
  });

  if (error || !data) {
    throw new Error(error?.message ?? "Nem sikerült betölteni a rendszer állapotát");
  }

  return data;
};

const fetchMetrics = async (): Promise<PerformanceMetric[]> => {
  const { data, error } = await supabase.functions.invoke<MonitoringMetricsResponse>("monitoring-metrics", {
    method: "GET",
  });

  if (error || !data) {
    throw new Error(error?.message ?? "Nem sikerült betölteni a teljesítmény metrikákat");
  }

  return data.metrics ?? [];
};

const AdminHealth = () => {
  const healthQuery = useQuery({
    queryKey: ["winmixpro", "health", "status"],
    queryFn: fetchHealth,
    refetchInterval: 45_000,
  });

  const metricsQuery = useQuery({
    queryKey: ["winmixpro", "health", "metrics"],
    queryFn: fetchMetrics,
    refetchInterval: 60_000,
  });

  const components = healthQuery.data?.components ?? [];
  const metrics = metricsQuery.data ?? [];

  const totals = useMemo(() => {
    const total = components.length;
    const healthy = components.filter((component) => component.status === "healthy").length;
    const alerting = components.filter((component) => component.status !== "healthy").length;
    const avgLatency = components
      .map((component) => component.response_time_ms)
      .filter((value): value is number => typeof value === "number" && value > 0);

    return {
      total,
      healthy,
      alerts: alerting,
      sla: total > 0 ? Math.round((healthy / total) * 100) : 0,
      avgLatency: avgLatency.length > 0
        ? Math.round(avgLatency.reduce((sum, value) => sum + value, 0) / avgLatency.length)
        : null,
    };
  }, [components]);

  const latestErrorRate = useMemo(() => {
    const errorMetrics = metrics
      .filter((metric) => metric.metric_name === "error_rate")
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return errorMetrics[0]?.value ?? null;
  }, [metrics]);

  const alerts = useMemo(() => {
    return components
      .filter((component) => component.status !== "healthy")
      .map((component) => ({
        id: component.id,
        title: component.component_name,
        status: component.status,
        description: `${component.component_type} szolgáltatás`,
        timestamp: component.checked_at,
      }));
  }, [components]);

  const getLevel = (key: (typeof metricColumns)[number]["key"], value: number | null) => {
    if (value === null || Number.isNaN(value)) return "ok";

    switch (key) {
      case "response_time_ms":
        if (value > 600) return "critical";
        if (value > 350) return "warning";
        return "ok";
      case "error_rate":
        if (value > 0.1) return "critical";
        if (value > 0.05) return "warning";
        return "ok";
      case "cpu_usage":
      case "memory_usage":
        if (value > 85) return "critical";
        if (value > 70) return "warning";
        return "ok";
      default:
        return "ok";
    }
  };

  const isLoading = healthQuery.isLoading || metricsQuery.isLoading;
  const hasError = healthQuery.isError || metricsQuery.isError;

  return (
    <WinmixProPage
      title="Rendszer egészség"
      description="Heatmap, riasztások és szolgáltatás szintű mutatók – valós időben a Supabase adataiból."
    >
      {isLoading ? (
        <WinmixProLoadingGrid />
      ) : hasError ? (
        <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-100">
          <p className="font-semibold">Nem sikerült betölteni a rendszer egészségét.</p>
          <p className="mt-2 text-sm opacity-80">
            {(healthQuery.error as Error)?.message ?? (metricsQuery.error as Error)?.message ?? "Ismeretlen hiba"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <WinmixProMetricCard
              label="SLA tartás"
              value={`${totals.sla}%`}
              hint={`${totals.healthy}/${totals.total} szolgáltatás stabil`}
              trend={healthQuery.data ? `Frissítve: ${new Intl.DateTimeFormat("hu-HU", {
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(healthQuery.data.updated_at))}` : "—"}
              intent={totals.sla >= 95 ? "positive" : totals.sla >= 80 ? "neutral" : "warning"}
            />
            <WinmixProMetricCard
              label="Aktív riasztások"
              value={`${totals.alerts}`}
              hint="Degradált vagy leállt komponensek"
              trend={totals.alerts > 0 ? "Figyelem szükséges" : "Nincs riasztás"}
              intent={totals.alerts > 0 ? "warning" : "positive"}
            />
            <WinmixProMetricCard
              label="Átlagos latency"
              value={totals.avgLatency ? `${totals.avgLatency} ms` : "—"}
              hint="Szolgáltatás átlag"
              trend={latestErrorRate !== null ? `Hibaarány: ${formatPercent(latestErrorRate * 100, 2)}` : ""}
              intent="neutral"
            />
          </div>

          <div className="overflow-x-auto rounded-3xl border border-white/10 bg-black/40">
            <table className="w-full min-w-[640px] text-left text-sm text-white/70">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-white/40">Szolgáltatás</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-white/40">Státusz</th>
                  {metricColumns.map((metric) => (
                    <th key={metric.key} className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-white/40">
                      {metric.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {components.map((component) => (
                  <tr key={component.id} className="border-t border-white/5">
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-white">{component.component_name}</p>
                      <p className="text-xs text-white/50">{component.component_type}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          component.status === "healthy"
                            ? "bg-emerald-500/10 text-emerald-200"
                            : component.status === "degraded"
                              ? "bg-amber-500/10 text-amber-200"
                              : "bg-rose-500/10 text-rose-200"
                        }`}
                      >
                        {component.status === "healthy"
                          ? "Egészséges"
                          : component.status === "degraded"
                            ? "Degradált"
                            : "Leállt"}
                      </span>
                    </td>
                    {metricColumns.map((metric) => {
                      const rawValue = component[metric.key];
                      const level = getLevel(metric.key, rawValue);
                      let displayValue = "—";

                      if (metric.key === "response_time_ms") {
                        displayValue = rawValue !== null ? `${rawValue} ms` : "—";
                      } else if (metric.key === "error_rate") {
                        displayValue = rawValue !== null ? formatPercent(rawValue * 100, 2) : "—";
                      } else {
                        displayValue = rawValue !== null ? `${rawValue}%` : "—";
                      }

                      return (
                        <td key={`${component.id}-${metric.key}`} className="px-4 py-4">
                          <div className={`rounded-2xl px-3 py-3 text-center text-sm font-semibold ${levelClasses[level]}`}>
                            <p>{displayValue}</p>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">Riasztások</p>
            <div className="mt-3 space-y-3">
              {alerts.length === 0 ? (
                <p className="text-sm text-white/60">Nincs aktív riasztás.</p>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.id} className="rounded-2xl border border-white/10 bg-black/40 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{alert.title}</p>
                        <p className="text-xs text-white/60">{alert.description}</p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          alert.status === "down"
                            ? "bg-rose-500/10 text-rose-200"
                            : "bg-amber-500/10 text-amber-200"
                        }`}
                      >
                        {alert.status === "down" ? "Leállt" : "Degradált"}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-white/60">
                      Frissítve: {new Intl.DateTimeFormat("hu-HU", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      }).format(new Date(alert.timestamp))}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </WinmixProPage>
  );
};

export default AdminHealth;
