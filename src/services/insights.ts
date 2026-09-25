import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DbInsight, DbCivicEvent, DbAnomaly, DbCorrelation, SeverityType } from '../types/database';

export async function fetchRecentInsights(cityId: string, limit: number = 10): Promise<DbInsight[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from('insights')
      .select('*')
      .eq('city_id', cityId)
      .order('generated_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as DbInsight[];
  } catch (err) {
    console.warn('Error fetching insights from Supabase:', err);
    return [];
  }
}

export async function generateCityInsight(
  cityId: string,
  cityName: string,
  events: DbCivicEvent[],
  anomalies: DbAnomaly[],
  correlations: DbCorrelation[]
): Promise<DbInsight | null> {
  if (events.length === 0 && anomalies.length === 0 && correlations.length === 0) {
    return null;
  }

  const highSeverityAnomalies = anomalies.filter(a => a.severity === 'high' || a.severity === 'critical');
  const weatherEvents = events.filter(e => e.type === 'weather');

  let title = `${cityName} Civic Signals Summary`;
  let summary = `Current urban operational telemetry in ${cityName} is nominal.`;
  let severity: SeverityType = 'low';

  const supportingEventIds = events.map(e => e.id);
  const supportingAnomalyIds = anomalies.map(a => a.id);
  const supportingCorrIds = correlations.map(c => c.id);

  if (weatherEvents.length > 0 && highSeverityAnomalies.length > 0) {
    severity = 'high';
    const weather = weatherEvents[0];
    const topAnomaly = highSeverityAnomalies[0];
    title = `Civic Operational Impact: ${weather.title} & ${topAnomaly.metric_type?.replace('_', ' ').toUpperCase()}`;
    summary = `${weather.title} is currently active in ${cityName}. ${topAnomaly.explanation} Observed correlations indicate these events coincided within the active telemetry window.`;
  } else if (highSeverityAnomalies.length > 0) {
    severity = 'high';
    const topAnomaly = highSeverityAnomalies[0];
    title = `Elevated ${topAnomaly.metric_type?.replace('_', ' ').toUpperCase()} Detected`;
    summary = `${topAnomaly.explanation} Civic operations teams recommend monitoring adjacent arterial corridors.`;
  } else if (correlations.length > 0) {
    severity = 'medium';
    const corr = correlations[0];
    title = `Observed Civic Event Correlation`;
    summary = `${corr.explanation}`;
  } else if (events.length > 0) {
    title = `Live Telemetry Feed Update`;
    summary = `${events.length} active civic signals logged in ${cityName}.`;
  }

  const newInsight: Omit<DbInsight, 'id' | 'created_at'> = {
    city_id: cityId,
    title,
    summary,
    severity,
    source: events.some(e => e.source === 'live') ? 'mixed' : 'demo',
    supporting_event_ids: supportingEventIds,
    supporting_anomaly_ids: supportingAnomalyIds,
    supporting_correlation_ids: supportingCorrIds,
    generated_at: new Date().toISOString()
  };

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('insights')
        .insert([newInsight])
        .select()
        .single();

      if (!error && data) return data as DbInsight;
    } catch (err) {
      console.error('Error storing insight:', err);
    }
  }

  return {
    ...newInsight,
    id: `ins-${Date.now()}`,
    created_at: new Date().toISOString()
  };
}
