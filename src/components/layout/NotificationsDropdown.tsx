import React, { useState, useRef, useEffect } from 'react';
import { Bell, AlertTriangle, AlertCircle, Info, CheckCheck } from 'lucide-react';
import { useCityPulse } from '../../context/CityPulseContext';

export const NotificationsDropdown: React.FC = () => {
  const { alerts, markAlertRead, markAllAlertsRead, setActivePage, selectNeighborhoodById } = useCityPulse();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = alerts.filter(a => !a.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-[#4A5D44] hover:text-[#1A2318] bg-white hover:bg-[#F4F8F2] border border-[#D2DEC9] transition"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-micro font-bold text-white shadow-sm animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-[#D2DEC9] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#D2DEC9] bg-[#F4F8F2]">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-[#1A2318]">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-micro font-bold bg-[#EAF2E6] text-[#2D4226] border border-[#B8D4B3]">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAlertsRead}
                className="text-xs text-[#4B6B40] hover:text-[#2D4226] flex items-center space-x-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Alert List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#E1EBE0]">
            {alerts.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#5A6D53]">
                No active notifications
              </div>
            ) : (
              alerts.map(alert => (
                <div
                  key={alert.id}
                  onClick={() => {
                    markAlertRead(alert.id);
                    selectNeighborhoodById(alert.district.toLowerCase().replace(' ', '-'));
                    setIsOpen(false);
                  }}
                  className={`p-3.5 flex items-start space-x-3 cursor-pointer transition ${
                    alert.read ? 'opacity-70 hover:bg-[#F4F8F2]' : 'bg-[#EFF4EC] hover:bg-[#E4ECE0]'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {alert.severity === 'critical' && (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    {alert.severity === 'warning' && (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    )}
                    {alert.severity === 'info' && (
                      <Info className="w-4 h-4 text-[#4B6B40]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#1A2318]">
                      <span className="truncate">{alert.title}</span>
                      <span className="text-micro text-[#5A6D53] font-mono shrink-0">{alert.timeAgo}</span>
                    </div>
                    <div className="text-micro text-[#5A6D53] mt-0.5 font-medium">
                      {alert.district}
                    </div>
                    <p className="text-xs text-[#4A5D44] mt-1 line-clamp-2">
                      {alert.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-[#D2DEC9] bg-[#F4F8F2] text-center">
            <button
              onClick={() => {
                setActivePage('alerts');
                setIsOpen(false);
              }}
              className="w-full py-1.5 rounded-lg bg-white hover:bg-[#E4ECE0] border border-[#D2DEC9] text-xs font-semibold text-[#4A5D44] hover:text-[#1A2318] transition"
            >
              View all alerts & preferences →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
