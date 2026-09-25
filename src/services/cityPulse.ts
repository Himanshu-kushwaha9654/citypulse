import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DbCityPulse, DbMetric } from '../types/database';

export interface ComponentScores {
  traffic: number;
  environment: number;
  utilities: number;
  safety: number;
}

export async function fetchCurrentCityPulse(cityId: string): Promise<DbCityPulse | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('city_pulse')
      .select('*')
      .eq('city_id', cityId)
      .order('calculated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data as DbCityPulse | null;
  } catch (err) {
    console.warn('Error fetching city pulse:', err);
    return null;
  }
}

export function computeCityPulseFromMetrics(metrics: DbMetric[]): {
  score: number;
  components: ComponentScores;
  status: 'healthy' | 'stable' | 'warning' | 'critical';
} {
  // Extract values with sensible defaults
  const trafficMetric = metrics.find(m => m.metric_type === 'traffic_flow');
  const aqiMetric = metrics.find(m => m.metric_type === 'aqi');
  const tempMetric = metrics.find(m => m.metric_type === 'temperature');
  const powerMetric = metrics.find(m => m.metric_type === 'energy_consumption');
  const incidentMetric = metrics.find(m => m.metric_type === 'active_incidents');

  // Traffic score (100 - congestion %)
  const trafficCongestion = trafficMetric ? trafficMetric.value : 45;
  const traffic_score = Math.max(0, Math.min(100, Math.round(100 - trafficCongestion)));

  // Environment score (based on AQI: AQI 0=100, AQI 300=0)
  const aqiVal = aqiMetric ? aqiMetric.value : 85;
  const environment_score = Math.max(0, Math.min(100, Math.round(100 - (aqiVal / 300) * 100)));

  // Utilities score (based on power consumption load vs baseline capacity)
  const powerVal = powerMetric ? powerMetric.value : 320;
  const utilities_score = Math.max(0, Math.min(100, Math.round(100 - (powerVal / 500) * 40)));

  // Safety score (based on active incidents count: 0=100, 10+=20)
  const incidents = incidentMetric ? incidentMetric.value : 2;
  const safety_score = Math.max(0, Math.min(100, Math.round(100 - incidents * 10)));

  // Weighted Combination
  // Weights: Traffic 30%, Environment 30%, Safety 25%, Utilities 15%
  const overall = Math.round(
    traffic_score * 0.30 +
    environment_score * 0.30 +
    safety_score * 0.25 +
    utilities_score * 0.15
  );

  let status: 'healthy' | 'stable' | 'warning' | 'critical' = 'stable';
  if (overall >= 85) status = 'healthy';
  else if (overall >= 65) status = 'stable';
  else if (overall >= 50) status = 'warning';
  else status = 'critical';

  return {
    score: overall,
    components: {
      traffic: traffic_score,
      environment: environment_score,
      utilities: utilities_score,
      safety: safety_score
    },
    status
  };
}

export async function calculateAndStoreCityPulse(cityId: string, metrics: DbMetric[]): Promise<DbCityPulse | null> {
  const { score, components, status } = computeCityPulseFromMetrics(metrics);

  const record: Omit<DbCityPulse, 'id' | 'created_at'> = {
    city_id: cityId,
    score,
    traffic_score: components.traffic,
    environment_score: components.environment,
    utilities_score: components.utilities,
    safety_score: components.safety,
    confidence: 0.94,
    status,
    calculated_at: new Date().toISOString()
  };

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('city_pulse')
        .insert([record])
        .select()
        .single();

      if (!error && data) return data as DbCityPulse;
    } catch (err) {
      console.error('Error storing city pulse:', err);
    }
  }

  return {
    ...record,
    id: `cp-${Date.now()}`,
    created_at: new Date().toISOString()
  };
}
