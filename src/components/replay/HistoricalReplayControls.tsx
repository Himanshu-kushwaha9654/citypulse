import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Radio,
  Clock,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { useCityPulse } from '../../context/CityPulseContext';
import { REPLAY_STEPS } from '../../data/mockData';

export const HistoricalReplayControls: React.FC = () => {
  const {
    replayIndex,
    setReplayIndex,
    isPlayingReplay,
    setIsPlayingReplay,
    replaySpeed,
    setReplaySpeed,
    setIsReplayMode,
    currentReplayStep,
    pulseScore
  } = useCityPulse();

  const handleStepBack = () => {
    setReplayIndex(Math.max(0, replayIndex - 1));
  };

  const handleStepForward = () => {
    setReplayIndex(Math.min(REPLAY_STEPS.length - 1, replayIndex + 1));
  };

  return (
    <div className="w-full space-y-6">

      {/* Top Replay Mode Banner */}
      <div className="border border-amber-300 rounded-2xl p-6 shadow-sm bg-gradient-to-r from-amber-50 via-white to-white flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-amber-100 border border-amber-300 text-amber-700">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-[#1A2318] font-heading">Historical Replay Active</h2>
              <span className="px-2 py-0.5 rounded text-micro font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
                TIMELINE EMULATION
              </span>
            </div>
            <p className="text-xs text-[#4A5D44] font-medium mt-0.5">
              Simulating storm front and traffic incident cascade (12:00 PM – 02:00 PM)
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setIsPlayingReplay(false);
            setIsReplayMode(false);
          }}
          className="px-5 py-2.5 rounded-xl bg-[#5E7352] hover:bg-[#4D5F43] text-white font-bold text-xs shadow-sm transition flex items-center space-x-2 shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Return to Live Stream</span>
        </button>
      </div>

      {/* Interactive Timeline Player Card */}
      <div className="smart-card p-6 space-y-6">

        {/* Current Timestamp Display & Score */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-[#4B6B40]" />
            <div>
              <span className="text-xs font-mono text-[#5A6D53] uppercase font-semibold">Simulated Time</span>
              <div className="text-2xl font-extrabold text-[#1A2318] font-mono">{currentReplayStep.timeLabel}</div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono text-[#5A6D53] uppercase font-semibold">Replay Pulse Index</span>
            <div className="text-2xl font-extrabold text-[#4B6B40] font-heading">
              {pulseScore} <span className="text-xs font-normal text-[#5A6D53]">/ 100</span>
            </div>
          </div>
        </div>

        {/* Timeline Scrubber Line */}
        <div className="space-y-2">
          <div
            role="slider"
            aria-label="Replay timeline"
            aria-valuemin={0}
            aria-valuemax={REPLAY_STEPS.length - 1}
            aria-valuenow={replayIndex}
            tabIndex={0}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
              setReplayIndex(Math.round(ratio * (REPLAY_STEPS.length - 1)));
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') { e.preventDefault(); handleStepForward(); }
              if (e.key === 'ArrowLeft') { e.preventDefault(); handleStepBack(); }
            }}
            className="relative w-full h-3 bg-[#D2DEC9] rounded-full overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#5E7352]/40"
          >
            <div
              className="h-full bg-gradient-to-r from-[#5E7352] to-amber-500 rounded-full transition-all duration-300 pointer-events-none"
              style={{ width: `${(replayIndex / (REPLAY_STEPS.length - 1)) * 100}%` }}
            ></div>
          </div>

          {/* Timeline Time Mark Labels */}
          <div className="flex justify-between text-xs font-mono text-[#5A6D53]">
            {REPLAY_STEPS.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setReplayIndex(idx)}
                className={`transition ${idx === replayIndex ? 'text-[#4B6B40] font-bold underline' : 'hover:text-[#1A2318]'}`}
              >
                {step.timeLabel}
              </button>
            ))}
          </div>
        </div>

        {/* Player Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#E1EBE0]">

          {/* Play / Pause / Step Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleStepBack}
              disabled={replayIndex === 0}
              className="p-2.5 rounded-xl bg-[#F4F8F2] hover:bg-[#E4ECE0] border border-[#D2DEC9] disabled:opacity-40 text-[#1A2318] transition"
              title="Step Back"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlayingReplay(!isPlayingReplay)}
              className="px-5 py-2.5 rounded-xl bg-[#5E7352] hover:bg-[#4D5F43] text-white font-extrabold text-sm transition shadow-sm flex items-center space-x-2"
            >
              {isPlayingReplay ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isPlayingReplay ? 'Pause' : 'Play Replay'}</span>
            </button>

            <button
              onClick={handleStepForward}
              disabled={replayIndex === REPLAY_STEPS.length - 1}
              className="p-2.5 rounded-xl bg-[#F4F8F2] hover:bg-[#E4ECE0] border border-[#D2DEC9] disabled:opacity-40 text-[#1A2318] transition"
              title="Step Forward"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Speed Selectors (1x, 2x, 5x) */}
          <div className="flex items-center space-x-1.5 bg-[#F4F8F2] p-1 rounded-xl border border-[#D2DEC9]">
            <span className="text-micro font-mono text-[#5A6D53] px-2 font-bold uppercase">Speed</span>
            {[1, 2, 5].map(speed => (
              <button
                key={speed}
                onClick={() => setReplaySpeed(speed)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition ${replaySpeed === speed
                    ? 'bg-[#5E7352] text-white shadow'
                    : 'text-[#5A6D53] hover:text-[#1A2318] hover:bg-[#E4ECE0]'
                  }`}
              >
                {speed}x
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Event Timeline Breakdown */}
      <div className="smart-card p-6 space-y-4">
        <h3 className="text-base font-bold text-[#1A2318] font-heading flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-[#4B6B40]" />
          <span>Event Timeline Sequence</span>
        </h3>

        <div className="space-y-3">
          {REPLAY_STEPS.map((step, idx) => {
            const isCurrent = idx === replayIndex;
            const isPassed = idx <= replayIndex;

            return (
              <div
                key={idx}
                onClick={() => setReplayIndex(idx)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between ${isCurrent
                    ? 'bg-[#EAF2E6] border-[#8FAE86] text-[#1A2318] shadow-sm'
                    : isPassed
                      ? 'bg-[#F8FAF7] border-[#E1EBE0] text-[#4A5D44] opacity-90'
                      : 'bg-white border-[#EDF2EA] text-[#94A38C]'
                  }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${isCurrent ? 'bg-[#5E7352] text-white' : 'bg-[#E4ECE0] text-[#94A38C]'
                    }`}>
                    {isCurrent ? <Radio className="w-3 h-3 animate-ping" /> : <CheckCircle2 className="w-3 h-3" />}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 text-xs font-mono font-bold">
                      <span className={isCurrent ? 'text-[#4B6B40]' : 'text-[#5A6D53]'}>{step.timeLabel}</span>
                      <span>-</span>
                      <span className="text-[#1A2318]">{step.weather}</span>
                    </div>
                    <p className="text-xs text-[#4A5D44] mt-1">{step.description}</p>
                    {step.keyEvent && (
                      <div className="mt-2 inline-block px-2.5 py-1 rounded bg-amber-100 border border-amber-300 text-amber-800 text-micro font-mono font-semibold">
                        ⚡ {step.keyEvent}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right text-xs font-mono shrink-0">
                  <div className="font-bold text-[#1A2318]">Traffic Index: {step.trafficIndex}</div>
                  <div className="text-micro text-[#5A6D53]">{step.activeEventsCount} active events</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
