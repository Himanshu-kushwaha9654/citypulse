import { 
  CityMapEvent, 
  CityTrafficSegment, 
  SearchLocation, 
  JAIPUR_MOCK_MAP_EVENTS, 
  JAIPUR_TRAFFIC_SEGMENTS, 
  JAIPUR_SEARCH_LOCATIONS 
} from '../data/mockMapData';
import { fetchRecentCivicEvents } from './civicEvents';
import { isSupabaseConfigured } from '../lib/supabase';
import { CITIES } from '../data/cities';
import { resolveCityDbId } from './cityResolver';

function generateCityDemoEvents(cityId: string): CityMapEvent[] {
  const city = CITIES.find(c => c.id.toLowerCase() === cityId.toLowerCase());
  if (!city) return JAIPUR_MOCK_MAP_EVENTS;

  const lat = city.latitude;
  const lng = city.longitude;

  const offsets = [
    { dLat: 0.012, dLng: 0.015, type: 'traffic' as const, severity: 'critical' as const, name: `${city.name} Central Arterial`, val: 84, unit: '% density' },
    { dLat: -0.018, dLng: 0.022, type: 'air_quality' as const, severity: 'high' as const, name: `${city.name} Industrial Belt`, val: 156, unit: 'AQI' },
    { dLat: 0.025, dLng: -0.018, type: 'weather' as const, severity: 'medium' as const, name: `${city.name} North Pass`, val: 28, unit: 'mm/h rain' },
    { dLat: -0.028, dLng: -0.024, type: 'transit' as const, severity: 'medium' as const, name: `${city.name} Express Transit Corridor`, val: 15, unit: 'min delay' },
    { dLat: 0.005, dLng: -0.032, type: 'incident' as const, severity: 'high' as const, name: `${city.name} West Bypass`, val: 75, unit: 'severity index' },
    { dLat: -0.012, dLng: -0.008, type: 'utility' as const, severity: 'low' as const, name: `${city.name} Substation Node`, val: 62, unit: '% load' },
    { dLat: 0.032, dLng: 0.028, type: 'traffic' as const, severity: 'medium' as const, name: `${city.name} Outer Ring Road`, val: 68, unit: '% density' },
    { dLat: -0.038, dLng: 0.012, type: 'weather' as const, severity: 'low' as const, name: `${city.name} South Sector`, val: 8, unit: 'mm/h rain' }
  ];

  return offsets.map((o, idx) => ({
    id: `${cityId}-demo-evt-${idx + 1}`,
    type: o.type,
    title: `${o.name} Civic Telemetry`,
    description: `Real-time civic signal update for ${city.name} (${city.state}). Source marked as demo simulation data.`,
    latitude: lat + o.dLat,
    longitude: lng + o.dLng,
    severity: o.severity,
    value: o.val,
    unit: o.unit,
    timestamp: 'Just now',
    districtId: `${cityId}-central`,
    districtName: `${city.name} Sector ${idx + 1}`,
    locationName: o.name,
    metadata: { source: 'demo' }
  }));
}

export const getMapEvents = async (cityId: string = 'jaipur'): Promise<CityMapEvent[]> => {
  if (isSupabaseConfigured()) {
    try {
      const dbUuid = await resolveCityDbId(cityId);
      if (dbUuid) {
        const dbEvents = await fetchRecentCivicEvents(dbUuid);
      if (dbEvents.length > 0) {
        const mapped: CityMapEvent[] = dbEvents
          .filter(e => e.latitude && e.longitude)
          .map(e => ({
            id: e.id,
            type: e.type,
            title: e.title,
            description: e.description,
            latitude: e.latitude!,
            longitude: e.longitude!,
            severity: e.severity,
            value: e.value || 0,
            unit: e.unit || '',
            timestamp: e.observedAt,
            districtId: (e.metadata?.districtId as string) || 'central-district',
            districtName: (e.metadata?.districtName as string) || 'Jaipur Central',
            locationName: (e.metadata?.locationName as string) || e.title,
            metadata: e.metadata
          }));
          return mapped;
        }
      }
    } catch (err) {
      console.warn('Failed fetching map events from Supabase, fallback to static mock:', err);
    }
  }

  if (cityId.toLowerCase() === 'jaipur') {
    return Promise.resolve(JAIPUR_MOCK_MAP_EVENTS);
  }

  return Promise.resolve(generateCityDemoEvents(cityId));
};

export const getTrafficSegments = async (): Promise<CityTrafficSegment[]> => {
  return Promise.resolve(JAIPUR_TRAFFIC_SEGMENTS);
};

export const getSearchLocations = async (): Promise<SearchLocation[]> => {
  return Promise.resolve(JAIPUR_SEARCH_LOCATIONS);
};

export const getTrafficEvents = async (cityId: string = 'jaipur'): Promise<CityMapEvent[]> => {
  const all = await getMapEvents(cityId);
  return all.filter(e => e.type === 'traffic');
};

export const getAirQualityEvents = async (cityId: string = 'jaipur'): Promise<CityMapEvent[]> => {
  const all = await getMapEvents(cityId);
  return all.filter(e => e.type === 'air_quality');
};

export const getWeatherEvents = async (cityId: string = 'jaipur'): Promise<CityMapEvent[]> => {
  const all = await getMapEvents(cityId);
  return all.filter(e => e.type === 'weather');
};

export const getTransitEvents = async (cityId: string = 'jaipur'): Promise<CityMapEvent[]> => {
  const all = await getMapEvents(cityId);
  return all.filter(e => e.type === 'transit');
};

export const getIncidentEvents = async (cityId: string = 'jaipur'): Promise<CityMapEvent[]> => {
  const all = await getMapEvents(cityId);
  return all.filter(e => e.type === 'incident');
};

export const getUtilityEvents = async (cityId: string = 'jaipur'): Promise<CityMapEvent[]> => {
  const all = await getMapEvents(cityId);
  return all.filter(e => e.type === 'utility');
};
