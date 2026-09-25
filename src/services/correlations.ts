import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DbCorrelation, DbCivicEvent, DbAnomaly } from '../types/database';

export async function fetchRecentCorrelations(cityId: string, limit: number = 20): Promise<DbCorrelation[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from('correlations')
      .select('*')
      .eq('city_id', cityId)
      .order('detected_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as DbCorrelation[];
  } catch (err) {
    console.warn('Error fetching correlations:', err);
    return [];
  }
}

export async function detectCorrelations(
  cityId: string,
  events: DbCivicEvent[],
  anomalies: DbAnomaly[]
): Promise<DbCorrelation[]> {
  const detected: DbCorrelation[] = [];
  const windowMs = 60 * 60 * 1000; // 60 minutes

  // Check 1: Weather event + Traffic anomaly / event
  const weatherEvents = events.filter(e => e.type === 'weather');
  const trafficEventsOrAnomalies = [
    ...events.filter(e => e.type === 'traffic'),
    ...anomalies.filter(a => a.metric_type === 'traffic_flow')
  ];

  for (const w of weatherEvents) {
    const wTime = new Date(w.observed_at).getTime();

    for (const t of trafficEventsOrAnomalies) {
      const tTime = new Date('observed_at' in t ? t.observed_at : t.detected_at).getTime();
      if (Math.abs(wTime - tTime) <= windowMs) {
        const correlation: Omit<DbCorrelation, 'id' | 'created_at'> = {
          city_id: cityId,
          event_a_type: 'weather',
          event_b_type: 'traffic',
          relationship: 'possible relationship',
          confidence: 0.88,
          time_window_minutes: 60,
          explanation: `Weather fluctuations (${w.title}) and increased traffic congestion were observed together within the same 60-minute window.`,
          detected_at: new Date().toISOString(),
          metadata: { weatherEventId: w.id, trafficId: 'id' in t ? t.id : undefined }
        };
        saveOrCollectCorrelation(correlation, detected);
      }
    }
  }

  // Check 2: Transit disruption + Traffic congestion
  const transitEvents = events.filter(e => e.type === 'transit');
  for (const tr of transitEvents) {
    const trTime = new Date(tr.observed_at).getTime();
    for (const t of trafficEventsOrAnomalies) {
      const tTime = new Date('observed_at' in t ? t.observed_at : t.detected_at).getTime();
      if (Math.abs(trTime - tTime) <= windowMs) {
        const correlation: Omit<DbCorrelation, 'id' | 'created_at'> = {
          city_id: cityId,
          event_a_type: 'transit',
          event_b_type: 'traffic',
          relationship: 'observed correlation',
          confidence: 0.85,
          time_window_minutes: 60,
          explanation: `Transit line delays (${tr.title}) coincided with elevated traffic levels in the region.`,
          detected_at: new Date().toISOString(),
          metadata: { transitEventId: tr.id }
        };
        saveOrCollectCorrelation(correlation, detected);
      }
    }
  }

  // Check 3: AQI spike + Incidents
  const aqiAnomalies = anomalies.filter(a => a.metric_type === 'aqi');
  const incidentEvents = events.filter(e => e.type === 'incident');
  for (const aqi of aqiAnomalies) {
    const aTime = new Date(aqi.detected_at).getTime();
    for (const inc of incidentEvents) {
      const iTime = new Date(inc.observed_at).getTime();
      if (Math.abs(aTime - iTime) <= windowMs) {
        const correlation: Omit<DbCorrelation, 'id' | 'created_at'> = {
          city_id: cityId,
          event_a_type: 'air_quality',
          event_b_type: 'incident',
          relationship: 'observed concurrent events',
          confidence: 0.76,
          time_window_minutes: 60,
          explanation: `An elevated AQI spike (${aqi.observed_value} AQI) was logged concurrently with safety/health incident report (${inc.title}).`,
          detected_at: new Date().toISOString(),
          metadata: { aqiAnomalyId: aqi.id, incidentId: inc.id }
        };
        saveOrCollectCorrelation(correlation, detected);
      }
    }
  }

  return detected;
}

async function saveOrCollectCorrelation(
  corr: Omit<DbCorrelation, 'id' | 'created_at'>,
  list: DbCorrelation[]
) {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('correlations')
        .insert([corr])
        .select()
        .single();
      if (!error && data) {
        list.push(data as DbCorrelation);
        return;
      }
    } catch (err) {
      console.error('Error saving correlation:', err);
    }
  }

  list.push({
    ...corr,
    id: `corr-${Date.now()}-${Math.random()}`,
    created_at: new Date().toISOString()
  });
}
