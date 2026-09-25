import React from 'react';
import { AlertCircle, AlertTriangle, Info, Check, Trash2 } from 'lucide-react';
import { AlertItem } from '../../types/citypulse';
import { useCityPulse } from '../../context/CityPulseContext';

interface AlertCardProps {
  alert: AlertItem;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
  const { markAlertRead, selectNeighborhoodById, setActivePage } = useCityPulse();

  const getBorderColor = () => {
    if (alert.severity === 'critical') return 'border-red-300 bg-red-50/60';
    if (alert.severity === 'warning') return 'border-amber-300 bg-amber-50/60';
    return 'border-[#B8D4B3] bg-[#F4F8F2]';
  };

  const getIcon = () => {
    if (alert.severity === 'critical') return <AlertCircle className="w-5 h-5 text-red-600" />;
    if (alert.severity === 'warning') return <AlertTriangle className="w-5 h-5 text-amber-600" />;
    return <Info className="w-5 h-5 text-[#4B6B40]" />;
  };

  return (
    <div className={`w-full border rounded-2xl p-5 shadow-sm transition-all duration-200 ${getBorderColor()} ${alert.read ? 'opacity-70' : ''}`}>
      <div className="flex items-start justify-between gap-4">

        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-white border border-[#D2DEC9] shrink-0 mt-0.5">
            {getIcon()}
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-0.5 rounded text-micro font-mono font-bold uppercase ${
                alert.severity === 'critical' ? 'bg-red-100 text-red-700 border border-red-300' :
                alert.severity === 'warning' ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                'bg-[#EAF2E6] text-[#2D4226] border border-[#B8D4B3]'
              }`}>
                {alert.severity}
              </span>
              <h4 className="text-base font-bold text-[#1A2318] font-heading">{alert.title}</h4>
            </div>

            <div className="text-xs text-[#5A6D53] font-mono flex items-center space-x-2">
              <span className="text-[#4B6B40] font-semibold">{alert.district}</span>
              <span>•</span>
              <span>Detected {alert.timeAgo}</span>
            </div>

            <p className="text-xs sm:text-sm text-[#2D3B28] mt-2 leading-relaxed">
              {alert.message}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col items-end space-y-2 shrink-0">
          {!alert.read && (
            <button
              onClick={() => markAlertRead(alert.id)}
              className="p-2 rounded-xl bg-white hover:bg-[#EFF4EC] border border-[#D2DEC9] text-xs font-semibold text-[#4A5D44] hover:text-[#1A2318] transition flex items-center space-x-1"
              title="Mark as read"
            >
              <Check className="w-4 h-4 text-emerald-600" />
            </button>
          )}

          <button
            onClick={() => {
              selectNeighborhoodById(alert.district.toLowerCase().replace(' ', '-'));
              setActivePage('map');
            }}
            className="px-3 py-1.5 rounded-xl bg-[#EAF2E6] hover:bg-[#DCE8D7] text-[#2D4226] border border-[#B8D4B3] text-xs font-bold transition"
          >
            Locate →
          </button>
        </div>

      </div>
    </div>
  );
};
