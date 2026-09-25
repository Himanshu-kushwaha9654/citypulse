import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, MapPin, Clock, Filter, CheckCircle2, ArrowRight } from 'lucide-react';
import { useCityPulse } from '../../context/CityPulseContext';
import { SeverityLevel, SignalType } from '../../types/citypulse';

export const PublicSafetyPage: React.FC = () => {
  const { mapIncidents, focusMapOnIncident, selectNeighborhoodById } = useCityPulse();
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredIncidents = mapIncidents.filter(inc => {
    if (severityFilter !== 'all' && inc.severity !== severityFilter) return false;
    if (typeFilter !== 'all' && inc.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans text-[#1A2318]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#D2DEC9] shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#1A2318] font-heading">Public Safety & Incident Response Dispatch</h2>
            <p className="text-xs text-[#5A6D53] font-mono">Live CAD 911 feed, traffic collisions, signal outages & severe weather advisories</p>
          </div>
        </div>

        {/* Severity Quick Badges */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-xl bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 font-bold">
            {mapIncidents.filter(i => i.severity === 'critical').length} Critical Incidents
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40 font-bold">
            {mapIncidents.filter(i => i.severity === 'high').length} High Priority
          </span>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#D2DEC9]">
        
        {/* Severity Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
          <span className="text-micro font-mono font-bold text-[#5A6D53] uppercase px-2">SEVERITY:</span>
          {['all', 'critical', 'high', 'medium', 'low'].map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition ${
                severityFilter === sev
                  ? 'bg-[#EF4444] text-slate-950 font-bold shadow-[0_0_10px_rgba(239,68,68,0.35)]'
                  : 'text-[#5A6D53] hover:text-[#1A2318] hover:bg-[#E4ECE0]'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Category Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
          <span className="text-micro font-mono font-bold text-[#5A6D53] uppercase px-2">CATEGORY:</span>
          {['all', 'traffic', 'incident', 'weather', 'air_quality', 'utility', 'transit'].map(cat => (
            <button
              key={cat}
              onClick={() => setTypeFilter(cat)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold uppercase transition ${
                typeFilter === cat
                  ? 'bg-[#10B981] text-slate-950 font-bold shadow-[0_0_10px_rgba(16,185,129,0.35)]'
                  : 'text-[#5A6D53] hover:text-[#1A2318] hover:bg-[#E4ECE0]'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>

      </div>

      {/* Incident List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIncidents.map((inc) => {
          let sevColor = 'text-[#10B981] border-[#10B981]/30 bg-[#10B981]/15';
          if (inc.severity === 'critical') sevColor = 'text-[#EF4444] border-[#EF4444]/40 bg-[#EF4444]/15 animate-pulse';
          else if (inc.severity === 'high') sevColor = 'text-[#F59E0B] border-[#F59E0B]/40 bg-[#F59E0B]/15';
          else if (inc.severity === 'medium') sevColor = 'text-[#FACC15] border-[#FACC15]/40 bg-[#FACC15]/15';

          return (
            <div key={inc.id} className="smart-card p-5 space-y-3 hover:border-[#B8D4B3] transition-all">
              <div className="flex items-start justify-between gap-2 border-b border-[#D2DEC9] pb-3">
                <div>
                  <span className="text-micro font-mono text-[#4B6B40] font-bold uppercase tracking-wider block">
                    {inc.type.replace('_', ' ')}
                  </span>
                  <h3 className="text-base font-bold text-[#1A2318] font-heading mt-0.5">{inc.title}</h3>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase border ${sevColor}`}>
                  {inc.severity}
                </span>
              </div>

              <p className="text-xs text-[#4A5D44] leading-relaxed">{inc.description}</p>

              <div className="flex items-center justify-between text-xs font-mono text-[#5A6D53] bg-[#F8FAF7] p-2.5 rounded-xl border border-[#E1EBE0]">
                <span className="flex items-center space-x-1 text-[#4A5D44]">
                  <MapPin className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>{inc.districtName}</span>
                </span>
                <span className="flex items-center space-x-1 text-[#5A6D53]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{inc.timestamp}</span>
                </span>
              </div>

              <div className="pt-2 flex items-center justify-between space-x-2">
                <button
                  onClick={() => selectNeighborhoodById(inc.districtId)}
                  className="px-3 py-1.5 rounded-xl bg-[#F4F8F2] hover:bg-[#E4ECE0] text-[#1A2318] text-xs font-bold border border-[#D2DEC9] transition"
                >
                  District Info
                </button>
                <button
                  onClick={() => focusMapOnIncident(inc.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-slate-950 text-xs font-extrabold transition shadow-[0_0_10px_rgba(16,185,129,0.3)] flex items-center space-x-1"
                >
                  <span>Focus Map</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
