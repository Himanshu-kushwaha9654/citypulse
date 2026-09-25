import React, { useState } from 'react';
import { BarChart3, TrendingUp, Layers, Compass, ArrowUpRight } from 'lucide-react';
import { useCityPulse } from '../../context/CityPulseContext';
import { TimeRange, SignalType } from '../../types/citypulse';
import { TrendChart } from '../trends/TrendChart';
import { CorrelationExplorer } from '../trends/CorrelationExplorer';

export const AnalyticsPage: React.FC = () => {
  const { neighborhoods, selectedNeighborhood, setSelectedNeighborhood } = useCityPulse();
  const [timeRange, setTimeRange] = useState<TimeRange>('24H');
  const [selectedSignal, setSelectedSignal] = useState<SignalType>('traffic');

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans text-[#1A2318]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#D2DEC9] shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-[#A78BFA]/15 text-[#A78BFA] border border-[#A78BFA]/30">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#1A2318] font-heading">Multi-Signal Analytics & Correlation Matrix</h2>
            <p className="text-xs text-[#5A6D53] font-mono">Statistical cross-correlation across traffic density, AQI, rainfall & dispatch incidents</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          {/* Time Range Selector */}
          <div className="flex items-center space-x-1.5 bg-[#F4F8F2] p-1.5 rounded-2xl border border-[#D2DEC9]">
            <span className="text-micro font-mono font-bold text-[#5A6D53] uppercase px-2">TIME:</span>
            {(['1H', '6H', '24H', '7D'] as TimeRange[]).map((tr) => (
              <button
                key={tr}
                onClick={() => setTimeRange(tr)}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition ${
                  timeRange === tr
                    ? 'bg-[#A78BFA] text-slate-950 shadow-[0_0_10px_rgba(167,139,250,0.35)]'
                    : 'text-[#5A6D53] hover:text-[#1A2318] hover:bg-[#E4ECE0]'
                }`}
              >
                {tr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics Trend Chart */}
      <TrendChart />

      {/* Cross-Signal Correlation Explorer */}
      <CorrelationExplorer />

    </div>
  );
};
