-- Ensure prediction decay events table has the expected monitoring columns
ALTER TABLE IF EXISTS public.prediction_decay_events
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'warning',
  ADD COLUMN IF NOT EXISTS drop_percentage NUMERIC(5, 2),
  ADD COLUMN IF NOT EXISTS action_taken TEXT,
  ADD COLUMN IF NOT EXISTS triggered_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS override_reason TEXT,
  ADD COLUMN IF NOT EXISTS overridden_by UUID REFERENCES auth.users(id);

-- Ensure team strength metrics are available for admin dashboards
ALTER TABLE IF EXISTS public.teams
  ADD COLUMN IF NOT EXISTS form_rating NUMERIC(5, 2),
  ADD COLUMN IF NOT EXISTS strength_index NUMERIC(5, 2);
