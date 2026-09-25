export * from './database';

export type PageView = 
  | 'overview' 
  | 'traffic'
  | 'environment'
  | 'utilities'
  | 'public-safety'
  | 'analytics'
  | 'map' 
  | 'anomalies' 
  | 'trends' 
  | 'replay' 
  | 'alerts' 
  | 'sources' 
  | 'ai';

export type TimeRange = '1H' | '6H' | '24H' | '7D';

export type SignalType = 
  | 'traffic' 
  | 'weather' 
  | 'transit' 
  | 'airQuality' 
  | 'incidents' 
  | 'utilities'
  | 'water'
  | 'noise';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type StatusLevel = 'stable' | 'warning' | 'critical' | 'healthy';

export interface CivicDataPoint {
  id: string;
  source: string;
  category: SignalType;
  location: {
    lat: number;
    lng: number;
    district?: string;
  };
  value: number;
  unit?: string;
  severity?: SeverityLevel;
  timestamp: string;
  baseline?: number;
  metadata?: Record<string, unknown>;
}

export interface SignalScore {
  key: SignalType;
  label: string;
  score: number;
  valueDisplay: string;
  unit: string;
  trend: string;
  isPositive: boolean;
  weightPct: number;
}

export interface Neighborhood {
  id: string;
  name: string;
  pulseScore: number;
  status: StatusLevel;
  center: [number, number]; // lat, lng
  isFavorite?: boolean;
  traffic: { level: string; score: number; trend: string; density: number; avgSpeed?: number; affectedRoadsCount?: number };
  aqi: { value: number; label: string; score: number; pm25: number; pm10: number; humidityPct?: number; tempC?: number };
  weather: { temp: string; condition: string; score: number; rainfall: number; windSpeedKm?: number };
  transit: { score: number; activeDelays: number; reliabilityPct: number; disruptedLines?: string[] };
  incidents: { score: number; reportCount: number; activeSevere: number; criticalList?: string[] };
  utilities: { score: number; loadGw: number; renewablePct: number; powerOutageRisk?: string };
  water: { score: number; throughputMl: number; pressurePsi?: number };
  noise: { score: number; decibels: number };
  timeline: { time: string; text: string; icon: string; category?: SignalType }[];
  insight: string;
}

export interface MapIncident {
  id: string;
  source?: string;
  type: SignalType;
  title: string;
  location: {
    lat: number;
    lng: number;
  };
  districtId: string;
  districtName: string;
  severity: SeverityLevel;
  timestamp: string;
  value: number;
  baseline: number;
  description: string;
}

export interface AnomalyItem {
  id: string;
  source?: string;
  title: string;
  districtId: string;
  districtName: string;
  category: SignalType;
  detectedAgo: string;
  currentValue: number;
  baselineValue: number;
  factorAboveBaseline: number;
  relatedSignals: { icon: string; name: string; value: string; category: SignalType }[];
  signalOverlap: number;
  description: string;
  detailedExplanation: string;
  mapCoordinates: [number, number];
  severity: SeverityLevel;
}

export interface TrendDataPoint {
  time: string;
  traffic: number;
  airQuality: number;
  incidents: number;
  transit: number;
  weather: number;
  utilities: number;
  water: number;
  noise: number;
}

export interface AlertItem {
  id: string;
  source?: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  district: string;
  timeAgo: string;
  type: SignalType;
  message: string;
  read: boolean;
  affectedSignals?: string[];
  recommendedAction?: string;
  resolved?: boolean;
}

export interface AlertPreferences {
  trafficThreshold: number;
  aqiThreshold: number;
  weatherAlerts: boolean;
  transitDisruption: boolean;
  incidentSpikes: boolean;
  powerOutage: boolean;
  waterSpikes: boolean;
  noiseSpikes: boolean;
}

export interface DataSourceItem {
  id: string;
  name: string;
  status: 'connected' | 'delayed' | 'degraded' | 'offline';
  lastUpdatedAgo: string;
  latencyMs: number;
  category: SignalType;
  uptime: string;
  recordsPerMin: number;
  dataQualityPct: number;
}

export interface ReplayStep {
  timeLabel: string;
  pulseScore: number;
  weather: string;
  trafficIndex: number;
  transitDelayCount: number;
  incidentsCount: number;
  activeEventsCount: number;
  description: string;
  keyEvent?: string;
  highlightDistrictId?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: string[];
  whyItMatters?: string;
  relationshipPipeline?: string[];
}

export interface ExplainModalData {
  title: string;
  summary: string;
  detailedPoints: string[];
  disclaimer?: string;
}

export type DemoScenarioId = 
  | 'normal-city'
  | 'heavy-rain'
  | 'traffic-disruption'
  | 'transit-failure'
  | 'aqi-spike'
  | 'power-outage'
  | 'civic-event'
  | 'weather-event'
  | 'water-contamination'
  | 'cyber-attack'
  | 'normal';

export interface DemoMetricShift {
  trafficCongestionPct?: number;
  aqiValue?: number;
  tempC?: number;
  humidityPct?: number;
  transitDelayMins?: number;
  utilityLoadPct?: number;
  incidentCountDelta?: number;
}

export interface DemoScenarioStep {
  stepIndex: number;
  title: string;
  description: string;
  districtId: string;
  districtName?: string;
  pulseDrop: number;
  metricsShift?: DemoMetricShift;
  mapIncident?: MapIncident;
  anomalyItem?: AnomalyItem;
  alertItem?: AlertItem;
  newAlertTitle?: string;
  aiSummary: string;
  aiWhyItMatters: string;
}

/** Matches the DB role domain (public.profiles.role): 'admin' has full
 * access + user management, 'operator' can write telemetry/ack alerts,
 * 'viewer' (default for every new signup) is read-only. */
export type AppRole = 'admin' | 'operator' | 'viewer';

export interface AuthUser {
  id: string;
  email: string;
  role: AppRole;
  favoriteDistricts: string[];
}

export interface ToastMessage {
  id: string;
  title: string;
  type: 'info' | 'success' | 'warning' | 'error';
  durationMs?: number;
}
