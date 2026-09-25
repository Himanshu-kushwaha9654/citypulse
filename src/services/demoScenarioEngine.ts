import { DemoScenarioId, DemoScenarioStep } from '../types/citypulse';

export interface DemoScenarioDefinition {
  id: DemoScenarioId;
  name: string;
  icon: string;
  description: string;
  districtId: string;
  districtName: string;
  steps: DemoScenarioStep[];
}

export const DEMO_SCENARIOS: DemoScenarioDefinition[] = [
  {
    id: 'heavy-rain',
    name: 'Heavy Rain',
    icon: '🌧',
    description: 'Simulates a severe convective rainstorm causing road waterlogging, traffic delays, transit disruptions, and incident surges.',
    districtId: 'central-district',
    districtName: 'Central District',
    steps: [
      {
        stepIndex: 1,
        title: 'Weather Deteriorates',
        description: 'Doppler precipitation radar detects rapid 55mm/h rain cell shifting over Central District.',
        districtId: 'central-district',
        districtName: 'Central District',
        pulseDrop: 2,
        metricsShift: { humidityPct: 92, tempC: 22 },
        newAlertTitle: '🌧 Heavy Rainfall Warning - Central District',
        aiSummary: 'Doppler telemetry flags severe convective precipitation (55mm/h) shifting over Central District.',
        aiWhyItMatters: 'Sudden rain accumulation will rapidly degrade road traction and expand vehicle braking distances.'
      },
      {
        stepIndex: 2,
        title: 'Traffic Congestion Increases (+31%)',
        description: 'Vehicular speeds on Grand Avenue & MI Road drop by 31% due to standing surface water.',
        districtId: 'central-district',
        districtName: 'Central District',
        pulseDrop: 4,
        metricsShift: { trafficCongestionPct: 31 },
        newAlertTitle: '🚗 Severe Traffic Congestion (+31%) - MI Road',
        aiSummary: 'Traffic congestion on Central District main arterials surged by 31% above baseline as rain intensified.',
        aiWhyItMatters: 'Average vehicle headways extended by 18 minutes; risk of gridlock on connecting roundabouts.'
      },
      {
        stepIndex: 3,
        title: 'Transit Delays Expand (+18m)',
        description: 'Metro Line 2 and Bus Route 14 experience 18-minute headway expansions.',
        districtId: 'central-district',
        districtName: 'Central District',
        pulseDrop: 3,
        metricsShift: { transitDelayMins: 18 },
        newAlertTitle: '🚌 Transit Headway Delay (+18m) - Metro Line 2',
        aiSummary: 'Surface transit and underground rail headway delays expanded to 18 minutes in flooded corridors.',
        aiWhyItMatters: 'Commuter platform density at Central Interchange has reached 88% capacity.'
      },
      {
        stepIndex: 4,
        title: 'Waterlogging Incident Reported',
        description: 'Grand Underpass reports 40cm waterlogging; emergency drainage pumps operating at peak load.',
        districtId: 'central-district',
        districtName: 'Central District',
        pulseDrop: 5,
        metricsShift: { incidentCountDelta: 2 },
        mapIncident: {
          id: 'demo-rain-inc-001',
          source: 'demo',
          type: 'weather',
          title: 'Underpass Flooding & Vehicle Stall',
          location: { lat: 26.9124, lng: 75.7873 },
          districtId: 'central-district',
          districtName: 'Central District',
          severity: 'critical',
          timestamp: 'Just now',
          value: 40,
          baseline: 0,
          description: '40cm surface water accumulation on Grand Underpass blocking 2 westbound lanes.'
        },
        newAlertTitle: '🚨 Waterlogging & Lane Closure - Grand Underpass',
        aiSummary: 'Waterlogging incident confirmed at Grand Underpass. Emergency response units dispatched.',
        aiWhyItMatters: 'Westbound traffic diverted to secondary residential streets.'
      },
      {
        stepIndex: 5,
        title: 'Anomaly Engine Flags 2.8× Incident Surge',
        description: 'Multi-signal correlation engine confirms 78% spatial overlap between rain cell and emergency CAD dispatches.',
        districtId: 'central-district',
        districtName: 'Central District',
        pulseDrop: 6,
        anomalyItem: {
          id: 'demo-anom-rain-01',
          source: 'demo',
          title: 'Correlated Heavy Rain & Incident Surge',
          districtId: 'central-district',
          districtName: 'Central District',
          category: 'weather',
          detectedAgo: '1m ago',
          currentValue: 2.8,
          baselineValue: 1.0,
          factorAboveBaseline: 2.8,
          relatedSignals: [
            { icon: '🌧️', name: 'Precipitation', value: '55 mm/h', category: 'weather' },
            { icon: '🚗', name: 'Congestion', value: '+31%', category: 'traffic' },
            { icon: '🚨', name: 'CAD Dispatches', value: '14 active', category: 'incidents' }
          ],
          signalOverlap: 84,
          description: 'Simulated convective downpour correlates with 2.8× spike in 911 dispatch calls and arterial slowdowns.',
          detailedExplanation: 'Spatial correlation between rain telemetry and vehicle sensors confirms cascade effect from rainfall to transit bottlenecks.',
          mapCoordinates: [26.9124, 75.7873],
          severity: 'critical'
        },
        newAlertTitle: '🚨 ANOMALY: 2.8× Incident Surge Detected',
        aiSummary: 'CityPulse anomaly engine flagged a 2.8× incident surge in Central District.',
        aiWhyItMatters: 'Spatial overlap between downpour radar and emergency calls confirms cascading disruption.'
      },
      {
        stepIndex: 6,
        title: 'City Pulse Score Drops to 51',
        description: 'Dynamic scoring engine updates overall City Pulse from baseline 72 down to 51.',
        districtId: 'central-district',
        districtName: 'Central District',
        pulseDrop: 8,
        aiSummary: 'City Pulse score dropped to 51 / 100 as multi-signal weighted impacts took effect.',
        aiWhyItMatters: 'Civic operational status shifted from Stable to Warning across Central District.'
      },
      {
        stepIndex: 7,
        title: 'Integrated Alert Generated',
        description: 'System triggers high-priority civic alert for emergency dispatchers and traffic control center.',
        districtId: 'central-district',
        districtName: 'Central District',
        pulseDrop: 0,
        alertItem: {
          id: 'demo-alert-rain-final',
          source: 'demo',
          severity: 'critical',
          title: '🚨 SEVERE WEATHER & TRAFFIC CASCADE ACTIVE',
          district: 'Central District',
          timeAgo: 'Just now',
          type: 'weather',
          message: 'Heavy rain downpour (55mm/h) causing 31% traffic congestion surge and underpass flooding in Central District.',
          read: false,
          affectedSignals: ['Weather', 'Traffic', 'Transit', 'Incidents'],
          recommendedAction: 'Dispatch municipal pump crews & adjust signal timing on Grand Avenue diverted routes.'
        },
        newAlertTitle: '🚨 SEVERE WEATHER & TRAFFIC CASCADE ACTIVE',
        aiSummary: 'Critical alert active: Multi-modal disruption confirmed across Central District.',
        aiWhyItMatters: 'Requires immediate dispatch coordination between traffic control and drainage maintenance.'
      },
      {
        stepIndex: 8,
        title: 'AI Explanation & Response Strategy Available',
        description: 'AI Copilot generates root cause analysis and recommended mitigation pathways.',
        districtId: 'central-district',
        districtName: 'Central District',
        pulseDrop: 0,
        aiSummary: 'Demo Mode Simulation: Heavy rain event over Central District has triggered a 3-stage civic cascade. Traffic speed dropped 31%, transit headways expanded 18 minutes, and underpass flooding was detected.',
        aiWhyItMatters: 'Recommended action: Deploy emergency pumps at Grand Underpass and activate alternate arterial signal timing.'
      }
    ]
  },
  {
    id: 'normal-city',
    name: 'Normal City',
    icon: '🌤',
    description: 'Simulates standard optimal city operations across all civic signals with clear weather and smooth flow.',
    districtId: 'central-district',
    districtName: 'Central District',
    steps: [
      {
        stepIndex: 1,
        title: 'Baseline Operations Verified',
        description: 'All 4,200 civic telemetry sensors report optimal baseline telemetry.',
        districtId: 'central-district',
        districtName: 'Central District',
        pulseDrop: -2,
        metricsShift: { trafficCongestionPct: -10, aqiValue: 35, tempC: 25, humidityPct: 45, transitDelayMins: 0 },
        aiSummary: 'City telemetry operating within optimal baseline ranges across all 8 civic sectors.',
        aiWhyItMatters: 'No active anomalies or operational bottlenecks detected.'
      },
      {
        stepIndex: 2,
        title: 'Traffic Flow Smooth (88% Speed Index)',
        description: 'Arterial speeds maintaining 48 km/h average; signal synchronization active.',
        districtId: 'central-district',
        districtName: 'Central District',
        pulseDrop: -2,
        aiSummary: 'Traffic speeds across main city corridors are flowing smoothly at 88% optimal index.',
        aiWhyItMatters: 'Commute times are 4 minutes below typical peak averages.'
      },
      {
        stepIndex: 3,
        title: 'Air Quality Clean (AQI 38)',
        description: 'PM2.5 concentration measured at 12 µg/m³; clean atmosphere.',
        districtId: 'central-district',
        districtName: 'Central District',
        pulseDrop: -1,
        aiSummary: 'Air quality index recorded at 38 (Good / Green). Low particulate counts.',
        aiWhyItMatters: 'Ideal conditions for outdoor activities and public recreation.'
      },
      {
        stepIndex: 4,
        title: 'City Pulse Score Reaches 82 / 100',
        description: 'Overall civic vitality index calculated at healthy 82.',
        districtId: 'central-district',
        districtName: 'Central District',
        pulseDrop: -3,
        aiSummary: 'City Pulse score stabilized at a healthy 82 / 100.',
        aiWhyItMatters: 'All infrastructure sectors reporting green status.'
      }
    ]
  },
  {
    id: 'traffic-disruption',
    name: 'Traffic Disruption',
    icon: '🚗',
    description: 'Simulates a major multi-vehicle collision on North Expressway causing severe arterial gridlock.',
    districtId: 'north-district',
    districtName: 'North District',
    steps: [
      {
        stepIndex: 1,
        title: 'Collision Reported - Exit 14',
        description: 'CAD dispatch receives 911 reports of 3-vehicle collision blocking 2 lanes on North Expressway.',
        districtId: 'north-district',
        districtName: 'North District',
        pulseDrop: 3,
        mapIncident: {
          id: 'demo-traf-inc-01',
          source: 'demo',
          type: 'traffic',
          title: '3-Vehicle Collision on Expressway Exit 14',
          location: { lat: 26.9312, lng: 75.8012 },
          districtId: 'north-district',
          districtName: 'North District',
          severity: 'critical',
          timestamp: 'Just now',
          value: 94,
          baseline: 42,
          description: 'Two lanes blocked on North Expressway Exit 14; emergency response en route.'
        },
        newAlertTitle: '💥 Collision Blockage - North Expressway Exit 14',
        aiSummary: 'Multi-vehicle collision blocking 2 lanes on North Expressway Exit 14.',
        aiWhyItMatters: 'First responder vehicles dispatched; tailback rapidly extending 2.5 km.'
      },
      {
        stepIndex: 2,
        title: 'Congestion Spikes to 94%',
        description: 'Probe traffic index jumps into critical red classification on North bypass.',
        districtId: 'north-district',
        districtName: 'North District',
        pulseDrop: 6,
        metricsShift: { trafficCongestionPct: 52 },
        newAlertTitle: '🚗 Critical Congestion Spike (94%) - North Bypass',
        aiSummary: 'Traffic density spiked to 94% on North Expressway corridors following lane closure.',
        aiWhyItMatters: 'Commute delays through North District increased by up to 34 minutes.'
      },
      {
        stepIndex: 3,
        title: 'Anomaly Engine Flags 3.2× Traffic Surge',
        description: 'Automated anomaly detection identifies 3.2× speed drop compared to historical Tuesday baseline.',
        districtId: 'north-district',
        districtName: 'North District',
        pulseDrop: 7,
        anomalyItem: {
          id: 'demo-anom-traf-01',
          source: 'demo',
          title: '3.2× Expressway Speed Drop Anomaly',
          districtId: 'north-district',
          districtName: 'North District',
          category: 'traffic',
          detectedAgo: '1m ago',
          currentValue: 3.2,
          baselineValue: 1.0,
          factorAboveBaseline: 3.2,
          relatedSignals: [
            { icon: '🚗', name: 'Speed Index', value: '11 km/h', category: 'traffic' },
            { icon: '🚨', name: 'Tailback', value: '4.2 km', category: 'incidents' }
          ],
          signalOverlap: 91,
          description: 'Probe speeds collapsed from 55 km/h to 11 km/h within 12 minutes of collision report.',
          detailedExplanation: 'Cross-validation between camera feeds and GPS probe telemetry confirms physical bottleneck at Exit 14.',
          mapCoordinates: [26.9312, 75.8012],
          severity: 'critical'
        },
        newAlertTitle: '🚨 ANOMALY: 3.2× Expressway Speed Collapse',
        aiSummary: 'CityPulse anomaly engine flagged a 3.2× speed drop in North District.',
        aiWhyItMatters: 'Bottleneck queue is spilling back into feeder arterials.'
      },
      {
        stepIndex: 4,
        title: 'City Pulse Score Drops to 56',
        description: 'North District traffic score degradation reduces city-wide Pulse score to 56.',
        districtId: 'north-district',
        districtName: 'North District',
        pulseDrop: 5,
        aiSummary: 'City Pulse score dropped to 56 / 100 due to severe arterial bottlenecking.',
        aiWhyItMatters: 'Requires dynamic signal timing overrides on parallel service roads.'
      }
    ]
  },
  {
    id: 'transit-failure',
    name: 'Transit Failure',
    icon: '🚌',
    description: 'Simulates a traction power grid trip causing widespread Metro line signals to fail.',
    districtId: 'tech-corridor',
    districtName: 'Tech Corridor',
    steps: [
      {
        stepIndex: 1,
        title: 'Substation Power Trip Detected',
        description: 'Substation 4 trips circuit breaker; power supply to Metro Line 1 interrupted.',
        districtId: 'tech-corridor',
        districtName: 'Tech Corridor',
        pulseDrop: 4,
        metricsShift: { transitDelayMins: 25 },
        newAlertTitle: '⚡ Metro Traction Power Trip - Substation 4',
        aiSummary: 'Substation 4 power trip interrupted third-rail voltage for Metro Line 1.',
        aiWhyItMatters: 'Three trains halted between stations; backup power auxiliary system engaged.'
      },
      {
        stepIndex: 2,
        title: 'Metro & Bus Line Headways Expands (+25m)',
        description: 'Platform queues build up at Tech Hub Interchange; delays reach 25 minutes.',
        districtId: 'tech-corridor',
        districtName: 'Tech Corridor',
        pulseDrop: 6,
        mapIncident: {
          id: 'demo-trans-inc-01',
          source: 'demo',
          type: 'transit',
          title: 'Metro Line 1 Signal Interruption',
          location: { lat: 26.8845, lng: 75.8123 },
          districtId: 'tech-corridor',
          districtName: 'Tech Corridor',
          severity: 'critical',
          timestamp: 'Just now',
          value: 25,
          baseline: 3,
          description: 'Metro Line 1 stopped; 4 shuttle buses deployed to bridge affected stations.'
        },
        newAlertTitle: '🚌 Critical Transit Failure (+25m Delays)',
        aiSummary: 'Metro Line 1 operational delay expanded to 25 minutes; station platforms crowded.',
        aiWhyItMatters: 'Emergency bus bridge activated between Tech Hub and Central Station.'
      },
      {
        stepIndex: 3,
        title: 'City Pulse Score Drops to 54',
        description: 'Public transit reliability index drops, shifting overall City Pulse to 54.',
        districtId: 'tech-corridor',
        districtName: 'Tech Corridor',
        pulseDrop: 8,
        aiSummary: 'City Pulse score dropped to 54 / 100 as transit grid stability collapsed.',
        aiWhyItMatters: 'Suburban commute flow disrupted; shuttle response units deployed.'
      }
    ]
  },
  {
    id: 'aqi-spike',
    name: 'AQI Spike',
    icon: '🌫',
    description: 'Simulates an atmospheric thermal inversion trapping industrial particulate emissions in West District.',
    districtId: 'west-district',
    districtName: 'West District',
    steps: [
      {
        stepIndex: 1,
        title: 'AQI Jump to 168 PM2.5',
        description: 'Environmental monitoring stations register rapid PM2.5 climb from 42 to 168 µg/m³.',
        districtId: 'west-district',
        districtName: 'West District',
        pulseDrop: 5,
        metricsShift: { aqiValue: 168 },
        newAlertTitle: '🌫️ AQI Hazard Warning (168 PM2.5) - West District',
        aiSummary: 'Air quality in West District jumped to 168 (Unhealthy range) due to atmospheric inversion.',
        aiWhyItMatters: 'Particulate density poses immediate health risks to sensitive demographics.'
      },
      {
        stepIndex: 2,
        title: 'Environmental Anomaly Detected',
        description: 'Multi-sensor check confirms 3.8× PM2.5 surge over historical weekly average.',
        districtId: 'west-district',
        districtName: 'West District',
        pulseDrop: 6,
        anomalyItem: {
          id: 'demo-anom-aqi-01',
          source: 'demo',
          title: '3.8× PM2.5 Industrial Dispersion Anomaly',
          districtId: 'west-district',
          districtName: 'West District',
          category: 'airQuality',
          detectedAgo: '1m ago',
          currentValue: 168,
          baselineValue: 44,
          factorAboveBaseline: 3.8,
          relatedSignals: [
            { icon: '🌫️', name: 'PM2.5', value: '168 µg/m³', category: 'airQuality' },
            { icon: '💨', name: 'Wind Vector', value: '2 km/h E', category: 'weather' }
          ],
          signalOverlap: 89,
          description: 'Stagnant wind vector trapped particulate emissions over West industrial sector.',
          detailedExplanation: 'Low wind speeds combined with thermal boundary layer prevented atmospheric dispersion.',
          mapCoordinates: [26.8912, 75.7512],
          severity: 'high'
        },
        newAlertTitle: '🚨 ANOMALY: 3.8× AQI Particulate Surge',
        aiSummary: 'CityPulse anomaly engine flagged a 3.8× AQI surge in West District.',
        aiWhyItMatters: 'Low wind speeds preventing smoke dispersion; health advisory active.'
      },
      {
        stepIndex: 3,
        title: 'City Pulse Score Drops to 60',
        description: 'Environmental degradation drops overall City Pulse score to 60.',
        districtId: 'west-district',
        districtName: 'West District',
        pulseDrop: 7,
        aiSummary: 'City Pulse score dropped to 60 / 100.',
        aiWhyItMatters: 'Public health advisory active; school outdoor activity restrictions recommended.'
      }
    ]
  },
  {
    id: 'power-outage',
    name: 'Power Outage',
    icon: '⚡',
    description: 'Simulates a high-voltage transformer breakdown causing grid blackout and signal dark zones.',
    districtId: 'west-district',
    districtName: 'West District',
    steps: [
      {
        stepIndex: 1,
        title: 'Substation Transformer Trip',
        description: 'Grid Substation B transformer 2 fails; 14 feeder sectors lose main utility power.',
        districtId: 'west-district',
        districtName: 'West District',
        pulseDrop: 6,
        metricsShift: { utilityLoadPct: 34 },
        newAlertTitle: '⚡ Grid Power Outage - Substation B Dark Zone',
        aiSummary: 'Substation B transformer failure caused utility blackout across 14 feeder sectors.',
        aiWhyItMatters: 'Traffic signals in 8 intersections switched to battery UPS backup.'
      },
      {
        stepIndex: 2,
        title: 'Intersection Traffic Signals Offline',
        description: 'UPS batteries depleting; 6 key intersections operating under manual traffic control.',
        districtId: 'west-district',
        districtName: 'West District',
        pulseDrop: 8,
        mapIncident: {
          id: 'demo-pow-inc-01',
          source: 'demo',
          type: 'utilities',
          title: 'Substation B Grid Blackout & Dark Signals',
          location: { lat: 26.8950, lng: 75.7600 },
          districtId: 'west-district',
          districtName: 'West District',
          severity: 'critical',
          timestamp: 'Just now',
          value: 34,
          baseline: 98,
          description: 'Power grid offline across West District; emergency generators active at hospital.'
        },
        newAlertTitle: '🚨 CRITICAL BLACKOUT & TRAFFIC SIGNAL FAILURE',
        aiSummary: 'Power grid blackout led to dark signals at 6 major West District intersections.',
        aiWhyItMatters: 'Manual traffic police officers dispatched; backup generators powering essential facilities.'
      },
      {
        stepIndex: 3,
        title: 'City Pulse Score Drops to 48',
        description: 'Utility outage and traffic grid risks reduce City Pulse score to 48.',
        districtId: 'west-district',
        districtName: 'West District',
        pulseDrop: 10,
        aiSummary: 'City Pulse score dropped to 48 / 100 under grid blackout conditions.',
        aiWhyItMatters: 'Utility response teams working on transformer bypass installation.'
      }
    ]
  },
  {
    id: 'civic-event',
    name: 'Major Civic Event',
    icon: '🚨',
    description: 'Simulates a massive stadium event generating road diversions and localized crowd surges.',
    districtId: 'central-district',
    districtName: 'Central District',
    steps: [
      {
        stepIndex: 1,
        title: 'Stadium Perimeter Gates Open',
        description: '45,000 spectators arriving for international championship match at City Stadium.',
        districtId: 'central-district',
        districtName: 'Central District',
        pulseDrop: 2,
        metricsShift: { trafficCongestionPct: 22 },
        newAlertTitle: '🚨 Civic Event Crowd & Traffic Surge - Stadium Zone',
        aiSummary: 'Major sports event at City Stadium generating high pedestrian and vehicle arrival volumes.',
        aiWhyItMatters: 'Stadium perimeter road diversions active; heavy transit station boarding.'
      },
      {
        stepIndex: 2,
        title: 'Road Closures & Transit Congestion',
        description: 'Stadium Way closed to non-event vehicles; Metro station queue times reach 12 minutes.',
        districtId: 'central-district',
        districtName: 'Central District',
        pulseDrop: 4,
        mapIncident: {
          id: 'demo-civic-inc-01',
          source: 'demo',
          type: 'incidents',
          title: 'Stadium Event Crowd Surge & Diversions',
          location: { lat: 26.9180, lng: 75.7920 },
          districtId: 'central-district',
          districtName: 'Central District',
          severity: 'medium',
          timestamp: 'Just now',
          value: 75,
          baseline: 20,
          description: 'Stadium Way closed for pedestrian safety; shuttle service operating continuously.'
        },
        newAlertTitle: '🚌 Event Shuttle Diversions Active',
        aiSummary: 'High pedestrian density around Stadium Way with managed traffic diversions.',
        aiWhyItMatters: 'Special event signal timing pattern running on surrounding arterials.'
      },
      {
        stepIndex: 3,
        title: 'City Pulse Adjusted to 66 (Managed Event Load)',
        description: 'City Pulse score stabilizes at 66 under planned civic event management.',
        districtId: 'central-district',
        districtName: 'Central District',
        pulseDrop: 4,
        aiSummary: 'City Pulse score adjusted to 66 / 100 during active stadium event window.',
        aiWhyItMatters: 'Event ops center maintaining real-time crowd flow supervision.'
      }
    ]
  },
  {
    id: 'water-contamination',
    name: 'Water Contamination',
    icon: '🚰',
    description: 'Simulates a chemical contamination anomaly in the municipal water supply.',
    districtId: 'south-district',
    districtName: 'South District',
    steps: [
      {
        stepIndex: 1,
        title: 'Sensor Detects pH Anomaly',
        description: 'Smart water grid sensor at South Reservoir detects sudden pH drop to 4.2.',
        districtId: 'south-district',
        districtName: 'South District',
        pulseDrop: 5,
        newAlertTitle: '🧪 Water Quality Anomaly - South Reservoir',
        aiSummary: 'Inline sensors detected severe pH anomaly in South Reservoir feed.',
        aiWhyItMatters: 'Potential chemical contamination could affect 150,000 households.'
      },
      {
        stepIndex: 2,
        title: 'Contamination Confirmed',
        description: 'Secondary sensors confirm heavy metal spike. Supply valves automatically shut off.',
        districtId: 'south-district',
        districtName: 'South District',
        pulseDrop: 15,
        mapIncident: {
          id: 'demo-water-inc-01',
          source: 'demo',
          type: 'utilities',
          title: 'Reservoir Contamination & Valve Shutoff',
          location: { lat: 26.8500, lng: 75.8000 },
          districtId: 'south-district',
          districtName: 'South District',
          severity: 'critical',
          timestamp: 'Just now',
          value: 100,
          baseline: 0,
          description: 'South Reservoir isolated from main grid to prevent spread.'
        },
        newAlertTitle: '🚨 CRITICAL: Water Supply Shutoff',
        aiSummary: 'South District water feed isolated due to confirmed contamination.',
        aiWhyItMatters: 'Emergency water tankers requested for affected residential zones.'
      },
      {
        stepIndex: 3,
        title: 'City Pulse Drops to 42',
        description: 'Critical utility failure drops City Pulse to emergency levels.',
        districtId: 'south-district',
        districtName: 'South District',
        pulseDrop: 8,
        aiSummary: 'City Pulse score dropped to 42 / 100 due to critical utility health risk.',
        aiWhyItMatters: 'Public health emergency declared in South District.'
      }
    ]
  },
  {
    id: 'cyber-attack',
    name: 'Cyber Attack',
    icon: '💻',
    description: 'Simulates a coordinated DDoS attack on municipal traffic light servers causing random failures.',
    districtId: 'central-district',
    districtName: 'Central District',
    steps: [
      {
        stepIndex: 1,
        title: 'DDoS Attack Detected',
        description: 'IT operations center flags 500Gbps traffic spike targeting Central Traffic API.',
        districtId: 'central-district',
        districtName: 'Central District',
        pulseDrop: 3,
        newAlertTitle: '💻 Traffic Server DDoS Attack Detected',
        aiSummary: 'Massive inbound traffic spike targeting municipal traffic control servers.',
        aiWhyItMatters: 'API latency increasing; risk of traffic light desynchronization.'
      },
      {
        stepIndex: 2,
        title: 'Traffic Grid Desynchronization',
        description: '25 intersections lose connection to central timing server, falling back to flashing red.',
        districtId: 'central-district',
        districtName: 'Central District',
        pulseDrop: 8,
        metricsShift: { trafficCongestionPct: 45 },
        mapIncident: {
          id: 'demo-cyber-inc-01',
          source: 'demo',
          type: 'traffic',
          title: 'Intersection Server Disconnect',
          location: { lat: 26.9150, lng: 75.7900 },
          districtId: 'central-district',
          districtName: 'Central District',
          severity: 'high',
          timestamp: 'Just now',
          value: 25,
          baseline: 0,
          description: '25 intersections operating on default safety flashing red.'
        },
        newAlertTitle: '🚨 WIDESPREAD TRAFFIC SIGNAL FAILURE',
        aiSummary: 'Cyber attack successfully disconnected 25 Central District traffic nodes.',
        aiWhyItMatters: 'Major arterial gridlock expected within 10 minutes.'
      },
      {
        stepIndex: 3,
        title: 'Anomaly: Congestion + API Failure',
        description: 'Engine correlates server packet loss with physical traffic gridlock.',
        districtId: 'central-district',
        districtName: 'Central District',
        pulseDrop: 5,
        anomalyItem: {
          id: 'demo-anom-cyber-01',
          source: 'demo',
          title: 'Cyber-Physical Cascade Event',
          districtId: 'central-district',
          districtName: 'Central District',
          category: 'traffic',
          detectedAgo: '1m ago',
          currentValue: 100,
          baselineValue: 0,
          factorAboveBaseline: 10,
          relatedSignals: [
            { icon: '💻', name: 'Server Latency', value: '5000ms', category: 'utilities' },
            { icon: '🚗', name: 'Congestion', value: '+45%', category: 'traffic' }
          ],
          signalOverlap: 95,
          description: 'Digital DDoS attack directly causing physical world gridlock in Central District.',
          detailedExplanation: 'Loss of central API heartbeat forced traffic controllers into failsafe mode, disrupting all green waves.',
          mapCoordinates: [26.9150, 75.7900],
          severity: 'critical'
        },
        newAlertTitle: '🚨 CYBER-PHYSICAL ANOMALY CONFIRMED',
        aiSummary: 'Digital server attack correlated with physical traffic breakdown.',
        aiWhyItMatters: 'Switching traffic API to redundant secure cloud nodes.'
      }
    ]
  }
];

export const getScenarioById = (id: DemoScenarioId): DemoScenarioDefinition => {
  return DEMO_SCENARIOS.find(s => s.id === id) || DEMO_SCENARIOS[0];
};
