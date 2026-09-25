import React from 'react';
import { ShieldAlert, Video, AlertCircle, Clock } from 'lucide-react';
import { useCityPulse } from '../../context/CityPulseContext';

export const PublicSafetyCard: React.FC = () => {
  const { openExplainModal, mapIncidents } = useCityPulse();

  const cctvCams = [
    { id: 'CAM-01', location: 'Main Street', status: 'ONLINE', isOnline: true },
    { id: 'CAM-12', location: 'City Center', status: 'ONLINE', isOnline: true },
    { id: 'CAM-23', location: 'Park Avenue', status: 'OFFLINE', isOnline: false },
  ];

  return (
    <div className="smart-card card-glow-incidents p-5 space-y-4 h-full flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E4ECE0]">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg icon-glow-incidents">
            <ShieldAlert className="w-3.5 h-3.5 text-[#C84B31]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1A2318] font-heading">Public Safety</h3>
            <p className="text-micro text-[#52604D] font-mono">Alerts & Incidents</p>
          </div>
        </div>
        <span className="badge-incidents font-mono text-micro font-bold px-2.5 py-0.5 rounded-full uppercase">
          {mapIncidents.length} Active
        </span>
      </div>

      {/* Section 1: CCTV Network */}
      <div className="space-y-2">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#1A2318]">
          <Video className="w-3.5 h-3.5 text-[#5E7352]" />
          <span>CCTV Network</span>
        </div>

        <div className="space-y-1.5 bg-[#F4F8F2] p-3 rounded-xl border border-[#D2DEC9]">
          {cctvCams.map((cam) => (
            <div key={cam.id} className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#1A2318]">{cam.id} - <span className="text-[#52604D]">{cam.location}</span></span>
              <span className={`px-2 py-0.5 rounded text-micro font-bold ${
                cam.isOnline ? 'badge-healthy' : 'badge-incidents'
              }`}>
                {cam.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Traffic Accident Alert Item */}
      <div className="space-y-2 pt-1 border-t border-[#E4ECE0]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#C84B31]">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Traffic Accident</span>
          </div>
          <span className="badge-incidents text-micro font-mono font-bold px-2 py-0.5 rounded uppercase">
            ACTIVE
          </span>
        </div>

        <div 
          onClick={() => openExplainModal({
            title: "Highway 5 Incident Details",
            summary: "2 vehicles involved near Exit 12. Response team dispatched at 18:45.",
            detailedPoints: ["Response units: 2 police cruisers, 1 tow truck", "Traffic delay: +18 min"]
          })}
          className="p-3 rounded-xl bg-[#FFF8F8] border border-[#F5C2C2] hover:border-[#C84B31]/60 shadow-sm cursor-pointer transition flex items-center justify-between text-xs"
        >
          <div>
            <div className="font-bold text-[#1A2318]">Highway 5, Exit 12</div>
            <div className="text-micro text-[#768570] font-mono flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3 text-[#768570]" />
              <span>5 min ago</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
