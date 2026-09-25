import React from 'react';
import { CityMapEvent } from '../../data/mockMapData';

interface CityPulseHUDProps {
  events: CityMapEvent[];
}

export const CityPulseHUD: React.FC<CityPulseHUDProps> = ({ events }) => {
  const activeCount = events.length;
  const criticalCount = events.filter(e => e.severity === 'critical').length;
  const highCount = events.filter(e => e.severity === 'high').length;

  // Compute dynamic health index (100 - penalties)
  const penalty = (criticalCount * 12) + (highCount * 5);
  const healthScore = Math.max(42, Math.min(98, 100 - penalty));

  let statusText = "Optimal";
  let statusColor = "text-[#2D5A27]";

  if (healthScore < 60) {
    statusText = "Critical";
    statusColor = "text-[#DC2626]";
  } else if (healthScore < 80) {
    statusText = "Moderate";
    statusColor = "text-[#D97706]";
  }

  return (
    <div className="absolute bottom-4 left-4 z-30 pointer-events-auto flex items-center space-x-3 px-4 py-2 rounded-full bg-white/95 border border-[#D2DEC9] backdrop-blur-xl shadow-lg text-xs font-mono text-[#1A2318]">
      <div className="flex items-center space-x-2 border-r border-[#E2EAD9] pr-3">
        <span className="text-micro uppercase font-bold text-[#5A6D53]">CITY PULSE</span>
        <span className={`font-extrabold text-sm ${statusColor}`}>
          {healthScore} <span className="text-micro text-[#5A6D53] font-normal">/100</span>
        </span>
      </div>

      <div className="flex items-center space-x-3 text-micro">
        <div className="flex items-center space-x-1">
          <span className="text-[#5A6D53]">Status:</span>
          <span className={`font-bold ${statusColor}`}>{statusText}</span>
        </div>

        <span className="text-[#C2D2B9]">|</span>

        <div className="flex items-center space-x-1">
          <span className="text-[#5A6D53]">Signals:</span>
          <span className="font-bold text-[#1A2318]">{activeCount}</span>
        </div>

        {criticalCount > 0 && (
          <>
            <span className="text-[#C2D2B9]">|</span>
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-ping" />
              <span className="text-[#5A6D53]">Critical:</span>
              <span className="font-bold text-[#DC2626]">{criticalCount}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
