import React from 'react';
import { Polyline, Popup } from 'react-leaflet';
import { CityTrafficSegment } from '../../data/mockMapData';

interface TrafficLayerProps {
  segments: CityTrafficSegment[];
}

export const TrafficLayer: React.FC<TrafficLayerProps> = ({ segments }) => {
  const getSegmentColor = (status: CityTrafficSegment['status']) => {
    switch (status) {
      case 'low': return '#10B981';
      case 'medium': return '#FACC15';
      case 'high': return '#F59E0B';
      case 'critical': return '#EF4444';
      default: return '#10B981';
    }
  };

  return (
    <>
      {segments.map((seg) => {
        const strokeColor = getSegmentColor(seg.status);
        return (
          <Polyline
            key={seg.id}
            positions={seg.coordinates}
            pathOptions={{
              color: strokeColor,
              weight: 5,
              opacity: 0.85,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          >
            <Popup className="citypulse-leaflet-popup">
              <div className="p-3 bg-[#F8FAF7] border border-[#D2DEC9] rounded-2xl text-[#1A2318] min-w-[210px] font-sans shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#E1EBE0] pb-1.5 mb-2">
                  <span className="text-micro font-mono font-bold uppercase tracking-wider text-[#F59E0B] flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: strokeColor }} />
                    <span>TRAFFIC CORRIDOR</span>
                  </span>
                  <span className="text-micro font-mono text-[#5A6D53]">{seg.updatedSecondsAgo}s ago</span>
                </div>

                <h4 className="text-xs font-bold text-[#1A2318] font-heading">{seg.roadName}</h4>
                <div className="text-micro text-[#5A6D53] mt-0.5">📍 {seg.districtName}</div>

                <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-xs font-mono">
                  <div className="p-2 rounded-xl bg-[#F4F8F2] border border-[#D2DEC9] flex flex-col">
                    <span className="text-micro text-[#5A6D53]">Congestion</span>
                    <strong className="text-[#1A2318] font-bold text-sm" style={{ color: strokeColor }}>
                      {seg.congestion}%
                    </strong>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F4F8F2] border border-[#D2DEC9] flex flex-col">
                    <span className="text-micro text-[#5A6D53]">Avg Speed</span>
                    <strong className="text-[#1A2318] font-bold text-sm">
                      {seg.speed} <span className="text-micro text-[#5A6D53] font-normal">km/h</span>
                    </strong>
                  </div>
                </div>

                <div className="mt-2 text-micro font-mono text-[#4A5D44] flex items-center justify-between">
                  <span>Impact Rating:</span>
                  <span className="font-bold uppercase" style={{ color: strokeColor }}>
                    {seg.status}
                  </span>
                </div>
              </div>
            </Popup>
          </Polyline>
        );
      })}
    </>
  );
};
