-- ============================================================
-- CITYPULSE SEED DATA FOR JAIPUR & INDIAN METROS
-- ============================================================

-- 1. SEED CITIES
INSERT INTO public.cities (id, name, state, country, latitude, longitude, timezone, data_mode) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Jaipur', 'Rajasthan', 'India', 26.9124, 75.7873, 'Asia/Kolkata', 'mixed'),
  ('00000000-0000-0000-0000-000000000002', 'Delhi', 'Delhi', 'India', 28.6139, 77.2090, 'Asia/Kolkata', 'demo'),
  ('00000000-0000-0000-0000-000000000003', 'Mumbai', 'Maharashtra', 'India', 19.0760, 72.8777, 'Asia/Kolkata', 'demo'),
  ('00000000-0000-0000-0000-000000000004', 'Bengaluru', 'Karnataka', 'India', 12.9716, 77.5946, 'Asia/Kolkata', 'demo'),
  ('00000000-0000-0000-0000-000000000005', 'Hyderabad', 'Telangana', 'India', 17.3850, 78.4867, 'Asia/Kolkata', 'demo'),
  ('00000000-0000-0000-0000-000000000006', 'Pune', 'Maharashtra', 'India', 18.5204, 73.8567, 'Asia/Kolkata', 'demo'),
  ('00000000-0000-0000-0000-000000000007', 'Ahmedabad', 'Gujarat', 'India', 23.0225, 72.5714, 'Asia/Kolkata', 'demo'),
  ('00000000-0000-0000-0000-000000000008', 'Kolkata', 'West Bengal', 'India', 22.5726, 88.3639, 'Asia/Kolkata', 'demo')
ON CONFLICT (name) DO UPDATE SET
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  data_mode = EXCLUDED.data_mode;

-- 2. SEED DATA SOURCES
INSERT INTO public.data_sources (id, name, type, provider, status, is_live) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Jaipur Traffic Radar API', 'traffic', 'Jaipur Traffic Police ITS', 'connected', true),
  ('10000000-0000-0000-0000-000000000002', 'Rajasthan CPCB AQI Network', 'air_quality', 'CPCB India', 'connected', true),
  ('10000000-0000-0000-0000-000000000003', 'OpenWeatherMap Jaipur Radar', 'weather', 'OpenWeatherMap', 'connected', true),
  ('10000000-0000-0000-0000-000000000004', 'Jaipur Metro & Transit Telemetry', 'transit', 'JMRC', 'connected', false),
  ('10000000-0000-0000-0000-000000000005', 'Jaipur CAD 911 Dispatch Feed', 'incident', 'Jaipur Municipal Dispatch', 'connected', true),
  ('10000000-0000-0000-0000-000000000006', 'JVVNL Power Grid Monitor', 'utility', 'JVVNL Utility', 'connected', false)
ON CONFLICT DO NOTHING;

-- 3. SEED ALERT THRESHOLDS FOR JAIPUR
INSERT INTO public.alert_thresholds (city_id, metric_type, threshold, operator, enabled) VALUES
  ('00000000-0000-0000-0000-000000000001', 'traffic_flow', 80.0, '>', true),
  ('00000000-0000-0000-0000-000000000001', 'aqi', 150.0, '>', true),
  ('00000000-0000-0000-0000-000000000001', 'transit_delay', 15.0, '>', true),
  ('00000000-0000-0000-0000-000000000001', 'energy_consumption', 3.0, '>', true)
ON CONFLICT DO NOTHING;

-- 4. SEED METRICS FOR JAIPUR
INSERT INTO public.metrics (city_id, metric_type, value, unit, source, recorded_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'traffic_flow', 87.0, '%', 'demo', now() - interval '5 minutes'),
  ('00000000-0000-0000-0000-000000000001', 'aqi', 62.0, 'AQI', 'demo', now() - interval '5 minutes'),
  ('00000000-0000-0000-0000-000000000001', 'temperature', 24.0, '°C', 'demo', now() - interval '5 minutes'),
  ('00000000-0000-0000-0000-000000000001', 'humidity', 65.0, '%', 'demo', now() - interval '5 minutes'),
  ('00000000-0000-0000-0000-000000000001', 'energy_consumption', 2.4, 'GW', 'demo', now() - interval '5 minutes'),
  ('00000000-0000-0000-0000-000000000001', 'water_usage', 1.8, 'ML', 'demo', now() - interval '5 minutes'),
  ('00000000-0000-0000-0000-000000000001', 'transit_delay', 8.0, 'min', 'demo', now() - interval '5 minutes'),
  ('00000000-0000-0000-0000-000000000001', 'active_incidents', 12.0, 'events', 'demo', now() - interval '5 minutes')
ON CONFLICT DO NOTHING;

-- 5. SEED CIVIC EVENTS FOR JAIPUR
INSERT INTO public.civic_events (city_id, type, title, description, latitude, longitude, severity, value, unit, source, observed_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'traffic', 'MI Road Traffic Congestion', 'Heavy evening queueing between Ajmeri Gate and Panch Batti.', 26.9180, 75.8150, 'high', 87.0, '%', 'demo', now() - interval '10 minutes'),
  ('00000000-0000-0000-0000-000000000001', 'weather', 'Convective Downpour Radar', 'Heavy 45mm/h precipitation cell over Central District.', 26.9124, 75.7873, 'critical', 45.0, 'mm/h', 'demo', now() - interval '15 minutes'),
  ('00000000-0000-0000-0000-000000000001', 'incident', 'Waterlogging at Grand Underpass', '40cm standing water blocking 2 westbound lanes.', 26.9080, 75.7820, 'critical', 40.0, 'cm', 'demo', now() - interval '12 minutes'),
  ('00000000-0000-0000-0000-000000000001', 'transit', 'Metro Line 2 Headway Expansion', 'Route 14 and Metro Line 2 experiencing 14-minute delays.', 26.8920, 75.8100, 'medium', 14.0, 'min', 'demo', now() - interval '20 minutes'),
  ('00000000-0000-0000-0000-000000000001', 'air_quality', 'Sitapura Industrial AQI Sensor', 'Fine particulate PM2.5 elevated near industrial perimeter.', 26.7820, 75.8350, 'medium', 148.0, 'AQI', 'demo', now() - interval '30 minutes')
ON CONFLICT DO NOTHING;

-- 6. SEED ANOMALIES FOR JAIPUR
INSERT INTO public.anomalies (city_id, metric_type, observed_value, baseline_value, deviation, severity, explanation, detected_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'traffic_flow', 87.0, 58.0, 29.0, 'critical', 'Traffic congestion is approximately 29% higher than the recent baseline on MI Road.', now() - interval '8 minutes'),
  ('00000000-0000-0000-0000-000000000001', 'active_incidents', 14.0, 5.0, 180.0, 'critical', 'CityPulse anomaly engine flagged a 2.8× incident surge in Central District.', now() - interval '10 minutes')
ON CONFLICT DO NOTHING;

-- 7. SEED CORRELATIONS FOR JAIPUR
INSERT INTO public.correlations (city_id, event_a_type, event_b_type, relationship, confidence, time_window_minutes, explanation, detected_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'weather', 'traffic', 'observed correlation', 0.88, 60, 'Heavy rain and increased traffic congestion were observed within the same 60-minute window across Central District. Possible relationship - not confirmed causation.', now() - interval '10 minutes'),
  ('00000000-0000-0000-0000-000000000001', 'weather', 'transit', 'observed correlation', 0.82, 60, 'Precipitation surge and transit headway expansion occurred simultaneously along Metro Line 2. Observed correlation - not confirmed causation.', now() - interval '12 minutes')
ON CONFLICT DO NOTHING;

-- 8. SEED CITY PULSE FOR JAIPUR
INSERT INTO public.city_pulse (city_id, score, traffic_score, environment_score, utilities_score, safety_score, confidence, status, calculated_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 72.0, 68.0, 75.0, 85.0, 60.0, 0.92, 'Stable', now() - interval '2 minutes')
ON CONFLICT DO NOTHING;

-- 9. SEED ALERTS FOR JAIPUR
INSERT INTO public.alerts (city_id, type, title, message, severity, threshold, current_value, metric_type, acknowledged, created_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'traffic', '🚨 CRITICAL TRAFFIC CONGESTION', 'Traffic congestion on MI Road reached 87% (+29% above baseline).', 'critical', 80.0, 87.0, 'traffic_flow', false, now() - interval '6 minutes'),
  ('00000000-0000-0000-0000-000000000001', 'weather', '🌧 Heavy Rainfall Warning', '45mm/h precipitation cell detected over Central District underpass routes.', 'warning', 30.0, 45.0, 'precipitation', false, now() - interval '14 minutes')
ON CONFLICT DO NOTHING;

-- 10. SEED INSIGHTS FOR JAIPUR
INSERT INTO public.insights (city_id, title, summary, severity, source, generated_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Multi-Signal Storm & Traffic Cascade', 'Heavy rain (45mm/h) is currently being observed in Jaipur. Traffic on MI Road is approximately 29% above recent baseline, and transit delays have expanded. These events occurred within the same period.', 'high', 'demo', now() - interval '5 minutes')
ON CONFLICT DO NOTHING;
