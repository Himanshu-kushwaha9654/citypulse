import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import {
  PageView,
  Neighborhood,
  MapIncident,
  AnomalyItem,
  AlertItem,
  DataSourceItem,
  ExplainModalData,
  AlertPreferences,
  SignalType,
  ReplayStep,
  AuthUser,
  DemoScenarioId,
  ToastMessage
} from '../types/citypulse';

import {
  INITIAL_PULSE_SCORE,
  INITIAL_SIGNAL_BREAKDOWN,
  INITIAL_NEIGHBORHOODS,
  INITIAL_MAP_INCIDENTS,
  ANOMALIES_DATA,
  INITIAL_ALERTS,
  INITIAL_DATA_SOURCES,
  REPLAY_STEPS,
  DEFAULT_ALERT_PREFERENCES
} from '../data/mockData';

import { City, DEFAULT_CITY as DEFAULT_CITY_CONFIG } from '../data/cities';
import { DEMO_SCENARIOS, getScenarioById } from '../services/demoScenarioEngine';
import { DemoEngineProvider, useDemoEngine, DemoSpeed } from './DemoEngineContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { fetchLatestMetrics, fetchDashboardMetrics } from '../services/metrics';
import { fetchRecentCivicEvents } from '../services/civicEvents';
import { fetchRecentAnomalies } from '../services/anomalies';
import { fetchActiveAlerts, acknowledgeAlertInDb } from '../services/alerts';
import { fetchCurrentCityPulse } from '../services/cityPulse';
import { fetchRecentInsights } from '../services/insights';
import { subscribeToCityRealtime, unsubscribeRealtime } from '../services/supabaseService';
import { resolveCityDbId } from '../services/cityResolver';
import { dbSeverityToAlertUi } from '../lib/severity';
import { getCurrentSession, fetchProfile, onAuthStateChange } from '../services/auth';

interface MapLayersState {
  traffic: boolean;
  incidents: boolean;
  weather: boolean;
  transit: boolean;
  airQuality: boolean;
  utilities: boolean;
  water: boolean;
  noise: boolean;
}

interface CityPulseContextType {
  activePage: PageView;
  setActivePage: (page: PageView) => void;
  pulseScore: number;
  setPulseScore: React.Dispatch<React.SetStateAction<number>>;
  signalBreakdown: typeof INITIAL_SIGNAL_BREAKDOWN;
  neighborhoods: Neighborhood[];
  selectedNeighborhood: Neighborhood | null;
  setSelectedNeighborhood: (n: Neighborhood | null) => void;
  mapIncidents: MapIncident[];
  anomalies: AnomalyItem[];
  alerts: AlertItem[];
  dataSources: DataSourceItem[];
  mapLayers: MapLayersState;
  toggleMapLayer: (layer: keyof MapLayersState) => void;
  explainModal: ExplainModalData | null;
  openExplainModal: (data: ExplainModalData) => void;
  closeExplainModal: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Simulation Controls & City Selector
  isSimulationPaused: boolean;
  setIsSimulationPaused: (paused: boolean) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  selectedCityConfig: City;
  setSelectedCityConfig: (city: City) => void;

  // Toast System
  toasts: ToastMessage[];
  showToast: (title: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;

  // Historical Replay State
  isReplayMode: boolean;
  setIsReplayMode: (active: boolean) => void;
  replayIndex: number;
  setReplayIndex: (index: number) => void;
  isPlayingReplay: boolean;
  setIsPlayingReplay: (playing: boolean) => void;
  replaySpeed: number;
  setReplaySpeed: (speed: number) => void;
  currentReplayStep: ReplayStep;

  // Alert preferences & actions
  alertPreferences: AlertPreferences;
  setAlertPreferences: React.Dispatch<React.SetStateAction<AlertPreferences>>;
  markAlertRead: (id: string) => void;
  markAllAlertsRead: () => void;

  // AI Modal & Suggestions
  isAiModalOpen: boolean;
  setIsAiModalOpen: (open: boolean) => void;
  aiSuggestedPrompt: string | null;
  setAiSuggestedPrompt: (prompt: string | null) => void;

  // Favorites & Auth
  favorites: string[];
  toggleFavoriteDistrict: (districtId: string) => void;
  user: AuthUser | null;
  setUser: (u: AuthUser | null) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // District Comparison
  isComparisonModalOpen: boolean;
  setIsComparisonModalOpen: (open: boolean) => void;

  // Demo Mode
  isDemoMode: boolean;
  setIsDemoMode: (active: boolean) => void;
  activeScenario: DemoScenarioId | null;
  setActiveScenario: (id: DemoScenarioId | null) => void;
  scenarioStepIndex: number;
  advanceDemoScenario: () => void;
  resetDemoScenario: () => void;

  // Helpers
  selectNeighborhoodById: (id: string) => void;
  focusMapOnIncident: (incidentId: string) => void;
  focusedCoordinates: [number, number] | null;
  setFocusedCoordinates: (coords: [number, number] | null) => void;
  lastUpdatedTime: string;
  dashboardMetrics: Record<string, any[]>;

  // RBAC: true for 'operator' and 'admin' roles. Mirrors the DB's RLS
  // write policies - used to disable/hide write controls in the UI
  // (the DB is still the real enforcement point).
  canManageBackend: boolean;
  isAdmin: boolean;
}

const CityPulseContext = createContext<CityPulseContextType | undefined>(undefined);

// Page views that are actually routable content ('ai' opens a modal via
// setIsAiModalOpen and never renders as a page — see MainContent in App.tsx).
const ROUTABLE_PAGES: PageView[] = [
  'overview', 'traffic', 'environment', 'utilities', 'public-safety',
  'analytics', 'map', 'anomalies', 'trends', 'replay', 'alerts', 'sources'
];

const CityPulseInnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const demoEngine = useDemoEngine();

  // The URL is the single source of truth for which page is active — this
  // is what makes browser back/forward, refresh, and shareable page links
  // work. (react-router-dom was already a dependency but was never wired
  // up; every page was previously plain in-memory state.)
  const location = useLocation();
  const navigate = useNavigate();
  const urlPage = location.pathname.slice(1) as PageView;
  const activePage: PageView = ROUTABLE_PAGES.includes(urlPage) ? urlPage : 'overview';
  const setActivePage = useCallback((page: PageView) => {
    if (ROUTABLE_PAGES.includes(page)) navigate(`/${page}`);
  }, [navigate]);
  const [pulseScoreState, setPulseScoreState] = useState(INITIAL_PULSE_SCORE);
  const [signalBreakdownState] = useState(INITIAL_SIGNAL_BREAKDOWN);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>(INITIAL_NEIGHBORHOODS);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<Neighborhood | null>(null);
  const [mapIncidentsState, setMapIncidentsState] = useState<MapIncident[]>(INITIAL_MAP_INCIDENTS);
  const [anomaliesState, setAnomaliesState] = useState<AnomalyItem[]>(ANOMALIES_DATA);
  const [alertsState, setAlertsState] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [dataSources, setDataSources] = useState<DataSourceItem[]>(INITIAL_DATA_SOURCES);
  const [dashboardMetrics, setDashboardMetrics] = useState<Record<string, any[]>>({});

  // Simulation Controls & City Selector
  const [isSimulationPaused, setIsSimulationPaused] = useState<boolean>(false);
  const [selectedCityConfig, setSelectedCityConfig] = useState<City>(DEFAULT_CITY_CONFIG);
  const selectedCity = selectedCityConfig.name;
  const setSelectedCity = (name: string) => { void name; };

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (title: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, title, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const [mapLayers, setMapLayers] = useState<MapLayersState>({
    traffic: true,
    incidents: true,
    weather: true,
    transit: true,
    airQuality: true,
    utilities: true,
    water: true,
    noise: true
  });

  const [explainModal, setExplainModal] = useState<ExplainModalData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedCoordinates, setFocusedCoordinates] = useState<[number, number] | null>(null);
  const [lastUpdatedTime, setLastUpdatedTime] = useState('8 seconds ago');

  // AI Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiSuggestedPrompt, setAiSuggestedPrompt] = useState<string | null>(null);

  // Historical Replay State
  const [isReplayMode, setIsReplayMode] = useState(false);
  const [replayIndex, setReplayIndex] = useState(0);
  const [isPlayingReplay, setIsPlayingReplay] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState(1);

  // Alert preferences
  const [alertPreferences, setAlertPreferences] = useState<AlertPreferences>(DEFAULT_ALERT_PREFERENCES);

  // Favorites & Auth
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('citypulse_favorites');
      return saved ? JSON.parse(saved) : ['central-district', 'north-district', 'tech-corridor'];
    } catch {
      return ['central-district', 'north-district', 'tech-corridor'];
    }
  });

  // Signed-out by default when the backend is live (the real session
  // loads asynchronously below). When Supabase isn't configured at all,
  // fall back to a mock operator so the offline/demo build still has an
  // identity to display.
  const [user, setUser] = useState<AuthUser | null>(() =>
    isSupabaseConfigured()
      ? null
      : {
        id: 'usr-101',
        email: 'chief.dispatcher@citypulse.gov',
        role: 'operator',
        favoriteDistricts: []
      }
  );

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  // -------------------------------------------------------------
  // SUPABASE AUTH SESSION (real accounts + role from public.profiles)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let isMounted = true;

    async function loadUserFromSession(session: Session | null) {
      if (!session?.user) {
        if (isMounted) setUser(null);
        return;
      }
      const profile = await fetchProfile(session.user.id);
      if (!isMounted) return;
      setUser({
        id: session.user.id,
        email: session.user.email || profile?.email || '',
        role: profile?.role || 'viewer',
        favoriteDistricts: []
      });
    }

    getCurrentSession().then(loadUserFromSession);
    const subscription = onAuthStateChange((session) => {
      loadUserFromSession(session);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // -------------------------------------------------------------
  // SUPABASE REALTIME & BACKEND DATA FETCHING
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let isMounted = true;
    let subscriptions: ReturnType<typeof subscribeToCityRealtime> = {};

    async function loadBackendData(cityId: string) {
      try {
        const [pulseData, dbAlerts, dbAnomalies, dbEvents, dbMetrics] = await Promise.all([
          fetchCurrentCityPulse(cityId),
          fetchActiveAlerts(cityId),
          fetchRecentAnomalies(cityId),
          fetchRecentCivicEvents(cityId, 50),
          fetchDashboardMetrics(cityId)
        ]);

        if (!isMounted) return;

        if (pulseData) {
          setPulseScoreState(pulseData.score);
        }

        if (dbAlerts && dbAlerts.length > 0) {
          const mapped: AlertItem[] = dbAlerts.map(a => ({
            id: a.id,
            source: 'live',
            severity: dbSeverityToAlertUi(a.severity),
            title: a.title,
            district: selectedCityConfig.name,
            timeAgo: 'Recently',
            type: (a.type as SignalType) || 'traffic',
            message: a.message,
            read: a.acknowledged
          }));
          setAlertsState(mapped);
        }

        if (dbAnomalies && dbAnomalies.length > 0) {
          const mappedAnoms: AnomalyItem[] = dbAnomalies.map(a => ({
            id: a.id,
            source: 'live',
            title: `Detected Anomaly in ${a.metric_type}`,
            districtId: 'central-district',
            districtName: selectedCityConfig.name,
            category: (a.metric_type as any) || 'traffic',
            detectedAgo: 'Recently',
            currentValue: a.observed_value,
            baselineValue: a.baseline_value,
            factorAboveBaseline: a.deviation,
            relatedSignals: (a.metadata as any)?.relatedSignals || [],
            signalOverlap: 80,
            description: a.explanation || 'Anomaly detected',
            detailedExplanation: 'Backend triggered anomaly via CityPulse Engine.',
            severity: a.severity,
            mapCoordinates: (a.metadata?.mapCoordinates || [26.9124, 75.7873]) as [number, number]
          }));
          setAnomaliesState(mappedAnoms);
        }

        if (dbEvents && dbEvents.length > 0) {
          const mappedEvents: MapIncident[] = dbEvents.map(e => ({
            id: e.id,
            source: 'live',
            type: e.type as any,
            title: e.title,
            location: { lat: e.latitude || 26.9124, lng: e.longitude || 75.7873 },
            districtId: 'central-district',
            districtName: selectedCityConfig.name,
            severity: e.severity,
            timestamp: 'Recently',
            value: e.value || 0,
            baseline: 0,
            description: e.description
          }));
          setMapIncidentsState(mappedEvents);
        }

        if (dbMetrics) {
          setDashboardMetrics(dbMetrics);
        }

        setLastUpdatedTime('Just now (Supabase Live)');
      } catch (err) {
        console.warn('Failed loading Supabase data:', err);
      }
    }

    async function init() {
      const cityId = await resolveCityDbId(selectedCityConfig.id);
      if (!cityId) {
        console.warn(`No backend city found for slug "${selectedCityConfig.id}"; showing local/demo data only.`);
        return;
      }
      if (!isMounted) return;

      await loadBackendData(cityId);
      if (!isMounted) return;

      // Subscribe to Realtime inserts/updates
      subscriptions = subscribeToCityRealtime(cityId, {
        onMetricInsert: (newMetric) => {
          if (newMetric) {
            setDashboardMetrics(prev => {
              const type = newMetric.metric_type;
              const existing = prev[type] || [];
              return { ...prev, [type]: [newMetric, ...existing].slice(0, 50) };
            });
          }
        },
        onPulseUpdate: (newPulse) => {
          if (newPulse && newPulse.score) {
            setPulseScoreState(newPulse.score);
            setLastUpdatedTime('Just now (Realtime update)');
          }
        },
        onAlertInsert: (newAlert) => {
          if (newAlert) {
            const alertItem: AlertItem = {
              id: newAlert.id,
              source: 'live',
              severity: dbSeverityToAlertUi(newAlert.severity),
              title: newAlert.title,
              district: selectedCityConfig.name,
              timeAgo: 'Just now',
              type: (newAlert.type as SignalType) || 'traffic',
              message: newAlert.message,
              read: false
            };
            setAlertsState(prev => [alertItem, ...prev]);
            showToast(`New Alert: ${newAlert.title}`, 'warning');
          }
        },
        onEventInsert: (newEvent) => {
          if (newEvent) {
            const mapInc: MapIncident = {
              id: newEvent.id,
              source: 'live',
              type: newEvent.type as any,
              title: newEvent.title,
              location: { lat: newEvent.latitude || 26.9124, lng: newEvent.longitude || 75.7873 },
              districtId: 'central-district',
              districtName: selectedCityConfig.name,
              severity: newEvent.severity,
              timestamp: 'Just now',
              value: newEvent.value || 0,
              baseline: 0,
              description: newEvent.description
            };
            setMapIncidentsState(prev => [mapInc, ...prev]);
          }
        },
        onAnomalyInsert: (newAnom) => {
          if (newAnom) {
            const anomItem: AnomalyItem = {
              id: newAnom.id,
              source: 'live',
              title: `Detected Anomaly in ${newAnom.metric_type}`,
              districtId: 'central-district',
              districtName: selectedCityConfig.name,
              category: (newAnom.metric_type as any) || 'traffic',
              detectedAgo: 'Just now',
              currentValue: newAnom.observed_value,
              baselineValue: newAnom.baseline_value,
              factorAboveBaseline: newAnom.deviation,
              relatedSignals: (newAnom.metadata as any)?.relatedSignals || [],
              signalOverlap: 80,
              description: newAnom.explanation || 'Anomaly detected',
              detailedExplanation: 'Backend triggered anomaly via CityPulse Engine.',
              severity: newAnom.severity,
              mapCoordinates: (newAnom.metadata?.mapCoordinates || [26.9124, 75.7873]) as [number, number]
            };
            setAnomaliesState(prev => [anomItem, ...prev]);
            showToast(`New Anomaly Detected!`, 'error');
          }
        }
      });
    }

    init();

    return () => {
      isMounted = false;
      unsubscribeRealtime(subscriptions);
    };
  }, [selectedCityConfig]);

  // -------------------------------------------------------------
  // DYNAMIC COMPOSITED DEMO STATE
  // -------------------------------------------------------------
  const effectivePulseScore = useMemo(() => {
    if (demoEngine.demoEnabled) {
      return Math.max(35, INITIAL_PULSE_SCORE - demoEngine.demoPulseScoreDrop);
    }
    return pulseScoreState;
  }, [demoEngine.demoEnabled, demoEngine.demoPulseScoreDrop, pulseScoreState]);

  const effectiveAlerts = useMemo(() => {
    if (demoEngine.demoEnabled && demoEngine.demoAlerts.length > 0) {
      return [...demoEngine.demoAlerts, ...alertsState];
    }
    return alertsState;
  }, [demoEngine.demoEnabled, demoEngine.demoAlerts, alertsState]);

  const effectiveMapIncidents = useMemo(() => {
    if (demoEngine.demoEnabled && demoEngine.demoIncidents.length > 0) {
      return [...demoEngine.demoIncidents, ...mapIncidentsState];
    }
    return mapIncidentsState;
  }, [demoEngine.demoEnabled, demoEngine.demoIncidents, mapIncidentsState]);

  const effectiveAnomalies = useMemo(() => {
    if (demoEngine.demoEnabled && demoEngine.demoAnomalies.length > 0) {
      return [...demoEngine.demoAnomalies, ...anomaliesState];
    }
    return anomaliesState;
  }, [demoEngine.demoEnabled, demoEngine.demoAnomalies, anomaliesState]);

  const effectiveSignalBreakdown = useMemo(() => {
    if (!demoEngine.demoEnabled) return signalBreakdownState;
    const shifts = demoEngine.activeMetricShifts;
    return signalBreakdownState.map(sig => {
      if (sig.key === 'traffic' && shifts.trafficCongestionPct) {
        return {
          ...sig,
          score: Math.max(25, sig.score - Math.round(shifts.trafficCongestionPct * 0.7)),
          valueDisplay: `+${shifts.trafficCongestionPct}%`,
          trend: `+${shifts.trafficCongestionPct}% surge`
        };
      }
      if (sig.key === 'weather' && (shifts.tempC || shifts.humidityPct)) {
        return {
          ...sig,
          score: Math.max(40, sig.score - 15),
          valueDisplay: `${shifts.tempC || 22}°C / ${shifts.humidityPct || 90}%`
        };
      }
      if (sig.key === 'airQuality' && shifts.aqiValue) {
        return {
          ...sig,
          score: Math.max(30, 100 - Math.round(shifts.aqiValue * 0.4)),
          valueDisplay: `${shifts.aqiValue} AQI`
        };
      }
      if (sig.key === 'transit' && shifts.transitDelayMins) {
        return {
          ...sig,
          score: Math.max(30, sig.score - shifts.transitDelayMins * 1.5),
          valueDisplay: `+${shifts.transitDelayMins}m delay`
        };
      }
      if (sig.key === 'utilities' && shifts.utilityLoadPct) {
        return {
          ...sig,
          score: Math.max(30, Math.round(shifts.utilityLoadPct)),
          valueDisplay: `${shifts.utilityLoadPct}% load`
        };
      }
      return sig;
    });
  }, [signalBreakdownState, demoEngine.demoEnabled, demoEngine.activeMetricShifts]);

  // Actions
  const toggleMapLayer = (layer: keyof MapLayersState) => {
    setMapLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const openExplainModal = (data: ExplainModalData) => {
    setExplainModal(data);
  };

  const closeExplainModal = () => {
    setExplainModal(null);
  };

  const markAlertRead = (id: string) => {
    setAlertsState(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
    acknowledgeAlertInDb(id);
    showToast('Alert marked as read', 'info');
  };

  const markAllAlertsRead = () => {
    setAlertsState(prev => prev.map(a => ({ ...a, read: true })));
    showToast('All alerts marked as read', 'success');
  };

  const toggleFavoriteDistrict = (districtId: string) => {
    setFavorites(prev => {
      const next = prev.includes(districtId) ? prev.filter(id => id !== districtId) : [...prev, districtId];
      try {
        localStorage.setItem('citypulse_favorites', JSON.stringify(next));
      } catch { }
      return next;
    });
    showToast('Favorites list updated', 'info');
  };

  const selectNeighborhoodById = (id: string) => {
    const found = neighborhoods.find(n => n.id === id);
    if (found) {
      setSelectedNeighborhood(found);
      setFocusedCoordinates(found.center);
    }
  };

  const focusMapOnIncident = (incidentId: string) => {
    const inc = effectiveMapIncidents.find(i => i.id === incidentId);
    if (inc) {
      setFocusedCoordinates([inc.location.lat, inc.location.lng]);
      setActivePage('map');
    }
  };

  const currentReplayStep = REPLAY_STEPS[replayIndex];

  return (
    <CityPulseContext.Provider value={{
      activePage,
      setActivePage,
      pulseScore: isReplayMode ? currentReplayStep.pulseScore : effectivePulseScore,
      setPulseScore: setPulseScoreState,
      signalBreakdown: effectiveSignalBreakdown,
      neighborhoods,
      selectedNeighborhood,
      setSelectedNeighborhood,
      mapIncidents: effectiveMapIncidents,
      anomalies: effectiveAnomalies,
      alerts: effectiveAlerts,
      dataSources,
      mapLayers,
      toggleMapLayer,
      explainModal,
      openExplainModal,
      closeExplainModal,
      searchQuery,
      setSearchQuery,
      isSimulationPaused: demoEngine.demoPaused || isSimulationPaused,
      setIsSimulationPaused: (paused) => {
        setIsSimulationPaused(paused);
        if (demoEngine.demoEnabled) {
          if (paused) demoEngine.pauseDemo();
          else demoEngine.resumeDemo();
        }
      },
      selectedCity,
      setSelectedCity,
      selectedCityConfig,
      setSelectedCityConfig,
      toasts,
      showToast,
      dismissToast,
      isReplayMode,
      setIsReplayMode,
      replayIndex,
      setReplayIndex,
      isPlayingReplay,
      setIsPlayingReplay,
      replaySpeed,
      setReplaySpeed,
      currentReplayStep,
      alertPreferences,
      setAlertPreferences,
      markAlertRead,
      markAllAlertsRead,
      isAiModalOpen,
      setIsAiModalOpen,
      aiSuggestedPrompt,
      setAiSuggestedPrompt,
      favorites,
      toggleFavoriteDistrict,
      user,
      setUser,
      isAuthModalOpen,
      setIsAuthModalOpen,
      isComparisonModalOpen,
      setIsComparisonModalOpen,

      // Single-source Demo Engine mappings
      isDemoMode: demoEngine.demoEnabled,
      setIsDemoMode: (active) => {
        if (active) demoEngine.startDemo();
        else demoEngine.resetDemo();
      },
      activeScenario: demoEngine.demoScenario,
      setActiveScenario: (id) => {
        if (id) demoEngine.setScenario(id);
      },
      scenarioStepIndex: demoEngine.demoStep,
      advanceDemoScenario: () => {
        demoEngine.jumpToStep(demoEngine.demoStep + 1);
      },
      resetDemoScenario: () => {
        demoEngine.resetDemo();
      },

      selectNeighborhoodById,
      focusMapOnIncident,
      focusedCoordinates,
      setFocusedCoordinates,
      lastUpdatedTime,
      dashboardMetrics,
      canManageBackend: user?.role === 'operator' || user?.role === 'admin',
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </CityPulseContext.Provider>
  );
};

export const CityPulseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <DemoEngineProvider>
      <CityPulseInnerProvider>
        {children}
      </CityPulseInnerProvider>
    </DemoEngineProvider>
  );
};

export const useCityPulse = () => {
  const context = useContext(CityPulseContext);
  if (!context) {
    throw new Error('useCityPulse must be used within a CityPulseProvider');
  }
  return context;
};
