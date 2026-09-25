import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, Info } from 'lucide-react';
import { useCityPulse } from '../../context/CityPulseContext';

export const AnalyticsInsightsCard: React.FC = () => {
  const { openExplainModal } = useCityPulse();

  const analyticsData = [
    { day: 'Mon', traffic: 45, energy: 60, incidents: 20 },
    { day: 'Tue', traffic: 58, energy: 68, incidents: 25 },
    { day: 'Wed', traffic: 72, energy: 75, incidents: 30 },
    { day: 'Thu', traffic: 68, energy: 70, incidents: 28 },
    { day: 'Fri', traffic: 85, energy: 88, incidents: 42 },
    { day: 'Sat', traffic: 60, energy: 65, incidents: 18 },
    { day: 'Sun', traffic: 50, energy: 55, incidents: 15 },
  ];

  return (
    <div className="smart-card card-glow-transit p-5 space-y-4 h-full flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E4ECE0]">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg icon-glow-transit">
            <TrendingUp className="w-3.5 h-3.5 text-[#5E7352]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1A2318] font-heading">Analytics & Insights</h3>
            <p className="text-micro text-[#52604D] font-mono">Weekly trends</p>
          </div>
        </div>
        <button
          onClick={() => openExplainModal({
            title: "Longitudinal Analytics",
            summary: "Superimposes traffic flow throughput, power grid usage, and emergency incident frequency over 7 days.",
            detailedPoints: [
              "Peak activity envelope occurs on Friday evening.",
              "Lowest incident frequency recorded on Sunday morning."
            ]
          })}
          className="p-1 rounded text-[#768570] hover:text-[#1A2318]"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Multi-line chart matching Section 9 Category Chart Colors */}
      <div className="h-44 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={analyticsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4ECE0" />
            <XAxis dataKey="day" stroke="#768570" fontSize={10} />
            <YAxis stroke="#768570" fontSize={10} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#D2DEC9', borderRadius: '12px', color: '#1A2318', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
            />
            <Line type="monotone" dataKey="traffic" name="Traffic" stroke="#5E7352" strokeWidth={2.5} dot={{ fill: '#5E7352', r: 3 }} />
            <Line type="monotone" dataKey="energy" name="Energy" stroke="#96632B" strokeWidth={2.5} dot={{ fill: '#96632B', r: 3 }} />
            <Line type="monotone" dataKey="incidents" name="Incidents" stroke="#C84B31" strokeWidth={2.5} dot={{ fill: '#C84B31', r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-center space-x-5 text-micro font-mono text-[#768570] pt-2 border-t border-[#E4ECE0]">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#5E7352]"></span>
          <span>Traffic</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#96632B]"></span>
          <span>Energy</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C84B31]"></span>
          <span>Incidents</span>
        </div>
      </div>

    </div>
  );
};
