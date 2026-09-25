import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DbMetric } from '../types/database';

export async function fetchLatestMetrics(cityId: string): Promise<DbMetric[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await supabase.rpc('get_latest_city_metrics', {
      p_city_id: cityId
    });

    if (error || !data) {
      // Fallback query if RPC isn't deployed yet
      const { data: directData, error: directError } = await supabase
        .from('metrics')
        .select('*')
        .eq('city_id', cityId)
        .order('recorded_at', { ascending: false })
        .limit(20);

      if (directError) throw directError;
      return directData as DbMetric[];
    }

    return data as DbMetric[];
  } catch (err) {
    console.warn('Error fetching latest metrics from Supabase:', err);
    return [];
  }
}

export async function fetchHistoricalMetrics(
  cityId: string,
  metricType?: string,
  timeRange: '24h' | '7d' | '30d' = '24h'
): Promise<DbMetric[]> {
  if (!isSupabaseConfigured()) return [];

  const now = new Date();
  let hoursAgo = 24;
  if (timeRange === '7d') hoursAgo = 24 * 7;
  if (timeRange === '30d') hoursAgo = 24 * 30;

  const since = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000).toISOString();

  try {
    let query = supabase
      .from('metrics')
      .select('*')
      .eq('city_id', cityId)
      .gte('recorded_at', since)
      .order('recorded_at', { ascending: true });

    if (metricType) {
      query = query.eq('metric_type', metricType);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data as DbMetric[];
  } catch (err) {
    console.warn('Error fetching historical metrics:', err);
    return [];
  }
}

export async function insertMetric(metric: Omit<DbMetric, 'id' | 'created_at'>): Promise<DbMetric | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('metrics')
      .insert([metric])
      .select()
      .single();

    if (error) throw error;
    return data as DbMetric;
  } catch (err) {
    console.error('Error inserting metric:', err);
    return null;
  }
}

export async function fetchDashboardMetrics(cityId: string): Promise<Record<string, DbMetric[]>> {
  if (!isSupabaseConfigured()) return {};
  
  try {
    const { data, error } = await supabase
      .from('metrics')
      .select('*')
      .eq('city_id', cityId)
      .order('recorded_at', { ascending: false })
      .limit(200);
      
    if (error || !data) return {};
    
    const grouped: Record<string, DbMetric[]> = {};
    data.forEach(metric => {
      if (!grouped[metric.metric_type]) grouped[metric.metric_type] = [];
      grouped[metric.metric_type].push(metric);
    });
    
    return grouped;
  } catch (err) {
    return {};
  }
}
