import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { AlertCircle, Zap } from 'lucide-react';
import { useCityPulse } from '../../context/CityPulseContext';

export const TrafficMonitoringCard: React.FC = () => {
  const { openExplainModal, signalBreakdown, mapIncidents, setActivePage } = useCityPulse();

  const trafficSig = signalBreakdown.find(s => s.key === 'traffic');
  const currentVal = trafficSig ? trafficSig.score : 87;
  const trendText = trafficSig ? trafficSig.trend : '+9% baseline';

  const trafficGraphData = [
    { time: '00:00', density: 35 },
    { time: '04:00', density: 25 },
    { time: '08:00', density: 65 },
    { time: '12:00', density: 58 },
    { time: '16:00', density: currentVal },
    { time: '20:00', density: Math.max(30, currentVal - 15) },
    { time: '23:00', density: 40 },
  ];

  const activeTrafficIncident = mapIncidents.find(i => i.type === 'traffic' || i.severity === 'critical');

  return (
    <div className="smart-card card-glow-traffic p-5 space-y-4 flex flex-col justify-between h-full text-[#1A2318]">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E4ECE0]">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg icon-glow-traffic">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1A2318] font-heading">Traffic Monitoring</h3>
            <p className="text-micro text-[#52604D] font-mono">Real-time density</p>
          </div>
        </div>
        <span className="badge-traffic font-mono text-micro font-bold px-2.5 py-1 rounded-full">
          {trendText}
        </span>
      </div>

      {/* Main Density Number */}
      <div className="flex items-baseline space-x-1.5">
        <span className="text-4xl font-bold text-[#1A2318] font-heading tracking-tight">{currentVal}</span>
        <span className="text-base font-semibold text-[#5E7352] font-mono">%</span>
      </div>

      {/* Chart */}
      <div className="h-44 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trafficGraphData}>
            <defs>
              <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5E7352" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#5E7352" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4ECE0" />
            <XAxis dataKey="time" stroke="#768570" fontSize={10} />
            <YAxis stroke="#768570" fontSize={10} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#D2DEC9', borderRadius: '12px', color: '#1A2318', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
            />
            <Area 
              type="monotone" 
              dataKey="density" 
              stroke="#5E7352" 
              strokeWidth={3} 
              fillOpacity={1}
              fill="url(#trafficGradient)"
              dot={{ fill: '#5E7352', r: 4, strokeWidth: 2, stroke: '#ffffff' }} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Subtitle Callout */}
      <div className="flex items-center space-x-2 text-xs font-mono text-[#5E7352] bg-[#EAF2E6] border border-[#A8CAA4] p-2.5 rounded-xl">
        <Zap className="w-4 h-4 text-[#5E7352] shrink-0" />
        <span>Peak Traffic Window: 16:00 - 19:00</span>
      </div>

      {/* Active Traffic Incident Banner */}
      <div 
        onClick={() => {
          if (activeTrafficIncident) {
            openExplainModal({
              title: `🚨 ${activeTrafficIncident.title}`,
              summary: activeTrafficIncident.description,
              detailedPoints: [
                `District: ${activeTrafficIncident.districtName}`,
                `Severity: ${activeTrafficIncident.severity.toUpperCase()}`,
                `Time: ${activeTrafficIncident.timestamp}`
              ]
            });
          } else {
            setActivePage('traffic');
          }
        }}
        className="p-3 rounded-xl badge-incidents flex items-center justify-between text-xs font-semibold cursor-pointer hover:opacity-90 transition shadow-xs"
      >
        <div className="flex items-center space-x-2 truncate">
          <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 animate-pulse" />
          <span className="truncate">{activeTrafficIncident ? activeTrafficIncident.title : 'Arterial Bottleneck Alert'}</span>
        </div>
        <span className="px-2 py-0.5 rounded text-micro font-mono font-bold bg-[#EF4444] text-white uppercase shrink-0 shadow-xs">
          ACTIVE
        </span>
      </div>

    </div>
  );
};
