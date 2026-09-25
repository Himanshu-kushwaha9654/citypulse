-- ============================================================
-- CITYPULSE - AUTH, ROLES (RBAC), AND BACKEND FIXES
-- ============================================================
-- This migration is written to be SAFE TO RUN ON TOP OF WHATEVER
-- STATE THE LIVE DATABASE IS CURRENTLY IN. The original schema
-- migration (20260925000000_citypulse_backend_schema.sql) was only
-- partially applied by hand - some tables exist, some (alert_thresholds)
-- don't, and the RPC functions were never created. Every statement
-- below uses IF NOT EXISTS / CREATE OR REPLACE / dynamic constraint
-- discovery so it can be re-run without error.
--
-- HOW TO APPLY: Supabase Dashboard -> SQL Editor -> paste this whole
-- file -> Run. (See supabase/SETUP.md for details and why this has
-- to be done from the dashboard rather than automatically.)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- 0. SMALL HELPER: generic updated_at trigger
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ------------------------------------------------------------
-- 0b. Generic helper to drop any CHECK constraint on a column
--     without needing to know its (possibly hand-created) name.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION pg_temp.drop_check_constraints(p_table text, p_column_pattern text)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE nsp.nspname = 'public' AND rel.relname = p_table AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) ILIKE '%' || p_column_pattern || '%'
  LOOP
    EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT %I', p_table, r.conname);
  END LOOP;
END;
$$;

-- ============================================================
-- 1. CITIES - add stable text slug (frontend uses 'jaipur', 'delhi', ...
--    while the PK is a UUID; this was the #1 cause of every backend
--    fetch silently failing and falling back to mock data).
-- ============================================================
ALTER TABLE public.cities ADD COLUMN IF NOT EXISTS slug TEXT;

-- Normalize whatever Jaipur row already exists (keep its UUID -
-- civic_events/alerts/anomalies/city_pulse rows already reference it).
UPDATE public.cities
SET name = 'Jaipur', slug = 'jaipur', state = COALESCE(state, 'Rajasthan'),
    country = COALESCE(country, 'India'), latitude = COALESCE(latitude, 26.9124),
    longitude = COALESCE(longitude, 75.7873), timezone = COALESCE(timezone, 'Asia/Kolkata'),
    data_mode = COALESCE(data_mode, 'mixed')
WHERE lower(name) = 'jaipur';

-- Backfill slug for any other pre-existing rows generically.
UPDATE public.cities SET slug = lower(regexp_replace(name, '\s+', '-', 'g'))
WHERE slug IS NULL;

ALTER TABLE public.cities ALTER COLUMN slug SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conrelid = 'public.cities'::regclass AND conname = 'cities_slug_key'
  ) THEN
    ALTER TABLE public.cities ADD CONSTRAINT cities_slug_key UNIQUE (slug);
  END IF;
END $$;

INSERT INTO public.cities (name, slug, state, country, latitude, longitude, timezone, data_mode) VALUES
  ('Delhi', 'delhi', 'Delhi', 'India', 28.6139, 77.2090, 'Asia/Kolkata', 'demo'),
  ('Mumbai', 'mumbai', 'Maharashtra', 'India', 19.0760, 72.8777, 'Asia/Kolkata', 'demo'),
  ('Bengaluru', 'bengaluru', 'Karnataka', 'India', 12.9716, 77.5946, 'Asia/Kolkata', 'demo'),
  ('Hyderabad', 'hyderabad', 'Telangana', 'India', 17.3850, 78.4867, 'Asia/Kolkata', 'demo'),
  ('Pune', 'pune', 'Maharashtra', 'India', 18.5204, 73.8567, 'Asia/Kolkata', 'demo'),
  ('Ahmedabad', 'ahmedabad', 'Gujarat', 'India', 23.0225, 72.5714, 'Asia/Kolkata', 'demo'),
  ('Kolkata', 'kolkata', 'West Bengal', 'India', 22.5726, 88.3639, 'Asia/Kolkata', 'demo')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 2. ALERT_THRESHOLDS - table is entirely missing on the live DB.
--    Recreated here WITH the unique constraint the app's upsert()
--    call requires (onConflict: 'city_id,metric_type').
-- ============================================================
CREATE TABLE IF NOT EXISTS public.alert_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES public.cities(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  threshold DOUBLE PRECISION NOT NULL,
  operator TEXT CHECK (operator IN ('>', '<', '>=', '<=')) DEFAULT '>',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alert_thresholds_city_id ON public.alert_thresholds(city_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conrelid = 'public.alert_thresholds'::regclass
      AND conname = 'alert_thresholds_city_metric_key'
  ) THEN
    ALTER TABLE public.alert_thresholds
      ADD CONSTRAINT alert_thresholds_city_metric_key UNIQUE (city_id, metric_type);
  END IF;
END $$;

DROP TRIGGER IF EXISTS trg_alert_thresholds_updated_at ON public.alert_thresholds;
CREATE TRIGGER trg_alert_thresholds_updated_at
  BEFORE UPDATE ON public.alert_thresholds
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.alert_thresholds (city_id, metric_type, threshold, operator, enabled)
SELECT c.id, t.metric_type, t.threshold, '>', true
FROM public.cities c
CROSS JOIN (VALUES
  ('traffic_flow', 80.0),
  ('aqi', 150.0),
  ('transit_delay', 15.0),
  ('energy_consumption', 3.0)
) AS t(metric_type, threshold)
WHERE c.slug = 'jaipur'
ON CONFLICT (city_id, metric_type) DO NOTHING;

-- ============================================================
-- 3. SEVERITY DOMAIN - standardize public.alerts.severity to the
--    same (low, medium, high, critical) domain used by civic_events
--    and anomalies. The live table only allowed (info, warning,
--    critical), which is not the domain services/alerts.ts writes,
--    so every threshold-triggered alert insert was silently failing.
-- ============================================================
-- Drop the old (info/warning/critical) constraint BEFORE normalizing
-- rows, since the normalized values ('medium', 'low') would violate it
-- while it's still in effect.
SELECT pg_temp.drop_check_constraints('alerts', 'severity');

UPDATE public.alerts SET severity = 'medium' WHERE severity = 'warning';
UPDATE public.alerts SET severity = 'low' WHERE severity = 'info';

ALTER TABLE public.alerts
  ADD CONSTRAINT alerts_severity_check CHECK (severity IN ('low', 'medium', 'high', 'critical'));

-- Defensively re-assert the same domain on the other severity columns
-- in case the live tables were hand-created with different values.
SELECT pg_temp.drop_check_constraints('civic_events', 'severity');
ALTER TABLE public.civic_events
  ADD CONSTRAINT civic_events_severity_check CHECK (severity IN ('low', 'medium', 'high', 'critical'));

SELECT pg_temp.drop_check_constraints('anomalies', 'severity');
ALTER TABLE public.anomalies
  ADD CONSTRAINT anomalies_severity_check CHECK (severity IN ('low', 'medium', 'high', 'critical'));

-- civic_events.type: re-assert canonical singular values (the demo
-- engine's 'utilities'/'incidents' plurals are fixed at the source
-- in this same change set, not by loosening this constraint).
SELECT pg_temp.drop_check_constraints('civic_events', 'type');
ALTER TABLE public.civic_events
  ADD CONSTRAINT civic_events_type_check
  CHECK (type IN ('traffic', 'air_quality', 'weather', 'transit', 'incident', 'utility'));

-- ============================================================
-- 4. PROFILES - one row per authenticated user, holding their role.
--    Roles: 'admin' (full access + user management),
--            'operator' (day-to-day ops: insert/ack telemetry & alerts),
--            'viewer' (read-only; default for every new signup).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'operator', 'viewer')),
  city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------
-- 4a. Role helper functions (SECURITY DEFINER so RLS policies that
--     call them don't recurse into profiles' own RLS).
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'viewer'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT public.current_user_role() = 'admin';
$$;

CREATE OR REPLACE FUNCTION public.is_operator_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT public.current_user_role() IN ('admin', 'operator');
$$;

-- ------------------------------------------------------------
-- 4b. Auto-create a profile whenever a new auth user signs up.
--     The account matching the project owner's email is bootstrapped
--     as 'admin' so there's at least one admin without needing to
--     hand-edit the database after signing up.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    CASE WHEN lower(NEW.email) = lower('fieldgamer789@gmail.com') THEN 'admin' ELSE 'viewer' END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill profiles for any auth users that already exist (e.g. if
-- someone signed up before this migration ran).
INSERT INTO public.profiles (id, email, role)
SELECT u.id, u.email,
  CASE WHEN lower(u.email) = lower('fieldgamer789@gmail.com') THEN 'admin' ELSE 'viewer' END
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- ------------------------------------------------------------
-- 4c. Prevent a non-admin from granting themselves a higher role
--     by directly UPDATE-ing their own profiles row.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only an admin can change a user role';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();

-- Convenience RPC for admins to change someone else's role from the app
-- (equivalent to an UPDATE, but explicit / auditable as an action).
CREATE OR REPLACE FUNCTION public.admin_set_user_role(target_user_id UUID, new_role TEXT)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE result public.profiles;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only an admin can change user roles';
  END IF;
  IF new_role NOT IN ('admin', 'operator', 'viewer') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;

  UPDATE public.profiles SET role = new_role WHERE id = target_user_id
  RETURNING * INTO result;

  RETURN result;
END;
$$;

-- ============================================================
-- 5. RPC FUNCTIONS used by the frontend - recreated with the
--    parameter name the frontend actually calls (p_city_id).
--    They didn't exist at all on the live DB (schema-cache 404s).
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_latest_city_metrics(p_city_id UUID)
RETURNS TABLE (
  metric_type TEXT,
  value DOUBLE PRECISION,
  unit TEXT,
  source TEXT,
  recorded_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT DISTINCT ON (m.metric_type)
    m.metric_type, m.value, m.unit, m.source, m.recorded_at
  FROM public.metrics m
  WHERE m.city_id = p_city_id
  ORDER BY m.metric_type, m.recorded_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_recent_civic_events(p_city_id UUID, p_limit INT DEFAULT 50)
RETURNS TABLE (
  id UUID, type TEXT, title TEXT, description TEXT,
  latitude DOUBLE PRECISION, longitude DOUBLE PRECISION,
  severity TEXT, value DOUBLE PRECISION, unit TEXT, source TEXT, observed_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT e.id, e.type, e.title, e.description, e.latitude, e.longitude,
         e.severity, e.value, e.unit, e.source, e.observed_at
  FROM public.civic_events e
  WHERE e.city_id = p_city_id
  ORDER BY e.observed_at DESC
  LIMIT p_limit;
$$;

CREATE OR REPLACE FUNCTION public.get_current_city_pulse(p_city_id UUID)
RETURNS TABLE (
  score DOUBLE PRECISION, traffic_score DOUBLE PRECISION, environment_score DOUBLE PRECISION,
  utilities_score DOUBLE PRECISION, safety_score DOUBLE PRECISION, status TEXT, calculated_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT p.score, p.traffic_score, p.environment_score, p.utilities_score, p.safety_score, p.status, p.calculated_at
  FROM public.city_pulse p
  WHERE p.city_id = p_city_id
  ORDER BY p.calculated_at DESC
  LIMIT 1;
$$;

-- NOTE: no separate DROP FUNCTION needed for old-parameter-name copies -
-- Postgres identifies a function by name + argument TYPES, not parameter
-- names, so CREATE OR REPLACE FUNCTION above already replaced any
-- get_latest_city_metrics(UUID)-shaped function in place, whatever its
-- parameter was called. (An explicit DROP FUNCTION ...(city_id_param UUID)
-- here would match that same signature and delete the function just
-- created above - do not add one.)

-- ============================================================
-- 6. ROW LEVEL SECURITY - role-gated instead of "anyone can write".
-- ============================================================
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.correlations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_pulse ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop every permissive policy from the original migration (by the
-- exact names it used) so writes stop being wide open to 'true'.
DROP POLICY IF EXISTS "Public Insert Civic Events" ON public.civic_events;
DROP POLICY IF EXISTS "Public Insert Metrics" ON public.metrics;
DROP POLICY IF EXISTS "Public Insert Anomalies" ON public.anomalies;
DROP POLICY IF EXISTS "Public Insert Correlations" ON public.correlations;
DROP POLICY IF EXISTS "Public Insert City Pulse" ON public.city_pulse;
DROP POLICY IF EXISTS "Public Insert Alerts" ON public.alerts;
DROP POLICY IF EXISTS "Public Update Alerts" ON public.alerts;
DROP POLICY IF EXISTS "Public Insert Insights" ON public.insights;
DROP POLICY IF EXISTS "Public Manage Alert Thresholds" ON public.alert_thresholds;

-- Read policies: the dashboard is public (works signed-out, like today).
DROP POLICY IF EXISTS "Public Read Cities" ON public.cities;
CREATE POLICY "read_cities" ON public.cities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Data Sources" ON public.data_sources;
CREATE POLICY "read_data_sources" ON public.data_sources FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Civic Events" ON public.civic_events;
CREATE POLICY "read_civic_events" ON public.civic_events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Metrics" ON public.metrics;
CREATE POLICY "read_metrics" ON public.metrics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Anomalies" ON public.anomalies;
CREATE POLICY "read_anomalies" ON public.anomalies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Correlations" ON public.correlations;
CREATE POLICY "read_correlations" ON public.correlations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read City Pulse" ON public.city_pulse;
CREATE POLICY "read_city_pulse" ON public.city_pulse FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Alerts" ON public.alerts;
CREATE POLICY "read_alerts" ON public.alerts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Insights" ON public.insights;
CREATE POLICY "read_insights" ON public.insights FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Alert Thresholds" ON public.alert_thresholds;
CREATE POLICY "read_alert_thresholds" ON public.alert_thresholds FOR SELECT USING (true);

-- Write policies: operator or admin only.
CREATE POLICY "write_civic_events" ON public.civic_events FOR INSERT WITH CHECK (public.is_operator_or_admin());
CREATE POLICY "update_civic_events" ON public.civic_events FOR UPDATE USING (public.is_admin());
CREATE POLICY "delete_civic_events" ON public.civic_events FOR DELETE USING (public.is_admin());

CREATE POLICY "write_metrics" ON public.metrics FOR INSERT WITH CHECK (public.is_operator_or_admin());

CREATE POLICY "write_anomalies" ON public.anomalies FOR INSERT WITH CHECK (public.is_operator_or_admin());

CREATE POLICY "write_correlations" ON public.correlations FOR INSERT WITH CHECK (public.is_operator_or_admin());

CREATE POLICY "write_city_pulse" ON public.city_pulse FOR INSERT WITH CHECK (public.is_operator_or_admin());

CREATE POLICY "write_alerts" ON public.alerts FOR INSERT WITH CHECK (public.is_operator_or_admin());
CREATE POLICY "update_alerts" ON public.alerts FOR UPDATE USING (public.is_operator_or_admin());

CREATE POLICY "write_insights" ON public.insights FOR INSERT WITH CHECK (public.is_operator_or_admin());

CREATE POLICY "manage_alert_thresholds" ON public.alert_thresholds FOR ALL
  USING (public.is_operator_or_admin()) WITH CHECK (public.is_operator_or_admin());

-- cities / data_sources: admin manages the reference data.
CREATE POLICY "admin_write_cities" ON public.cities FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "admin_update_cities" ON public.cities FOR UPDATE USING (public.is_admin());
CREATE POLICY "admin_delete_cities" ON public.cities FOR DELETE USING (public.is_admin());

CREATE POLICY "admin_write_data_sources" ON public.data_sources FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "admin_update_data_sources" ON public.data_sources FOR UPDATE USING (public.is_admin());
CREATE POLICY "admin_delete_data_sources" ON public.data_sources FOR DELETE USING (public.is_admin());

-- profiles: everyone can read their own row; admins can read/manage all.
-- (role changes are additionally guarded by the trigger above.)
DROP POLICY IF EXISTS "read_own_profile" ON public.profiles;
CREATE POLICY "read_own_profile" ON public.profiles FOR SELECT USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
CREATE POLICY "update_own_profile" ON public.profiles FOR UPDATE
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());

-- No public INSERT policy on profiles - rows are only ever created by
-- the handle_new_user() trigger (SECURITY DEFINER, bypasses RLS).

-- ============================================================
-- 7. REALTIME - make sure every table the frontend subscribes to is
--    published (defensive: adding an already-published table errors).
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['metrics','civic_events','anomalies','correlations','city_pulse','alerts','insights','alert_thresholds']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;

-- ============================================================
-- Done. Verify with:
--   select id, slug, name from public.cities order by name;
--   select * from public.profiles;
--   select public.get_latest_city_metrics(id) from public.cities where slug = 'jaipur';
-- ============================================================
