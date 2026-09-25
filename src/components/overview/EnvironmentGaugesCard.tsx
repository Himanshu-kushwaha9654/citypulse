import React from 'react';
import { Wind, Volume2, Thermometer, Droplets, Info } from 'lucide-react';
import { useCityPulse } from '../../context/CityPulseContext';

export const EnvironmentGaugesCard: React.FC = () => {
  const { openExplainModal, signalBreakdown } = useCityPulse();

  const aqiSig = signalBreakdown.find(s => s.key === 'airQuality');
  const weatherSig = signalBreakdown.find(s => s.key === 'weather');

  const aqiVal = aqiSig ? (parseInt(aqiSig.valueDisplay) || 62) : 62;
  const aqiBadge = aqiVal <= 50 ? 'Good' : aqiVal <= 100 ? 'Moderate' : aqiVal <= 150 ? 'Unhealthy' : 'Hazardous';

  const gauges = [
    {
      id: 'aqi',
      label: 'AQI',
      value: aqiVal,
      max: 180,
      badgeText: aqiBadge,
      strokeColor: aqiVal > 100 ? '#EF4444' : '#22D3EE',
      glowShadow: 'drop-shadow(0px 0px 8px rgba(34, 211, 238, 0.6))',
      radialGlow: 'radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, transparent 70%)',
      badgeClass: aqiVal > 100 ? 'badge-incidents' : 'badge-aqi',
      textColor: aqiVal > 100 ? 'text-[#EF4444]' : 'text-[#22D3EE]',
      icon: Wind
    },
    {
      id: 'noise',
      label: 'Noise',
      value: 48,
      max: 100,
      badgeText: '48 dB',
      strokeColor: '#60A5FA',
      glowShadow: 'drop-shadow(0px 0px 8px rgba(96, 165, 250, 0.6))',
      radialGlow: 'radial-gradient(circle, rgba(96, 165, 250, 0.15) 0%, transparent 70%)',
      badgeClass: 'badge-weather',
      textColor: 'text-[#60A5FA]',
      icon: Volume2
    },
    {
      id: 'temp',
      label: 'Temp',
      value: weatherSig && weatherSig.valueDisplay.includes('°C') ? parseInt(weatherSig.valueDisplay) || 24 : 24,
      max: 50,
      badgeText: `${weatherSig && weatherSig.valueDisplay.includes('°C') ? parseInt(weatherSig.valueDisplay) || 24 : 24}°C`,
      strokeColor: '#F59E0B',
      glowShadow: 'drop-shadow(0px 0px 8px rgba(245, 158, 11, 0.6))',
      radialGlow: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)',
      badgeClass: 'badge-traffic',
      textColor: 'text-[#F59E0B]',
      icon: Thermometer
    },
    {
      id: 'humidity',
      label: 'Humidity',
      value: weatherSig && weatherSig.valueDisplay.includes('%') ? parseInt(weatherSig.valueDisplay.split('/')[1]) || 65 : 65,
      max: 100,
      badgeText: `${weatherSig && weatherSig.valueDisplay.includes('%') ? parseInt(weatherSig.valueDisplay.split('/')[1]) || 65 : 65}%`,
      strokeColor: '#A78BFA',
      glowShadow: 'drop-shadow(0px 0px 8px rgba(167, 139, 250, 0.6))',
      radialGlow: 'radial-gradient(circle, rgba(167, 139, 250, 0.15) 0%, transparent 70%)',
      badgeClass: 'badge-transit',
      textColor: 'text-[#A78BFA]',
      icon: Droplets
    }
  ];

  return (
    <div className="smart-card card-glow-aqi p-5 space-y-4 h-full flex flex-col justify-between text-[#1A2318]">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E4ECE0]">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg icon-glow-aqi">
            <Wind className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1A2318] font-heading">Environment</h3>
            <p className="text-micro text-[#52604D] font-mono">Live telemetry</p>
          </div>
        </div>
        <button
          onClick={() => openExplainModal({
            title: "Environmental Telemetry",
            summary: "Combines particulate AQI, ambient decibel sensors, microclimate thermal readers, and relative humidity telemetry.",
            detailedPoints: [
              `AQI: ${aqiVal} (${aqiBadge})`,
              "Noise: 48 dB (Normal urban ambient level)",
              `Temperature: ${gauges[2].value}°C`,
              `Humidity: ${gauges[3].value}% relative moisture`
            ]
          })}
          className="p-1 rounded text-[#768570] hover:text-[#1A2318]"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* 2x2 Gauges Grid */}
      <div className="grid grid-cols-2 gap-4 py-1 flex-1 items-center">
        {gauges.map((g) => {
          const radius = 28;
          const strokeWidth = 5.5;
          const circumference = 2 * Math.PI * radius;
          const pct = Math.min(100, Math.max(0, (g.value / g.max) * 100));
          const strokeDashoffset = circumference - (pct / 100) * circumference;

          return (
            <div key={g.id} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#F8FAF7] border border-[#E4ECE0] relative overflow-hidden group">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r={radius} stroke="#E4ECE0" strokeWidth={strokeWidth} fill="transparent" />
                  <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    stroke={g.strokeColor}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <span className={`absolute text-xs font-extrabold font-mono ${g.textColor}`}>
                  {g.value}
                </span>
              </div>
              <span className="text-micro font-bold text-[#1A2318] mt-1.5">{g.label}</span>
              <span className={`text-micro font-mono font-extrabold px-2 py-0.5 rounded-full mt-1 ${g.badgeClass}`}>
                {g.badgeText}
              </span>
            </div>
          );
        })}
      </div>

    </div>
  );
};
