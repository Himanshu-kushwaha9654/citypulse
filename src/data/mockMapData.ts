export interface CityMapEvent {
  id: string;
  type: "traffic" | "air_quality" | "weather" | "transit" | "incident" | "utility";
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  severity: "low" | "medium" | "high" | "critical";
  value?: number;
  unit?: string;
  baseline?: number;
  change?: string;
  timestamp: string;
  districtId: string;
  districtName: string;
  locationName: string;
  impact?: string;
  correlatedEventIds?: string[];
  metadata?: Record<string, unknown>;
}

export interface CityTrafficSegment {
  id: string;
  roadName: string;
  congestion: number; // 0 - 100%
  speed: number; // km/h
  status: "low" | "medium" | "high" | "critical";
  coordinates: [number, number][];
  updatedSecondsAgo: number;
  districtName: string;
}

export interface SearchLocation {
  name: string;
  latitude: number;
  longitude: number;
  districtId?: string;
  description?: string;
}

export const DEFAULT_CITY = {
  name: "Jaipur",
  state: "Rajasthan",
  country: "India",
  lat: 26.9124,
  lng: 75.7873,
  zoom: 12
};

// Comprehensive, geographically distributed Jaipur telemetry dataset (48 events across 16 city sectors)
export const JAIPUR_MOCK_MAP_EVENTS: CityMapEvent[] = [
  // 1. MI Road
  {
    id: "map-inc-1",
    type: "traffic",
    title: "Severe Traffic Congestion",
    description: "Peak hour vehicle queueing causing 3km tailback near Panch Batti roundabout.",
    latitude: 26.9180,
    longitude: 75.8150,
    severity: "critical",
    value: 88,
    unit: "% density",
    baseline: 60,
    change: "+46%",
    timestamp: "2 mins ago",
    districtId: "central-district",
    districtName: "Central District",
    locationName: "MI Road (Mirza Ismail Road)",
    impact: "High - Emergency routing delayed",
    correlatedEventIds: ["map-inc-9", "map-inc-12"],
    metadata: { avgSpeed: 14 }
  },
  {
    id: "map-evt-2",
    type: "transit",
    title: "Express Bus Route Delay",
    description: "City bus Route 9 operating with +18 min delay due to arterial traffic congestion.",
    latitude: 26.9142,
    longitude: 75.8095,
    severity: "medium",
    value: 18,
    unit: "min delay",
    baseline: 4,
    change: "+350%",
    timestamp: "7 mins ago",
    districtId: "central-district",
    districtName: "Central District",
    locationName: "Sindhi Camp Bus Station Corridor",
    impact: "Moderate passenger queue buildup"
  },
  {
    id: "map-evt-3",
    type: "incident",
    title: "Vehicle Stall at Crossing",
    description: "Stalled delivery van blocking 1 lane near Ajmeri Gate entrance.",
    latitude: 26.9195,
    longitude: 75.8210,
    severity: "medium",
    value: 65,
    unit: "severity index",
    baseline: 20,
    change: "+225%",
    timestamp: "11 mins ago",
    districtId: "central-district",
    districtName: "Central District",
    locationName: "MI Road (Ajmeri Gate Junction)",
    impact: "Tow truck dispatched"
  },

  // 2. C-Scheme
  {
    id: "map-inc-2",
    type: "traffic",
    title: "Moderate Arterial Delay",
    description: "Slow traffic flow near commercial complex roundabout.",
    latitude: 26.9042,
    longitude: 75.7984,
    severity: "medium",
    value: 68,
    unit: "% density",
    baseline: 50,
    change: "+18%",
    timestamp: "6 mins ago",
    districtId: "central-district",
    districtName: "Central District",
    locationName: "C-Scheme (Ahinsa Circle)",
    impact: "Medium - Commute extended by 10m",
    metadata: { avgSpeed: 24 }
  },
  {
    id: "map-evt-5",
    type: "air_quality",
    title: "Moderate AQI Concentration",
    description: "Evening particulate accumulation in commercial residential sector.",
    latitude: 26.9015,
    longitude: 75.7925,
    severity: "low",
    value: 78,
    unit: "AQI",
    baseline: 65,
    change: "+20%",
    timestamp: "14 mins ago",
    districtId: "central-district",
    districtName: "Central District",
    locationName: "C-Scheme (Bhagwan Das Road)",
    impact: "Normal urban air envelope"
  },
  {
    id: "map-evt-6",
    type: "incident",
    title: "Signal Sync Calibration",
    description: "Automated signal timing adjustment active at major intersection.",
    latitude: 26.9080,
    longitude: 75.8020,
    severity: "low",
    value: 42,
    unit: "priority rating",
    baseline: 15,
    change: "+180%",
    timestamp: "19 mins ago",
    districtId: "central-district",
    districtName: "Central District",
    locationName: "C-Scheme (Statue Circle)",
    impact: "Minor traffic pacing"
  },

  // 3. Bani Park
  {
    id: "map-inc-9",
    type: "weather",
    title: "Heavy Precipitation Downpour",
    description: "Convective rain cell dumping 45mm/h precipitation causing water pooling.",
    latitude: 26.9275,
    longitude: 75.7918,
    severity: "high",
    value: 45,
    unit: "mm/h rain",
    baseline: 5,
    change: "+800%",
    timestamp: "3 mins ago",
    districtId: "north-district",
    districtName: "North District",
    locationName: "Bani Park",
    impact: "High - Road water logging risk",
    correlatedEventIds: ["map-inc-1"],
    metadata: { temp: "26°C", wind: "32 km/h" }
  },
  {
    id: "map-evt-8",
    type: "utility",
    title: "Power Line Maintenance Check",
    description: "Scheduled grid balance inspection on residential feeder branch.",
    latitude: 26.9320,
    longitude: 75.7875,
    severity: "low",
    value: 52,
    unit: "% load",
    baseline: 60,
    change: "-13%",
    timestamp: "22 mins ago",
    districtId: "north-district",
    districtName: "North District",
    locationName: "Bani Park (Kabir Marg)",
    impact: "Zero consumer outage"
  },
  {
    id: "map-evt-9",
    type: "transit",
    title: "Bus Stop Platform Crowd",
    description: "Increased commuter boarding count during rain shower.",
    latitude: 26.9230,
    longitude: 75.7965,
    severity: "medium",
    value: 12,
    unit: "min delay",
    baseline: 3,
    change: "+300%",
    timestamp: "8 mins ago",
    districtId: "north-district",
    districtName: "North District",
    locationName: "Bani Park Collectorate Circle",
    impact: "Extra shuttle dispatched"
  },

  // 4. Vaishali Nagar
  {
    id: "map-inc-10",
    type: "weather",
    title: "Thunderstorm Gust Advisory",
    description: "Peak surface wind vector gusts up to 48 km/h.",
    latitude: 26.8962,
    longitude: 75.7415,
    severity: "medium",
    value: 48,
    unit: "km/h wind",
    baseline: 12,
    change: "+300%",
    timestamp: "9 mins ago",
    districtId: "west-district",
    districtName: "West District",
    locationName: "Vaishali Nagar (National Handloom Circle)",
    impact: "Medium - High wind advisory",
    metadata: { temp: "27°C", wind: "48 km/h" }
  },
  {
    id: "map-evt-11",
    type: "utility",
    title: "Substation Load Surge",
    description: "Commercial air conditioning load spike during humid weather transition.",
    latitude: 26.8915,
    longitude: 75.7480,
    severity: "high",
    value: 88,
    unit: "% load",
    baseline: 65,
    change: "+35%",
    timestamp: "16 mins ago",
    districtId: "west-district",
    districtName: "West District",
    locationName: "Vaishali Nagar Substation B",
    impact: "Transformer cooling active"
  },
  {
    id: "map-evt-12",
    type: "air_quality",
    title: "Elevated Urban Dust",
    description: "Localized particulate drift along main commercial boulevard.",
    latitude: 26.9020,
    longitude: 75.7350,
    severity: "low",
    value: 92,
    unit: "AQI",
    baseline: 70,
    change: "+31%",
    timestamp: "25 mins ago",
    districtId: "west-district",
    districtName: "West District",
    locationName: "Vaishali Nagar (Amrapali Circle)",
    impact: "Low health concern"
  },

  // 5. Ajmer Road
  {
    id: "map-inc-4",
    type: "traffic",
    title: "High Corridor Density",
    description: "Moderate queueing near DCA intersection signal.",
    latitude: 26.8841,
    longitude: 75.7523,
    severity: "medium",
    value: 64,
    unit: "% density",
    baseline: 50,
    change: "+14%",
    timestamp: "8 mins ago",
    districtId: "west-district",
    districtName: "West District",
    locationName: "Ajmer Road (DCA Intersection)",
    impact: "Moderate - Westbound corridor slow",
    metadata: { avgSpeed: 28 }
  },
  {
    id: "map-evt-14",
    type: "transit",
    title: "Intercity Highway Bus Delay",
    description: "Express intercity bus delayed by toll gate bottleneck.",
    latitude: 26.8785,
    longitude: 75.7430,
    severity: "medium",
    value: 16,
    unit: "min delay",
    baseline: 5,
    change: "+220%",
    timestamp: "12 mins ago",
    districtId: "west-district",
    districtName: "West District",
    locationName: "Ajmer Road Expressway Flyover",
    impact: "Expressway lane slowed"
  },
  {
    id: "map-evt-15",
    type: "traffic",
    title: "Service Lane Merge Slowdown",
    description: "Commercial merging traffic slowing main highway carriageway.",
    latitude: 26.8710,
    longitude: 75.7310,
    severity: "low",
    value: 55,
    unit: "% density",
    baseline: 45,
    change: "+22%",
    timestamp: "30 mins ago",
    districtId: "west-district",
    districtName: "West District",
    locationName: "Ajmer Road (Purani Chungi)",
    impact: "Minor merge queue"
  },

  // 6. Civil Lines
  {
    id: "map-evt-16",
    type: "incident",
    title: "VIP Convoy Routing Diversion",
    description: "Temporary signal override and lane reservation for official delegation movement.",
    latitude: 26.9083,
    longitude: 75.7825,
    severity: "medium",
    value: 70,
    unit: "priority rating",
    baseline: 10,
    change: "+600%",
    timestamp: "4 mins ago",
    districtId: "central-district",
    districtName: "Central District",
    locationName: "Civil Lines Metro Corridor",
    impact: "Traffic held for 5 minutes"
  },
  {
    id: "map-evt-17",
    type: "weather",
    title: "Localized Rain Shower",
    description: "Light precipitation cell moving east across government residential sector.",
    latitude: 26.9130,
    longitude: 75.7760,
    severity: "low",
    value: 12,
    unit: "mm/h rain",
    baseline: 2,
    change: "+500%",
    timestamp: "18 mins ago",
    districtId: "central-district",
    districtName: "Central District",
    locationName: "Civil Lines (Raj Bhavan Road)",
    impact: "Wet pavement alert"
  },

  // 7. Mansarovar
  {
    id: "map-inc-6",
    type: "incident",
    title: "Utility Signal Outage",
    description: "Traffic light signal malfunction causing manual dispatch intervention.",
    latitude: 26.8485,
    longitude: 75.7652,
    severity: "high",
    value: 78,
    unit: "priority rating",
    baseline: 15,
    change: "+420%",
    timestamp: "12 mins ago",
    districtId: "south-hub",
    districtName: "South Hub",
    locationName: "Mansarovar (VT Road Crossing)",
    impact: "High - Traffic warden deployed",
    metadata: { teamAssigned: "Unit 4 Tech Ops" }
  },
  {
    id: "map-evt-19",
    type: "transit",
    title: "Metro Terminal Platform Queue",
    description: "Headway spacing increased by 10 minutes at Metro Line 1 western terminus.",
    latitude: 26.8540,
    longitude: 75.7710,
    severity: "medium",
    value: 10,
    unit: "min delay",
    baseline: 2,
    change: "+400%",
    timestamp: "15 mins ago",
    districtId: "south-hub",
    districtName: "South Hub",
    locationName: "Mansarovar Metro Terminal Station",
    impact: "Platform passenger density 72%"
  },
  {
    id: "map-evt-20",
    type: "traffic",
    title: "Market Road Flow Density",
    description: "Evening shopping crowd vehicle movement on primary market spine.",
    latitude: 26.8420,
    longitude: 75.7580,
    severity: "low",
    value: 58,
    unit: "% density",
    baseline: 45,
    change: "+28%",
    timestamp: "28 mins ago",
    districtId: "south-hub",
    districtName: "South Hub",
    locationName: "Mansarovar (Madhyam Marg)",
    impact: "Slow commercial parking"
  },

  // 8. Tonk Road
  {
    id: "map-inc-3",
    type: "traffic",
    title: "Expressway Bottleneck",
    description: "High volume freight traffic bottleneck near flyover entry.",
    latitude: 26.8524,
    longitude: 75.8053,
    severity: "high",
    value: 82,
    unit: "% density",
    baseline: 55,
    change: "+27%",
    timestamp: "4 mins ago",
    districtId: "south-hub",
    districtName: "South Hub",
    locationName: "Tonk Road (Near Gopalpura Flyover)",
    impact: "High - Southbound freight slow",
    correlatedEventIds: ["map-inc-5"],
    metadata: { avgSpeed: 18 }
  },
  {
    id: "map-evt-22",
    type: "utility",
    title: "High Voltage Cable Test",
    description: "Grid monitoring team conducting thermal scan on main southern feeder line.",
    latitude: 26.8610,
    longitude: 75.8010,
    severity: "low",
    value: 72,
    unit: "% load",
    baseline: 70,
    change: "+3%",
    timestamp: "35 mins ago",
    districtId: "south-hub",
    districtName: "South Hub",
    locationName: "Tonk Road (Nehru Place Substation)",
    impact: "Routine telemetry verification"
  },
  {
    id: "map-evt-23",
    type: "traffic",
    title: "Southbound Arterial Slowdown",
    description: "Tailback extending from Laxmi Mandir Cinema junction.",
    latitude: 26.8720,
    longitude: 75.8040,
    severity: "medium",
    value: 71,
    unit: "% density",
    baseline: 52,
    change: "+36%",
    timestamp: "10 mins ago",
    districtId: "south-hub",
    districtName: "South Hub",
    locationName: "Tonk Road (Laxmi Mandir Circle)",
    impact: "Signal timing adjusted"
  },

  // 9. Malviya Nagar
  {
    id: "map-inc-5",
    type: "incident",
    title: "Multi-Vehicle Collision",
    description: "Right lanes blocked by two passenger vehicles. First responders dispatched.",
    latitude: 26.8512,
    longitude: 75.8284,
    severity: "critical",
    value: 95,
    unit: "severity index",
    baseline: 20,
    change: "+375%",
    timestamp: "5 mins ago",
    districtId: "tech-corridor",
    districtName: "Tech Corridor",
    locationName: "Malviya Nagar (Calgiri Road)",
    impact: "Critical - Dual lane blockage",
    correlatedEventIds: ["map-inc-3"],
    metadata: { cadRef: "CAD-911-4820" }
  },
  {
    id: "map-evt-25",
    type: "air_quality",
    title: "Commercial Zone AQI Rise",
    description: "Particulate index elevated around retail mall cluster.",
    latitude: 26.8565,
    longitude: 75.8210,
    severity: "medium",
    value: 112,
    unit: "AQI",
    baseline: 75,
    change: "+49%",
    timestamp: "13 mins ago",
    districtId: "tech-corridor",
    districtName: "Tech Corridor",
    locationName: "Malviya Nagar (Gaurav Tower Circle)",
    impact: "Sensitive groups advisory"
  },
  {
    id: "map-evt-26",
    type: "traffic",
    title: "Market Avenue Bottleneck",
    description: "Heavy shopper vehicle influx on internal retail spine.",
    latitude: 26.8450,
    longitude: 75.8320,
    severity: "low",
    value: 62,
    unit: "% density",
    baseline: 48,
    change: "+29%",
    timestamp: "21 mins ago",
    districtId: "tech-corridor",
    districtName: "Tech Corridor",
    locationName: "Malviya Nagar Sector 4 Spine",
    impact: "Parking congestion"
  },

  // 10. JLN Marg
  {
    id: "map-inc-8",
    type: "air_quality",
    title: "Moderate AQI Reading",
    description: "Particulate levels in normal evening operating envelope.",
    latitude: 26.8825,
    longitude: 75.8082,
    severity: "low",
    value: 72,
    unit: "AQI",
    baseline: 68,
    change: "+5%",
    timestamp: "10 mins ago",
    districtId: "tech-corridor",
    districtName: "Tech Corridor",
    locationName: "JLN Marg (World Trade Park)",
    impact: "Low - Acceptable air quality",
    metadata: { pm25: 22, pm10: 48 }
  },
  {
    id: "map-evt-28",
    type: "transit",
    title: "Metro Line 1 Corridor Sync",
    description: "Train schedule operating smoothly along educational institutional belt.",
    latitude: 26.8680,
    longitude: 75.8110,
    severity: "low",
    value: 2,
    unit: "min delay",
    baseline: 2,
    change: "0%",
    timestamp: "5 mins ago",
    districtId: "tech-corridor",
    districtName: "Tech Corridor",
    locationName: "JLN Marg (Rajasthan University Station)",
    impact: "Normal operational rhythm"
  },
  {
    id: "map-evt-29",
    type: "weather",
    title: "Clear Sky Vector",
    description: "Visibility > 8km with light 8 km/h breeze along green corridor.",
    latitude: 26.8910,
    longitude: 75.8070,
    severity: "low",
    value: 25,
    unit: "°C temp",
    baseline: 24,
    change: "+4%",
    timestamp: "15 mins ago",
    districtId: "tech-corridor",
    districtName: "Tech Corridor",
    locationName: "JLN Marg (OTS Circle)",
    impact: "Optimal conditions"
  },

  // 11. Jagatpura
  {
    id: "map-evt-30",
    type: "utility",
    title: "Water Main Pressure Maintenance",
    description: "Municipal water supply pipeline pressure regulation check.",
    latitude: 26.8124,
    longitude: 75.8351,
    severity: "low",
    value: 48,
    unit: "psi pressure",
    baseline: 50,
    change: "-4%",
    timestamp: "26 mins ago",
    districtId: "tech-corridor",
    districtName: "Tech Corridor",
    locationName: "Jagatpura Main Pumping Station",
    impact: "Stable distribution"
  },
  {
    id: "map-evt-31",
    type: "air_quality",
    title: "Construction Dust Drift",
    description: "Particulate elevation near new railway overbridge construction.",
    latitude: 26.8210,
    longitude: 75.8420,
    severity: "medium",
    value: 118,
    unit: "AQI",
    baseline: 70,
    change: "+68%",
    timestamp: "17 mins ago",
    districtId: "tech-corridor",
    districtName: "Tech Corridor",
    locationName: "Jagatpura ROB Junction",
    impact: "Dust suppression active"
  },

  // 12. Sitapura
  {
    id: "map-inc-7",
    type: "air_quality",
    title: "PM2.5 AQI Spike",
    description: "Fine particulate concentration elevated downwind of industrial construction.",
    latitude: 26.7782,
    longitude: 75.8423,
    severity: "high",
    value: 148,
    unit: "AQI",
    baseline: 65,
    change: "+123%",
    timestamp: "15 mins ago",
    districtId: "tech-corridor",
    districtName: "Tech Corridor",
    locationName: "Sitapura Industrial Area",
    impact: "Unhealthy for sensitive groups",
    metadata: { pm25: 64, pm10: 120 }
  },
  {
    id: "map-evt-33",
    type: "utility",
    title: "Industrial High Voltage Demand",
    description: "Heavy manufacturing shift starting high transformer grid load.",
    latitude: 26.7710,
    longitude: 75.8490,
    severity: "medium",
    value: 84,
    unit: "% load",
    baseline: 68,
    change: "+23%",
    timestamp: "11 mins ago",
    districtId: "tech-corridor",
    districtName: "Tech Corridor",
    locationName: "Sitapura Industrial Substation 3",
    impact: "Grid stability monitored"
  },
  {
    id: "map-evt-34",
    type: "incident",
    title: "Chemical Spill Drill / Minor Containment",
    description: "Safety verification inspection in industrial park sector.",
    latitude: 26.7840,
    longitude: 75.8360,
    severity: "low",
    value: 30,
    unit: "priority rating",
    baseline: 10,
    change: "+200%",
    timestamp: "40 mins ago",
    districtId: "tech-corridor",
    districtName: "Tech Corridor",
    locationName: "Sitapura Industrial Phase II",
    impact: "Precautionary safety check"
  },

  // 13. Raja Park
  {
    id: "map-evt-35",
    type: "weather",
    title: "Passing Precipitation Cell",
    description: "Light localized rain shower across retail market streets.",
    latitude: 26.8981,
    longitude: 75.8285,
    severity: "low",
    value: 8,
    unit: "mm/h rain",
    baseline: 2,
    change: "+300%",
    timestamp: "14 mins ago",
    districtId: "central-district",
    districtName: "Central District",
    locationName: "Raja Park Main Market",
    impact: "Minor road dampness"
  },
  {
    id: "map-evt-36",
    type: "utility",
    title: "Distribution Transformer Telemetry",
    description: "Smart transformer sensor sending nominal health status telemetry.",
    latitude: 26.8920,
    longitude: 75.8350,
    severity: "low",
    value: 62,
    unit: "% load",
    baseline: 60,
    change: "+3%",
    timestamp: "32 mins ago",
    districtId: "central-district",
    districtName: "Central District",
    locationName: "Raja Park (Panchwati Circle)",
    impact: "Healthy grid node"
  },

  // 14. Amer Road (Far North)
  {
    id: "map-evt-37",
    type: "weather",
    title: "Hillslope Cloud Layer",
    description: "Low cloud accumulation over Aravalli ridge lines near Amber Fort.",
    latitude: 26.9554,
    longitude: 75.8382,
    severity: "medium",
    value: 88,
    unit: "% humidity",
    baseline: 60,
    change: "+46%",
    timestamp: "6 mins ago",
    districtId: "north-district",
    districtName: "North District",
    locationName: "Amer Road (Jal Mahal Corridor)",
    impact: "Scenic mist / Reduced visibility 2km"
  },
  {
    id: "map-evt-38",
    type: "traffic",
    title: "Tourist Coach Corridor Queue",
    description: "High volume tourist bus arrival causing slow movement near Jal Mahal.",
    latitude: 26.9620,
    longitude: 75.8320,
    severity: "high",
    value: 76,
    unit: "% density",
    baseline: 45,
    change: "+68%",
    timestamp: "9 mins ago",
    districtId: "north-district",
    districtName: "North District",
    locationName: "Amer Road Highway Pass",
    impact: "Traffic police managing queue"
  },

  // 15. Sanganer (Far South)
  {
    id: "map-evt-39",
    type: "traffic",
    title: "Airport Cargo Merge Delay",
    description: "Freight vehicles merging onto airport connector road.",
    latitude: 26.8023,
    longitude: 75.7954,
    severity: "medium",
    value: 69,
    unit: "% density",
    baseline: 48,
    change: "+43%",
    timestamp: "13 mins ago",
    districtId: "south-hub",
    districtName: "South Hub",
    locationName: "Sanganer Airport Connector Road",
    impact: "Cargo speed 22 km/h"
  },
  {
    id: "map-evt-40",
    type: "weather",
    title: "Southern Rain Band",
    description: "Scattered shower cell passing over Sanganer textile sector.",
    latitude: 26.7940,
    longitude: 75.7860,
    severity: "low",
    value: 15,
    unit: "mm/h rain",
    baseline: 3,
    change: "+400%",
    timestamp: "20 mins ago",
    districtId: "south-hub",
    districtName: "South Hub",
    locationName: "Sanganer Town Circle",
    impact: "Wet surface warning"
  },
  {
    id: "map-evt-41",
    type: "transit",
    title: "Suburban Feeder Bus Run",
    description: "Feeder bus route connecting airport perimeter with suburban rail.",
    latitude: 26.8110,
    longitude: 75.7890,
    severity: "low",
    value: 4,
    unit: "min delay",
    baseline: 2,
    change: "+100%",
    timestamp: "18 mins ago",
    districtId: "south-hub",
    districtName: "South Hub",
    locationName: "Sanganer Bus Terminal",
    impact: "Normal shuttle service"
  },

  // 16. Vidyadhar Nagar (Far North-West)
  {
    id: "map-inc-13",
    type: "utility",
    title: "Substation Transformer Fluctuation",
    description: "Grid load voltage pulse recorded during monsoon rain surge.",
    latitude: 26.9621,
    longitude: 75.7803,
    severity: "high",
    value: 94,
    unit: "% load",
    baseline: 70,
    change: "+34%",
    timestamp: "11 mins ago",
    districtId: "north-district",
    districtName: "North District",
    locationName: "Vidyadhar Nagar Power Substation",
    impact: "High - Backup generators online",
    correlatedEventIds: ["map-inc-9"],
    metadata: { gridVoltage: "230V step pulse" }
  },
  {
    id: "map-evt-43",
    type: "incident",
    title: "Intersectional Stall",
    description: "Minor vehicle breakdown at Sector 2 roundabout.",
    latitude: 26.9550,
    longitude: 75.7720,
    severity: "low",
    value: 35,
    unit: "priority rating",
    baseline: 15,
    change: "+133%",
    timestamp: "24 mins ago",
    districtId: "north-district",
    districtName: "North District",
    locationName: "Vidyadhar Nagar Sector 2 Circle",
    impact: "Assisted by patrol"
  },
  {
    id: "map-evt-44",
    type: "transit",
    title: "Northbound Express Bus Delay",
    description: "Route 4 bus headway delayed due to northern bypass rain.",
    latitude: 26.9680,
    longitude: 75.7860,
    severity: "medium",
    value: 14,
    unit: "min delay",
    baseline: 3,
    change: "+366%",
    timestamp: "16 mins ago",
    districtId: "north-district",
    districtName: "North District",
    locationName: "Vidyadhar Nagar Highway Junction",
    impact: "Moderate headway delay"
  },
  {
    id: "map-evt-45",
    type: "air_quality",
    title: "Suburban Baseline Air Envelope",
    description: "Clean atmospheric reading along northern foothill belt.",
    latitude: 26.9740,
    longitude: 75.7750,
    severity: "low",
    value: 48,
    unit: "AQI",
    baseline: 50,
    change: "-4%",
    timestamp: "29 mins ago",
    districtId: "north-district",
    districtName: "North District",
    locationName: "Vidyadhar Nagar Sector 8 Park",
    impact: "Optimal air quality"
  }
];

// Jaipur Demonstration Traffic Segment Segments (Section 9)
export const JAIPUR_TRAFFIC_SEGMENTS: CityTrafficSegment[] = [
  {
    id: "seg-mi-road",
    roadName: "MI Road (Mirza Ismail Road)",
    congestion: 82,
    speed: 18,
    status: "high",
    coordinates: [
      [26.9150, 75.8050],
      [26.9180, 75.8150],
      [26.9200, 75.8230]
    ],
    updatedSecondsAgo: 12,
    districtName: "Central District"
  },
  {
    id: "seg-tonk-road",
    roadName: "Tonk Road Arterial",
    congestion: 76,
    speed: 22,
    status: "high",
    coordinates: [
      [26.8800, 75.8020],
      [26.8520, 75.8050],
      [26.8300, 75.8080]
    ],
    updatedSecondsAgo: 18,
    districtName: "South Hub"
  },
  {
    id: "seg-ajmer-road",
    roadName: "Ajmer Road Expressway",
    congestion: 64,
    speed: 35,
    status: "medium",
    coordinates: [
      [26.8950, 75.7700],
      [26.8840, 75.7520],
      [26.8700, 75.7350]
    ],
    updatedSecondsAgo: 24,
    districtName: "West District"
  },
  {
    id: "seg-jln-marg",
    roadName: "JLN Marg Corridor",
    congestion: 38,
    speed: 48,
    status: "low",
    coordinates: [
      [26.9050, 75.8120],
      [26.8920, 75.8080],
      [26.8650, 75.8090]
    ],
    updatedSecondsAgo: 8,
    districtName: "Tech Corridor"
  },
  {
    id: "seg-cscheme",
    roadName: "C-Scheme Ring Road",
    congestion: 68,
    speed: 26,
    status: "medium",
    coordinates: [
      [26.9080, 75.7920],
      [26.9010, 75.7980],
      [26.8950, 75.8030]
    ],
    updatedSecondsAgo: 15,
    districtName: "Central District"
  },
  {
    id: "seg-malviya-nagar",
    roadName: "Malviya Nagar Calgiri Avenue",
    congestion: 91,
    speed: 12,
    status: "critical",
    coordinates: [
      [26.8580, 75.8200],
      [26.8510, 75.8280],
      [26.8420, 75.8350]
    ],
    updatedSecondsAgo: 6,
    districtName: "Tech Corridor"
  }
];

// Jaipur Search Locations Lookup (Section 5)
export const JAIPUR_SEARCH_LOCATIONS: SearchLocation[] = [
  { name: "MI Road", latitude: 26.9180, longitude: 75.8150, districtId: "central-district", description: "Mirza Ismail Road Shopping & Business Hub" },
  { name: "C-Scheme", latitude: 26.9042, longitude: 75.7984, districtId: "central-district", description: "Ahinsa Circle & Upscale Commercial Zone" },
  { name: "Malviya Nagar", latitude: 26.8512, longitude: 75.8284, districtId: "tech-corridor", description: "Gaurav Tower & Tech Commercial Sector" },
  { name: "Vaishali Nagar", latitude: 26.8962, longitude: 75.7415, districtId: "west-district", description: "National Handloom & Residential Sector" },
  { name: "Mansarovar", latitude: 26.8485, longitude: 75.7652, districtId: "south-hub", description: "VT Road & Suburb Residential Zone" },
  { name: "Tonk Road", latitude: 26.8524, longitude: 75.8053, districtId: "south-hub", description: "Gopalpura Flyover Arterial Corridor" },
  { name: "Ajmer Road", latitude: 26.8841, longitude: 75.7523, districtId: "west-district", description: "DCA Intersection Highway Corridor" },
  { name: "JLN Marg", latitude: 26.8825, longitude: 75.8082, districtId: "tech-corridor", description: "World Trade Park & Educational Boulevard" },
  { name: "Sitapura", latitude: 26.7782, longitude: 75.8423, districtId: "tech-corridor", description: "Industrial & Educational Zone" },
  { name: "Bani Park", latitude: 26.9275, longitude: 75.7918, districtId: "north-district", description: "Heritage Residential & Hotel District" },
  { name: "Civil Lines", latitude: 26.9083, longitude: 75.7825, districtId: "central-district", description: "Government Sector & Metro Station" },
  { name: "Raja Park", latitude: 26.8981, longitude: 75.8285, districtId: "central-district", description: "Commercial Market & Retail Sector" },
  { name: "Amer Road", latitude: 26.9554, longitude: 75.8382, districtId: "north-district", description: "Amber Fort & Jal Mahal Heritage Pass" },
  { name: "Sanganer", latitude: 26.8023, longitude: 75.7954, districtId: "south-hub", description: "Airport Sector & Craft Industry" },
  { name: "Vidyadhar Nagar", latitude: 26.9621, longitude: 75.7803, districtId: "north-district", description: "Northern Residential & Power Substation Zone" },
  { name: "Jagatpura", latitude: 26.8124, longitude: 75.8351, districtId: "tech-corridor", description: "Institutional & Railway Infrastructure" }
];
