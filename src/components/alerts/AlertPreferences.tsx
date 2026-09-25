import React from 'react';
import { Sliders, Bell, Save } from 'lucide-react';
import { useCityPulse } from '../../context/CityPulseContext';
import { resolveCityDbId } from '../../services/cityResolver';
import { upsertAlertThreshold } from '../../services/thresholds';

export const AlertPreferences: React.FC = () => {
  const { alertPreferences, setAlertPreferences, showToast, selectedCityConfig, canManageBackend } = useCityPulse();

  const handleToggle = (key: keyof typeof alertPreferences) => {
    setAlertPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSlider = (key: 'trafficThreshold' | 'aqiThreshold', val: number) => {
    setAlertPreferences(prev => ({
      ...prev,
      [key]: val
    }));
  };

  return (
    <div className="smart-card w-full p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E1EBE0]">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl icon-glow-aqi">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1A2318] font-heading">Alert Preferences & Thresholds</h3>
            <p className="text-xs text-[#5A6D53] font-mono">Customize trigger sensitivities and automated notification categories</p>
          </div>
        </div>

        <button
          disabled={!canManageBackend}
          title={canManageBackend ? undefined : 'Sign in as an operator or admin to save thresholds'}
          className="px-3.5 py-1.5 rounded-xl bg-[#5E7352] hover:bg-[#4D5F43] disabled:bg-[#E1EBE0] disabled:cursor-not-allowed disabled:hover:bg-[#E1EBE0] text-white disabled:text-[#94A38C] font-bold text-xs shadow-sm transition flex items-center space-x-1.5"
          onClick={async () => {
            if (!canManageBackend) return;
            const cityId = await resolveCityDbId(selectedCityConfig.id);
            if (!cityId) {
              showToast('Backend not connected - preferences kept locally only', 'warning');
              return;
            }
            await Promise.all([
              upsertAlertThreshold(cityId, 'traffic_flow', alertPreferences.trafficThreshold, '>'),
              upsertAlertThreshold(cityId, 'aqi', alertPreferences.aqiThreshold, '>')
            ]);
            showToast('Alert preferences & thresholds saved to Supabase', 'success');
          }}
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Preferences</span>
        </button>
      </div>

      {/* Threshold Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Traffic Threshold */}
        <div className="p-4 rounded-xl bg-[#F4F8F2] border border-[#D2DEC9] space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-[#1A2318]">
            <span>Traffic Congestion Alert Threshold</span>
            <span className="font-mono font-bold text-[#4B6B40]">{alertPreferences.trafficThreshold}% above baseline</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={alertPreferences.trafficThreshold}
            onChange={(e) => handleSlider('trafficThreshold', parseInt(e.target.value))}
            className="w-full accent-[#5E7352] bg-[#D2DEC9] rounded-lg cursor-pointer"
          />
          <div className="text-micro text-[#5A6D53]">
            Triggers warning when congestion index exceeds baseline by {alertPreferences.trafficThreshold}%.
          </div>
        </div>

        {/* AQI Threshold */}
        <div className="p-4 rounded-xl bg-[#F4F8F2] border border-[#D2DEC9] space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-[#1A2318]">
            <span>Air Quality Alert Threshold (AQI)</span>
            <span className="font-mono font-bold text-emerald-700">AQI {alertPreferences.aqiThreshold}</span>
          </div>
          <input
            type="range"
            min="50"
            max="250"
            value={alertPreferences.aqiThreshold}
            onChange={(e) => handleSlider('aqiThreshold', parseInt(e.target.value))}
            className="w-full accent-emerald-600 bg-[#D2DEC9] rounded-lg cursor-pointer"
          />
          <div className="text-micro text-[#5A6D53]">
            Triggers advisory when particulate AQI crosses {alertPreferences.aqiThreshold}.
          </div>
        </div>

      </div>

      {/* Categories Toggle Toggles Grid */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs uppercase font-bold text-[#5A6D53] tracking-wider">
          Notification Stream Subscriptions
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { key: 'weatherAlerts' as const, label: 'Weather & Severe Rain', desc: 'Precipitation cells & storm warnings' },
            { key: 'transitDisruption' as const, label: 'Transit Headway Disruption', desc: 'Metro and bus delays > 10 min' },
            { key: 'incidentSpikes' as const, label: 'Emergency Incident Spikes', desc: 'Abnormal 911 dispatch clustering' },
            { key: 'powerOutage' as const, label: 'Power Grid Fluctuation', desc: 'Substation load and outage alerts' },
          ].map(item => (
            <label
              key={item.key}
              className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${alertPreferences[item.key]
                  ? 'bg-[#EAF2E6] border-[#B8D4B3] text-[#1A2318] shadow-sm'
                  : 'bg-[#F8FAF7] border-[#E1EBE0] text-[#94A38C] opacity-80'
                }`}
            >
              <div>
                <div className="text-xs font-bold">{item.label}</div>
                <div className="text-micro text-[#5A6D53] mt-0.5">{item.desc}</div>
              </div>
              <input
                type="checkbox"
                checked={alertPreferences[item.key]}
                onChange={() => handleToggle(item.key)}
                className="w-4 h-4 rounded border-[#B8D4B3] text-[#5E7352] focus:ring-[#5E7352] bg-white"
              />
            </label>
          ))}
        </div>
      </div>

    </div>
  );
};
