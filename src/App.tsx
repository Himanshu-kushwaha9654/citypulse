import React from 'react';
import { CityPulseProvider, useCityPulse } from './context/CityPulseContext';
import { TopHeader } from './components/layout/TopHeader';
import { ExplainModal } from './components/common/ExplainModal';
import { AIAssistantModal } from './components/ai/AIAssistantModal';
import { NeighborhoodPanel } from './components/detail/NeighborhoodPanel';
import { AuthModal } from './components/layout/AuthModal';
import { DistrictComparisonModal } from './components/comparison/DistrictComparisonModal';
import { ToastContainer } from './components/common/ToastContainer';

// Dashboard Overview Components
import { DemoModeBanner } from './components/overview/DemoModeBanner';
import { TopMetricsRow } from './components/overview/TopMetricsRow';
import { TrafficMonitoringCard } from './components/overview/TrafficMonitoringCard';
import { LiveMap } from './components/map/LiveMap';
import { EnvironmentGaugesCard } from './components/overview/EnvironmentGaugesCard';
import { UtilitiesCard } from './components/overview/UtilitiesCard';
import { PublicSafetyCard } from './components/overview/PublicSafetyCard';
import { AnalyticsInsightsCard } from './components/overview/AnalyticsInsightsCard';

// Dedicated Page Views
import { TrafficPage } from './components/pages/TrafficPage';
import { EnvironmentPage } from './components/pages/EnvironmentPage';
import { UtilitiesPage } from './components/pages/UtilitiesPage';
import { PublicSafetyPage } from './components/pages/PublicSafetyPage';
import { AnalyticsPage } from './components/pages/AnalyticsPage';
import { AnomalyCard } from './components/anomalies/AnomalyCard';
import { HistoricalReplayControls } from './components/replay/HistoricalReplayControls';
import { TrendChart } from './components/trends/TrendChart';
import { CorrelationExplorer } from './components/trends/CorrelationExplorer';
import { AlertCard } from './components/alerts/AlertCard';
import { AlertPreferences } from './components/alerts/AlertPreferences';
import { DataSourceCard } from './components/sources/DataSourceCard';

import { DemoBar } from './components/layout/DemoBar';

const MainContent: React.FC = () => {
  const { activePage, anomalies, alerts, setIsAiModalOpen } = useCityPulse();

  return (
    <div className="flex-1 min-h-screen bg-[#E4ECE0] text-[#1A2318] p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* 1. OVERVIEW DASHBOARD */}
      {activePage === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Top Row: 5 Metric Cards */}
          <TopMetricsRow />

          {/* Middle Row Grid (Traffic Monitoring | Tactical Map | Environment Gauges) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left: Traffic Monitoring */}
            <div className="lg:col-span-3">
              <TrafficMonitoringCard />
            </div>

            {/* Center: Tactical Command Map */}
            <div className="lg:col-span-6">
              <LiveMap heightClass="h-full min-h-[440px]" />
            </div>

            {/* Right: Environment Gauges */}
            <div className="lg:col-span-3">
              <EnvironmentGaugesCard />
            </div>
          </div>

          {/* Bottom Row Grid (Utilities | Public Safety | Analytics) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            <UtilitiesCard />
            <PublicSafetyCard />
            <AnalyticsInsightsCard />
          </div>

        </div>
      )}

      {/* 2. TRAFFIC DEDICATED PAGE */}
      {activePage === 'traffic' && <TrafficPage />}

      {/* 3. ENVIRONMENT DEDICATED PAGE */}
      {activePage === 'environment' && <EnvironmentPage />}

      {/* 4. UTILITIES DEDICATED PAGE */}
      {activePage === 'utilities' && <UtilitiesPage />}

      {/* 5. PUBLIC SAFETY DEDICATED PAGE */}
      {activePage === 'public-safety' && <PublicSafetyPage />}

      {/* 6. ANALYTICS DEDICATED PAGE */}
      {activePage === 'analytics' && <AnalyticsPage />}

      {/* 7. FULL COMMAND MAP VIEW */}
      {activePage === 'map' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#1A2318] font-heading">Live Tactical Command Map</h3>
              <p className="text-xs text-[#52604D] font-mono">Real-time vector telemetry & OpenStreetMap city markers</p>
            </div>
          </div>
          <LiveMap heightClass="h-[calc(100vh-180px)]" isExpanded={true} />
        </div>
      )}

      {/* 8. ANOMALIES VIEW */}
      {activePage === 'anomalies' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div>
            <h3 className="text-2xl font-bold text-[#1A2318] font-heading">Detected Civic Anomalies</h3>
            <p className="text-xs text-[#52604D] font-mono">Unusual telemetry spikes detected across sensor feeds in real time</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {anomalies.map(anom => (
              <AnomalyCard key={anom.id} anomaly={anom} />
            ))}
          </div>
        </div>
      )}

      {/* 9. TRENDS & CORRELATION VIEW */}
      {activePage === 'trends' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <TrendChart />
          <CorrelationExplorer />
        </div>
      )}

      {/* 10. HISTORICAL REPLAY VIEW */}
      {activePage === 'replay' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <HistoricalReplayControls />
          <LiveMap heightClass="h-[440px]" />
        </div>
      )}

      {/* 11. ALERTS & PREFERENCES VIEW */}
      {activePage === 'alerts' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[#1A2318] font-heading">Active Smart Alerts</h3>
            <div className="space-y-3">
              {alerts.map(alert => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          </div>

          <AlertPreferences />
        </div>
      )}

      {/* 12. DATA SOURCES VIEW */}
      {activePage === 'sources' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <DataSourceCard />
        </div>
      )}

    </div>
  );
};

const AppShell: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen,
    isComparisonModalOpen,
    setIsComparisonModalOpen,
    toasts,
    dismissToast
  } = useCityPulse();

  return (
    <div className="min-h-screen bg-[#E4ECE0] flex flex-col font-sans selection:bg-[#5E7352]/20 selection:text-[#1A2318]">
      {/* Top Header Bar */}
      <TopHeader />

      {/* Global Compact Demo Bar (Visible near header across all pages) */}
      <div className="px-4 sm:px-6 lg:px-8 pt-3 pb-0 sticky top-[62px] z-30">
        <DemoBar />
      </div>

      {/* Main Workspace Body */}
      <MainContent />

      {/* Toast Notification Overlay System */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Modals & Overlays */}
      <ExplainModal />
      <AIAssistantModal />
      <NeighborhoodPanel />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <DistrictComparisonModal isOpen={isComparisonModalOpen} onClose={() => setIsComparisonModalOpen(false)} />
    </div>
  );
};

export function App() {
  return (
    <CityPulseProvider>
      <AppShell />
    </CityPulseProvider>
  );
}

export default App;
