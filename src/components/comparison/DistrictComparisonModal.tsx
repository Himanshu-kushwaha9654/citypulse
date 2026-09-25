import React, { useState } from 'react';
import { X, Columns, ArrowRight, Zap, Wind, Car, Train, CloudRain, ShieldAlert } from 'lucide-react';
import { useCityPulse } from '../../context/CityPulseContext';

interface DistrictComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DistrictComparisonModal: React.FC<DistrictComparisonModalProps> = ({ isOpen, onClose }) => {
  const { neighborhoods } = useCityPulse();
  const [district1Id, setDistrict1Id] = useState('central-district');
  const [district2Id, setDistrict2Id] = useState('north-district');

  if (!isOpen) return null;

  const d1 = neighborhoods.find(n => n.id === district1Id) || neighborhoods[0];
  const d2 = neighborhoods.find(n => n.id === district2Id) || neighborhoods[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A2318]/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white border border-[#D2DEC9] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[#1A2318] max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D2DEC9] bg-[#F4F8F2]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl icon-glow-aqi">
              <Columns className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1A2318] font-heading">Neighborhood Telemetry Comparison</h3>
              <p className="text-xs text-[#5A6D53] font-mono">Side-by-side multi-sector analysis</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#5A6D53] hover:text-[#1A2318] hover:bg-[#E4ECE0] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selectors Bar */}
        <div className="p-4 border-b border-[#D2DEC9] bg-[#F4F8F2] flex flex-col sm:flex-row items-center justify-around gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#5A6D53] font-mono font-bold">District A:</span>
            <select
              value={district1Id}
              onChange={(e) => setDistrict1Id(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#D2DEC9] text-xs font-bold text-[#1A2318] focus:outline-none focus:border-[#5E7352]"
            >
              {neighborhoods.map(n => (
                <option key={n.id} value={n.id} disabled={n.id === district2Id}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>

          <span className="text-[#94A38C] font-bold hidden sm:inline">VS</span>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#5A6D53] font-mono font-bold">District B:</span>
            <select
              value={district2Id}
              onChange={(e) => setDistrict2Id(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#D2DEC9] text-xs font-bold text-[#1A2318] focus:outline-none focus:border-[#5E7352]"
            >
              {neighborhoods.map(n => (
                <option key={n.id} value={n.id} disabled={n.id === district1Id}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="p-6 overflow-y-auto space-y-4">

          {/* Pulse Score Side-by-Side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#F4F8F2] border border-[#D2DEC9] text-center">
              <div className="text-xs text-[#5A6D53] font-medium">{d1.name} Pulse Score</div>
              <div className="text-3xl font-black text-[#1A2318] font-heading mt-1">{d1.pulseScore} <span className="text-xs text-[#5A6D53] font-normal">/ 100</span></div>
            </div>
            <div className="p-4 rounded-xl bg-[#F4F8F2] border border-[#D2DEC9] text-center">
              <div className="text-xs text-[#5A6D53] font-medium">{d2.name} Pulse Score</div>
              <div className="text-3xl font-black text-[#1A2318] font-heading mt-1">{d2.pulseScore} <span className="text-xs text-[#5A6D53] font-normal">/ 100</span></div>
            </div>
          </div>

          {/* Metric Rows */}
          {[
            { label: 'Traffic Density', v1: `${d1.traffic.density}% (${d1.traffic.level})`, v2: `${d2.traffic.density}% (${d2.traffic.level})`, icon: Car, color: 'text-[#F59E0B]' },
            { label: 'Air Quality (AQI)', v1: `AQI ${d1.aqi.value} (${d1.aqi.label})`, v2: `AQI ${d2.aqi.value} (${d2.aqi.label})`, icon: Wind, color: 'text-[#22D3EE]' },
            { label: 'Weather Condition', v1: `${d1.weather.condition} (${d1.weather.temp})`, v2: `${d2.weather.condition} (${d2.weather.temp})`, icon: CloudRain, color: 'text-[#60A5FA]' },
            { label: 'Transit Reliability', v1: `${d1.transit.activeDelays} active delays (${d1.transit.reliabilityPct}% on-time)`, v2: `${d2.transit.activeDelays} active delays (${d2.transit.reliabilityPct}% on-time)`, icon: Train, color: 'text-[#A78BFA]' },
            { label: 'Incident Reports', v1: `${d1.incidents.reportCount} reports logged`, v2: `${d2.incidents.reportCount} reports logged`, icon: ShieldAlert, color: 'text-[#EF4444]' },
            { label: 'Energy Grid Load', v1: `${d1.utilities.loadGw} GW (${d1.utilities.renewablePct}% renewable)`, v2: `${d2.utilities.loadGw} GW (${d2.utilities.renewablePct}% renewable)`, icon: Zap, color: 'text-[#FACC15]' }
          ].map((row, idx) => {
            const Icon = row.icon;
            return (
              <div key={idx} className="p-3.5 rounded-xl bg-[#F4F8F2] border border-[#D2DEC9] space-y-2">
                <div className="flex items-center space-x-2 text-xs font-semibold text-[#4A5D44]">
                  <Icon className={`w-4 h-4 ${row.color}`} />
                  <span>{row.label}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-2 rounded bg-white border border-[#E1EBE0] text-[#1A2318] font-bold truncate">{row.v1}</div>
                  <div className="p-2 rounded bg-white border border-[#E1EBE0] text-[#1A2318] font-bold truncate">{row.v2}</div>
                </div>
              </div>
            );
          })}

        </div>

      </div>
    </div>
  );
};
