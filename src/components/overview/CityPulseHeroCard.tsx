import React from 'react';
import { CircularGauge } from '../common/CircularGauge';
import { useCityPulse } from '../../context/CityPulseContext';
import { Info } from 'lucide-react';

export const CityPulseHeroCard: React.FC = () => {
  const { pulseScore, signalBreakdown, openExplainModal } = useCityPulse();

  return (
    <div className="smart-card card-glow-healthy relative w-full p-6 sm:p-8 overflow-hidden">

      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#5E7352]/8 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">

        {/* Left Side: Score & Radial Gauge */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left space-y-4">
          <div className="flex items-center space-x-3">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-[#4B6B40] font-mono">
              CITY PULSE INDEX
            </h2>
            <button
              onClick={() => openExplainModal({
                title: "What is the City Pulse Index?",
                summary: "The City Pulse Index is a real-time composite health score between 0 and 100 synthesized from traffic, weather, air quality, transit, emergency incidents, and grid load.",
                detailedPoints: [
                  "Scores above 75 indicate optimal civic flow with minimal delays or disruptions.",
                  "Scores between 55 and 74 flag moderate congestion, rain cells, or localized delays.",
                  "Scores below 55 highlight emergency incidents or severe grid anomalies requiring operational response."
                ],
                disclaimer: "Synthesized live every 5 seconds across 5 telemetry feeds."
              })}
              className="p-1 rounded text-[#5A6D53] hover:text-[#4B6B40] transition"
              title="Explain metric"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          <div className="py-2">
            <CircularGauge 
              score={pulseScore} 
              statusText={pulseScore >= 75 ? "Stable" : pulseScore >= 55 ? "Moderate" : "Critical"} 
              subtitle="Overall civic conditions across all city districts are currently stable."
            />
          </div>
        </div>

        {/* Right Side: Telemetry Signals Breakdown Grid */}
        <div className="w-full lg:w-auto flex-1 max-w-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase font-semibold text-[#5A6D53] tracking-wider">
              Telemetry Signal Breakdown
            </span>
            <span className="text-micro font-mono text-[#4B6B40]">Live Stream ●</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {signalBreakdown.map((sig) => {
              // Calculate ring offset
              const pct = sig.score;
              return (
                <div
                  key={sig.key}
                  className="p-3.5 rounded-xl bg-[#F4F8F2] border border-[#D2DEC9] hover:bg-[#EAF2E6] transition flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    {/* Mini Ring SVG */}
                    <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                      <svg className="w-10 h-10 transform -rotate-90">
                        <circle cx="20" cy="20" r="16" stroke="#D2DEC9" strokeWidth="3.5" fill="none" />
                        <circle
                          cx="20"
                          cy="20"
                          r="16"
                          stroke={sig.score >= 75 ? '#2D5A27' : sig.score >= 55 ? '#D97706' : '#DC2626'}
                          strokeWidth="3.5"
                          fill="none"
                          strokeDasharray="100"
                          strokeDashoffset={100 - (pct * 100) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-micro font-bold text-[#1A2318] font-mono">{sig.score}</span>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-[#1A2318] group-hover:text-[#2D4226] transition">
                        {sig.label}
                      </div>
                      <div className="text-micro text-[#5A6D53]">Baseline normalized</div>
                    </div>
                  </div>

                  {/* Trend Indicator */}
                  <div className={`px-2 py-1 rounded-lg text-xs font-mono font-bold ${
                    sig.isPositive ? 'bg-[#E4F0E2] text-[#1E3A1A]' : 'bg-[#FEF3C7] text-[#92400E]'
                  }`}>
                    {sig.trend}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
