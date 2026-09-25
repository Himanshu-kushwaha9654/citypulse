import React, { useState } from 'react';
import { Zap, Droplets, Activity, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useCityPulse } from '../../context/CityPulseContext';
import { TimeRange } from '../../types/citypulse';

export const UtilitiesPage: React.FC = () => {
  const { dataSources, setFocusedCoordinates } = useCityPulse();
  const [timeRange, setTimeRange] = useState<TimeRange>('24H');

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans text-[#1A2318]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#D2DEC9] shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-[#FACC15]/15 text-[#FACC15] border border-[#FACC15]/30">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#1A2318] font-heading">Utilities & Energy Grid Telemetry</h2>
            <p className="text-xs text-[#5A6D53] font-mono">Electric power grid load, transformer substations & municipal water distribution</p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center space-x-1.5 bg-[#F4F8F2] p-1.5 rounded-2xl border border-[#D2DEC9]">
          <span className="text-micro font-mono font-bold text-[#5A6D53] uppercase px-2">TIME:</span>
          {(['1H', '6H', '24H', '7D'] as TimeRange[]).map((tr) => (
            <button
              key={tr}
              onClick={() => setTimeRange(tr)}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition ${
                timeRange === tr
                  ? 'bg-[#FACC15] text-slate-950 shadow-[0_0_10px_rgba(250,204,21,0.35)]'
                  : 'text-[#5A6D53] hover:text-[#1A2318] hover:bg-[#E4ECE0]'
              }`}
            >
              {tr}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="smart-card card-glow-utilities p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#5A6D53] font-mono">
            <span>Electric Grid Power Demand</span>
            <Zap className="w-4 h-4 text-[#FACC15]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-[#1A2318] font-heading">1.42 <span className="text-xs text-[#5A6D53] font-normal">GW</span></span>
            <span className="text-xs font-mono text-emerald-600 font-bold">Stable Demand</span>
          </div>
          <div className="text-micro text-[#5A6D53] font-mono">Peak Load: 1.68 GW</div>
        </div>

        <div className="smart-card card-glow-healthy p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#5A6D53] font-mono">
            <span>Renewable Power Share</span>
            <Activity className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-[#10B981] font-heading">38.4%</span>
            <span className="text-xs font-mono text-emerald-600 font-bold">+6.2% Solar Surge</span>
          </div>
          <div className="text-micro text-[#5A6D53] font-mono">Solar + Wind Generation Active</div>
        </div>

        <div className="smart-card card-glow-aqi p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#5A6D53] font-mono">
            <span>Municipal Water Flow</span>
            <Droplets className="w-4 h-4 text-[#4B6B40]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-[#1A2318] font-heading">420 <span className="text-xs text-[#5A6D53] font-normal">ML/day</span></span>
            <span className="text-xs font-mono text-[#4B6B40] font-bold">Pressure: 52 PSI</span>
          </div>
          <div className="text-micro text-[#5A6D53] font-mono">Storage Tanks: 88% capacity</div>
        </div>

        <div className="smart-card card-glow-incidents p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#5A6D53] font-mono">
            <span>Grid Fluctuation Risk</span>
            <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-[#F59E0B] font-heading">Low-Medium</span>
            <span className="text-xs font-mono text-amber-600 font-bold">Rain Surge Pulse</span>
          </div>
          <div className="text-micro text-[#5A6D53] font-mono">Vidyadhar Substation Monitoring</div>
        </div>

      </div>

      {/* Detailed Utility Status Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="smart-card p-6 space-y-4">
          <h3 className="text-base font-bold text-[#1A2318] font-heading flex items-center space-x-2">
            <Zap className="w-4 h-4 text-[#FACC15]" />
            <span>Power Substation Operating Envelope</span>
          </h3>
          <p className="text-xs text-[#4A5D44] leading-relaxed">
            All 6 main high-voltage regional substations across Jaipur are connected to the central load balancing grid. Backup gas-turbines are standing by in North District.
          </p>
          <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-[#E1EBE0] space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-[#5A6D53]">Vidyadhar Nagar Substation:</span>
              <strong className="text-amber-600 font-bold">94% Load (Rain Surge Warning)</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5A6D53]">Sitapura Industrial Grid:</span>
              <strong className="text-emerald-600 font-bold">68% Load (Normal)</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5A6D53]">Central Commercial Grid:</span>
              <strong className="text-emerald-600 font-bold">78% Load (Normal)</strong>
            </div>
          </div>
        </div>

        <div className="smart-card p-6 space-y-4">
          <h3 className="text-base font-bold text-[#1A2318] font-heading flex items-center space-x-2">
            <Droplets className="w-4 h-4 text-[#4B6B40]" />
            <span>Water Pipeline Network Status</span>
          </h3>
          <p className="text-xs text-[#4A5D44] leading-relaxed">
            High-pressure feeder lines from Bisalpur reservoir operating at optimal flow throughput with 0 major pipe breach alerts logged in the last 24 hours.
          </p>
          <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-[#E1EBE0] space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-[#5A6D53]">Main Arterial Feeder Line 1:</span>
              <strong className="text-emerald-600 font-bold">54 PSI / Nominal</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5A6D53]">Pumping Station 4 (Malviya):</span>
              <strong className="text-emerald-600 font-bold">Active / 100% Throughput</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5A6D53]">Water Quality Sensor Network:</span>
              <strong className="text-[#4B6B40] font-bold">PH 7.4 / Clean</strong>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
