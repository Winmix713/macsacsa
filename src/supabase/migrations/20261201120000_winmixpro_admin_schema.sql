-- WinMixPro Admin Schema Consolidation Migration
-- Ensures Phase 3-8 operational tables exist with consistent RLS policies.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 1. Scheduled jobs registry
CREATE TABLE IF NOT EXISTS public.scheduled_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL UNIQUE,
  job_type TEXT NOT NULL,
  cron_schedule TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.scheduled_jobs IS 'Stores metadata for background jobs managed by the WinMix scheduler.';
COMMENT ON COLUMN public.scheduled_jobs.job_type IS 'Categorises the job: data_import, prediction, aggregation, maintenance, etc.';
COMMENT ON COLUMN public.scheduled_jobs.cron_schedule IS 'Cron expression in UTC that defines when the job should run.';
COMMENT ON COLUMN public.scheduled_jobs.config IS 'JSONB configuration payload for custom job parameters (window sizes, descriptions, etc.).';

CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_enabled ON public.scheduled_jobs(enabled);
CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_next_run_at ON public.scheduled_jobs(next_run_at);

DROP TRIGGER IF EXISTS trg_touch_scheduled_jobs_updated_at ON public.scheduled_jobs;
CREATE TRIGGER trg_touch_scheduled_jobs_updated_at
  BEFORE UPDATE ON public.scheduled_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.scheduled_jobs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'scheduled_jobs' AND policyname = 'scheduled_jobs_select_authenticated'
  ) THEN
    CREATE POLICY scheduled_jobs_select_authenticated ON public.scheduled_jobs
      FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'scheduled_jobs' AND policyname = 'scheduled_jobs_full_service'
  ) THEN
    CREATE POLICY scheduled_jobs_full_service ON public.scheduled_jobs
      FOR ALL
      USING (public.is_service_role())
      WITH CHECK (public.is_service_role());
  END IF;
END
$$;

-- Seed default scheduled jobs
INSERT INTO public.scheduled_jobs (job_name, job_type, cron_schedule, enabled, next_run_at, config)
VALUES
  (
    'fetch_upcoming_fixtures',
    'data_import',
    '0 2 * * *',
    true,
    NOW(),
    '{"description": "Frissíti a közelgő mérkőzések listáját a következő napokra", "source": "seed"}'::jsonb
  ),
  (
    'run_daily_predictions',
    'prediction',
    '0 3 * * *',
    true,
    NOW(),
    '{"description": "AI predikciók futtatása a következő 24 órában kezdődő mérkőzésekre", "prediction_window_hours": 24}'::jsonb
  ),
  (
    'update_team_stats',
    'aggregation',
    '0 4 * * *',
    true,
    NOW(),
    '{"description": "Aggregálja a csapat és pattern statisztikákat naponta"}'::jsonb
  ),
  (
    'cleanup_old_logs',
    'maintenance',
    '0 1 * * 0',
    true,
    NOW(),
    '{"description": "Eltávolítja a 30 napnál régebbi job execution logokat", "retention_days": 30}'::jsonb
  )
ON CONFLICT (job_name) DO NOTHING;

-- 2. Job execution logs
CREATE TABLE IF NOT EXISTS public.job_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.scheduled_jobs(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('queued','running','success','error')),
  duration_ms INTEGER,
  records_processed INTEGER DEFAULT 0,
  error_message TEXT,
  error_stack TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.job_execution_logs IS 'Execution history for scheduled jobs including success/failure metadata.';

CREATE INDEX IF NOT EXISTS idx_job_execution_logs_job_id ON public.job_execution_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_job_execution_logs_started_at ON public.job_execution_logs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_execution_logs_status ON public.job_execution_logs(status);

ALTER TABLE public.job_execution_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'job_execution_logs' AND policyname = 'job_execution_logs_select_authenticated'
  ) THEN
    CREATE POLICY job_execution_logs_select_authenticated ON public.job_execution_logs
      FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'job_execution_logs' AND policyname = 'job_execution_logs_full_service'
  ) THEN
    CREATE POLICY job_execution_logs_full_service ON public.job_execution_logs
      FOR ALL
      USING (public.is_service_role())
      WITH CHECK (public.is_service_role());
  END IF;
END
$$;

-- 3. Model performance summaries
CREATE TABLE IF NOT EXISTS public.model_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version TEXT NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  total_predictions INTEGER NOT NULL DEFAULT 0,
  accuracy_overall DECIMAL(5,2),
  accuracy_winner DECIMAL(5,2),
  accuracy_btts DECIMAL(5,2),
  confidence_calibration_score DECIMAL(6,4),
  league_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_model_period UNIQUE (model_version, period_start, period_end)
);

CREATE INDEX IF NOT EXISTS idx_model_performance_version ON public.model_performance(model_version);
CREATE INDEX IF NOT EXISTS idx_model_performance_period ON public.model_performance(period_start, period_end);

ALTER TABLE public.model_performance ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'model_performance' AND policyname = 'model_performance_select_authenticated'
  ) THEN
    CREATE POLICY model_performance_select_authenticated ON public.model_performance
      FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'model_performance' AND policyname = 'model_performance_full_service'
  ) THEN
    CREATE POLICY model_performance_full_service ON public.model_performance
      FOR ALL
      USING (public.is_service_role())
      WITH CHECK (public.is_service_role());
  END IF;
END
$$;

-- 4. Model comparison snapshots
CREATE TABLE IF NOT EXISTS public.model_comparison (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_a_id TEXT NOT NULL,
  model_b_id TEXT NOT NULL,
  comparison_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accuracy_diff DECIMAL(5,2),
  p_value DECIMAL(6,5),
  winning_model TEXT,
  sample_size INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.model_comparison ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'model_comparison' AND policyname = 'model_comparison_select_authenticated'
  ) THEN
    CREATE POLICY model_comparison_select_authenticated ON public.model_comparison
      FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'model_comparison' AND policyname = 'model_comparison_full_service'
  ) THEN
    CREATE POLICY model_comparison_full_service ON public.model_comparison
      FOR ALL
      USING (public.is_service_role())
      WITH CHECK (public.is_service_role());
  END IF;
END
$$;

-- 5. Model registry
CREATE TABLE IF NOT EXISTS public.model_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name TEXT NOT NULL,
  model_version TEXT NOT NULL,
  model_type TEXT NOT NULL CHECK (model_type IN ('champion','challenger','shadow','retired')),
  algorithm TEXT,
  hyperparameters JSONB NOT NULL DEFAULT '{}'::jsonb,
  traffic_allocation INTEGER NOT NULL DEFAULT 0,
  total_predictions INTEGER NOT NULL DEFAULT 0,
  accuracy DECIMAL(5,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_model_name_version UNIQUE (model_name, model_version)
);

CREATE INDEX IF NOT EXISTS idx_model_registry_type ON public.model_registry(model_type);
CREATE INDEX IF NOT EXISTS idx_model_registry_active ON public.model_registry(is_active);
CREATE INDEX IF NOT EXISTS idx_model_registry_registered_at ON public.model_registry(registered_at DESC);

DROP TRIGGER IF EXISTS trg_touch_model_registry_updated_at ON public.model_registry;
CREATE TRIGGER trg_touch_model_registry_updated_at
  BEFORE UPDATE ON public.model_registry
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.model_registry ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'model_registry' AND policyname = 'model_registry_select_authenticated'
  ) THEN
    CREATE POLICY model_registry_select_authenticated ON public.model_registry
      FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'model_registry' AND policyname = 'model_registry_full_service'
  ) THEN
    CREATE POLICY model_registry_full_service ON public.model_registry
      FOR ALL
      USING (public.is_service_role())
      WITH CHECK (public.is_service_role());
  END IF;
END
$$;

-- 6. Model experiments
CREATE TABLE IF NOT EXISTS public.model_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_name TEXT NOT NULL,
  champion_model_id UUID REFERENCES public.model_registry(id) ON DELETE SET NULL,
  challenger_model_id UUID REFERENCES public.model_registry(id) ON DELETE SET NULL,
  target_sample_size INTEGER NOT NULL DEFAULT 100,
  current_sample_size INTEGER NOT NULL DEFAULT 0,
  significance_threshold DECIMAL(6,4) NOT NULL DEFAULT 0.0500,
  accuracy_diff DECIMAL(5,2),
  p_value DECIMAL(6,5),
  winner_model_id UUID REFERENCES public.model_registry(id) ON DELETE SET NULL,
  decision TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_model_experiments_started_at ON public.model_experiments(started_at DESC);

ALTER TABLE public.model_experiments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'model_experiments' AND policyname = 'model_experiments_select_authenticated'
  ) THEN
    CREATE POLICY model_experiments_select_authenticated ON public.model_experiments
      FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'model_experiments' AND policyname = 'model_experiments_full_service'
  ) THEN
    CREATE POLICY model_experiments_full_service ON public.model_experiments
      FOR ALL
      USING (public.is_service_role())
      WITH CHECK (public.is_service_role());
  END IF;
END
$$;

-- 7. Pattern definitions
CREATE TABLE IF NOT EXISTS public.pattern_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_name TEXT NOT NULL UNIQUE,
  detection_function TEXT NOT NULL,
  min_sample_size INTEGER NOT NULL DEFAULT 50,
  min_confidence_threshold DECIMAL(5,2) NOT NULL DEFAULT 0.50,
  priority INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_touch_pattern_definitions_updated_at ON public.pattern_definitions;
CREATE TRIGGER trg_touch_pattern_definitions_updated_at
  BEFORE UPDATE ON public.pattern_definitions
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.pattern_definitions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'pattern_definitions' AND policyname = 'pattern_definitions_select_authenticated'
  ) THEN
    CREATE POLICY pattern_definitions_select_authenticated ON public.pattern_definitions
      FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'pattern_definitions' AND policyname = 'pattern_definitions_full_service'
  ) THEN
    CREATE POLICY pattern_definitions_full_service ON public.pattern_definitions
      FOR ALL
      USING (public.is_service_role())
      WITH CHECK (public.is_service_role());
  END IF;
END
$$;

-- 8. Team patterns
CREATE TABLE IF NOT EXISTS public.team_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL,
  pattern_name TEXT NOT NULL,
  confidence DECIMAL(5,2) NOT NULL DEFAULT 0,
  strength DECIMAL(5,2) NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  prediction_impact DECIMAL(5,2) NOT NULL DEFAULT 0,
  historical_accuracy DECIMAL(5,2) NOT NULL DEFAULT 0,
  pattern_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_team_pattern UNIQUE (team_id, pattern_name)
);

CREATE INDEX IF NOT EXISTS idx_team_patterns_team ON public.team_patterns(team_id);
CREATE INDEX IF NOT EXISTS idx_team_patterns_type ON public.team_patterns(pattern_type);

DROP TRIGGER IF EXISTS trg_touch_team_patterns_updated_at ON public.team_patterns;
CREATE TRIGGER trg_touch_team_patterns_updated_at
  BEFORE UPDATE ON public.team_patterns
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.team_patterns ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'team_patterns' AND policyname = 'team_patterns_select_authenticated'
  ) THEN
    CREATE POLICY team_patterns_select_authenticated ON public.team_patterns
      FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'team_patterns' AND policyname = 'team_patterns_full_service'
  ) THEN
    CREATE POLICY team_patterns_full_service ON public.team_patterns
      FOR ALL
      USING (public.is_service_role())
      WITH CHECK (public.is_service_role());
  END IF;
END
$$;

-- 9. Cross-league intelligence
CREATE TABLE IF NOT EXISTS public.cross_league_correlations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_a_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  league_b_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  correlation_type TEXT NOT NULL CHECK (correlation_type IN ('form_impact','home_advantage','scoring_trend')),
  coefficient DOUBLE PRECISION NOT NULL,
  p_value DOUBLE PRECISION,
  sample_size INTEGER NOT NULL DEFAULT 0,
  insight_summary TEXT,
  last_calculated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (league_a_id, league_b_id, correlation_type)
);

CREATE INDEX IF NOT EXISTS idx_cross_corr_league_pair ON public.cross_league_correlations(league_a_id, league_b_id);
CREATE INDEX IF NOT EXISTS idx_cross_corr_type ON public.cross_league_correlations(correlation_type);
CREATE INDEX IF NOT EXISTS idx_cross_corr_updated_at ON public.cross_league_correlations(last_calculated DESC);

ALTER TABLE public.cross_league_correlations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'cross_league_correlations' AND policyname = 'cross_league_correlations_select_authenticated'
  ) THEN
    CREATE POLICY cross_league_correlations_select_authenticated ON public.cross_league_correlations
      FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'cross_league_correlations' AND policyname = 'cross_league_correlations_full_service'
  ) THEN
    CREATE POLICY cross_league_correlations_full_service ON public.cross_league_correlations
      FOR ALL
      USING (public.is_service_role())
      WITH CHECK (public.is_service_role());
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.meta_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_name TEXT NOT NULL,
  pattern_type TEXT NOT NULL,
  supporting_leagues UUID[] NOT NULL DEFAULT '{}'::UUID[],
  evidence_strength INTEGER NOT NULL CHECK (evidence_strength BETWEEN 0 AND 100),
  prediction_impact DOUBLE PRECISION NOT NULL DEFAULT 0,
  pattern_description TEXT,
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meta_patterns_type ON public.meta_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_meta_patterns_strength ON public.meta_patterns(evidence_strength DESC);

ALTER TABLE public.meta_patterns ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'meta_patterns' AND policyname = 'meta_patterns_select_authenticated'
  ) THEN
    CREATE POLICY meta_patterns_select_authenticated ON public.meta_patterns
      FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'meta_patterns' AND policyname = 'meta_patterns_full_service'
  ) THEN
    CREATE POLICY meta_patterns_full_service ON public.meta_patterns
      FOR ALL
      USING (public.is_service_role())
      WITH CHECK (public.is_service_role());
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.league_characteristics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  avg_goals DOUBLE PRECISION,
  home_advantage_index DOUBLE PRECISION,
  competitive_balance_index DOUBLE PRECISION,
  predictability_score DOUBLE PRECISION,
  physicality_index DOUBLE PRECISION,
  trend_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  season TEXT NOT NULL DEFAULT '2024-2025',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (league_id, season)
);

CREATE INDEX IF NOT EXISTS idx_league_characteristics_league ON public.league_characteristics(league_id);
CREATE INDEX IF NOT EXISTS idx_league_characteristics_season ON public.league_characteristics(season);

DROP TRIGGER IF EXISTS trg_touch_league_characteristics_updated_at ON public.league_characteristics;
CREATE TRIGGER trg_touch_league_characteristics_updated_at
  BEFORE UPDATE ON public.league_characteristics
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.league_characteristics ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'league_characteristics' AND policyname = 'league_characteristics_select_authenticated'
  ) THEN
    CREATE POLICY league_characteristics_select_authenticated ON public.league_characteristics
      FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'league_characteristics' AND policyname = 'league_characteristics_full_service'
  ) THEN
    CREATE POLICY league_characteristics_full_service ON public.league_characteristics
      FOR ALL
      USING (public.is_service_role())
      WITH CHECK (public.is_service_role());
  END IF;
END
$$;

-- 10. Monitoring tables
CREATE TABLE IF NOT EXISTS public.system_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_name TEXT NOT NULL,
  component_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('healthy','degraded','down')),
  response_time_ms INTEGER,
  error_rate DOUBLE PRECISION,
  cpu_usage DOUBLE PRECISION,
  memory_usage DOUBLE PRECISION,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_health_component_name ON public.system_health(component_name);
CREATE INDEX IF NOT EXISTS idx_system_health_checked_at ON public.system_health(checked_at DESC);

ALTER TABLE public.system_health ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'system_health' AND policyname = 'system_health_select_authenticated'
  ) THEN
    CREATE POLICY system_health_select_authenticated ON public.system_health
      FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'system_health' AND policyname = 'system_health_full_service'
  ) THEN
    CREATE POLICY system_health_full_service ON public.system_health
      FOR ALL
      USING (public.is_service_role())
      WITH CHECK (public.is_service_role());
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_type TEXT NOT NULL,
  metric_category TEXT NOT NULL,
  value DOUBLE PRECISION NOT NULL,
  unit TEXT NOT NULL,
  component TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_component_timestamp ON public.performance_metrics(component, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_type ON public.performance_metrics(metric_type);

ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'performance_metrics' AND policyname = 'performance_metrics_select_authenticated'
  ) THEN
    CREATE POLICY performance_metrics_select_authenticated ON public.performance_metrics
      FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'performance_metrics' AND policyname = 'performance_metrics_full_service'
  ) THEN
    CREATE POLICY performance_metrics_full_service ON public.performance_metrics
      FOR ALL
      USING (public.is_service_role())
      WITH CHECK (public.is_service_role());
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.computation_graph (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id TEXT NOT NULL UNIQUE,
  node_name TEXT NOT NULL,
  node_type TEXT NOT NULL,
  dependencies TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  execution_time_ms INTEGER,
  position_x DOUBLE PRECISION NOT NULL DEFAULT 0,
  position_y DOUBLE PRECISION NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'healthy',
  last_run TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_computation_graph_status ON public.computation_graph(status);

ALTER TABLE public.computation_graph ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'computation_graph' AND policyname = 'computation_graph_select_authenticated'
  ) THEN
    CREATE POLICY computation_graph_select_authenticated ON public.computation_graph
      FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'computation_graph' AND policyname = 'computation_graph_full_service'
  ) THEN
    CREATE POLICY computation_graph_full_service ON public.computation_graph
      FOR ALL
      USING (public.is_service_role())
      WITH CHECK (public.is_service_role());
  END IF;
END
$$;

-- Seed monitoring defaults if tables are empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.system_health) THEN
    INSERT INTO public.system_health (component_name, component_type, status, response_time_ms, error_rate, cpu_usage, memory_usage)
    VALUES
      ('Public API', 'api', 'healthy', 120, 0.01, 22.5, 35.0),
      ('analyze-match', 'edge_function', 'degraded', 480, 0.06, 65.0, 52.0),
      ('get-predictions', 'edge_function', 'healthy', 160, 0.02, 30.0, 40.0),
      ('Postgres DB', 'database', 'healthy', 90, 0.005, 35.0, 60.0),
      ('Scheduler', 'service', 'healthy', 150, 0.01, 28.0, 32.0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.performance_metrics WHERE timestamp > NOW() - INTERVAL '1 hour') THEN
    INSERT INTO public.performance_metrics (metric_name, metric_type, metric_category, value, unit, component, timestamp)
    VALUES
      ('latency_p50', 'latency', 'api_call', 110, 'ms', 'Public API', NOW() - INTERVAL '40 minutes'),
      ('latency_p95', 'latency', 'api_call', 230, 'ms', 'Public API', NOW() - INTERVAL '40 minutes'),
      ('error_rate', 'error_rate', 'prediction', 0.04, 'percent', 'analyze-match', NOW() - INTERVAL '30 minutes'),
      ('throughput', 'throughput', 'api_call', 32, 'rps', 'Public API', NOW() - INTERVAL '20 minutes'),
      ('latency_p50', 'latency', 'prediction', 340, 'ms', 'analyze-match', NOW() - INTERVAL '10 minutes');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.computation_graph) THEN
    INSERT INTO public.computation_graph (node_id, node_name, node_type, dependencies, execution_time_ms, position_x, position_y, status, last_run)
    VALUES
      ('data_source', 'Data Source', 'input', ARRAY[]::TEXT[], 40, 50, 80, 'healthy', NOW() - INTERVAL '10 minutes'),
      ('pattern_detection', 'Pattern Detection', 'transformation', ARRAY['data_source'], 180, 300, 120, 'healthy', NOW() - INTERVAL '8 minutes'),
      ('prediction_engine', 'Prediction Engine', 'aggregation', ARRAY['pattern_detection'], 450, 600, 160, 'degraded', NOW() - INTERVAL '7 minutes'),
      ('feedback_loop', 'Feedback Loop', 'transformation', ARRAY['prediction_engine'], 120, 900, 200, 'healthy', NOW() - INTERVAL '5 minutes'),
      ('api_response', 'API Response', 'output', ARRAY['prediction_engine'], 60, 600, 380, 'healthy', NOW() - INTERVAL '2 minutes');
  END IF;
END
$$;
