import React from 'react';
import { Activity } from 'lucide-react';
import { useCityPulse } from '../../context/CityPulseContext';

export const DataHealthBadge: React.FC = () => {
  const { dataSources, setActivePage } = useCityPulse();
  
  const connectedCount = dataSources.filter(d => d.status === 'connected').length;
  const totalCount = dataSources.length;
  const isHealthy = connectedCount === totalCount;
  const delayedFeed = dataSources.find(d => d.status === 'delayed');

  return (
    <button
      onClick={() => setActivePage('sources')}
      className={`group flex items-center space-x-2.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all duration-200 shadow-sm ${
        isHealthy
          ? 'bg-white border-[#D2DEC9] text-[#4A5D44] hover:border-[#8FAE86] hover:bg-[#F4F8F2]'
          : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
      }`}
      title="Click to view Live Data Sources details"
    >
      <Activity className={`w-3.5 h-3.5 ${isHealthy ? 'text-emerald-600' : 'text-amber-600 animate-pulse'}`} />

      <div className="flex items-center space-x-1.5">
        <span className="font-semibold uppercase tracking-wider text-micro text-[#5A6D53]">DATA HEALTH</span>
        <span className="text-[#B8C6B1]">|</span>
        <span className="flex items-center">
          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isHealthy ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'}`}></span>
          <strong className="text-[#1A2318]">{connectedCount}/{totalCount}</strong> feeds online
        </span>
      </div>

      {!isHealthy && delayedFeed && (
        <span className="hidden lg:inline-block text-micro text-amber-700 pl-1 border-l border-amber-300">
          ({delayedFeed.name} delayed)
        </span>
      )}
    </button>
  );
};
