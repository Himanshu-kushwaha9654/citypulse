-- ============================================================
-- CITYPULSE BACKEND FOUNDATION SCHEMA MIGRATION
-- ============================================================

-- Enable pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- 1. CITIES TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  state TEXT,
  country TEXT DEFAULT 'India',
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  data_mode TEXT CHECK (data_mode IN ('live', 'demo', 'mixed')) DEFAULT 'demo',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------
-- 2. DATA SOURCES TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- weather, traffic, air_quality, transit, incident, utility, demo
  provider TEXT,
  status TEXT DEFAULT 'connected',
  is_live BOOLEAN DEFAULT false,
  last_updated TIMESTAMPTZ DEFAULT now(),
  configuration JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------
-- 3. CIVIC EVENTS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.civic_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES public.cities(id) ON DELETE CASCADE,
  source_id UUID REFERENCES public.data_sources(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('traffic', 'air_quality', 'weather', 'transit', 'incident', 'utility')),
  title TEXT NOT NULL,
  description TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  value DOUBLE PRECISION,
  unit TEXT,
  source TEXT DEFAULT 'demo',
  observed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_civic_events_city_id ON public.civic_events(city_id);
CREATE INDEX IF NOT EXISTS idx_civic_events_type ON public.civic_events(type);
CREATE INDEX IF NOT EXISTS idx_civic_events_severity ON public.civic_events(severity);
CREATE INDEX IF NOT EXISTS idx_civic_events_observed_at ON public.civic_events(observed_at DESC);

-- ------------------------------------------------------------
-- 4. METRICS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES public.cities(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL, -- traffic_flow, aqi, temperature, humidity, noise, energy_consumption, water_usage, transit_delay, active_incidents
  value DOUBLE PRECISION NOT NULL,
  unit TEXT,
  source TEXT DEFAULT 'demo',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_metrics_city_id ON public.metrics(city_id);
CREATE INDEX IF NOT EXISTS idx_metrics_metric_type ON public.metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_metrics_recorded_at ON public.metrics(recorded_at DESC);

-- ------------------------------------------------------------
-- 5. ANOMALIES TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES public.cities(id) ON DELETE CASCADE,
  metric_type TEXT,
  observed_value DOUBLE PRECISION,
  baseline_value DOUBLE PRECISION,
  deviation DOUBLE PRECISION,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  explanation TEXT,
  detected_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_anomalies_city_id ON public.anomalies(city_id);

-- ------------------------------------------------------------
-- 6. CORRELATIONS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.correlations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES public.cities(id) ON DELETE CASCADE,
  event_a_type TEXT,
  event_b_type TEXT,
  relationship TEXT DEFAULT 'observed correlation',
  confidence DOUBLE PRECISION DEFAULT 0.85,
  time_window_minutes INTEGER DEFAULT 60,
  explanation TEXT,
  detected_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_correlations_city_id ON public.correlations(city_id);

-- ------------------------------------------------------------
-- 7. CITY PULSE TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.city_pulse (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES public.cities(id) ON DELETE CASCADE,
  score DOUBLE PRECISION NOT NULL CHECK (score >= 0 AND score <= 100),
  traffic_score DOUBLE PRECISION DEFAULT 80,
  environment_score DOUBLE PRECISION DEFAULT 75,
  utilities_score DOUBLE PRECISION DEFAULT 85,
  safety_score DOUBLE PRECISION DEFAULT 78,
  confidence DOUBLE PRECISION DEFAULT 0.9,
  status TEXT DEFAULT 'Stable',
  calculated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_city_pulse_city_id ON public.city_pulse(city_id);

-- ------------------------------------------------------------
-- 8. ALERTS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES public.cities(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical')) DEFAULT 'warning',
  threshold DOUBLE PRECISION,
  current_value DOUBLE PRECISION,
  metric_type TEXT,
  acknowledged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_alerts_city_id ON public.alerts(city_id);

-- ------------------------------------------------------------
-- 9. INSIGHTS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES public.cities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  source TEXT DEFAULT 'demo',
  supporting_event_ids JSONB DEFAULT '[]'::jsonb,
  supporting_anomaly_ids JSONB DEFAULT '[]'::jsonb,
  supporting_correlation_ids JSONB DEFAULT '[]'::jsonb,
  generated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_insights_city_id ON public.insights(city_id);

-- ------------------------------------------------------------
-- 10. ALERT THRESHOLDS TABLE
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------
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

-- Public Read Policies
CREATE POLICY "Public Read Cities" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Public Read Data Sources" ON public.data_sources FOR SELECT USING (true);
CREATE POLICY "Public Read Civic Events" ON public.civic_events FOR SELECT USING (true);
CREATE POLICY "Public Read Metrics" ON public.metrics FOR SELECT USING (true);
CREATE POLICY "Public Read Anomalies" ON public.anomalies FOR SELECT USING (true);
CREATE POLICY "Public Read Correlations" ON public.correlations FOR SELECT USING (true);
CREATE POLICY "Public Read City Pulse" ON public.city_pulse FOR SELECT USING (true);
CREATE POLICY "Public Read Alerts" ON public.alerts FOR SELECT USING (true);
CREATE POLICY "Public Read Insights" ON public.insights FOR SELECT USING (true);
CREATE POLICY "Public Read Alert Thresholds" ON public.alert_thresholds FOR SELECT USING (true);

-- Public Write/Update Policies for Demo & MVP interaction
CREATE POLICY "Public Insert Civic Events" ON public.civic_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Metrics" ON public.metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Anomalies" ON public.anomalies FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Correlations" ON public.correlations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert City Pulse" ON public.city_pulse FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Alerts" ON public.alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Alerts" ON public.alerts FOR UPDATE USING (true);
CREATE POLICY "Public Insert Insights" ON public.insights FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Manage Alert Thresholds" ON public.alert_thresholds FOR ALL USING (true);

-- ------------------------------------------------------------
-- HELPER STORED FUNCTIONS (RPCs)
-- ------------------------------------------------------------

-- Function 1: Get latest metrics by city
CREATE OR REPLACE FUNCTION get_latest_city_metrics(city_id_param UUID)
RETURNS TABLE (
  metric_type TEXT,
  value DOUBLE PRECISION,
  unit TEXT,
  source TEXT,
  recorded_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (m.metric_type)
    m.metric_type,
    m.value,
    m.unit,
    m.source,
    m.recorded_at
  FROM public.metrics m
  WHERE m.city_id = city_id_param
  ORDER BY m.metric_type, m.recorded_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function 2: Get recent civic events by city
CREATE OR REPLACE FUNCTION get_recent_civic_events(city_id_param UUID, limit_param INT DEFAULT 50)
RETURNS TABLE (
  id UUID,
  type TEXT,
  title TEXT,
  description TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  severity TEXT,
  value DOUBLE PRECISION,
  unit TEXT,
  source TEXT,
  observed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id, e.type, e.title, e.description, e.latitude, e.longitude,
    e.severity, e.value, e.unit, e.source, e.observed_at
  FROM public.civic_events e
  WHERE e.city_id = city_id_param
  ORDER BY e.observed_at DESC
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function 3: Get current City Pulse by city
CREATE OR REPLACE FUNCTION get_current_city_pulse(city_id_param UUID)
RETURNS TABLE (
  score DOUBLE PRECISION,
  traffic_score DOUBLE PRECISION,
  environment_score DOUBLE PRECISION,
  utilities_score DOUBLE PRECISION,
  safety_score DOUBLE PRECISION,
  status TEXT,
  calculated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.score, p.traffic_score, p.environment_score, p.utilities_score, p.safety_score, p.status, p.calculated_at
  FROM public.city_pulse p
  WHERE p.city_id = city_id_param
  ORDER BY p.calculated_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- ------------------------------------------------------------
-- REALTIME PUBLICATION ENABLEMENT
-- ------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.civic_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.anomalies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.correlations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.city_pulse;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.insights;
