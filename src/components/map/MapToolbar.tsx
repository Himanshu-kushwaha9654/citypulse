import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { SearchLocation, JAIPUR_SEARCH_LOCATIONS } from '../../data/mockMapData';

interface MapToolbarProps {
  activeFilter: string;
  onFilterChange: (filterId: string) => void;
  onSelectSearchLocation: (loc: SearchLocation) => void;
  isLegendOpen: boolean;
  onToggleLegend: () => void;
  lastUpdatedSecAgo: number;
}

export const MapToolbar: React.FC<MapToolbarProps> = ({
  activeFilter,
  onFilterChange,
  onSelectSearchLocation,
  isLegendOpen,
  onToggleLegend,
  lastUpdatedSecAgo
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLocations = searchQuery.trim() === ''
    ? []
    : JAIPUR_SEARCH_LOCATIONS.filter(loc => 
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (loc.description && loc.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  const categories = [
    { id: 'all', label: 'All', color: '#4B6B40' },
    { id: 'traffic', label: 'Traffic', color: '#D97706' },
    { id: 'air_quality', label: 'Air Quality', color: '#059669' },
    { id: 'weather', label: 'Weather', color: '#2563EB' },
    { id: 'transit', label: 'Transit', color: '#7C3AED' },
    { id: 'incidents', label: 'Incidents', color: '#DC2626' },
    { id: 'utilities', label: 'Utilities', color: '#D97706' },
  ];

  return (
    <div className="absolute top-3 left-3 right-3 z-30 flex flex-col md:flex-row items-center justify-between gap-2.5 pointer-events-none">
      
      {/* LEFT: Legend toggle & Category Filters */}
      <div className="pointer-events-auto flex items-center space-x-1.5 p-1.5 rounded-full bg-white/95 border border-[#D2DEC9] backdrop-blur-xl shadow-lg overflow-x-auto max-w-full scrollbar-none">
        {/* Expandable Legend Toggle Button */}
        <button
          onClick={onToggleLegend}
          className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all flex items-center space-x-1 ${
            isLegendOpen
              ? 'bg-[#5E7352] text-white shadow-xs'
              : 'text-[#4A5D44] hover:text-[#1A2318] bg-[#EFF4EC] hover:bg-[#E2ECE0] border border-[#D2DEC9]'
          }`}
        >
          <span>LEGEND</span>
          <span className="text-micro opacity-75">{isLegendOpen ? '▲' : '▾'}</span>
        </button>

        <span className="h-4 w-px bg-[#D2DEC9] mx-1 shrink-0" />

        {/* Category Filters */}
        {categories.map((cat) => {
          const isActive = activeFilter === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onFilterChange(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center space-x-1.5 shrink-0 ${
                isActive
                  ? 'bg-[#5E7352] text-white font-bold shadow-xs'
                  : 'text-[#4A5D44] hover:text-[#1A2318] hover:bg-[#EFF4EC] border border-transparent'
              }`}
            >
              <span 
                className="w-2 h-2 rounded-full transition-transform" 
                style={{ 
                  backgroundColor: isActive ? '#FFFFFF' : cat.color,
                  transform: isActive ? 'scale(1.2)' : 'scale(1)'
                }} 
              />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* CENTER / FLEXIBLE: Search Box with Autocomplete */}
      <div ref={searchRef} className="pointer-events-auto relative w-full md:w-72 shrink-0">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-[#5A6D53] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder="Search Jaipur area (MI Road)..."
            className="w-full pl-9 pr-8 py-1.5 text-xs rounded-full bg-white border border-[#D2DEC9] text-[#1A2318] placeholder-[#6C7E67] shadow-lg backdrop-blur-xl focus:outline-none focus:border-[#5E7352] transition-all font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsDropdownOpen(false);
              }}
              className="absolute right-3 p-0.5 rounded-full hover:bg-[#E4ECE0] text-[#5A6D53]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Autocomplete Dropdown */}
        {isDropdownOpen && filteredLocations.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#D2DEC9] rounded-2xl shadow-xl overflow-hidden z-50 backdrop-blur-2xl text-xs max-h-56 divide-y divide-[#EFF4EC]">
            {filteredLocations.map((loc, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelectSearchLocation(loc);
                  setSearchQuery(loc.name);
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-3.5 py-2.5 hover:bg-[#F4F8F2] text-[#1A2318] transition flex items-start space-x-2.5 group"
              >
                <MapPin className="w-3.5 h-3.5 text-[#4B6B40] mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[#1A2318] flex items-center justify-between">
                    <span>{loc.name}</span>
                    <span className="text-micro font-mono text-[#4B6B40] opacity-0 group-hover:opacity-100 transition-opacity">
                      Fly To →
                    </span>
                  </div>
                  {loc.description && (
                    <div className="text-micro text-[#5A6D53] truncate mt-0.5">{loc.description}</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT: Live Pulse Status Indicator */}
      <div className="pointer-events-auto hidden lg:flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-[#D2DEC9] backdrop-blur-xl shadow-lg text-xs font-mono">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4B6B40] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4B6B40]"></span>
        </span>
        <span className="font-bold text-[#2D4226] uppercase tracking-wider text-micro">LIVE</span>
        <span className="text-[#C2D2B9]">|</span>
        <span className="text-[#5A6D53] text-micro">Updated {lastUpdatedSecAgo}s ago</span>
      </div>

    </div>
  );
};
