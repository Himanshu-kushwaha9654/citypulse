import React, { useState } from 'react';
import { Car, Clock, ShieldAlert, ArrowUpRight, TrendingUp, Filter, MapPin } from 'lucide-react';
import { useCityPulse } from '../../context/CityPulseContext';
import { TimeRange } from '../../types/citypulse';
import { LiveMap } from '../map/LiveMap';
import { JAIPUR_TRAFFIC_SEGMENTS } from '../../data/mockMapData';

export const TrafficPage: React.FC = () => {
  const { mapIncidents, selectNeighborhoodById, setActivePage, setFocusedCoordinates } = useCityPulse();
  const [timeRange, setTimeRange] = useState<TimeRange>('24H');
  const [selectedRoad, setSelectedRoad] = useState<string | null>(null);

  const trafficIncidents = mapIncidents.filter(i => i.type === 'traffic');

  // Dynamic multiplier for chart based on timeRange
  const getTimeRangeMultiplier = () => {
    switch (timeRange) {
      case '1H': return 0.85;
      case '6H': return 0.95;
      case '24H': return 1.0;
      case '7D': return 1.15;
    }
  };

  const mult = getTimeRangeMultiplier();

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans text-[#1A2318]">
      
      {/* Header & Time Range Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#D2DEC9] shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-2xl bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#1A2318] font-heading">Traffic & Arterial Corridor Intelligence</h2>
              <p className="text-xs text-[#5A6D53] font-mono">Real-time vehicle density, flow rates & congestion bottlenecks</p>
            </div>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center space-x-1.5 bg-[#F4F8F2] p-1.5 rounded-2xl border border-[#D2DEC9] self-start md:self-auto">
          <span className="text-micro font-mono font-bold text-[#5A6D53] uppercase px-2">TIME:</span>
          {(['1H', '6H', '24H', '7D'] as TimeRange[]).map((tr) => (
            <button
              key={tr}
              onClick={() => setTimeRange(tr)}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition ${
                timeRange === tr
                  ? 'bg-[#F59E0B] text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.35)]'
                  : 'text-[#5A6D53] hover:text-[#1A2318] hover:bg-[#E4ECE0]'
              }`}
            >
              {tr}
            </button>
          ))}
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="smart-card card-glow-traffic p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#5A6D53] font-mono">
            <span>Avg Congestion Density</span>
            <Car className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-[#1A2318] font-heading">
              {Math.round(76 * mult)}%
            </span>
            <span className="text-xs font-mono text-amber-600 font-bold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +14%
            </span>
          </div>
          <div className="text-micro text-[#5A6D53] font-mono">Baseline: 62% for selected {timeRange}</div>
        </div>

        <div className="smart-card card-glow-traffic p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#5A6D53] font-mono">
            <span>Average Speed</span>
            <TrendingUp className="w-4 h-4 text-[#22D3EE]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-[#1A2318] font-heading">
              {Math.round(22 / mult)} <span className="text-xs text-[#5A6D53] font-normal">km/h</span>
            </span>
            <span className="text-xs font-mono text-emerald-600 font-bold">Normal arterial flow</span>
          </div>
          <div className="text-micro text-[#5A6D53] font-mono">Target: &gt; 35 km/h</div>
        </div>

        <div className="smart-card card-glow-incidents p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#5A6D53] font-mono">
            <span>Congested Corridors</span>
            <ShieldAlert className="w-4 h-4 text-[#EF4444]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-[#EF4444] font-heading">
              {JAIPUR_TRAFFIC_SEGMENTS.filter(s => s.status === 'high' || s.status === 'critical').length}
            </span>
            <span className="text-xs font-mono text-red-600 font-bold">2 Critical tailbacks</span>
          </div>
          <div className="text-micro text-[#5A6D53] font-mono">MI Road & Malviya Nagar</div>
        </div>

        <div className="smart-card card-glow-healthy p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#5A6D53] font-mono">
            <span>Traffic Signals Active</span>
            <Clock className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-[#1A2318] font-heading">98.4%</span>
            <span className="text-xs font-mono text-emerald-600 font-bold">1 Outage reported</span>
          </div>
          <div className="text-micro text-[#5A6D53] font-mono">Adaptive timing sync ON</div>
        </div>
      </div>

      {/* Main Grid: Affected Road Corridors & Interactive Traffic Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 5 Cols: Affected Road Segments List */}
        <div className="lg:col-span-5 smart-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#D2DEC9] pb-3">
            <h3 className="text-base font-bold text-[#1A2318] font-heading flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B] shadow-[0_0_8px_#F59E0B]" />
              <span>Monitored Road Corridors</span>
            </h3>
            <span className="text-xs font-mono text-[#5A6D53]">{JAIPUR_TRAFFIC_SEGMENTS.length} Segments</span>
          </div>

          <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
            {JAIPUR_TRAFFIC_SEGMENTS.map((seg) => {
              const isSelected = selectedRoad === seg.id;
              let badgeColor = 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30';
              if (seg.status === 'critical') badgeColor = 'bg-red-500/15 text-red-600 border-red-500/30';
              else if (seg.status === 'high') badgeColor = 'bg-amber-500/15 text-amber-600 border-amber-500/30';
              else if (seg.status === 'medium') badgeColor = 'bg-yellow-500/15 text-yellow-600 border-yellow-500/30';

              return (
                <div
                  key={seg.id}
                  onClick={() => setSelectedRoad(seg.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#EAF2E6] border-[#F59E0B] shadow-[0_0_14px_rgba(245,158,11,0.2)]'
                      : 'bg-white border-[#D2DEC9] hover:border-[#B8D4B3]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-[#1A2318] text-xs">{seg.roadName}</div>
                    <span className={`px-2 py-0.5 rounded-full text-micro font-mono font-bold uppercase border ${badgeColor}`}>
                      {seg.status}
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs font-mono">
                    <div className="bg-[#F8FAF7] p-2 rounded-xl border border-[#E1EBE0]">
                      <span className="text-micro text-[#5A6D53] block">Density</span>
                      <strong className="text-[#F59E0B] text-sm">{Math.round(seg.congestion * mult)}%</strong>
                    </div>
                    <div className="bg-[#F8FAF7] p-2 rounded-xl border border-[#E1EBE0]">
                      <span className="text-micro text-[#5A6D53] block">Avg Speed</span>
                      <strong className="text-[#1A2318] text-sm">{seg.speed} km/h</strong>
                    </div>
                    <div className="bg-[#F8FAF7] p-2 rounded-xl border border-[#E1EBE0]">
                      <span className="text-micro text-[#5A6D53] block">District</span>
                      <strong className="text-[#4A5D44] text-micro truncate block">{seg.districtName}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 7 Cols: Traffic Map Center */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#1A2318] font-heading">Interactive Traffic Layer Map</h3>
            <button
              onClick={() => setActivePage('map')}
              className="text-xs font-mono font-bold text-[#10B981] hover:underline"
            >
              Full Screen Map →
            </button>
          </div>
          <LiveMap heightClass="h-[460px]" />
        </div>

      </div>

    </div>
  );
};
