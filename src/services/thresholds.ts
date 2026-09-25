import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DbAlertThreshold } from '../types/database';

export async function fetchAlertThresholds(cityId: string): Promise<DbAlertThreshold[]> {
  if (!isSupabaseConfigured()) {
    return [
      { id: 'th-1', city_id: cityId, metric_type: 'traffic_flow', threshold: 75, operator: '>', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'th-2', city_id: cityId, metric_type: 'aqi', threshold: 120, operator: '>', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'th-3', city_id: cityId, metric_type: 'transit_delay', threshold: 25, operator: '>', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ];
  }

  try {
    const { data, error } = await supabase
      .from('alert_thresholds')
      .select('*')
      .eq('city_id', cityId)
      .eq('enabled', true);

    if (error || !data || data.length === 0) {
      return [
        { id: 'th-1', city_id: cityId, metric_type: 'traffic_flow', threshold: 75, operator: '>', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'th-2', city_id: cityId, metric_type: 'aqi', threshold: 120, operator: '>', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'th-3', city_id: cityId, metric_type: 'transit_delay', threshold: 25, operator: '>', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ];
    }

    return data as DbAlertThreshold[];
  } catch (err) {
    console.warn('Error fetching alert thresholds:', err);
    return [];
  }
}

export async function upsertAlertThreshold(
  cityId: string,
  metricType: string,
  threshold: number,
  operator: '>' | '<' | '>=' | '<=' = '>'
): Promise<DbAlertThreshold | null> {
  const payload = {
    city_id: cityId,
    metric_type: metricType,
    threshold,
    operator,
    enabled: true,
    updated_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    return {
      id: `th-${Date.now()}`,
      ...payload,
      created_at: new Date().toISOString()
    };
  }

  try {
    const { data, error } = await supabase
      .from('alert_thresholds')
      .upsert(payload, { onConflict: 'city_id,metric_type' })
      .select()
      .single();

    if (error) throw error;
    return data as DbAlertThreshold;
  } catch (err) {
    console.error('Error upserting alert threshold:', err);
    return null;
  }
}
