import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DbCivicEvent, NormalizedCivicEvent } from '../types/database';

export function normalizeDbCivicEvent(dbEvent: DbCivicEvent): NormalizedCivicEvent {
  return {
    id: dbEvent.id,
    cityId: dbEvent.city_id,
    sourceId: dbEvent.source_id || undefined,
    type: dbEvent.type,
    title: dbEvent.title,
    description: dbEvent.description || '',
    latitude: dbEvent.latitude || undefined,
    longitude: dbEvent.longitude || undefined,
    severity: dbEvent.severity,
    value: dbEvent.value || undefined,
    unit: dbEvent.unit || undefined,
    source: dbEvent.source || 'demo',
    observedAt: dbEvent.observed_at,
    metadata: dbEvent.metadata || undefined,
  };
}

export async function fetchRecentCivicEvents(cityId: string, limit: number = 50): Promise<NormalizedCivicEvent[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from('civic_events')
      .select('*')
      .eq('city_id', cityId)
      .order('observed_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data as DbCivicEvent[]).map(normalizeDbCivicEvent);
  } catch (err) {
    console.warn('Error fetching civic events from Supabase:', err);
    return [];
  }
}

export async function insertCivicEvent(event: Omit<DbCivicEvent, 'id' | 'created_at'>): Promise<NormalizedCivicEvent | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('civic_events')
      .insert([event])
      .select()
      .single();

    if (error) throw error;
    return normalizeDbCivicEvent(data as DbCivicEvent);
  } catch (err) {
    console.error('Error inserting civic event:', err);
    return null;
  }
}
