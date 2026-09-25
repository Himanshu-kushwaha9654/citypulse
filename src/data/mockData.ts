import {
  Neighborhood,
  MapIncident,
  AnomalyItem,
  TrendDataPoint,
  AlertItem,
  DataSourceItem,
  ReplayStep,
  AlertPreferences,
  SignalScore
} from '../types/citypulse';

// Initial overall Pulse score
export const INITIAL_PULSE_SCORE = 78;

// Transparent 6-Category Pulse Score Calculation Weights (Section 36)
export const SIGNAL_WEIGHTS = {
  traffic: 0.20,
  airQuality: 0.20,
  transit: 0.15,
  weather: 0.15,
  incidents: 0.20,
  utilities: 0.10
};

export const INITIAL_SIGNAL_BREAKDOWN: SignalScore[] = [
  { key: 'traffic', label: 'Traffic', score: 72, valueDisplay: '87%', unit: '%', trend: '↑ +5%', isPositive: true, weightPct: 20 },
  { key: 'airQuality', label: 'Air Quality', score: 81, valueDisplay: '62', unit: 'AQI', trend: '↓ -8%', isPositive: false, weightPct: 20 },
  { key: 'transit', label: 'Transit', score: 76, valueDisplay: '94%', unit: 'On Time', trend: '↑ +2%', isPositive: true, weightPct: 15 },
  { key: 'weather', label: 'Weather', score: 69, valueDisplay: '24°C', unit: 'Rain', trend: '↓ -5%', isPositive: false, weightPct: 15 },
  { key: 'incidents', label: 'Incidents', score: 84, valueDisplay: '12', unit: 'Active', trend: '↑ +5%', isPositive: true, weightPct: 20 },
  { key: 'utilities', label: 'Utilities', score: 90, valueDisplay: '2.4', unit: 'GW', trend: '↑ +3%', isPositive: true, weightPct: 10 },
];

// Mock Neighborhoods / Districts (Indian / Futuristic Metropolitan mix)
export const INITIAL_NEIGHBORHOODS: Neighborhood[] = [
  {
    id: 'central-district',
    name: 'Central District',
    pulseScore: 71,
    status: 'warning',
    center: [26.9124, 75.7873],
    isFavorite: true,
    traffic: { level: 'Heavy Congestion (+28%)', score: 64, trend: '↑ +12%', density: 87 },
    aqi: { value: 112, label: 'Moderate', score: 70, pm25: 42, pm10: 88 },
    weather: { temp: '24°C', condition: 'Heavy Rain', score: 58, rainfall: 45 },
    transit: { score: 68, activeDelays: 2, reliabilityPct: 82 },
    incidents: { score: 62, reportCount: 5, activeSevere: 1 },
    utilities: { score: 88, loadGw: 0.8, renewablePct: 76 },
    water: { score: 85, throughputMl: 0.6 },
    noise: { score: 72, decibels: 64 },
    timeline: [
      { time: '17:30', text: 'Heavy rainfall warning issued', icon: '🌧️', category: 'weather' },
      { time: '17:38', text: 'Traffic congestion +18% above baseline', icon: '🚗', category: 'traffic' },
      { time: '17:44', text: 'Transit Route 14 signal delay reported', icon: '🚇', category: 'transit' },
      { time: '17:51', text: 'Incident spike detected near Central Metro', icon: '🚨', category: 'incidents' }
    ],
    insight: 'Incident activity is elevated compared with recent baseline. Rainfall and increased traffic are occurring in the same area and time window.'
  },
  {
    id: 'north-district',
    name: 'North District',
    pulseScore: 62,
    status: 'critical',
    center: [26.9350, 75.7950],
    isFavorite: true,
    traffic: { level: 'Severe Bottleneck (+42%)', score: 51, trend: '↑ +24%', density: 94 },
    aqi: { value: 88, label: 'Good', score: 85, pm25: 24, pm10: 52 },
    weather: { temp: '23°C', condition: 'Thunderstorm', score: 48, rainfall: 62 },
    transit: { score: 55, activeDelays: 4, reliabilityPct: 71 },
    incidents: { score: 58, reportCount: 8, activeSevere: 2 },
    utilities: { score: 72, loadGw: 0.9, renewablePct: 65 },
    water: { score: 80, throughputMl: 0.5 },
    noise: { score: 65, decibels: 71 },
    timeline: [
      { time: '17:15', text: 'Main artery signal outage reported', icon: '🚦', category: 'traffic' },
      { time: '17:28', text: 'Emergency response vehicles dispatched', icon: '🚑', category: 'incidents' },
      { time: '17:40', text: 'North highway bottleneck extends 3km', icon: '🚗', category: 'traffic' }
    ],
    insight: 'Major traffic disruption detected on North Expressway. High signal overlap with storm front approaching.'
  },
  {
    id: 'west-district',
    name: 'West District',
    pulseScore: 84,
    status: 'stable',
    center: [26.9010, 75.7600],
    isFavorite: false,
    traffic: { level: 'Normal Flow', score: 86, trend: '↓ -2%', density: 42 },
    aqi: { value: 145, label: 'Unhealthy for Sensitive Groups', score: 58, pm25: 68, pm10: 120 },
    weather: { temp: '26°C', condition: 'Partly Cloudy', score: 82, rainfall: 0 },
    transit: { score: 90, activeDelays: 0, reliabilityPct: 96 },
    incidents: { score: 88, reportCount: 1, activeSevere: 0 },
    utilities: { score: 92, loadGw: 0.5, renewablePct: 88 },
    water: { score: 90, throughputMl: 0.4 },
    noise: { score: 84, decibels: 48 },
    timeline: [
      { time: '16:45', text: 'Particulate matter AQI spike detected', icon: '🌫️', category: 'airQuality' },
      { time: '17:20', text: 'Transit schedules running on time', icon: '🚌', category: 'transit' }
    ],
    insight: 'Air quality degradation flagged due to localized particulate shift; traffic flow remains optimal.'
  },
  {
    id: 'tech-corridor',
    name: 'Tech Corridor',
    pulseScore: 89,
    status: 'healthy',
    center: [26.8850, 75.8120],
    isFavorite: true,
    traffic: { level: 'Light Traffic', score: 92, trend: '↓ -4%', density: 38 },
    aqi: { value: 64, label: 'Good', score: 91, pm25: 18, pm10: 36 },
    weather: { temp: '25°C', condition: 'Clear', score: 88, rainfall: 0 },
    transit: { score: 94, activeDelays: 0, reliabilityPct: 98 },
    incidents: { score: 95, reportCount: 0, activeSevere: 0 },
    utilities: { score: 96, loadGw: 0.7, renewablePct: 92 },
    water: { score: 94, throughputMl: 0.5 },
    noise: { score: 88, decibels: 42 },
    timeline: [
      { time: '17:00', text: 'Evening rush hour traffic moving smoothly', icon: '🟢', category: 'traffic' }
    ],
    insight: 'All civic systems in Tech Corridor operating within optimal baseline parameters.'
  },
  {
    id: 'waterfront',
    name: 'Waterfront Quay',
    pulseScore: 76,
    status: 'stable',
    center: [26.9200, 75.8250],
    isFavorite: false,
    traffic: { level: 'Moderate Flow', score: 74, trend: '↑ +3%', density: 60 },
    aqi: { value: 72, label: 'Good', score: 88, pm25: 22, pm10: 44 },
    weather: { temp: '23°C', condition: 'Moderate Wind', score: 70, rainfall: 10 },
    transit: { score: 82, activeDelays: 1, reliabilityPct: 88 },
    incidents: { score: 78, reportCount: 2, activeSevere: 0 },
    utilities: { score: 85, loadGw: 0.4, renewablePct: 80 },
    water: { score: 88, throughputMl: 0.7 },
    noise: { score: 75, decibels: 58 },
    timeline: [
      { time: '17:10', text: 'High tide wind advisory active', icon: '🌬️', category: 'weather' }
    ],
    insight: 'Waterfront pedestrian traffic elevated; transit ferries reporting minor delay.'
  },
  {
    id: 'south-hub',
    name: 'South Logistics Hub',
    pulseScore: 80,
    status: 'stable',
    center: [26.8600, 75.7700],
    isFavorite: false,
    traffic: { level: 'Freight Movement Active', score: 78, trend: '↑ +1%', density: 55 },
    aqi: { value: 95, label: 'Moderate', score: 77, pm25: 35, pm10: 72 },
    weather: { temp: '26°C', condition: 'Cloudy', score: 80, rainfall: 0 },
    transit: { score: 85, activeDelays: 1, reliabilityPct: 90 },
    incidents: { score: 84, reportCount: 2, activeSevere: 0 },
    utilities: { score: 89, loadGw: 0.9, renewablePct: 70 },
    water: { score: 86, throughputMl: 0.6 },
    noise: { score: 70, decibels: 68 },
    timeline: [
      { time: '17:05', text: 'Freight train crossing complete', icon: '🚆', category: 'transit' }
    ],
    insight: 'Logistics routes operating cleanly with steady throughput.'
  }
];

// Mock Map Incidents / Markers
export const INITIAL_MAP_INCIDENTS: MapIncident[] = [
  {
    id: 'inc-101',
    type: 'traffic',
    title: 'Major Traffic Congestion',
    location: { lat: 26.9150, lng: 75.7890 },
    districtId: 'central-district',
    districtName: 'Central District',
    severity: 'high',
    timestamp: '17:48',
    value: 82,
    baseline: 60,
    description: 'Vehicle delay 28% above typical baseline. 3km tailback on Grand Avenue.'
  },
  {
    id: 'inc-102',
    type: 'weather',
    title: 'Heavy Rainfall Zone',
    location: { lat: 26.9180, lng: 75.7820 },
    districtId: 'central-district',
    districtName: 'Central District',
    severity: 'medium',
    timestamp: '17:30',
    value: 45,
    baseline: 5,
    description: 'Localized heavy precipitation downpour cell.'
  },
  {
    id: 'inc-103',
    type: 'transit',
    title: 'Metro Line 2 Delay',
    location: { lat: 26.9110, lng: 75.7850 },
    districtId: 'central-district',
    districtName: 'Central District',
    severity: 'medium',
    timestamp: '17:44',
    value: 14,
    baseline: 2,
    description: 'Track maintenance check causing 14-minute headway delay.'
  },
  {
    id: 'inc-104',
    type: 'incidents',
    title: 'Multi-Vehicle Collision',
    location: { lat: 26.9380, lng: 75.7920 },
    districtId: 'north-district',
    districtName: 'North District',
    severity: 'critical',
    timestamp: '17:25',
    value: 95,
    baseline: 20,
    description: 'Two lanes blocked on North Bypass. First responders on scene.'
  },
  {
    id: 'inc-105',
    type: 'utilities',
    title: 'Substation Grid Warning',
    location: { lat: 26.9410, lng: 75.7980 },
    districtId: 'north-district',
    districtName: 'North District',
    severity: 'high',
    timestamp: '17:15',
    value: 1200,
    baseline: 0,
    description: 'Transformer voltage fluctuation detected during storm surge.'
  },
  {
    id: 'inc-106',
    type: 'airQuality',
    title: 'Elevated AQI Spike',
    location: { lat: 26.9030, lng: 75.7580 },
    districtId: 'west-district',
    districtName: 'West District',
    severity: 'medium',
    timestamp: '16:50',
    value: 145,
    baseline: 70,
    description: 'Dust & fine particulate buildup near industrial perimeter.'
  }
];

// Anomalies Data
export const ANOMALIES_DATA: AnomalyItem[] = [
  {
    id: 'anom-1',
    title: '🚨 Unusual Incident Spike',
    districtId: 'central-district',
    districtName: 'Central District',
    category: 'incidents',
    detectedAgo: '14 minutes ago',
    currentValue: 42,
    baselineValue: 15,
    factorAboveBaseline: 2.8,
    relatedSignals: [
      { icon: '🌧️', name: 'Rainfall', value: '45 mm/h', category: 'weather' },
      { icon: '🚗', name: 'Traffic', value: '+31% baseline', category: 'traffic' },
      { icon: '🚦', name: 'Incidents', value: '5 active reports', category: 'incidents' }
    ],
    signalOverlap: 78,
    description: 'Incident reports are 2.8× higher than recent baseline. Overlaps temporally with severe rain cell downpour.',
    detailedExplanation: 'Incident reports are currently 2.8× higher than the recent baseline for this area. The increase happened within the last 30 minutes, which is why the system flagged it as unusual. Rainfall and traffic congestion are active simultaneously in this spatial envelope.',
    mapCoordinates: [26.9124, 75.7873],
    severity: 'critical'
  },
  {
    id: 'anom-2',
    title: '⚡ Grid Power Voltage Surge',
    districtId: 'north-district',
    districtName: 'North District',
    category: 'utilities',
    detectedAgo: '22 minutes ago',
    currentValue: 3.4,
    baselineValue: 1.0,
    factorAboveBaseline: 3.4,
    relatedSignals: [
      { icon: '🌩️', name: 'Lightning Strikes', value: '14 pulses/min', category: 'weather' },
      { icon: '⚡', name: 'Grid Load', value: '94% capacity', category: 'utilities' },
      { icon: '🚑', name: 'Emergency Calls', value: '8 reports', category: 'incidents' }
    ],
    signalOverlap: 84,
    description: 'Substation load abnormal jump following thunderstorm lightning activity.',
    detailedExplanation: 'Transformer sensors in North District recorded a voltage surge 3.4× above typical idle levels. This aligns with extreme weather events recorded by meteorology stations nearby.',
    mapCoordinates: [26.9350, 75.7950],
    severity: 'high'
  },
  {
    id: 'anom-3',
    title: '🌫️ Particulate Matter Anomaly',
    districtId: 'west-district',
    districtName: 'West District',
    category: 'airQuality',
    detectedAgo: '45 minutes ago',
    currentValue: 145,
    baselineValue: 68,
    factorAboveBaseline: 2.1,
    relatedSignals: [
      { icon: '🌬️', name: 'Wind Vector', value: 'WNW 24 km/h', category: 'weather' },
      { icon: '🏭', name: 'Emissions', value: 'Elevated', category: 'airQuality' }
    ],
    signalOverlap: 65,
    description: 'Air Quality Index jumped from 68 to 145 within 25 minutes.',
    detailedExplanation: 'AQI sensors registered a rapid influx of PM2.5 particles. Meteorological wind vectors show air masses moving east from the industrial periphery, correlating with the AQI sensor shift.',
    mapCoordinates: [26.9010, 75.7600],
    severity: 'medium'
  }
];

// Historical Replay Timeline Steps
export const REPLAY_STEPS: ReplayStep[] = [
  {
    timeLabel: '12:00 PM',
    pulseScore: 88,
    weather: 'Clear Skies',
    trafficIndex: 45,
    transitDelayCount: 0,
    incidentsCount: 1,
    activeEventsCount: 1,
    description: 'Normal mid-day city operation across all districts.'
  },
  {
    timeLabel: '12:30 PM',
    pulseScore: 86,
    weather: 'Clouding Over',
    trafficIndex: 48,
    transitDelayCount: 0,
    incidentsCount: 2,
    activeEventsCount: 2,
    description: 'Cloud cover builds over North and Central districts.'
  },
  {
    timeLabel: '13:00 PM',
    pulseScore: 82,
    weather: 'Light Rain',
    trafficIndex: 56,
    transitDelayCount: 1,
    incidentsCount: 3,
    activeEventsCount: 3,
    description: 'Precipitation starts in North District. Minor speed reductions on main arterials.',
    keyEvent: '13:05 - Rain begins in North District'
  },
  {
    timeLabel: '13:30 PM',
    pulseScore: 74,
    weather: 'Heavy Rain & Wind',
    trafficIndex: 68,
    transitDelayCount: 3,
    incidentsCount: 6,
    activeEventsCount: 6,
    description: 'Storm shifts to Central District. Traffic congestion increases +28%. Transit headway expanded.',
    keyEvent: '13:27 - Traffic congestion increases 28%',
    highlightDistrictId: 'central-district'
  },
  {
    timeLabel: '14:00 PM',
    pulseScore: 68,
    weather: 'Thunderstorm Cell',
    trafficIndex: 82,
    transitDelayCount: 5,
    incidentsCount: 9,
    activeEventsCount: 9,
    description: 'Multi-vehicle incident on North Expressway. Transformer grid surge flagged.',
    keyEvent: '13:41 - Incident spike on North Bypass',
    highlightDistrictId: 'north-district'
  }
];

// Trends Datasets (24H, 6H, 30D)
export const TRENDS_24H: TrendDataPoint[] = [
  { time: '00:00', traffic: 22, airQuality: 45, incidents: 1, transit: 98, weather: 90, utilities: 85, water: 40, noise: 30 },
  { time: '03:00', traffic: 15, airQuality: 40, incidents: 0, transit: 99, weather: 90, utilities: 80, water: 35, noise: 25 },
  { time: '06:00', traffic: 42, airQuality: 55, incidents: 2, transit: 92, weather: 85, utilities: 88, water: 60, noise: 45 },
  { time: '09:00', traffic: 78, airQuality: 72, incidents: 4, transit: 84, weather: 80, utilities: 94, water: 82, noise: 68 },
  { time: '12:00', traffic: 65, airQuality: 68, incidents: 3, transit: 88, weather: 82, utilities: 90, water: 75, noise: 60 },
  { time: '15:00', traffic: 70, airQuality: 85, incidents: 5, transit: 78, weather: 70, utilities: 92, water: 78, noise: 64 },
  { time: '18:00', traffic: 88, airQuality: 112, incidents: 8, transit: 68, weather: 58, utilities: 96, water: 88, noise: 75 },
  { time: '21:00', traffic: 45, airQuality: 80, incidents: 3, transit: 90, weather: 75, utilities: 86, water: 55, noise: 40 },
];

export const TRENDS_6H: TrendDataPoint[] = [
  { time: '12:00', traffic: 52, airQuality: 65, incidents: 2, transit: 90, weather: 85, utilities: 88, water: 70, noise: 55 },
  { time: '13:00', traffic: 60, airQuality: 70, incidents: 3, transit: 85, weather: 80, utilities: 90, water: 72, noise: 58 },
  { time: '14:00', traffic: 72, airQuality: 85, incidents: 5, transit: 75, weather: 65, utilities: 94, water: 80, noise: 65 },
  { time: '15:00', traffic: 68, airQuality: 92, incidents: 4, transit: 78, weather: 68, utilities: 92, water: 76, noise: 62 },
  { time: '16:00', traffic: 79, airQuality: 105, incidents: 6, transit: 72, weather: 62, utilities: 95, water: 84, noise: 70 },
  { time: '17:00', traffic: 84, airQuality: 112, incidents: 8, transit: 68, weather: 58, utilities: 96, water: 88, noise: 75 },
];

// Initial Active Alerts
export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'alt-1',
    severity: 'critical',
    title: 'Major traffic disruption',
    district: 'North District',
    timeAgo: '6 minutes ago',
    type: 'traffic',
    message: 'Collision blocking 2 lanes on North Expressway. Emergency services on site.',
    read: false,
    affectedSignals: ['Traffic Probe', 'Incident 911', 'Transit Route 4'],
    recommendedAction: 'Reroute northbound freight traffic via West Bypass.'
  },
  {
    id: 'alt-2',
    severity: 'warning',
    title: 'Air quality deterioration',
    district: 'West District',
    timeAgo: '12 minutes ago',
    type: 'airQuality',
    message: 'AQI crossed configured safety threshold (145 PM2.5). Sensitive groups advised.',
    read: false,
    affectedSignals: ['Air Quality PM2.5 Sensor'],
    recommendedAction: 'Issue public health advisory for elderly & children.'
  },
  {
    id: 'alt-3',
    severity: 'info',
    title: 'Transit headway delay',
    district: 'Central District',
    timeAgo: '18 minutes ago',
    type: 'transit',
    message: 'Metro Line 2 operating with +14 min headway intervals due to track signal checks.',
    read: true
  },
  {
    id: 'alt-4',
    severity: 'warning',
    title: 'Precipitation Warning',
    district: 'Central District',
    timeAgo: '25 minutes ago',
    type: 'weather',
    message: 'Heavy rain cell dumping 45mm/h. Water pooling risk on low-lying intersections.',
    read: true
  }
];

// Initial Data Sources across 8 categories
export const INITIAL_DATA_SOURCES: DataSourceItem[] = [
  {
    id: 'ds-1',
    name: 'Weather API',
    status: 'connected',
    lastUpdatedAgo: '8 sec ago',
    latencyMs: 140,
    category: 'weather',
    uptime: '99.98%',
    recordsPerMin: 120,
    dataQualityPct: 98
  },
  {
    id: 'ds-2',
    name: 'Traffic Feed',
    status: 'connected',
    lastUpdatedAgo: '5 sec ago',
    latencyMs: 85,
    category: 'traffic',
    uptime: '99.95%',
    recordsPerMin: 450,
    dataQualityPct: 99
  },
  {
    id: 'ds-3',
    name: 'Transit Feed',
    status: 'connected',
    lastUpdatedAgo: '12 sec ago',
    latencyMs: 210,
    category: 'transit',
    uptime: '99.90%',
    recordsPerMin: 180,
    dataQualityPct: 96
  },
  {
    id: 'ds-4',
    name: 'Incident Reports 911',
    status: 'connected',
    lastUpdatedAgo: '10 sec ago',
    latencyMs: 190,
    category: 'incidents',
    uptime: '100.0%',
    recordsPerMin: 35,
    dataQualityPct: 100
  },
  {
    id: 'ds-5',
    name: 'Air Quality Sensor Network',
    status: 'delayed',
    lastUpdatedAgo: '4 min ago',
    latencyMs: 1850,
    category: 'airQuality',
    uptime: '98.40%',
    recordsPerMin: 60,
    dataQualityPct: 92
  },
  {
    id: 'ds-6',
    name: 'Grid Energy Telemetry',
    status: 'connected',
    lastUpdatedAgo: '15 sec ago',
    latencyMs: 110,
    category: 'utilities',
    uptime: '99.99%',
    recordsPerMin: 200,
    dataQualityPct: 99
  },
  {
    id: 'ds-7',
    name: 'Water Distribution SCADA',
    status: 'connected',
    lastUpdatedAgo: '20 sec ago',
    latencyMs: 160,
    category: 'water',
    uptime: '99.92%',
    recordsPerMin: 80,
    dataQualityPct: 97
  },
  {
    id: 'ds-8',
    name: 'Acoustic Noise Sensors',
    status: 'connected',
    lastUpdatedAgo: '18 sec ago',
    latencyMs: 175,
    category: 'noise',
    uptime: '99.85%',
    recordsPerMin: 90,
    dataQualityPct: 95
  }
];

export const DEFAULT_ALERT_PREFERENCES: AlertPreferences = {
  trafficThreshold: 75,
  aqiThreshold: 120,
  weatherAlerts: true,
  transitDisruption: true,
  incidentSpikes: true,
  powerOutage: true,
  waterSpikes: true,
  noiseSpikes: true
};
