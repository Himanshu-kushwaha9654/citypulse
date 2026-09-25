import React from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  Zap, 
  TrendingUp, 
  RotateCcw, 
  Bell, 
  Database, 
  Sparkles,
  User,
  ShieldCheck
} from 'lucide-react';
import { useCityPulse } from '../../context/CityPulseContext';
import { PageView } from '../../types/citypulse';
import { ROLE_LABELS } from '../../services/auth';

interface NavItem {
  id: PageView;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const { activePage, setActivePage, alerts, dataSources, setIsAiModalOpen, user } = useCityPulse();

  const unreadAlerts = alerts.filter(a => !a.read).length;
  const allSourcesOk = dataSources.every(d => d.status === 'connected');

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'map', label: 'Live Map', icon: MapPin },
    { id: 'anomalies', label: 'Anomalies', icon: Zap, badge: '3' },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'replay', label: 'Historical Replay', icon: RotateCcw },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: unreadAlerts > 0 ? unreadAlerts.toString() : undefined },
    { id: 'sources', label: 'Data Sources', icon: Database },
    { id: 'ai', label: 'AI Assistant', icon: Sparkles },
  ];

  const handleNavClick = (pageId: PageView) => {
    if (pageId === 'ai') {
      setIsAiModalOpen(true);
    } else {
      setActivePage(pageId);
    }
  };

  return (
    <>
      {/* Desktop Persistent Left Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen fixed top-0 left-0 bg-white/95 backdrop-blur-xl border-r border-[#D2DEC9] z-30 select-none">
        {/* Brand Header */}
        <div className="p-6 border-b border-[#D2DEC9]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#5E7352] flex items-center justify-center shadow-sm">
              <div className="w-4 h-4 rounded-full border-2 border-white animate-ping"></div>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wider text-[#1A2318] font-heading flex items-center gap-1">
                CITYPULSE
              </h1>
              <p className="text-micro text-[#5E7352] font-mono tracking-tight font-medium">
                Live Civic Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-[#EAF2E6] text-[#2D4226] border border-[#B8D4B3] shadow-sm'
                    : 'text-[#5A6D53] hover:text-[#1A2318] hover:bg-[#EFF4EC]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#4B6B40]' : 'text-[#5A6D53]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-micro font-bold ${
                    item.id === 'alerts' && unreadAlerts > 0
                      ? 'bg-red-500 text-white'
                      : 'bg-[#EAF2E6] text-[#4B6B40] border border-[#B8D4B3]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Sidebar Status & Profile */}
        <div className="p-4 border-t border-[#D2DEC9] space-y-3 bg-[#F4F8F2]">
          {/* Status Indicator */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-[#D2DEC9]">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${allSourcesOk ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              <span className="text-micro font-mono text-[#4A5D44] font-semibold tracking-wide">
                {allSourcesOk ? '● ALL SYSTEMS OPERATIONAL' : '● FEED DEGRADED'}
              </span>
            </div>
            <ShieldCheck className="w-3.5 h-3.5 text-[#5A6D53]" />
          </div>

          {/* User Profile Footer */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#E4ECE0] border border-[#D2DEC9] flex items-center justify-center text-[#4B6B40] shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="text-xs min-w-0">
                <div className="font-semibold text-[#1A2318] truncate">
                  {user?.email ? user.email.split('@')[0] : 'Guest'}
                </div>
                <div className="text-micro text-[#5A6D53]">{user ? ROLE_LABELS[user.role] : 'Not signed in'}</div>
              </div>
            </div>
            <button
              onClick={() => setActivePage('sources')}
              className="p-1.5 rounded-lg text-[#5A6D53] hover:text-[#1A2318] hover:bg-[#EFF4EC] transition"
              title="System Settings & Data Sources"
            >
              <Database className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-xl border-t border-[#D2DEC9] z-40 flex items-center justify-around px-2">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition ${
                isActive ? 'text-[#4B6B40] font-semibold' : 'text-[#5A6D53]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-micro mt-1 truncate max-w-[50px]">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setIsAiModalOpen(true)}
          className="flex flex-col items-center justify-center w-14 py-1 rounded-xl text-[#4B6B40] bg-[#EAF2E6] border border-[#B8D4B3]"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-micro mt-1">AI</span>
        </button>
      </nav>
    </>
  );
};
