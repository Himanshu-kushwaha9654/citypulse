import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { Info, TrendingUp, Zap, Droplets, Volume2 } from 'lucide-react';
import { useCityPulse } from '../../context/CityPulseContext';
import { TRENDS_24H, TRENDS_6H } from '../../data/mockData';

export const TrendChart: React.FC = () => {
  const { openExplainModal } = useCityPulse();
  const [timeframe, setTimeframe] = useState<'1H' | '6H' | '24H' | '7D' | '30D'>('24H');

  const data = timeframe === '6H' ? TRENDS_6H : TRENDS_24H;

  return (
    <div className="w-full space-y-6">
      
      {/* Timeframe Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h3 className="text-lg font-bold text-[#1A2318] font-heading">Civic Performance Metrics</h3>
          <p className="text-xs text-[#52604D] font-mono">Longitudinal telemetry history across all urban sectors</p>
        </div>

        {/* Section 16: 1H, 6H, 24H, 7D, 30D Timeframe Selectors */}
        <div className="flex items-center space-x-1 bg-[#F4F8F2] p-1.5 rounded-xl border border-[#D2DEC9] self-start sm:self-auto">
          {(['1H', '6H', '24H', '7D', '30D'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                timeframe === tf
                  ? 'bg-[#10B981] text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'text-[#5A6D53] hover:text-[#1A2318] hover:bg-[#E4ECE0]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Analytics Charts (8 Categories Covered) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Traffic Congestion Trend */}
        <div className="smart-card card-glow-traffic p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#D2DEC9] pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shadow-[0_0_8px_#F59E0B]"></span>
              <h4 className="text-sm font-bold text-[#1A2318] font-heading">Traffic Congestion Index</h4>
            </div>
            <button
              onClick={() => openExplainModal({
                title: "Traffic Congestion Index",
                summary: "Measures average probe speed deficit compared to free-flow baseline speed limit across major arterials.",
                detailedPoints: [
                  "Higher numbers indicate slower travel speeds & queuing.",
                  "Spikes typically correspond with bad weather, signal outages, or accidents."
                ],
                disclaimer: "Data updated every 5 seconds."
              })}
              className="p-1 rounded text-[#5A6D53] hover:text-[#F59E0B] transition"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E1EBE0" />
                <XAxis dataKey="time" stroke="#8A9A83" fontSize={11} />
                <YAxis stroke="#8A9A83" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#F59E0B', borderRadius: '12px', color: '#1A2318' }} />
                <Line type="monotone" dataKey="traffic" stroke="#F59E0B" strokeWidth={3} dot={{ fill: '#F59E0B', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Air Quality Index (AQI) */}
        <div className="smart-card card-glow-aqi p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#D2DEC9] pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22D3EE] shadow-[0_0_8px_#22D3EE]"></span>
              <h4 className="text-sm font-bold text-[#1A2318] font-heading">Air Quality Index (AQI)</h4>
            </div>
            <button
              onClick={() => openExplainModal({
                title: "Air Quality Index",
                summary: "Synthesizes fine particulate matter (PM2.5, PM10) and nitrogen dioxide sensors.",
                detailedPoints: ["0-50 = Good, 51-100 = Moderate, 101+ = Unhealthy for sensitive groups."]
              })}
              className="p-1 rounded text-[#5A6D53] hover:text-[#22D3EE] transition"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E1EBE0" />
                <XAxis dataKey="time" stroke="#8A9A83" fontSize={11} />
                <YAxis stroke="#8A9A83" fontSize={11} domain={[0, 150]} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#22D3EE', borderRadius: '12px', color: '#1A2318' }} />
                <Line type="monotone" dataKey="airQuality" stroke="#22D3EE" strokeWidth={3} dot={{ fill: '#22D3EE', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Emergency Incident Activity (Bar Chart) */}
        <div className="smart-card card-glow-incidents p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#D2DEC9] pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shadow-[0_0_8px_#EF4444]"></span>
              <h4 className="text-sm font-bold text-[#1A2318] font-heading">Emergency Incident Reports</h4>
            </div>
            <button
              onClick={() => openExplainModal({
                title: "Emergency Incident Activity",
                summary: "Counts active 911/CAD emergency calls per 30-minute window across collision, utility, and weather categories.",
                detailedPoints: ["Normal baseline: 1-3 calls per window.", "Spikes indicate compound civic disruptions."]
              })}
              className="p-1 rounded text-[#5A6D53] hover:text-[#EF4444] transition"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E1EBE0" />
                <XAxis dataKey="time" stroke="#8A9A83" fontSize={11} />
                <YAxis stroke="#8A9A83" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#EF4444', borderRadius: '12px', color: '#1A2318' }} />
                <Bar dataKey="incidents" fill="#EF4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Transit Reliability (Area Chart) */}
        <div className="smart-card card-glow-transit p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#D2DEC9] pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A78BFA] shadow-[0_0_8px_#A78BFA]"></span>
              <h4 className="text-sm font-bold text-[#1A2318] font-heading">Transit On-Time Performance</h4>
            </div>
            <button
              onClick={() => openExplainModal({
                title: "Transit Reliability",
                summary: "Percentage of metro trains and express bus routes operating within 3 minutes of scheduled GTFS timetable.",
                detailedPoints: ["Values above 90% represent excellent timetable fidelity.", "Drops below 75% flag widespread systemic delays."]
              })}
              className="p-1 rounded text-[#5A6D53] hover:text-[#A78BFA] transition"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E1EBE0" />
                <XAxis dataKey="time" stroke="#8A9A83" fontSize={11} />
                <YAxis stroke="#8A9A83" fontSize={11} domain={[50, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#A78BFA', borderRadius: '12px', color: '#1A2318' }} />
                <Area type="monotone" dataKey="transit" stroke="#A78BFA" fill="#A78BFA" fillOpacity={0.25} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
