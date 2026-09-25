import React from 'react';
import { X } from 'lucide-react';

interface MapLegendProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MapLegend: React.FC<MapLegendProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const legendSections = [
    {
      title: "Traffic Density",
      items: [
        { label: "High / Critical Congestion", color: "#DC2626" },
        { label: "Medium Congestion", color: "#D97706" },
        { label: "Normal Flow", color: "#2D5A27" },
      ]
    },
    {
      title: "Air Quality Index (AQI)",
      items: [
        { label: "Good (0-50)", color: "#2D5A27" },
        { label: "Moderate (51-100)", color: "#059669" },
        { label: "Poor / Spike (101+)", color: "#DC2626" },
      ]
    },
    {
      title: "Civic Signals & Incidents",
      items: [
        { label: "Public Safety / Accident", color: "#DC2626" },
        { label: "Weather Storm / Rain", color: "#2563EB" },
        { label: "Transit Delay", color: "#7C3AED" },
        { label: "Grid Utility Fluctuation", color: "#D97706" },
      ]
    }
  ];

  return (
    <div className="absolute top-16 left-3 z-30 w-72 p-4 rounded-2xl bg-white/95 border border-[#D2DEC9] backdrop-blur-2xl shadow-xl text-xs font-sans pointer-events-auto animate-fade-in text-[#1A2318]">
      <div className="flex items-center justify-between border-b border-[#EFF4EC] pb-2 mb-3">
        <span className="font-heading font-bold text-[#1A2318] uppercase tracking-wider text-xs flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-[#4B6B40]" />
          <span>MAP LEGEND</span>
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-[#EFF4EC] text-[#5A6D53] transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {legendSections.map((sec, idx) => (
          <div key={idx} className="space-y-1.5">
            <h5 className="text-micro font-mono uppercase tracking-wider font-semibold text-[#5A6D53]">
              {sec.title}
            </h5>
            <div className="space-y-1 bg-[#F4F8F2] p-2 rounded-xl border border-[#E2EAD9]">
              {sec.items.map((item, itemIdx) => (
                <div key={itemIdx} className="flex items-center justify-between text-micro">
                  <span className="text-[#2D3B28] font-medium">{item.label}</span>
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
