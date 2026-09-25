import React from 'react';
import {
  X,
  Car,
  Wind,
  Train,
  CloudRain,
  Sparkles,
  ChevronRight,
  Star,
  Zap,
  Droplets,
  Volume2,
  ShieldAlert
} from 'lucide-react';
import { useCityPulse } from '../../context/CityPulseContext';

export const NeighborhoodPanel: React.FC = () => {
  const {
    selectedNeighborhood,
    setSelectedNeighborhood,
    openExplainModal,
    favorites,
    toggleFavoriteDistrict
  } = useCityPulse();

  if (!selectedNeighborhood) return null;

  const n = selectedNeighborhood;
  const isFav = favorites.includes(n.id);

  const getStatusStyle = (status: string) => {
    if (status === 'critical') return {
      badge: 'badge-incidents',
      headerBg: 'radial-gradient(circle at 50% 0%, rgba(239, 68, 68, 0.15), transparent 70%), #13151e',
      pulseBorder: 'border-[#EF4444]/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
    };
    if (status === 'warning') return {
      badge: 'badge-traffic',
      headerBg: 'radial-gradient(circle at 50% 0%, rgba(245, 158, 11, 0.12), transparent 70%), #13151e',
      pulseBorder: 'border-[#F59E0B]/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
    };
    return {
      badge: 'badge-healthy',
      headerBg: 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.12), transparent 70%), #13151e',
      pulseBorder: 'border-[#10B981]/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
    };
  };

  const style = getStatusStyle(n.status);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-white/98 backdrop-blur-2xl border-l border-[#D2DEC9] shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 text-[#1A2318]">
      {/* Panel Header with Ambient Category Glow */}
      <div className="p-6 border-b border-[#D2DEC9] bg-[#F4F8F2] sticky top-0 z-10">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-bold text-[#1A2318] font-heading">{n.name}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${style.badge}`}>
                ● {n.status}
              </span>
            </div>
            <p className="text-xs text-[#52604D] mt-1 font-mono">
              Coordinates: {n.center[0].toFixed(4)}, {n.center[1].toFixed(4)}
            </p>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Section 30: Favorite Toggle */}
            <button
              onClick={() => toggleFavoriteDistrict(n.id)}
              className={`p-2 rounded-xl border transition ${isFav
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 shadow-sm'
                  : 'bg-white border-[#D2DEC9] text-[#52604D] hover:text-[#1A2318]'
                }`}
              title={isFav ? 'Remove from My Areas' : 'Add to My Areas'}
            >
              <Star className={`w-4 h-4 ${isFav ? 'fill-amber-500' : ''}`} />
            </button>

            <button
              onClick={() => setSelectedNeighborhood(null)}
              className="p-2 rounded-xl text-[#52604D] hover:text-[#1A2318] hover:bg-[#E4ECE0] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pulse Score Banner */}
        <div className="mt-4 p-4 rounded-xl bg-white border border-[#D2DEC9] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-[#52604D] font-medium">District Pulse Score</span>
            <div className="text-3xl font-extrabold text-[#1A2318] font-heading mt-0.5">
              {n.pulseScore}
              <span className="text-sm font-normal text-[#768570]"> / 100</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-[#5E7352]/30 border-t-[#5E7352] flex items-center justify-center font-bold text-[#5E7352] text-sm shadow-sm">
            {n.pulseScore}%
          </div>
        </div>
      </div>

      {/* Comprehensive 8-Category Telemetry Grid */}
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-xs uppercase font-semibold text-[#52604D] tracking-wider mb-3 font-mono">
            Multi-Category Live Telemetry
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Traffic */}
            <div className="p-3 rounded-xl bg-[#F4F8F2] border border-[#D2DEC9]">
              <div className="flex items-center space-x-1.5 text-[#5E7352] text-xs font-semibold">
                <Car className="w-3.5 h-3.5" />
                <span>Traffic</span>
              </div>
              <div className="text-sm font-bold text-[#1A2318] mt-1">{n.traffic.level}</div>
              <div className="text-micro text-[#52604D] font-mono">{n.traffic.trend}</div>
            </div>

            {/* AQI */}
            <div className="p-3 rounded-xl bg-[#F4F8F2] border border-[#D2DEC9]">
              <div className="flex items-center space-x-1.5 text-[#5E7352] text-xs font-semibold">
                <Wind className="w-3.5 h-3.5" />
                <span>Air Quality</span>
              </div>
              <div className="text-sm font-bold text-[#1A2318] mt-1">AQI {n.aqi.value}</div>
              <div className="text-micro text-[#52604D] font-mono">{n.aqi.label}</div>
            </div>

            {/* Weather */}
            <div className="p-3 rounded-xl bg-[#F4F8F2] border border-[#D2DEC9]">
              <div className="flex items-center space-x-1.5 text-[#5E7352] text-xs font-semibold">
                <CloudRain className="w-3.5 h-3.5" />
                <span>Weather</span>
              </div>
              <div className="text-sm font-bold text-[#1A2318] mt-1">{n.weather.condition}</div>
              <div className="text-micro text-[#52604D] font-mono">{n.weather.temp}</div>
            </div>

            {/* Transit */}
            <div className="p-3 rounded-xl bg-[#F4F8F2] border border-[#D2DEC9]">
              <div className="flex items-center space-x-1.5 text-[#5E7352] text-xs font-semibold">
                <Train className="w-3.5 h-3.5" />
                <span>Transit</span>
              </div>
              <div className="text-sm font-bold text-[#1A2318] mt-1">
                {n.transit.activeDelays > 0 ? `${n.transit.activeDelays} delays` : 'On Time'}
              </div>
              <div className="text-micro text-[#52604D] font-mono">{n.transit.reliabilityPct}% reliability</div>
            </div>

            {/* Utilities */}
            <div className="p-3 rounded-xl bg-[#F4F8F2] border border-[#D2DEC9]">
              <div className="flex items-center space-x-1.5 text-[#5E7352] text-xs font-semibold">
                <Zap className="w-3.5 h-3.5" />
                <span>Utilities</span>
              </div>
              <div className="text-sm font-bold text-[#1A2318] mt-1">{n.utilities.loadGw} GW</div>
              <div className="text-micro text-[#52604D] font-mono">{n.utilities.renewablePct}% renewable</div>
            </div>

            {/* Incidents */}
            <div className="p-3 rounded-xl bg-[#F4F8F2] border border-[#D2DEC9]">
              <div className="flex items-center space-x-1.5 text-[#C84B31] text-xs font-semibold">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Incidents</span>
              </div>
              <div className="text-sm font-bold text-[#1A2318] mt-1">{n.incidents.reportCount} reports</div>
              <div className="text-micro text-[#52604D] font-mono">{n.incidents.activeSevere} severe</div>
            </div>

            {/* Water */}
            <div className="p-3 rounded-xl bg-[#F4F8F2] border border-[#D2DEC9]">
              <div className="flex items-center space-x-1.5 text-[#5E7352] text-xs font-semibold">
                <Droplets className="w-3.5 h-3.5" />
                <span>Water</span>
              </div>
              <div className="text-sm font-bold text-[#1A2318] mt-1">{n.water.throughputMl} ML/h</div>
              <div className="text-micro text-[#52604D] font-mono">SCADA Normal</div>
            </div>

            {/* Noise */}
            <div className="p-3 rounded-xl bg-[#F4F8F2] border border-[#D2DEC9]">
              <div className="flex items-center space-x-1.5 text-[#5E7352] text-xs font-semibold">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Noise Level</span>
              </div>
              <div className="text-sm font-bold text-[#1A2318] mt-1">{n.noise.decibels} dB</div>
              <div className="text-micro text-[#52604D] font-mono">Acoustic Sensor</div>
            </div>
          </div>
        </div>

        {/* CityPulse Insight Box */}
        <div className="p-4 rounded-xl bg-[#F4F8F2] border border-[#D2DEC9] shadow-sm space-y-2">
          <div className="flex items-center space-x-2 text-[#5E7352] font-semibold text-xs">
            <Sparkles className="w-4 h-4" />
            <span>CityPulse Insight</span>
          </div>
          <p className="text-xs text-[#1A2318] leading-relaxed font-sans">
            "{n.insight}"
          </p>
          <div className="text-micro text-[#52604D] font-mono">
            * Observed signal overlap - possible correlation, not confirmed causation.
          </div>
        </div>

        {/* Section 11: District Timeline Activity Stream */}
        <div>
          <h3 className="text-xs uppercase font-semibold text-[#52604D] tracking-wider mb-3 font-mono">
            Recent Activity Timeline
          </h3>
          <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#D2DEC9]">
            {n.timeline.map((event, idx) => (
              <div key={idx} className="flex items-center space-x-3 text-xs relative pl-7">
                <span className="absolute left-1.5 w-3 h-3 rounded-full bg-[#5E7352]/20 border border-[#5E7352] shrink-0"></span>
                <span className="font-mono text-[#768570] text-micro shrink-0">{event.time}</span>
                <span className="mr-1">{event.icon}</span>
                <span className="text-[#1A2318] font-medium">{event.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-[#D2DEC9]">
          <button
            onClick={() => {
              openExplainModal({
                title: `Full Analysis: ${n.name}`,
                summary: `The Pulse score for ${n.name} stands at ${n.pulseScore}/100. Signal overlaps detected between weather and traffic congestion.`,
                detailedPoints: [
                  `Traffic congestion is operating at ${n.traffic.level}.`,
                  `Air Quality Index is measured at ${n.aqi.value} (${n.aqi.label}).`,
                  `Transit telemetry recorded ${n.transit.activeDelays} active delays.`,
                  `Emergency dispatch reports ${n.incidents.reportCount} active incidents.`
                ],
                disclaimer: 'Detailed signal breakdown generated from live telemetry feeds.'
              });
            }}
            className="w-full py-2.5 rounded-xl bg-[#5E7352] hover:bg-[#4D5F43] text-white font-bold text-xs transition flex items-center justify-center space-x-2 shadow-md"
          >
            <span>View Full Analysis</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
