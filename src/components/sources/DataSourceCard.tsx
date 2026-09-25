import React, { useState } from 'react';
import { Database, Clock, ShieldCheck, Activity, RefreshCw, AlertOctagon, ToggleLeft, ToggleRight } from 'lucide-react';
import { useCityPulse } from '../../context/CityPulseContext';
import { DataSourceItem } from '../../types/citypulse';

export const DataSourceCard: React.FC = () => {
  const { dataSources, showToast } = useCityPulse();
  const [sources, setSources] = useState<DataSourceItem[]>(dataSources);
  const [isOutageSimulated, setIsOutageSimulated] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshFeeds = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setSources(curr => curr.map(s => ({
        ...s,
        lastUpdatedAgo: 'Just now',
        latencyMs: Math.floor(Math.random() * 25) + 12
      })));
      setIsRefreshing(false);
      showToast('All 6 telemetry data feeds refreshed', 'success');
    }, 600);
  };

  const handleToggleOutage = () => {
    const nextOutage = !isOutageSimulated;
    setIsOutageSimulated(nextOutage);
    if (nextOutage) {
      setSources(curr => curr.map(s => 
        s.category === 'transit' 
          ? { ...s, status: 'offline', lastUpdatedAgo: '12 min ago', latencyMs: 9999 } 
          : s
      ));
      showToast('SIMULATED OUTAGE: Transit telemetry feed offline', 'error');
    } else {
      setSources(dataSources);
      showToast('Transit telemetry feed restored', 'success');
    }
  };

  const connectedCount = sources.filter(d => d.status === 'connected').length;
  const totalCount = sources.length;

  return (
    <div className="w-full space-y-6 text-[#1A2318] font-sans">
      
      {/* Overview Banner & Action Controls */}
      <div className="smart-card card-glow-healthy p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl icon-glow-healthy">
            <Database className="w-6 h-6 text-[#10B981]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-[#1A2318] font-heading">Live Telemetry Data Feeds</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                isOutageSimulated ? 'badge-incidents' : 'badge-healthy'
              }`}>
                {connectedCount} / {totalCount} FEEDS OPERATIONAL
              </span>
            </div>
            <p className="text-xs text-[#4A5D44] font-medium mt-1">
              CityPulse automatic pipeline fallback protects decision intelligence during outage events.
            </p>
          </div>
        </div>

        {/* Refresh & Outage Controls */}
        <div className="flex items-center space-x-3">
          
          {/* Refresh Button */}
          <button
            onClick={handleRefreshFeeds}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl bg-[#F4F8F2] hover:bg-[#E4ECE0] border border-[#D2DEC9] text-xs font-mono font-bold text-[#1A2318] transition flex items-center space-x-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#10B981] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Feeds'}</span>
          </button>

          {/* Demo Source Failure Toggle (Section 18) */}
          <button
            onClick={handleToggleOutage}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition border flex items-center space-x-2 ${
              isOutageSimulated
                ? 'bg-red-100 text-red-700 border-red-300 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                : 'bg-[#F4F8F2] border-[#D2DEC9] text-[#5A6D53] hover:text-[#1A2318]'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5 text-[#EF4444]" />
            <span>Outage Sim: {isOutageSimulated ? 'ON (Transit Offline)' : 'OFF'}</span>
          </button>

        </div>
      </div>

      {/* Grid of Data Source Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sources.map((source) => {
          const isConnected = source.status === 'connected';
          const isOffline = source.status === 'offline';

          return (
            <div
              key={source.id}
              className={`smart-card p-5 transition-all duration-200 ${
                isOffline
                  ? 'card-glow-incidents border-[#EF4444]/60'
                  : isConnected 
                    ? 'card-glow-healthy' 
                    : 'card-glow-traffic border-[#F59E0B]/40'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#D2DEC9]">
                <div>
                  <h3 className="text-base font-bold text-[#1A2318] font-heading">{source.name}</h3>
                  <span className="text-micro text-[#5A6D53] font-mono uppercase">{source.category}</span>
                </div>

                <div className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold flex items-center space-x-1.5 ${
                  isOffline
                    ? 'badge-incidents'
                    : isConnected 
                      ? 'badge-healthy' 
                      : 'badge-traffic'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    isOffline ? 'bg-[#EF4444] animate-ping' : isConnected ? 'live-dot-glow' : 'bg-[#F59E0B]'
                  }`}></span>
                  <span className="capitalize">{source.status}</span>
                </div>
              </div>

              <div className="pt-4 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-[#4A5D44]">
                  <span className="text-[#5A6D53] flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Last Updated:</span>
                  </span>
                  <span className={`font-bold ${isOffline ? 'text-[#EF4444]' : 'text-[#1A2318]'}`}>
                    {source.lastUpdatedAgo}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#4A5D44]">
                  <span className="text-[#5A6D53] flex items-center space-x-1">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Latency:</span>
                  </span>
                  <span className="font-bold text-[#4B6B40]">{source.latencyMs} ms</span>
                </div>

                <div className="flex items-center justify-between text-[#4A5D44]">
                  <span className="text-[#5A6D53]">Monthly SLA Uptime:</span>
                  <span className="font-bold text-[#10B981]">{source.uptime}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
