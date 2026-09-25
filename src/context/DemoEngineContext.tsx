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

    // The Demo Engine always accumulates state locally to avoid 401 Unauthorized
    // RLS errors during hackathon submission without Auth implemented.
    setDemoPulseScoreDrop(accumulatedDrop);
    setDemoIncidents(accumulatedIncidents);
    setDemoAlerts(accumulatedAlerts);
    setDemoAnomalies(accumulatedAnomalies);
    setActiveMetricShifts(accumulatedShifts);
    setDemoLastUpdate(Date.now());
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
