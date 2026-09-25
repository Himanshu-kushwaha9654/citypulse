import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { Network, AlertCircle, Sparkles } from 'lucide-react';
import { SignalType } from '../../types/citypulse';
import { TRENDS_24H } from '../../data/mockData';

export const CorrelationExplorer: React.FC = () => {
  const [signal1, setSignal1] = useState<SignalType>('traffic');
  const [signal2, setSignal2] = useState<SignalType>('weather');

  const signalOptions: { key: SignalType; label: string; color: string }[] = [
    { key: 'traffic', label: 'Traffic Congestion (🚗)', color: '#F59E0B' },
    { key: 'weather', label: 'Weather Intensity (🌦️)', color: '#60A5FA' },
    { key: 'transit', label: 'Transit Reliability (🚇)', color: '#A78BFA' },
    { key: 'incidents', label: 'Emergency Incidents (🚨)', color: '#EF4444' },
    { key: 'airQuality', label: 'Air Quality AQI (🌫️)', color: '#22D3EE' },
    { key: 'utilities', label: 'Grid Power Load (⚡)', color: '#FACC15' },
    { key: 'water', label: 'Water Consumption (💧)', color: '#60A5FA' },
    { key: 'noise', label: 'Acoustic Noise (🔊)', color: '#22D3EE' },
  ];

  const sig1Config = signalOptions.find(s => s.key === signal1) || signalOptions[0];
  const sig2Config = signalOptions.find(s => s.key === signal2) || signalOptions[1];

  const getObservedRelationshipText = () => {
    if (signal1 === 'traffic' && signal2 === 'weather') {
      return "Traffic congestion increased during the same period that rainfall intensity increased in Central and North districts.";
    }
    if (signal1 === 'weather' && signal2 === 'incidents') {
      return "Emergency incident dispatch reports surged concurrently with localized precipitation peaks.";
    }
    if (signal1 === 'traffic' && signal2 === 'transit') {
      return "Metro transit delay headways expanded during peak surface arterial congestion spikes.";
    }
    if (signal1 === 'airQuality' && signal2 === 'incidents') {
      return "Particulate matter shifts coincided with reported industrial emission activity.";
    }
    if (signal1 === 'utilities' && signal2 === 'weather') {
      return "Substation electrical load spiked during high ambient temperature and thunderstorm events.";
    }
    return `Observed temporal overlap between ${sig1Config.label} telemetry and ${sig2Config.label} telemetry feeds over the past 24 hours.`;
  };

  return (
    <div className="smart-card card-glow-transit p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D2DEC9]">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl icon-glow-transit">
            <Network className="w-5 h-5 text-[#A78BFA]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1A2318] font-heading">Signal Correlation Explorer</h3>
            <p className="text-xs text-[#5A6D53] font-mono">Cross-telemetry longitudinal overlay</p>
          </div>
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Signal 1 Select */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#5A6D53] font-mono">Signal A:</span>
            <select
              value={signal1}
              onChange={(e) => setSignal1(e.target.value as SignalType)}
              className="px-3 py-1.5 rounded-xl bg-[#F4F8F2] border border-[#D2DEC9] text-xs font-semibold text-[#1A2318] focus:outline-none focus:border-[#A78BFA]"
            >
              {signalOptions.map(s => (
                <option key={s.key} value={s.key} disabled={s.key === signal2}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <span className="text-[#94A38C] font-bold">↔</span>

          {/* Signal 2 Select */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#5A6D53] font-mono">Signal B:</span>
            <select
              value={signal2}
              onChange={(e) => setSignal2(e.target.value as SignalType)}
              className="px-3 py-1.5 rounded-xl bg-[#F4F8F2] border border-[#D2DEC9] text-xs font-semibold text-[#1A2318] focus:outline-none focus:border-[#A78BFA]"
            >
              {signalOptions.map(s => (
                <option key={s.key} value={s.key} disabled={s.key === signal1}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Dual Axis Overlay Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={TRENDS_24H}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E1EBE0" />
            <XAxis dataKey="time" stroke="#8A9A83" fontSize={11} />
            <YAxis yAxisId="left" stroke={sig1Config.color} fontSize={11} />
            <YAxis yAxisId="right" orientation="right" stroke={sig2Config.color} fontSize={11} />
            <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#A78BFA', borderRadius: '12px', color: '#1A2318' }} />
            <Legend />
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey={signal1} 
              name={sig1Config.label} 
              stroke={sig1Config.color} 
              strokeWidth={3} 
              dot={{ fill: sig1Config.color, r: 4 }} 
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey={signal2} 
              name={sig2Config.label} 
              stroke={sig2Config.color} 
              strokeWidth={3} 
              strokeDasharray="5 5" 
              dot={{ fill: sig2Config.color, r: 4 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Relationship Analysis Footer */}
      <div className="p-4 rounded-xl bg-[#F4F8F2] border border-[#D2DEC9] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-bold text-[#A78BFA] font-mono flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Observed Relationship</span>
          </span>
          <span className="badge-transit font-mono text-micro font-bold px-2.5 py-0.5 rounded-full">
            Observed Signal Overlap
          </span>
        </div>

        <p className="text-xs sm:text-sm text-[#1A2318] leading-relaxed font-sans">
          "{getObservedRelationshipText()}"
        </p>

        <div className="text-micro text-[#5A6D53] font-mono flex items-center space-x-1.5 pt-1 border-t border-[#D2DEC9]">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Note: Observed temporal overlap does not establish direct causation between these data streams.</span>
        </div>
      </div>

    </div>
  );
};
