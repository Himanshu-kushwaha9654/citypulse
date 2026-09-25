import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronDown, 
  FastForward, 
  Activity,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { useDemoEngine, DemoSpeed } from '../../context/DemoEngineContext';
import { DEMO_SCENARIOS } from '../../services/demoScenarioEngine';
import { DemoScenarioId } from '../../types/citypulse';

export const DemoBar: React.FC = () => {
  const {
    demoEnabled,
    demoRunning,
    demoPaused,
    demoScenario,
    demoSpeed,
    demoStep,
    totalSteps,
    demoElapsedTimeFormatted,
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
    activeMetricShifts
  } = useDemoEngine();

  const [showScenarioDropdown, setShowScenarioDropdown] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowScenarioDropdown(false);
      }
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format progress percentage
  const progressPct = Math.round(((demoStep + 1) / totalSteps) * 100);

  // Status Badge Label & Colors
  const statusInfo = React.useMemo(() => {
    if (!demoEnabled) {
      return {
        label: 'SIMULATION READY',
        dotColor: 'bg-emerald-600',
        glowClass: 'border-[#D2DEC9] bg-white',
        btnText: '▶ DEMO',
        btnBg: 'bg-white text-[#2A3B24] border-[#D2DEC9] hover:bg-[#EFF4EC]'
      };
    }
    if (demoRunning) {
      return {
        label: 'SIMULATION RUNNING',
        dotColor: 'bg-emerald-500 animate-pulse',
        glowClass: 'border-emerald-500/60 shadow-[0_0_12px_rgba(75,107,64,0.25)] bg-[#F4F8F2]',
        btnText: '⏸ DEMO ACTIVE',
        btnBg: 'bg-[#4B6B40] text-white font-bold shadow-xs hover:bg-[#3D5A33]'
      };
    }
    return {
      label: 'SIMULATION PAUSED',
      dotColor: 'bg-amber-500',
      glowClass: 'border-amber-400/70 bg-amber-50/60 shadow-xs',
      btnText: '▶ DEMO PAUSED',
      btnBg: 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
    };
  }, [demoEnabled, demoRunning]);

  return (
    <div className="relative w-full">
      
      {/* ============================================================ */}
      {/* 1. COMPACT PREMIUM HEADER DEMO BAR (DESKTOP / TABLET)       */}
      {/* ============================================================ */}
      <div 
        onClick={() => setShowPopover(prev => !prev)}
        className={`w-full h-11 px-3 sm:px-4 rounded-2xl border backdrop-blur-xl transition-all duration-200 flex items-center justify-between text-xs font-sans text-[#1A2318] cursor-pointer ${statusInfo.glowClass}`}
      >
        
        {/* Left Section: Main Play / Pause Button & Scenario Selector */}
        <div className="flex items-center space-x-2.5">
          
          {/* Main Action Toggle Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePauseDemo();
            }}
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center space-x-1.5 transition-all duration-150 shrink-0 ${statusInfo.btnBg}`}
          >
            {demoRunning ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span className="tracking-wide">{statusInfo.btnText}</span>
          </button>

          <span className="text-[#D2DEC9] hidden sm:inline">│</span>

          {/* Scenario Selector Dropdown */}
          <div className="relative shrink-0" ref={dropdownRef} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowScenarioDropdown(!showScenarioDropdown)}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-white/80 border border-[#D2DEC9] text-[#1A2318] hover:border-[#4B6B40] font-medium transition"
            >
              <span className="text-sm">{currentScenario.icon}</span>
              <span className="font-semibold max-w-[130px] sm:max-w-[180px] truncate">
                {currentScenario.name}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#5A6D53] transition-transform ${showScenarioDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Scenario Dropdown Menu */}
            {showScenarioDropdown && (
              <div className="absolute top-full left-0 mt-1.5 w-64 bg-white border border-[#D2DEC9] rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-[#EBF1E8] animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3.5 py-2 bg-[#F4F8F2] text-micro font-mono uppercase tracking-wider text-[#4B6B40] font-bold">
                  Select Civic Scenario
                </div>
                <div className="max-h-64 overflow-y-auto py-1">
                  {DEMO_SCENARIOS.map(scenario => {
                    const isSelected = scenario.id === demoScenario;
                    return (
                      <button
                        key={scenario.id}
                        onClick={() => {
                          setScenario(scenario.id as DemoScenarioId);
                          setShowScenarioDropdown(false);
                          if (!demoEnabled) startDemo(scenario.id as DemoScenarioId);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition ${
                          isSelected ? 'bg-[#EFF4EC] text-[#4B6B40] font-bold' : 'hover:bg-[#F8FAF7] text-[#2D3B28]'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <span className="text-base">{scenario.icon}</span>
                          <span className="truncate">{scenario.name}</span>
                        </div>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#4B6B40]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <span className="text-[#D2DEC9] hidden md:inline">│</span>

          {/* Speed Selector (1x, 2x, 5x) */}
          <div className="hidden md:flex items-center space-x-1 bg-[#EFF4EC] p-0.5 rounded-full border border-[#D2DEC9] shrink-0" onClick={(e) => e.stopPropagation()}>
            {([1, 2, 5] as DemoSpeed[]).map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-0.5 text-micro font-mono font-bold rounded-full transition ${
                  demoSpeed === s
                    ? 'bg-[#4B6B40] text-white shadow-xs'
                    : 'text-[#4A5D44] hover:text-[#1A2318]'
                }`}
              >
                {s}×
              </button>
            ))}
          </div>

        </div>

        {/* Center / Right Section: Live Telemetry Metrics & Progress Pipeline */}
        <div className="flex items-center space-x-3 shrink-0">
          
          {/* Active Metric Highlight Pill (when running) */}
          {demoEnabled && currentStepData && (
            <div className="hidden lg:flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-[#EAF2E7] border border-[#C6DAC1] text-micro font-mono text-[#2E4527]">
              <Activity className="w-3 h-3 text-[#4B6B40] animate-pulse" />
              <span className="font-bold truncate max-w-[150px]">
                {currentStepData.title}
              </span>
              {activeMetricShifts.trafficCongestionPct && (
                <span className="text-emerald-700 font-bold ml-1">
                  +{activeMetricShifts.trafficCongestionPct}% Traffic
                </span>
              )}
            </div>
          )}

          {/* Timer Clock */}
          <div className="hidden sm:flex items-center space-x-1.5 font-mono text-xs font-semibold text-[#3D5034]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4B6B40]" />
            <span>{demoElapsedTimeFormatted}</span>
          </div>

          <span className="text-[#D2DEC9] hidden sm:inline">│</span>

          {/* Compact Timeline Progress Dots */}
          <div className="hidden xl:flex items-center space-x-1">
            {currentScenario.steps.map((st, idx) => {
              const isPast = idx <= demoStep;
              const isCurrent = idx === demoStep && demoRunning;
              return (
                <button
                  key={st.stepIndex}
                  onClick={() => jumpToStep(idx)}
                  title={`Step ${idx + 1}: ${st.title}`}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    isCurrent 
                      ? 'bg-[#4B6B40] scale-125 shadow-xs ring-2 ring-[#4B6B40]/30' 
                      : isPast 
                        ? 'bg-[#4B6B40]' 
                        : 'bg-[#D2DEC9]'
                  }`}
                />
              );
            })}
          </div>

          {/* Simulation Status Badge */}
          <div className="flex items-center space-x-1.5 text-micro font-mono font-bold text-[#3D5A33]">
            <span className={`w-2 h-2 rounded-full ${statusInfo.dotColor}`} />
            <span className="hidden sm:inline">{statusInfo.label}</span>
          </div>

          {/* Reset Button */}
          {demoEnabled && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetDemo();
              }}
              className="p-1 rounded-full text-[#4A5D44] hover:text-red-700 hover:bg-red-50 transition"
              title="Reset Demo Simulation to Baseline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* More / Details Popover Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowPopover(!showPopover);
            }}
            className="p-1 rounded-full text-[#4A5D44] hover:text-[#1A2318] hover:bg-[#EFF4EC] transition"
            title="Open Demo Details & Pipeline Controls"
          >
            <Info className="w-4 h-4 text-[#4B6B40]" />
          </button>

        </div>

      </div>

      {/* ============================================================ */}
      {/* 2. DEMO DETAILS POPOVER DIALOG                               */}
      {/* ============================================================ */}
      {showPopover && (
        <div 
          ref={popoverRef}
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-[#D2DEC9] rounded-3xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200 text-xs font-sans text-[#1A2318]"
        >
          {/* Popover Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#EBF1E8]">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-[#4B6B40] text-white flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h4 className="font-heading font-bold text-sm text-[#1A2318]">CITYPULSE DEMO ENGINE</h4>
            </div>
            <span className="text-micro font-mono px-2 py-0.5 rounded-full bg-[#EFF4EC] text-[#4B6B40] font-bold">
              v2.4 REALTIME
            </span>
          </div>

          {/* Status Section */}
          <div className="py-3 space-y-3 border-b border-[#EBF1E8]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#5A6D53] font-medium">Status</span>
              <span className="font-mono font-bold flex items-center space-x-1.5 text-[#2D4226]">
                <span className={`w-2 h-2 rounded-full ${statusInfo.dotColor}`} />
                <span>{statusInfo.label}</span>
              </span>
            </div>

            {/* Scenario Picker */}
            <div className="space-y-1">
              <label className="text-[#5A6D53] font-medium block">Active Scenario</label>
              <select
                value={demoScenario}
                onChange={(e) => {
                  setScenario(e.target.value as DemoScenarioId);
                  if (!demoEnabled) startDemo(e.target.value as DemoScenarioId);
                }}
                className="w-full px-3 py-1.5 rounded-xl bg-[#F8FAF7] border border-[#D2DEC9] text-xs font-semibold text-[#1A2318] focus:outline-none focus:border-[#4B6B40]"
              >
                {DEMO_SCENARIOS.map(sc => (
                  <option key={sc.id} value={sc.id}>
                    {sc.icon} {sc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Speed Control */}
            <div className="flex items-center justify-between">
              <span className="text-[#5A6D53] font-medium">Simulation Speed</span>
              <div className="flex items-center space-x-1 bg-[#EFF4EC] p-0.5 rounded-full border border-[#D2DEC9]">
                {([1, 2, 5] as DemoSpeed[]).map(s => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`px-3 py-1 text-xs font-mono font-bold rounded-full transition ${
                      demoSpeed === s
                        ? 'bg-[#4B6B40] text-white shadow-xs'
                        : 'text-[#4A5D44] hover:text-[#1A2318]'
                    }`}
                  >
                    {s}×
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pipeline Progress Section */}
          <div className="py-3 space-y-2 border-b border-[#EBF1E8]">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="font-bold text-[#1A2318]">
                Step {demoStep + 1} / {totalSteps}
              </span>
              <span className="text-[#4B6B40] font-bold">{progressPct}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-[#EBF1E8] overflow-hidden">
              <div 
                className="h-full bg-[#4B6B40] transition-all duration-300 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Current Step Description */}
            {currentStepData && (
              <div className="p-2.5 rounded-xl bg-[#F4F8F2] border border-[#D6E3CE] space-y-1">
                <span className="font-bold text-[#2A3B24] block">
                  {currentStepData.title}
                </span>
                <p className="text-micro text-[#4A5D44] leading-relaxed">
                  {currentStepData.description}
                </p>
              </div>
            )}
          </div>

          {/* Controls Actions Footer */}
          <div className="pt-3 flex items-center space-x-2">
            <button
              onClick={togglePauseDemo}
              className="flex-1 py-2 rounded-xl bg-[#4B6B40] text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm hover:bg-[#3D5A33] transition"
            >
              {demoRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{demoEnabled ? 'Resume' : 'Start Simulation'}</span>
                </>
              )}
            </button>

            <button
              onClick={resetDemo}
              className="px-4 py-2 rounded-xl bg-white border border-[#D2DEC9] text-[#4A5D44] font-semibold text-xs hover:bg-[#EFF4EC] hover:text-red-700 transition"
            >
              Reset
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
