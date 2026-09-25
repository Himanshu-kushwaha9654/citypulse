import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DbAlert, DbMetric, DbAlertThreshold, SeverityType } from '../types/database';

export async function fetchActiveAlerts(cityId: string, limit: number = 30): Promise<DbAlert[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('city_id', cityId)
      .is('resolved_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as DbAlert[];
  } catch (err) {
    console.warn('Error fetching active alerts:', err);
    return [];
  }
}

export async function acknowledgeAlertInDb(alertId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return true;

  try {
    const { error } = await supabase
      .from('alerts')
      .update({ acknowledged: true })
      .eq('id', alertId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error acknowledging alert in DB:', err);
    return false;
  }
}

export async function resolveAlertInDb(alertId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return true;

  try {
    const { error } = await supabase
      .from('alerts')
      .update({ resolved_at: new Date().toISOString() })
      .eq('id', alertId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error resolving alert in DB:', err);
    return false;
  }
}

export async function evaluateThresholdsAndTriggerAlerts(
  cityId: string,
  metrics: DbMetric[],
  thresholds: DbAlertThreshold[],
  existingAlerts: DbAlert[]
): Promise<DbAlert[]> {
  const triggered: DbAlert[] = [];

  for (const metric of metrics) {
    const thresholdRule = thresholds.find(t => t.metric_type === metric.metric_type && t.enabled);
    if (!thresholdRule) continue;

    let isViolated = false;
    if (thresholdRule.operator === '>' && metric.value > thresholdRule.threshold) isViolated = true;
    if (thresholdRule.operator === '>=' && metric.value >= thresholdRule.threshold) isViolated = true;
    if (thresholdRule.operator === '<' && metric.value < thresholdRule.threshold) isViolated = true;
    if (thresholdRule.operator === '<=' && metric.value <= thresholdRule.threshold) isViolated = true;

    if (isViolated) {
      // Deduplication: skip if active unacknowledged alert already exists for same city & metric_type
      const alreadyAlerted = existingAlerts.some(a => 
        a.city_id === cityId && 
        a.metric_type === metric.metric_type && 
        !a.acknowledged && 
        !a.resolved_at
      );

      if (alreadyAlerted) continue;

      const severity: SeverityType = 
        metric.value > thresholdRule.threshold * 1.5 ? 'critical' :
        metric.value > thresholdRule.threshold * 1.2 ? 'high' : 'medium';

      const typeFormatted = metric.metric_type.replace('_', ' ').toUpperCase();
      const title = `${typeFormatted} Threshold Cross Warning`;
      const message = `Current value of ${metric.value} ${metric.unit || ''} crossed configured limit of ${thresholdRule.threshold} ${metric.unit || ''}.`;

      const newAlert: Omit<DbAlert, 'id' | 'created_at'> = {
        city_id: cityId,
        type: metric.metric_type.split('_')[0] || 'traffic',
        title,
        message,
        severity,
        threshold: thresholdRule.threshold,
        current_value: metric.value,
        metric_type: metric.metric_type,
        acknowledged: false,
        resolved_at: null
      };

      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from('alerts')
            .insert([newAlert])
            .select()
            .single();

          if (!error && data) {
            triggered.push(data as DbAlert);
            continue;
          }
        } catch (err) {
          console.error('Error inserting alert:', err);
        }
      }

      triggered.push({
        ...newAlert,
        id: `alert-${Date.now()}-${Math.random()}`,
        created_at: new Date().toISOString()
      });
    }
  }

  return triggered;
}
