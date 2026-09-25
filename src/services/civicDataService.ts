import { CivicDataPoint, Neighborhood, SignalScore } from '../types/citypulse';
import { INITIAL_NEIGHBORHOODS, SIGNAL_WEIGHTS } from '../data/mockData';

// Normalized Civic Data Service Layer
export const getNormalizedDataPoints = (neighborhoods: Neighborhood[] = INITIAL_NEIGHBORHOODS): CivicDataPoint[] => {
  const points: CivicDataPoint[] = [];

  neighborhoods.forEach(n => {
    // Traffic
    points.push({
      id: `dp-traffic-${n.id}`,
      source: 'ITS Traffic Probe Feed',
      category: 'traffic',
      location: { lat: n.center[0], lng: n.center[1], district: n.name },
      value: n.traffic.density,
      unit: '%',
      severity: n.traffic.density > 80 ? 'high' : n.traffic.density > 60 ? 'medium' : 'low',
      timestamp: 'Just now',
      baseline: 60
    });

    // AQI
    points.push({
      id: `dp-aqi-${n.id}`,
      source: 'Environmental AQI Station',
      category: 'airQuality',
      location: { lat: n.center[0], lng: n.center[1], district: n.name },
      value: n.aqi.value,
      unit: 'AQI',
      severity: n.aqi.value > 120 ? 'high' : n.aqi.value > 80 ? 'medium' : 'low',
      timestamp: '8 sec ago',
      baseline: 65
    });

    // Weather
    points.push({
      id: `dp-weather-${n.id}`,
      source: 'Radar Doppler Weather API',
      category: 'weather',
      location: { lat: n.center[0], lng: n.center[1], district: n.name },
      value: n.weather.rainfall,
      unit: 'mm/h',
      severity: n.weather.rainfall > 40 ? 'critical' : n.weather.rainfall > 10 ? 'medium' : 'low',
      timestamp: '5 sec ago',
      baseline: 5
    });

    // Incidents
    points.push({
      id: `dp-incidents-${n.id}`,
      source: 'Municipal CAD 911',
      category: 'incidents',
      location: { lat: n.center[0], lng: n.center[1], district: n.name },
      value: n.incidents.reportCount,
      unit: 'reports',
      severity: n.incidents.reportCount > 5 ? 'critical' : n.incidents.reportCount > 2 ? 'medium' : 'low',
      timestamp: '10 sec ago',
      baseline: 2
    });
  });

  return points;
};

// Section 36: Transparent Composite City Pulse Score Calculation
export const calculateCityPulseScore = (signals: SignalScore[]): { score: number; status: 'healthy' | 'stable' | 'warning' | 'critical' } => {
  let weightedSum = 0;

  signals.forEach(sig => {
    const weight = (SIGNAL_WEIGHTS[sig.key as keyof typeof SIGNAL_WEIGHTS] || 0.15);
    weightedSum += sig.score * weight;
  });

  const finalScore = Math.round(weightedSum);

  let status: 'healthy' | 'stable' | 'warning' | 'critical' = 'stable';
  if (finalScore >= 85) status = 'healthy';
  else if (finalScore >= 65) status = 'stable';
  else if (finalScore >= 50) status = 'warning';
  else status = 'critical';

  return { score: finalScore, status };
};
