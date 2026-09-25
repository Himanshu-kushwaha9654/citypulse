import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DbCity } from '../types/database';
import { CITIES, City } from '../data/cities';

export async function fetchCities(): Promise<DbCity[]> {
  if (!isSupabaseConfigured()) {
    return CITIES.map(c => ({
      id: c.id,
      name: c.name,
      state: c.state,
      country: 'India',
      latitude: c.latitude,
      longitude: c.longitude,
      timezone: 'Asia/Kolkata',
      data_mode: c.id === 'jaipur' ? 'mixed' : 'demo',
      created_at: new Date().toISOString()
    }));
  }

  try {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .order('name');

    if (error || !data || data.length === 0) {
      console.warn('Supabase fetchCities failed or empty, using fallback local cities list.', error);
      return CITIES.map(c => ({
        id: c.id,
        name: c.name,
        state: c.state,
        country: 'India',
        latitude: c.latitude,
        longitude: c.longitude,
        timezone: 'Asia/Kolkata',
        data_mode: c.id === 'jaipur' ? 'mixed' : 'demo',
        created_at: new Date().toISOString()
      }));
    }

    return data as DbCity[];
  } catch (err) {
    console.error('Error fetching cities:', err);
    return CITIES.map(c => ({
      id: c.id,
      name: c.name,
      state: c.state,
      country: 'India',
      latitude: c.latitude,
      longitude: c.longitude,
      timezone: 'Asia/Kolkata',
      data_mode: c.id === 'jaipur' ? 'mixed' : 'demo',
      created_at: new Date().toISOString()
    }));
  }
}

export async function getCityByName(name: string): Promise<DbCity | null> {
  const cities = await fetchCities();
  const found = cities.find(c => c.name.toLowerCase() === name.toLowerCase());
  return found || cities[0] || null;
}
