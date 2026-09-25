import React from 'react';
import { Sparkles, ArrowRight, Info, ShieldCheck } from 'lucide-react';
import { useCityPulse } from '../../context/CityPulseContext';

export const WhatsHappeningCard: React.FC = () => {
  const { openExplainModal, lastUpdatedTime } = useCityPulse();

  return (
    <div className="smart-card card-glow-aqi p-5 space-y-4 flex flex-col justify-between h-full">

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#D2DEC9]">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl icon-glow-aqi">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1A2318] font-heading">What's happening now?</h3>
            <p className="text-micro text-[#5A6D53] font-mono">Automated Multi-Feed Synthesis</p>
          </div>
        </div>

        <button
          onClick={() => openExplainModal({
            title: "How is 'What's Happening Now' generated?",
            summary: "This live summary automatically aggregates weather radar inputs, GPS probe congestion metrics, and GTFS transit telemetry to summarize active city conditions.",
            detailedPoints: [
              "Identifies multi-signal clusters occurring in the same district and time window.",
              "Calculates spatial and temporal signal overlap (e.g. 78% overlap between rainfall & traffic slowdowns).",
              "Uses strict hedging language to prevent false causal assertions."
            ],
            disclaimer: "Possible correlation - not confirmed causation."
          })}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-[#F4F8F2] hover:bg-[#E4ECE0] border border-[#D2DEC9] text-xs font-semibold text-[#4A5D44] hover:text-[#1A2318] transition"
        >
          <Info className="w-3.5 h-3.5 text-[#4B6B40]" />
          <span>Explain</span>
        </button>
      </div>

      {/* Main AI Summary Content */}
      <div className="py-2 space-y-3">
        {/* Primary Insight Text */}
        <div className="p-3.5 rounded-xl bg-[#F4F8F2] border border-[#B8D4B3] text-[#1A2318] text-xs sm:text-sm leading-relaxed">
          <p className="font-medium text-[#1A2318]">
            Heavy rainfall has been detected in the <strong className="text-[#4B6B40]">Central District</strong>. Traffic congestion is currently <strong className="text-amber-700">28% above recent baseline</strong> and two transit delays have been reported nearby.
          </p>
        </div>

        {/* Why It Matters Box */}
        <div className="space-y-1">
          <h4 className="text-micro uppercase tracking-wider font-bold text-[#4B6B40] font-mono">
            Why it matters
          </h4>
          <p className="text-xs text-[#4A5D44] font-medium">
            Travel times in the affected area <span className="underline decoration-[#8FAE86] underline-offset-4">may increase</span> during the next hour as signals overlap.
          </p>
        </div>

        {/* Visual Relationship Pipeline (Weather 🌦 -> Traffic 🚗 -> Transit 🚇) */}
        <div className="p-3 rounded-xl bg-[#F8FAF7] border border-[#D2DEC9]">
          <div className="text-micro font-mono text-[#5A6D53] uppercase font-semibold mb-2">
            Observed Signal Pipeline Correlation
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#1A2318]">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg badge-weather">
              <span className="text-sm">🌧️</span>
              <span>Weather (Rain)</span>
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-[#94A38C] shrink-0" />

            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg badge-traffic">
              <span className="text-sm">🚗</span>
              <span>Traffic (+28%)</span>
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-[#94A38C] shrink-0" />

            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg badge-transit">
              <span className="text-sm">🚇</span>
              <span>Transit (2 Delays)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 13 Footer Disclaimer */}
      <div className="pt-2 border-t border-[#D2DEC9] flex items-center justify-between text-micro text-[#5A6D53] font-mono">
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full live-dot-glow"></span>
          <span className="font-semibold text-[#4B6B40]">AI SUMMARY</span>
          <span>•</span>
          <span>Updated {lastUpdatedTime}</span>
        </div>
        <div className="flex items-center space-x-1 text-[#5A6D53]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#4B6B40]" />
          <span>Signals overlap - possible correlation</span>
        </div>
      </div>

    </div>
  );
};
