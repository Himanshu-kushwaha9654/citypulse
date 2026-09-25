import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { DemoScenarioId, DemoScenarioStep, MapIncident, AnomalyItem, AlertItem } from '../types/citypulse';
import { DEMO_SCENARIOS, getScenarioById, DemoScenarioDefinition } from '../services/demoScenarioEngine';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { resolveCityDbId } from '../services/cityResolver';
import { signalTypeToDbEventType } from '../lib/eventType';
import { alertUiSeverityToDb } from '../lib/severity';

export type DemoSpeed = 1 | 2 | 5;

export interface DemoEngineContextType {
  demoEnabled: boolean;
  demoRunning: boolean;
  demoPaused: boolean;
  demoScenario: DemoScenarioId;
  demoSpeed: DemoSpeed;
  demoStep: number;
  totalSteps: number;
  demoElapsedTime: number;
  demoElapsedTimeFormatted: string;
  demoStartedAt: number | null;
  demoLastUpdate: number | null;
  currentScenario: DemoScenarioDefinition;
  currentStepData: DemoScenarioStep | null;

  // Actions
  startDemo: (scenarioId?: DemoScenarioId) => void;
  pauseDemo: () => void;
  resumeDemo: () => void;
  togglePauseDemo: () => void;
  resetDemo: () => void;
  setScenario: (id: DemoScenarioId) => void;
  setSpeed: (speed: DemoSpeed) => void;
  jumpToStep: (stepIndex: number) => void;

  // Registered state mutators from CityPulseContext
  demoIncidents: MapIncident[];
  demoAlerts: AlertItem[];
  demoAnomalies: AnomalyItem[];
  demoPulseScoreDrop: number;
  activeMetricShifts: {
    trafficCongestionPct?: number;
    aqiValue?: number;
    tempC?: number;
    humidityPct?: number;
    transitDelayMins?: number;
    utilityLoadPct?: number;
    incidentCountDelta?: number;
  };
}

const DemoEngineContext = createContext<DemoEngineContextType | undefined>(undefined);

export const DemoEngineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [demoEnabled, setDemoEnabled] = useState(false);
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoPaused, setDemoPaused] = useState(false);
  const [demoScenario, setDemoScenarioState] = useState<DemoScenarioId>('heavy-rain');
  const [demoSpeed, setDemoSpeedState] = useState<DemoSpeed>(1);
  const [demoStep, setDemoStep] = useState(0);
  const [demoElapsedTime, setDemoElapsedTime] = useState(0);
  const [demoStartedAt, setDemoStartedAt] = useState<number | null>(null);
  const [demoLastUpdate, setDemoLastUpdate] = useState<number | null>(null);

  // Active accumulated demo state
  const [demoIncidents, setDemoIncidents] = useState<MapIncident[]>([]);
  const [demoAlerts, setDemoAlerts] = useState<AlertItem[]>([]);
  const [demoAnomalies, setDemoAnomalies] = useState<AnomalyItem[]>([]);
  const [demoPulseScoreDrop, setDemoPulseScoreDrop] = useState(0);
  const [activeMetricShifts, setActiveMetricShifts] = useState<{
    trafficCongestionPct?: number;
    aqiValue?: number;
    tempC?: number;
    humidityPct?: number;
    transitDelayMins?: number;
    utilityLoadPct?: number;
    incidentCountDelta?: number;
  }>({});

  const currentScenario = getScenarioById(demoScenario);
  const totalSteps = currentScenario.steps.length;
  const currentStepData = currentScenario.steps[demoStep] || null;

  // Format seconds -> 01:24
  const demoElapsedTimeFormatted = React.useMemo(() => {
    const mins = Math.floor(demoElapsedTime / 60);
    const secs = demoElapsedTime % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [demoElapsedTime]);

  // Apply step payload into accumulated demo state
  const applyStepState = useCallback((scenario: DemoScenarioDefinition, stepIdx: number) => {
    let accumulatedDrop = 0;
    const accumulatedIncidents: MapIncident[] = [];
    const accumulatedAlerts: AlertItem[] = [];
    const accumulatedAnomalies: AnomalyItem[] = [];
    let accumulatedShifts = {};

    for (let i = 0; i <= stepIdx; i++) {
      const step = scenario.steps[i];
      if (!step) continue;
      accumulatedDrop += step.pulseDrop;

      if (step.metricsShift) {
        accumulatedShifts = { ...accumulatedShifts, ...step.metricsShift };
      }
      if (step.mapIncident) {
        accumulatedIncidents.push(step.mapIncident);
      }
      if (step.anomalyItem) {
        accumulatedAnomalies.push(step.anomalyItem);
      }
      if (step.alertItem) {
        accumulatedAlerts.push(step.alertItem);
      } else if (step.newAlertTitle) {
        accumulatedAlerts.push({
          id: `demo-alt-${step.districtId}-${step.stepIndex}`,
          source: 'demo',
          severity: 'critical',
          title: step.newAlertTitle,
          district: step.districtName || 'Central District',
          timeAgo: 'Just now',
          type: 'weather',
          message: step.description,
          read: false,
          affectedSignals: ['Traffic', 'Weather', 'Transit']
        });
      }
    }

    // If backend is connected, DO NOT accumulate local state (let Realtime subscriptions handle it)
    if (isSupabaseConfigured()) {
      setDemoPulseScoreDrop(0);
      setDemoIncidents([]);
      setDemoAlerts([]);
      setDemoAnomalies([]);
      setActiveMetricShifts({});
      setDemoLastUpdate(Date.now());

      if (scenario.steps[stepIdx]) {
        const currentStep = scenario.steps[stepIdx];

        // Direct insertion to DB (bypasses the ingest-telemetry Edge Function,
        // which requires an authenticated operator/admin call). The demo
        // engine always simulates Jaipur regardless of the selected city.
        (async () => {
          const cityId = await resolveCityDbId('jaipur');
          if (!cityId) {
            console.warn('Demo engine: could not resolve Jaipur city id, skipping DB writes.');
            return;
          }

          const inserts = [];

          if (currentStep.mapIncident) {
            inserts.push(supabase.from('civic_events').insert({
              city_id: cityId,
              type: signalTypeToDbEventType(currentStep.mapIncident.type) || 'incident',
              title: currentStep.mapIncident.title,
              description: currentStep.mapIncident.description,
              latitude: currentStep.mapIncident.location?.lat,
              longitude: currentStep.mapIncident.location?.lng,
              severity: currentStep.mapIncident.severity || 'medium',
              value: currentStep.mapIncident.value,
              source: 'demo_engine'
            }));
          }

          if (currentStep.anomalyItem) {
            inserts.push(supabase.from('anomalies').insert({
              city_id: cityId,
              metric_type: currentStep.anomalyItem.category,
              observed_value: currentStep.anomalyItem.currentValue,
              baseline_value: currentStep.anomalyItem.baselineValue,
              deviation: currentStep.anomalyItem.factorAboveBaseline,
              severity: currentStep.anomalyItem.severity || 'high',
              explanation: currentStep.anomalyItem.description,
              metadata: { relatedSignals: currentStep.anomalyItem.relatedSignals }
            }));
          }

          if (currentStep.alertItem) {
            inserts.push(supabase.from('alerts').insert({
              city_id: cityId,
              type: currentStep.alertItem.type || 'info',
              title: currentStep.alertItem.title,
              message: currentStep.alertItem.message,
              severity: alertUiSeverityToDb(currentStep.alertItem.severity || 'warning'),
              metric_type: currentStep.alertItem.type,
              acknowledged: false
            }));
          }

          if (currentStep.pulseDrop) {
            inserts.push(
              supabase.from('city_pulse').select('*').eq('city_id', cityId).order('calculated_at', { ascending: false }).limit(1).single()
                .then(({ data: currentPulse }) => {
                  const oldScore = currentPulse?.score || 82;
                  const newScore = Math.max(0, oldScore - currentStep.pulseDrop!);
                  return supabase.from('city_pulse').insert({
                    city_id: cityId,
                    score: newScore,
                    traffic_score: currentPulse?.traffic_score || 80,
                    environment_score: currentPulse?.environment_score || 75,
                    utilities_score: currentPulse?.utilities_score || 85,
                    safety_score: currentPulse?.safety_score || 78,
                    status: newScore < 60 ? 'warning' : 'stable'
                  });
                })
            );
          }

          if (currentStep.metricsShift) {
            const shift = currentStep.metricsShift;
            if (shift.trafficCongestionPct !== undefined) {
              inserts.push(supabase.from('metrics').insert({
                city_id: cityId, metric_type: 'traffic_flow', value: Math.max(0, 87 - shift.trafficCongestionPct), unit: '%', source: 'demo'
              }));
            }
            if (shift.aqiValue !== undefined) {
              inserts.push(supabase.from('metrics').insert({
                city_id: cityId, metric_type: 'aqi', value: shift.aqiValue, unit: 'AQI', source: 'demo'
              }));
            }
            if (shift.utilityLoadPct !== undefined) {
              inserts.push(supabase.from('metrics').insert({
                city_id: cityId, metric_type: 'energy_consumption', value: shift.utilityLoadPct > 10 ? (shift.utilityLoadPct / 10) : 2.4, unit: 'GW', source: 'demo'
              }));
            }
          }

          await Promise.all(inserts);
        })().catch(err => console.warn('Direct DB insertion failed:', err));
      }
    } else {
      setDemoPulseScoreDrop(accumulatedDrop);
      setDemoIncidents(accumulatedIncidents);
      setDemoAlerts(accumulatedAlerts);
      setDemoAnomalies(accumulatedAnomalies);
      setActiveMetricShifts(accumulatedShifts);
      setDemoLastUpdate(Date.now());
    }
  }, []);

  // Timer reference
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clockTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clear timers
  const clearTimers = useCallback(() => {
    if (stepTimerRef.current) {
      clearInterval(stepTimerRef.current);
      stepTimerRef.current = null;
    }
    if (clockTimerRef.current) {
      clearInterval(clockTimerRef.current);
      clockTimerRef.current = null;
    }
  }, []);

  // Reset demo
  const resetDemo = useCallback(() => {
    clearTimers();
    setDemoEnabled(false);
    setDemoRunning(false);
    setDemoPaused(false);
    setDemoStep(0);
    setDemoElapsedTime(0);
    setDemoStartedAt(null);
    setDemoLastUpdate(null);
    setDemoIncidents([]);
    setDemoAlerts([]);
    setDemoAnomalies([]);
    setDemoPulseScoreDrop(0);
    setActiveMetricShifts({});
  }, [clearTimers]);

  // Set scenario
  const setScenario = useCallback((id: DemoScenarioId) => {
    setDemoScenarioState(id);
    const newScenario = getScenarioById(id);
    setDemoStep(0);
    setDemoElapsedTime(0);
    if (demoRunning) {
      applyStepState(newScenario, 0);
    }
  }, [demoRunning, applyStepState]);

  // Set speed
  const setSpeed = useCallback((speed: DemoSpeed) => {
    setDemoSpeedState(speed);
  }, []);

  // Start demo
  const startDemo = useCallback((scenarioId?: DemoScenarioId) => {
    const scId = scenarioId || demoScenario;
    setDemoScenarioState(scId);
    const sc = getScenarioById(scId);

    setDemoEnabled(true);
    setDemoRunning(true);
    setDemoPaused(false);
    setDemoStep(0);
    setDemoElapsedTime(0);
    setDemoStartedAt(Date.now());

    applyStepState(sc, 0);
  }, [demoScenario, applyStepState]);

  // Pause demo
  const pauseDemo = useCallback(() => {
    setDemoPaused(true);
    setDemoRunning(false);
  }, []);

  // Resume demo
  const resumeDemo = useCallback(() => {
    setDemoEnabled(true);
    setDemoRunning(true);
    setDemoPaused(false);
  }, []);

  const togglePauseDemo = useCallback(() => {
    if (!demoEnabled) {
      startDemo();
    } else if (demoRunning) {
      pauseDemo();
    } else {
      resumeDemo();
    }
  }, [demoEnabled, demoRunning, startDemo, pauseDemo, resumeDemo]);

  // Jump to specific step
  const jumpToStep = useCallback((stepIdx: number) => {
    const sc = getScenarioById(demoScenario);
    const boundedIdx = Math.max(0, Math.min(stepIdx, sc.steps.length - 1));
    setDemoStep(boundedIdx);
    applyStepState(sc, boundedIdx);
  }, [demoScenario, applyStepState]);

  // Effect: Run Step Advancement & Clock Timers
  useEffect(() => {
    clearTimers();

    if (demoEnabled && demoRunning && !demoPaused) {
      // 1. Clock timer (ticks every 1s scaled by speed)
      const clockInterval = 1000 / demoSpeed;
      clockTimerRef.current = setInterval(() => {
        setDemoElapsedTime(prev => prev + 1);
      }, clockInterval);

      // 2. Step auto-advancement timer (6s per step base / demoSpeed)
      const stepInterval = 5000 / demoSpeed;
      stepTimerRef.current = setInterval(() => {
        setDemoStep(prevStep => {
          const sc = getScenarioById(demoScenario);
          if (prevStep < sc.steps.length - 1) {
            const nextStep = prevStep + 1;
            applyStepState(sc, nextStep);
            return nextStep;
          } else {
            // Reached last step - stay at last step, keep timer running
            return prevStep;
          }
        });
      }, stepInterval);
    }

    return () => {
      clearTimers();
    };
  }, [demoEnabled, demoRunning, demoPaused, demoScenario, demoSpeed, applyStepState, clearTimers]);

  return (
    <DemoEngineContext.Provider value={{
      demoEnabled,
      demoRunning,
      demoPaused,
      demoScenario,
      demoSpeed,
      demoStep,
      totalSteps,
      demoElapsedTime,
      demoElapsedTimeFormatted,
      demoStartedAt,
      demoLastUpdate,
      currentScenario,
      currentStepData,
      startDemo,
      pauseDemo,
      resumeDemo,
      togglePauseDemo,
      resetDemo,
      setScenario,
      setSpeed,
      jumpToStep,
      demoIncidents,
      demoAlerts,
      demoAnomalies,
      demoPulseScoreDrop,
      activeMetricShifts
    }}>
      {children}
    </DemoEngineContext.Provider>
  );
};

export const useDemoEngine = () => {
  const context = useContext(DemoEngineContext);
  if (!context) {
    throw new Error('useDemoEngine must be used within a DemoEngineProvider');
  }
  return context;
};
