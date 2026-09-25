import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DbAnomaly, DbMetric, SeverityType } from '../types/database';

export interface AnomalyConfig {
  metricType: string;
  thresholdPct: number; // e.g., 20 for 20% deviation
  label: string;
}

export const ANOMALY_THRESHOLDS: Record<string, number> = {
  traffic_flow: 25,
  aqi: 20,
  transit_delay: 30,
  energy_consumption: 25,
  water_usage: 25,
  active_incidents: 50,
};

export async function fetchRecentAnomalies(cityId: string, limit: number = 20): Promise<DbAnomaly[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from('anomalies')
      .select('*')
      .eq('city_id', cityId)
      .order('detected_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as DbAnomaly[];
  } catch (err) {
    console.warn('Error fetching anomalies:', err);
    return [];
  }
}

export async function detectAndRecordAnomalies(
  cityId: string,
  currentMetric: DbMetric,
  recentMetrics: DbMetric[]
): Promise<DbAnomaly | null> {
  const thresholdPct = ANOMALY_THRESHOLDS[currentMetric.metric_type] || 25;

  // Calculate baseline from last N metrics of same metric_type
  const matchingMetrics = recentMetrics.filter(m => m.metric_type === currentMetric.metric_type);
  if (matchingMetrics.length === 0) return null;

  const sum = matchingMetrics.reduce((acc, m) => acc + m.value, 0);
  const baseline = sum / matchingMetrics.length;

  if (baseline === 0) return null;

  const deviationPct = Math.round(((currentMetric.value - baseline) / baseline) * 100);

  if (Math.abs(deviationPct) >= thresholdPct) {
    const severity: SeverityType = 
      Math.abs(deviationPct) > 60 ? 'critical' :
      Math.abs(deviationPct) > 40 ? 'high' :
      Math.abs(deviationPct) > 25 ? 'medium' : 'low';

    const direction = deviationPct > 0 ? 'higher' : 'lower';
    const explanation = `${currentMetric.metric_type.replace('_', ' ').toUpperCase()} is approximately ${Math.abs(deviationPct)}% ${direction} than the recent baseline of ${Math.round(baseline)} ${currentMetric.unit || ''}.`;

    const newAnomaly: Omit<DbAnomaly, 'id' | 'created_at'> = {
      city_id: cityId,
      metric_type: currentMetric.metric_type,
      observed_value: currentMetric.value,
      baseline_value: baseline,
      deviation: deviationPct,
      severity,
      explanation,
      detected_at: new Date().toISOString(),
      metadata: {
        unit: currentMetric.unit,
        source: currentMetric.source
      }
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('anomalies')
          .insert([newAnomaly])
          .select()
          .single();

        if (error) throw error;
        return data as DbAnomaly;
      } catch (err) {
        console.error('Error recording detected anomaly:', err);
      }
    }

    return {
      ...newAnomaly,
      id: `anon-${Date.now()}`,
      created_at: new Date().toISOString()
    };
  }

  return null;
}
