import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Zap, Info } from 'lucide-react';
import { useCityPulse } from '../../context/CityPulseContext';

export const UtilitiesCard: React.FC = () => {
  const { openExplainModal } = useCityPulse();

  const utilitiesData = [
    { day: 'Mon', renewable: 65, nonRenewable: 35 },
    { day: 'Tue', renewable: 72, nonRenewable: 28 },
    { day: 'Wed', renewable: 80, nonRenewable: 20 },
    { day: 'Thu', renewable: 75, nonRenewable: 25 },
    { day: 'Fri', renewable: 88, nonRenewable: 12 },
    { day: 'Sat', renewable: 92, nonRenewable: 8 },
    { day: 'Sun', renewable: 85, nonRenewable: 15 },
  ];

  return (
    <div className="smart-card card-glow-utilities p-5 space-y-4 h-full flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E4ECE0]">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg icon-glow-utilities">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1A2318] font-heading">Utilities & Resources</h3>
            <p className="text-micro text-[#52604D] font-mono">Power & Water</p>
          </div>
        </div>
        <button
          onClick={() => openExplainModal({
            title: "Energy & Resource Telemetry",
            summary: "Tracks municipal grid power consumption, solar/wind renewable integration percentage, and clean water throughput.",
            detailedPoints: [
              "Renewable Ratio: 82% average weekly contribution.",
              "Water Throughput: 1.8 ML/h steady state."
            ]
          })}
          className="p-1 rounded text-[#768570] hover:text-[#1A2318]"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      <div className="text-xs font-semibold text-[#1A2318] flex items-center justify-between">
        <span>Energy Usage (Weekly)</span>
        <span className="badge-utilities font-mono text-micro font-bold px-2 py-0.5 rounded">2.4 GW</span>
      </div>

      {/* Bar Chart matching Dribbble yellow & cyan bars */}
      <div className="h-44 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={utilitiesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4ECE0" />
            <XAxis dataKey="day" stroke="#768570" fontSize={10} />
            <YAxis stroke="#768570" fontSize={10} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#D2DEC9', borderRadius: '12px', color: '#1A2318', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
            />
            <Bar dataKey="renewable" name="Renewable" fill="#5E7352" radius={[4, 4, 0, 0]} />
            <Bar dataKey="nonRenewable" name="Non-Renewable" fill="#96632B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-center space-x-6 text-micro font-mono text-[#768570] pt-2 border-t border-[#E4ECE0]">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#5E7352]"></span>
          <span>Renewable Power</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#96632B]"></span>
          <span>Non-Renewable</span>
        </div>
      </div>

    </div>
  );
};
