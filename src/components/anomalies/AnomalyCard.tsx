import React from 'react';
import { AlertCircle, MapPin, Info, ArrowUpRight, Zap } from 'lucide-react';
import { AnomalyItem } from '../../types/citypulse';
import { useCityPulse } from '../../context/CityPulseContext';

interface AnomalyCardProps {
  anomaly: AnomalyItem;
}

export const AnomalyCard: React.FC<AnomalyCardProps> = ({ anomaly }) => {
  const { openExplainModal, selectNeighborhoodById, setActivePage } = useCityPulse();

  return (
    <div className="smart-card relative w-full p-6 hover:border-[#5E7352]/40">

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E1EBE0]">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="text-xl">{anomaly.title.split(' ')[0]}</span>
            <h3 className="text-lg font-bold text-[#1A2318] font-heading">
              {anomaly.title.substring(anomaly.title.indexOf(' ') + 1)}
            </h3>
          </div>
          <div className="flex items-center space-x-2 text-xs text-[#5A6D53] font-mono mt-1">
            <MapPin className="w-3.5 h-3.5 text-[#4B6B40]" />
            <span className="text-[#4B6B40] font-semibold">{anomaly.districtName}</span>
            <span>•</span>
            <span>Detected {anomaly.detectedAgo}</span>
          </div>
        </div>

        {/* Baseline Factor Pill */}
        <div className="px-3.5 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-700 font-mono text-xs font-bold self-start sm:self-auto flex items-center space-x-1">
          <Zap className="w-3.5 h-3.5" />
          <span>{anomaly.factorAboveBaseline}× above baseline</span>
        </div>
      </div>

      {/* Main Body */}
      <div className="py-4 space-y-4">
        <p className="text-xs sm:text-sm text-[#2D3B28] leading-relaxed">
          {anomaly.description}
        </p>

        {/* Related Signals Grid */}
        <div>
          <h4 className="text-micro font-mono text-[#5A6D53] uppercase font-semibold mb-2">
            Simultaneously Detected Signals
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {anomaly.relatedSignals.map((sig, idx) => (
              <div key={idx} className="px-3 py-2 rounded-xl bg-[#F4F8F2] border border-[#D2DEC9] flex items-center space-x-2.5">
                <span className="text-base">{sig.icon}</span>
                <div>
                  <div className="text-micro text-[#5A6D53] font-medium">{sig.name}</div>
                  <div className="text-xs font-bold text-[#1A2318]">{sig.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Signal Overlap Progress Bar */}
        <div className="p-3.5 rounded-xl bg-[#F4F8F2] border border-[#D2DEC9] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#4A5D44]">Spatial & Temporal Signal Overlap</span>
            <span className="font-mono font-bold text-[#4B6B40]">{anomaly.signalOverlap}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#D2DEC9] overflow-hidden">
            <div
              className="h-full bg-[#5E7352] rounded-full transition-all duration-500"
              style={{ width: `${anomaly.signalOverlap}%` }}
            ></div>
          </div>
          <div className="text-micro text-amber-700 font-mono flex items-center space-x-1.5 pt-0.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Possible correlation - not confirmed causation.</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-[#E1EBE0] flex items-center justify-end space-x-3">
        <button
          onClick={() => openExplainModal({
            title: `Explanation: ${anomaly.title}`,
            summary: anomaly.detailedExplanation,
            detailedPoints: [
              `Anomaly magnitude: ${anomaly.factorAboveBaseline}× recent historical mean.`,
              `District: ${anomaly.districtName}`,
              `Overlap confidence: ${anomaly.signalOverlap}%`
            ],
            disclaimer: "Possible correlation - not confirmed causation."
          })}
          className="px-4 py-2 rounded-xl bg-[#F4F8F2] hover:bg-[#E4ECE0] border border-[#D2DEC9] text-xs font-semibold text-[#1A2318] transition flex items-center space-x-1.5"
        >
          <Info className="w-3.5 h-3.5 text-[#4B6B40]" />
          <span>Explain</span>
        </button>

        <button
          onClick={() => {
            selectNeighborhoodById(anomaly.districtId);
            setActivePage('map');
          }}
          className="px-4 py-2 rounded-xl bg-[#5E7352] hover:bg-[#4D5F43] text-white font-bold text-xs transition flex items-center space-x-1.5 shadow-sm"
        >
          <span>View on Map</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
