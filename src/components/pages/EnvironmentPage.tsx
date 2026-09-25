import React, { useState } from 'react';
import { CloudRain, Wind, Thermometer, Volume2, Sun, ArrowUpRight, Filter } from 'lucide-react';
import { useCityPulse } from '../../context/CityPulseContext';
import { TimeRange } from '../../types/citypulse';
import { TrendChart } from '../trends/TrendChart';

export const EnvironmentPage: React.FC = () => {
  const { neighborhoods, setSelectedNeighborhood } = useCityPulse();
  const [timeRange, setTimeRange] = useState<TimeRange>('24H');
  const [selectedMetric, setSelectedMetric] = useState<'aqi' | 'pm25' | 'pm10' | 'temp' | 'noise'>('aqi');

  const topAqiDistrict = [...neighborhoods].sort((a, b) => b.aqi.value - a.aqi.value)[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans text-[#1A2318]">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#D2DEC9] shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-[#22D3EE]/15 text-[#22D3EE] border border-[#22D3EE]/30">
            <Wind className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#1A2318] font-heading">Environmental & Air Quality Telemetry</h2>
            <p className="text-xs text-[#5A6D53] font-mono">Sensors tracking AQI, PM2.5, PM10, rainfall, surface temperature & acoustic noise</p>
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
                  ? 'bg-[#22D3EE] text-slate-950 shadow-[0_0_10px_rgba(34,211,238,0.35)]'
                  : 'text-[#5A6D53] hover:text-[#1A2318] hover:bg-[#E4ECE0]'
              }`}
            >
              {tr}
            </button>
          ))}
        </div>
      </div>

      {/* Top 4 Environmental Gauge Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* AQI Card */}
        <div 
          onClick={() => setSelectedMetric('aqi')}
          className={`smart-card card-glow-aqi p-5 space-y-2 cursor-pointer transition ${
            selectedMetric === 'aqi' ? 'border-[#22D3EE] shadow-[0_0_16px_rgba(34,211,238,0.25)]' : ''
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#5A6D53] font-mono">
            <span>Citywide AQI Index</span>
            <Wind className="w-4 h-4 text-[#22D3EE]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-[#22D3EE] font-heading">148 AQI</span>
            <span className="text-xs font-mono text-amber-600 font-bold">Moderate Spike</span>
          </div>
          <div className="text-micro text-[#5A6D53] font-mono">Highest: Sitapura (162 AQI)</div>
        </div>

        {/* PM2.5 / PM10 */}
        <div 
          onClick={() => setSelectedMetric('pm25')}
          className={`smart-card card-glow-aqi p-5 space-y-2 cursor-pointer transition ${
            selectedMetric === 'pm25' ? 'border-[#22D3EE] shadow-[0_0_16px_rgba(34,211,238,0.25)]' : ''
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#5A6D53] font-mono">
            <span>PM2.5 / PM10 Dust</span>
            <Sun className="w-4 h-4 text-[#FACC15]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-[#1A2318] font-heading">64 <span className="text-xs text-[#5A6D53] font-normal">µg/m³</span></span>
            <span className="text-xs font-mono text-amber-600 font-bold">+18% vs yesterday</span>
          </div>
          <div className="text-micro text-[#5A6D53] font-mono">WHO Standard Limit: 25 µg/m³</div>
        </div>

        {/* Temperature & Rainfall */}
        <div 
          onClick={() => setSelectedMetric('temp')}
          className={`smart-card card-glow-weather p-5 space-y-2 cursor-pointer transition ${
            selectedMetric === 'temp' ? 'border-[#60A5FA] shadow-[0_0_16px_rgba(96,165,250,0.25)]' : ''
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#5A6D53] font-mono">
            <span>Surface Temp & Rain</span>
            <Thermometer className="w-4 h-4 text-[#60A5FA]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-[#1A2318] font-heading">27.4°C</span>
            <span className="text-xs font-mono text-blue-600 font-bold flex items-center">
              <CloudRain className="w-3.5 h-3.5 mr-1" /> 45mm/h Rain
            </span>
          </div>
          <div className="text-micro text-[#5A6D53] font-mono">Humidity: 84% RH</div>
        </div>

        {/* Noise Levels */}
        <div 
          onClick={() => setSelectedMetric('noise')}
          className={`smart-card card-glow-healthy p-5 space-y-2 cursor-pointer transition ${
            selectedMetric === 'noise' ? 'border-[#10B981] shadow-[0_0_16px_rgba(16,185,129,0.25)]' : ''
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#5A6D53] font-mono">
            <span>Ambient Acoustic Noise</span>
            <Volume2 className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-[#1A2318] font-heading">58 dB</span>
            <span className="text-xs font-mono text-emerald-600 font-bold">Within normal envelope</span>
          </div>
          <div className="text-micro text-[#5A6D53] font-mono">Quiet Threshold: 55 dB</div>
        </div>

      </div>

      {/* Main Environmental Trend Chart Component */}
      <TrendChart />

    </div>
  );
};
