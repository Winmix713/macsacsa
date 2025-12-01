import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock8, RefreshCcw, Zap, XCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import WinmixProMetricCard from "@/winmixpro/components/MetricCard";
import WinmixProPage from "@/winmixpro/components/Page";
import { usePersistentState } from "@/winmixpro/hooks/usePersistentState";
import { supabase } from "@/integrations/supabase/client";
import type { JobListResponse, JobSummary, JobToggleResponse, JobTriggerResponse, JobLog } from "@/types/jobs";
import { toast } from "sonner";

import WinmixProLoadingGrid from "@/winmixpro/components/LoadingGrid";

const jobTypeLabels: Record<string, string> = {
  data_import: "Adat import",
  prediction: "Modellezés",
  aggregation: "Aggregáció",
  maintenance: "Karbantartás",
  monitoring: "Monitoring",
};

type JobCategory = "all" | string;

const statusClasses: Record<string, string> = {
  running: "bg-emerald-500/10 text-emerald-200",
  success: "bg-sky-500/10 text-sky-200",
  queued: "bg-amber-500/10 text-amber-200",
  error: "bg-rose-500/10 text-rose-200",
  disabled: "bg-white/10 text-white/60",
  due: "bg-amber-500/10 text-amber-200",
};

const statusLabels: Record<string, string> = {
  running: "Fut",
  success: "Sikeres",
  queued: "Sorban",
  error: "Hiba",
  disabled: "Letiltva",
  due: "Esedékes",
};

const timelineIcons = {
  success: CheckCircle2,
  running: RefreshCcw,
  error: XCircle,
};

const timelineColor = {
  success: "text-emerald-300",
  running: "text-sky-300",
  error: "text-rose-300",
};

const formatJobType = (jobType: string) => jobTypeLabels[jobType] ?? jobType;

const formatDuration = (ms?: number | null) => {
  if (!ms || ms <= 0) return "—";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}p ${seconds.toString().padStart(2, "0")}mp`;
};

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("hu-HU", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("hu-HU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
};

const fetchJobs = async (): Promise<JobSummary[]> => {
  const { data, error } = await supabase.functions.invoke<JobListResponse>("jobs-list", {
    method: "GET",
  });

  if (error) {
    throw new Error(error.message ?? "Nem sikerült betölteni a feladatokat");
  }

  return data?.jobs ?? [];
};

const AdminJobs = () => {
  const queryClient = useQueryClient();
  const [category, setCategory] = usePersistentState<JobCategory>("winmixpro-job-filter", "all");

  const jobsQuery = useQuery({
    queryKey: ["winmixpro", "jobs"],
    queryFn: fetchJobs,
    refetchInterval: 30_000,
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ jobId, enabled }: { jobId: string; enabled: boolean }) => {
      const { data, error } = await supabase.functions.invoke<JobToggleResponse>("jobs-toggle", {
        body: { jobId, enabled },
      });

      if (error) {
        throw new Error(error.message ?? "Nem sikerült frissíteni a job állapotát");
      }

      return data?.job;
    },
    onSuccess: (_, { enabled }) => {
      toast.success(`Feladat ${enabled ? "engedélyezve" : "letiltva"}`);
      void queryClient.invalidateQueries({ queryKey: ["winmixpro", "jobs"] });
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Ismeretlen hiba";
      toast.error(message);
    },
  });

  const runMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { data, error } = await supabase.functions.invoke<JobTriggerResponse>("jobs-trigger", {
        body: { jobId },
      });

      if (error) {
        throw new Error(error.message ?? "Nem sikerült futtatni a feladatot");
      }

      return data?.result;
    },
    onSuccess: (result) => {
      if (result) {
        toast.success(`Feladat futtatva – ${result.recordsProcessed ?? 0} rekord feldolgozva`);
      } else {
        toast.success("Feladat futtatás elindítva");
      }
      void queryClient.invalidateQueries({ queryKey: ["winmixpro", "jobs"] });
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Ismeretlen hiba";
      toast.error(message);
    },
  });

  const jobs = jobsQuery.data ?? [];

  const categories = useMemo(() => {
    const uniqueTypes = Array.from(new Set(jobs.map((job) => job.job_type)));
    return [
      { value: "all" as JobCategory, label: "Összes" },
      ...uniqueTypes.map((type) => ({ value: type, label: formatJobType(type) })),
    ];
  }, [jobs]);

  const visibleJobs = useMemo(() => {
    if (category === "all") {
      return jobs;
    }
    return jobs.filter((job) => job.job_type === category);
  }, [jobs, category]);

  const metrics = useMemo(() => {
    const total = jobs.length;
    const enabled = jobs.filter((job) => job.enabled).length;
    const running = jobs.filter((job) => job.last_log?.status === "running").length;
    const avgDurations = jobs
      .map((job) => job.average_duration_ms)
      .filter((ms): ms is number => typeof ms === "number" && ms > 0);
    const average = avgDurations.length > 0
      ? avgDurations.reduce((sum, ms) => sum + ms, 0) / avgDurations.length
      : null;
    const automationScore = total > 0 ? Math.round((enabled / total) * 100) : 0;

    return {
      total,
      enabled,
      running,
      automationScore,
      average,
    };
  }, [jobs]);

  const timeline = useMemo(() => {
    const logs: Array<JobLog & { jobName: string }> = jobs.flatMap((job) =>
      (job.recent_logs ?? []).map((log) => ({ ...log, jobName: job.job_name }))
    );

    return logs
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
      .slice(0, 8);
  }, [jobs]);

  const getJobStatus = (job: JobSummary) => {
    if (!job.enabled) {
      return { key: "disabled", label: statusLabels.disabled };
    }
    if (job.last_log?.status === "running") {
      return { key: "running", label: statusLabels.running };
    }
    if (job.last_log?.status === "success") {
      return { key: "success", label: statusLabels.success };
    }
    if (job.last_log?.status === "error") {
      return { key: "error", label: statusLabels.error };
    }
    if (job.is_due) {
      return { key: "due", label: statusLabels.due };
    }
    return { key: "queued", label: statusLabels.queued };
  };

  const getSuccessRatio = (job: JobSummary) => {
    if (!job.stats || job.stats.total_runs === 0) return 0;
    return Math.round((job.stats.success_runs / job.stats.total_runs) * 100);
  };

  return (
    <WinmixProPage
      title="Automatizált folyamatok"
      description="Scheduler, job életciklus és SLA státuszok – valós Supabase adatokkal."
      actions={
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/5 text-white hover:bg-white/10"
            onClick={() => void jobsQuery.refetch()}
            disabled={jobsQuery.isFetching}
          >
            <RefreshCcw className={`mr-2 h-4 w-4 ${jobsQuery.isFetching ? "animate-spin" : ""}`} />
            Frissítés
          </Button>
        </div>
      }
    >
      {jobsQuery.isLoading ? (
        <WinmixProLoadingGrid />
      ) : jobsQuery.isError ? (
        <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-100">
          <p className="font-semibold">Nem sikerült betölteni az ütemezett feladatokat.</p>
          <p className="mt-2 text-sm opacity-80">
            {(jobsQuery.error as Error)?.message ?? "Ismeretlen hiba"}
          </p>
          <Button
            size="sm"
            className="mt-4 bg-white/10 text-white hover:bg-white/20"
            onClick={() => void jobsQuery.refetch()}
          >
            Újra
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <WinmixProMetricCard
              label="Aktív jobok"
              value={`${metrics.enabled}/${metrics.total}`}
              hint="Engedélyezett / összes"
              trend={metrics.running > 0 ? `${metrics.running} fut` : "—"}
              intent="positive"
              icon={Clock8}
            />
            <WinmixProMetricCard
              label="Automatizációs pont"
              value={`${metrics.automationScore}%`}
              hint="Engedélyezett arány"
              trend={metrics.automationScore >= 80 ? "Jó lefedettség" : "Növelhető"}
              intent={metrics.automationScore >= 80 ? "positive" : metrics.automationScore >= 60 ? "neutral" : "warning"}
              icon={Zap}
            />
            <WinmixProMetricCard
              label="Átlagos futási idő"
              value={formatDuration(metrics.average)}
              hint="Utolsó futások átlaga"
              trend={metrics.average ? `${Math.floor((metrics.average ?? 0) / 1000)} mp` : "—"}
              intent="neutral"
            />
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/5 p-4 backdrop-blur">
            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <Button
                  key={item.value}
                  size="sm"
                  variant={category === item.value ? "default" : "secondary"}
                  className={
                    category === item.value
                      ? "bg-emerald-500 text-white hover:bg-emerald-600"
                      : "bg-white/5 text-white/70 hover:bg-white/10"
                  }
                  onClick={() => setCategory(item.value)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <div className="rounded-3xl border border-white/10 bg-black/50 p-4">
              {visibleJobs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/20 p-6 text-center text-sm text-white/60">
                  Nincs megjeleníthető job ebben a kategóriában.
                </div>
              ) : (
                <div className="space-y-4">
                  {visibleJobs.map((job) => {
                    const status = getJobStatus(job);
                    const successRatio = getSuccessRatio(job);
                    const configDescription = typeof job.config?.description === "string" ? job.config.description : null;

                    return (
                      <div
                        key={job.id}
                        className="rounded-2xl border border-white/10 bg-white/5/40 p-4 transition hover:border-white/30"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-lg font-semibold text-white">{job.job_name}</p>
                            <p className="text-xs uppercase tracking-[0.4em] text-white/40">
                              {formatJobType(job.job_type)}
                            </p>
                            {configDescription ? (
                              <p className="mt-1 text-xs text-white/60">{configDescription}</p>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[status.key]}`}>
                              {status.label}
                            </span>
                            <label className="flex items-center gap-2 text-xs text-white/60">
                              <Switch
                                checked={job.enabled}
                                onCheckedChange={() => toggleMutation.mutate({ jobId: job.id, enabled: !job.enabled })}
                                disabled={toggleMutation.isPending}
                              />
                              Engedélyezett
                            </label>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-white/70 hover:bg-white/10"
                              onClick={() => runMutation.mutate(job.id)}
                              disabled={runMutation.isPending}
                            >
                              <Play className="mr-1 h-3.5 w-3.5" /> Futatás
                            </Button>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-4">
                          <div>
                            <p className="text-xs uppercase text-white/50">Ütemezés</p>
                            <p className="text-sm text-white">{job.cron_schedule}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-white/50">Legutóbbi futás</p>
                            <p className="text-sm text-white">{formatDateTime(job.last_run_at)}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-white/50">Következő futás</p>
                            <p className="text-sm text-white">{formatDateTime(job.next_run_at)}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-white/50">Sikeresség</p>
                            <div className="mt-1 h-2 rounded-full bg-white/10">
                              <div
                                className="h-full rounded-full bg-emerald-400"
                                style={{ width: `${successRatio}%` }}
                              />
                            </div>
                            <p className="text-xs text-white/60">{successRatio}%</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-black/60 p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.4em] text-white/60">Legutóbbi események</p>
              {timeline.length === 0 ? (
                <p className="mt-4 text-sm text-white/60">Még nincs futási előzmény.</p>
              ) : (
                <ol className="mt-4 space-y-6 border-l border-white/20 pl-6">
                  {timeline.map((entry) => {
                    const status = entry.status in timelineIcons ? entry.status : "running";
                    const Icon = timelineIcons[status as keyof typeof timelineIcons];
                    const intent = timelineColor[status as keyof typeof timelineColor] ?? "text-white";
                    return (
                      <li key={`${entry.id}-${entry.started_at}`} className="relative">
                        <span className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-black">
                          <Icon className={`h-4 w-4 ${intent}`} />
                        </span>
                        <div className="rounded-2xl bg-black/40 p-3">
                          <p className="text-xs uppercase tracking-[0.35em] text-white/40">
                            {formatTime(entry.started_at)}
                          </p>
                          <p className="text-sm font-semibold text-white">{entry.jobName}</p>
                          <p className="text-xs text-white/60">
                            {statusLabels[status as keyof typeof statusLabels] ?? entry.status}
                            {entry.duration_ms ? ` • ${formatDuration(entry.duration_ms)}` : ""}
                            {typeof entry.records_processed === "number" ? ` • ${entry.records_processed} rekord` : ""}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </div>
        </>
      )}
    </WinmixProPage>
  );
};

export default AdminJobs;
