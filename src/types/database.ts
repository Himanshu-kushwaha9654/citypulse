export type CityDataMode = 'live' | 'demo' | 'mixed';
export type SeverityType = 'low' | 'medium' | 'high' | 'critical';
export type EventType = 'traffic' | 'air_quality' | 'weather' | 'transit' | 'incident' | 'utility';
export type ThresholdOperator = '>' | '<' | '>=' | '<=';

export interface DbCity {
  id: string;
  name: string;
  state: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  data_mode: CityDataMode;
  created_at: string;
}

export interface DbDataSource {
  id: string;
  name: string;
  type: string;
  provider: string | null;
  status: string | null;
  is_live: boolean;
  last_updated: string | null;
  configuration: Record<string, unknown> | null;
  created_at: string;
}

export interface DbCivicEvent {
  id: string;
  city_id: string;
  source_id?: string | null;
  type: EventType;
  title: string;
  description: string | null;
  latitude?: number | null;
  longitude?: number | null;
  severity: SeverityType;
  value?: number | null;
  unit?: string | null;
  source: 'live' | 'demo';
  observed_at: string;
  created_at: string;
  metadata?: Record<string, unknown> | null;
}

export interface DbMetric {
  id: string;
  city_id: string;
  metric_type: string;
  value: number;
  unit?: string | null;
  source: 'live' | 'demo';
  recorded_at: string;
  created_at: string;
}

export interface DbAnomaly {
  id: string;
  city_id: string;
  metric_type: string | null;
  observed_value: number;
  baseline_value: number;
  deviation: number;
  severity: SeverityType;
  explanation: string;
  detected_at: string;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

export interface DbCorrelation {
  id: string;
  city_id: string;
  event_a_type: string;
  event_b_type: string;
  relationship: string;
  confidence: number;
  time_window_minutes: number;
  explanation: string;
  detected_at: string;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

export interface DbCityPulse {
  id: string;
  city_id: string;
  score: number;
  traffic_score: number;
  environment_score: number;
  utilities_score: number;
  safety_score: number;
  confidence: number;
  status: 'healthy' | 'stable' | 'warning' | 'critical';
  calculated_at: string;
  created_at: string;
}

export interface DbAlert {
  id: string;
  city_id: string;
  type: string;
  title: string;
  message: string;
  severity: SeverityType;
  threshold?: number | null;
  current_value?: number | null;
  metric_type?: string | null;
  acknowledged: boolean;
  created_at: string;
  resolved_at?: string | null;
}

export interface DbInsight {
  id: string;
  city_id: string;
  title: string;
  summary: string;
  severity: SeverityType;
  source: 'live' | 'demo' | 'mixed';
  supporting_event_ids?: string[] | null;
  supporting_anomaly_ids?: string[] | null;
  supporting_correlation_ids?: string[] | null;
  generated_at: string;
  created_at: string;
}

export interface DbAlertThreshold {
  id: string;
  city_id: string;
  metric_type: string;
  threshold: number;
  operator: ThresholdOperator;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Normalized Civic Event interface as requested in Requirement 7
export interface NormalizedCivicEvent {
  id: string;
  cityId: string;
  sourceId?: string;
  type: EventType;
  title: string;
  description: string;
  latitude?: number;
  longitude?: number;
  severity: SeverityType;
  value?: number;
  unit?: string;
  source: 'live' | 'demo';
  observedAt: string;
  metadata?: Record<string, unknown>;
}
