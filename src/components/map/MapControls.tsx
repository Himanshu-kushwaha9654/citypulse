import React from 'react';
import { Plus, Minus, Navigation, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onLocateMe: () => void;
  onResetView: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  geoError: string | null;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onLocateMe,
  onResetView,
  onToggleFullscreen,
  isFullscreen,
  geoError
}) => {
  return (
    <div className="absolute bottom-4 right-4 z-30 flex flex-col items-center space-y-1.5 pointer-events-auto">
      
      {/* Geolocation Toast Notification */}
      {geoError && (
        <div className="mb-2 px-3 py-1.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-xs font-mono backdrop-blur-xl shadow-lg animate-fade-in font-semibold">
          {geoError}
        </div>
      )}

      {/* Floating Light Glass Control Panel */}
      <div className="flex flex-col p-1 rounded-2xl bg-white/95 border border-[#D2DEC9] backdrop-blur-xl shadow-lg divide-y divide-[#EFF4EC]">
        
        {/* Zoom In */}
        <button
          onClick={onZoomIn}
          className="group relative p-2.5 rounded-xl text-[#3D5034] hover:text-[#1A2318] hover:bg-[#F4F8F2] transition-all"
          aria-label="Zoom In"
        >
          <Plus className="w-4 h-4" />
          <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2 py-1 rounded-lg bg-white border border-[#D2DEC9] text-micro font-mono text-[#1A2318] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md font-semibold">
            Zoom In (+)
          </span>
        </button>

        {/* Zoom Out */}
        <button
          onClick={onZoomOut}
          className="group relative p-2.5 rounded-xl text-[#3D5034] hover:text-[#1A2318] hover:bg-[#F4F8F2] transition-all"
          aria-label="Zoom Out"
        >
          <Minus className="w-4 h-4" />
          <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2 py-1 rounded-lg bg-white border border-[#D2DEC9] text-micro font-mono text-[#1A2318] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md font-semibold">
            Zoom Out (-)
          </span>
        </button>

        {/* Locate User */}
        <button
          onClick={onLocateMe}
          className="group relative p-2.5 rounded-xl text-[#3D5034] hover:text-[#4B6B40] hover:bg-[#F4F8F2] transition-all"
          aria-label="My Location"
        >
          <Navigation className="w-4 h-4" />
          <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2 py-1 rounded-lg bg-white border border-[#D2DEC9] text-micro font-mono text-[#1A2318] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md font-semibold">
            My Location
          </span>
        </button>

        {/* Reset View */}
        <button
          onClick={onResetView}
          className="group relative p-2.5 rounded-xl text-[#3D5034] hover:text-[#2563EB] hover:bg-[#F4F8F2] transition-all"
          aria-label="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2 py-1 rounded-lg bg-white border border-[#D2DEC9] text-micro font-mono text-[#1A2318] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md font-semibold">
            Reset View (Jaipur)
          </span>
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={onToggleFullscreen}
          className="group relative p-2.5 rounded-xl text-[#3D5034] hover:text-[#1A2318] hover:bg-[#F4F8F2] transition-all"
          aria-label="Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4 text-[#7C3AED]" /> : <Maximize2 className="w-4 h-4" />}
          <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2 py-1 rounded-lg bg-white border border-[#D2DEC9] text-micro font-mono text-[#1A2318] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md font-semibold">
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </span>
        </button>

      </div>
    </div>
  );
};
