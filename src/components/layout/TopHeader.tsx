import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Compass,
  ChevronDown,
  Settings,
  Sparkles,
  Search,
  Columns,
  User,
  Play,
  Pause,
  CornerDownLeft
} from 'lucide-react';
import { useCityPulse } from '../../context/CityPulseContext';
import { useDemoEngine } from '../../context/DemoEngineContext';
import { PageView, Neighborhood } from '../../types/citypulse';
import { CITIES, City } from '../../data/cities';
import { UserAvatar } from '../common/UserAvatar';
import { NotificationsDropdown } from './NotificationsDropdown';
import { ProfileMenu } from './ProfileMenu';
import { SettingsModal } from './SettingsModal';

export const TopHeader: React.FC = () => {
  const {
    activePage,
    setActivePage,
    setIsAiModalOpen,
    searchQuery,
    setSearchQuery,
    neighborhoods,
    selectNeighborhoodById,
    user,
    setIsAuthModalOpen,
    setIsComparisonModalOpen,
    isSimulationPaused,
    setIsSimulationPaused,
    selectedCity,
    setSelectedCityConfig,
    showToast
  } = useCityPulse();

  const demoEngine = useDemoEngine();

  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [cityHighlight, setCityHighlight] = useState(0);
  const [searchHighlight, setSearchHighlight] = useState(0);
  const cityBtnRef = useRef<HTMLButtonElement>(null);
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  // Global search covers both districts (within the current city) and
  // cities (to switch city) — a single box, one flat result list, so
  // typing a city name (e.g. "Jaipur") does something useful instead of
  // silently matching nothing against the district list alone.
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const filteredNeighborhoods: Neighborhood[] = trimmedQuery === ''
    ? neighborhoods
    : neighborhoods.filter((n: Neighborhood) => n.name.toLowerCase().includes(trimmedQuery));
  const filteredCities: City[] = trimmedQuery === ''
    ? CITIES.filter((c) => c.name !== selectedCity)
    : CITIES.filter((c) =>
        c.name.toLowerCase().includes(trimmedQuery) || c.state.toLowerCase().includes(trimmedQuery)
      ).filter((c) => c.name !== selectedCity);

  type SearchResult =
    | { kind: 'district'; item: Neighborhood }
    | { kind: 'city'; item: City };
  const searchResults: SearchResult[] = [
    ...filteredNeighborhoods.map((item): SearchResult => ({ kind: 'district', item })),
    ...filteredCities.map((item): SearchResult => ({ kind: 'city', item })),
  ];

  // Recompute anchor position whenever dropdown opens
  const openCityDropdown = useCallback(() => {
    if (cityBtnRef.current) {
      setDropdownRect(cityBtnRef.current.getBoundingClientRect());
    }
    setCityHighlight(CITIES.findIndex(c => c.name === selectedCity));
    setShowCityDropdown(true);
  }, [selectedCity]);

  // Close on outside click / Escape
  useEffect(() => {
    if (!showCityDropdown) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setShowCityDropdown(false); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setCityHighlight(h => Math.min(h + 1, CITIES.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setCityHighlight(h => Math.max(h - 1, 0)); }
      if (e.key === 'Enter') {
        const city = CITIES[cityHighlight];
        if (city) { setSelectedCityConfig(city); showToast(`Switched to ${city.name}, ${city.state}`, 'info'); setShowCityDropdown(false); }
      }
    };
    const onClick = (e: MouseEvent) => {
      const el = document.getElementById('city-dropdown-portal');
      if (el && !el.contains(e.target as Node) && !cityBtnRef.current?.contains(e.target as Node)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick); };
  }, [showCityDropdown, cityHighlight, setSelectedCityConfig, showToast]);

  // Selecting a district focuses the map on it; selecting a city switches
  // the whole dashboard to that city.
  const selectSearchResult = useCallback((result: SearchResult) => {
    if (result.kind === 'district') {
      selectNeighborhoodById(result.item.id);
      setActivePage('map');
    } else {
      setSelectedCityConfig(result.item);
      showToast(`Switched to ${result.item.name}, ${result.item.state}`, 'info');
    }
    setSearchQuery('');
    setShowSearchResults(false);
  }, [selectNeighborhoodById, setActivePage, setSelectedCityConfig, showToast, setSearchQuery]);

  // Global search: close on outside click / Escape, arrow-key + Enter to select
  useEffect(() => {
    if (!showSearchResults) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setShowSearchResults(false); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSearchHighlight(h => Math.min(h + 1, searchResults.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSearchHighlight(h => Math.max(h - 1, 0)); }
      if (e.key === 'Enter') {
        const match = searchResults[searchHighlight];
        if (match) selectSearchResult(match);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick); };
  }, [showSearchResults, searchHighlight, searchResults, selectSearchResult]);

  // Complete Page Navigation Tabs
  const navTabs: { id: PageView; label: string }[] = [
    { id: 'overview', label: 'Dashboard' },
    { id: 'traffic', label: 'Traffic' },
    { id: 'environment', label: 'Environment' },
    { id: 'utilities', label: 'Utilities' },
    { id: 'public-safety', label: 'Public Safety' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'map', label: 'Live Map' },
    { id: 'anomalies', label: 'Anomalies' },
    { id: 'trends', label: 'Trends' },
    { id: 'replay', label: 'Historical Replay' },
    { id: 'alerts', label: 'Alerts' },
    { id: 'sources', label: 'Data Sources' }
  ];

  return (
    <header className="w-full bg-[#E4ECE0]/90 backdrop-blur-2xl border-b border-[#D2DEC9] px-4 sm:px-6 py-3 sticky top-0 z-40 transition-all shadow-xs">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3">

        {/* Left Side: Brand Logo with Luxury Editorial Serif */}
        <div className="flex items-center space-x-3 self-start lg:self-auto shrink-0">
          <div
            onClick={() => setActivePage('overview')}
            className="w-9 h-9 rounded-2xl bg-[#5E7352] shadow-sm flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 transition-transform"
          >
            <Compass className="w-5 h-5 text-white stroke-[2.2]" />
          </div>
          <div>
            <h1
              onClick={() => setActivePage('overview')}
              className="text-xl font-bold tracking-tight text-[#1A2318] font-heading flex items-center gap-1.5 cursor-pointer"
            >
              CityPulse <span className="text-micro font-sans font-bold text-[#3B4D36] bg-[#D6E3CE] px-2 py-0.5 rounded-full border border-[#BFCDB5] uppercase tracking-wider">PRO</span>
            </h1>
          </div>
        </div>

        {/* Center Search & Pill Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 max-w-full overflow-hidden">

          {/* Global Location Search Box */}
          <div className="relative w-full sm:w-44 lg:w-48 shrink-0" ref={searchBoxRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#5A6D53]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchHighlight(0);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                placeholder="Search district or city..."
                aria-label="Search district or city"
                className="w-full pl-8 pr-8 py-1.5 text-xs rounded-full bg-white border border-[#D2DEC9] text-[#1A2318] placeholder-[#6C7E67] focus:outline-none focus:border-[#5E7352] shadow-xs transition-all"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const match = searchResults[searchHighlight] || searchResults[0];
                  if (match) selectSearchResult(match);
                }}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#5E7352] hover:bg-[#4A5D44] text-white p-1 rounded-full transition-colors flex items-center justify-center cursor-pointer"
                title="Press Enter to search"
              >
                <CornerDownLeft className="w-3 h-3" />
              </button>
            </div>

            {/* Search Dropdown Results */}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#D2DEC9] rounded-2xl shadow-xl z-50 overflow-hidden max-h-72 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <>
                    {filteredNeighborhoods.length > 0 && (
                      <div className="px-3.5 pt-2.5 pb-1 text-micro font-mono font-bold uppercase tracking-wider text-[#94A38C]">
                        Districts in {selectedCity}
                      </div>
                    )}
                    {searchResults.map((result, idx) => {
                      const isHighlighted = idx === searchHighlight;
                      if (result.kind === 'district') {
                        const n = result.item;
                        return (
                          <button
                            key={`district-${n.id}`}
                            onMouseEnter={() => setSearchHighlight(idx)}
                            onClick={() => selectSearchResult(result)}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs transition border-t border-[#EBF1E8] first:border-t-0 ${
                              isHighlighted ? 'bg-[#F4F8F2]' : 'hover:bg-[#F4F8F2]'
                            }`}
                          >
                            <span className="font-semibold text-[#1A2318]">{n.name}</span>
                            <span className="text-micro font-mono text-[#4A6340] font-bold">Pulse {n.pulseScore}</span>
                          </button>
                        );
                      }
                      const c = result.item;
                      const isFirstCity = idx === filteredNeighborhoods.length;
                      return (
                        <React.Fragment key={`city-${c.id}`}>
                          {isFirstCity && (
                            <div className="px-3.5 pt-2.5 pb-1 text-micro font-mono font-bold uppercase tracking-wider text-[#94A38C] border-t border-[#EBF1E8]">
                              Switch City
                            </div>
                          )}
                          <button
                            onMouseEnter={() => setSearchHighlight(idx)}
                            onClick={() => selectSearchResult(result)}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs transition ${
                              isHighlighted ? 'bg-[#F4F8F2]' : 'hover:bg-[#F4F8F2]'
                            }`}
                          >
                            <span className="font-semibold text-[#1A2318]">{c.name}</span>
                            <span className="text-micro text-[#5A6D53]">{c.state}</span>
                          </button>
                        </React.Fragment>
                      );
                    })}
                  </>
                ) : (
                  <div className="px-3.5 py-3 text-xs text-[#5A6D53] text-center">
                    No districts or cities match "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Pill Bar (Ostra Style) */}
          <nav className="flex items-center space-x-1 bg-[#EFF4EC] p-1 rounded-full border border-[#D2DEC9] overflow-x-auto max-w-full scrollbar-none shadow-xs">
            {navTabs.map((tab) => {
              const isActive = activePage === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActivePage(tab.id)}
                  className={`relative px-3.5 py-1.2 rounded-full text-xs font-semibold font-sans transition-all duration-150 whitespace-nowrap ${isActive
                      ? 'bg-[#5E7352] text-white font-bold shadow-xs'
                      : 'text-[#4A5D44] hover:text-[#1A2318] hover:bg-[#E2ECE0]'
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

        </div>

        {/* Right Controls Bar */}
        <div className="flex items-center space-x-2 shrink-0">

          {/* Realtime Play / Pause Button */}
          <button
            onClick={() => {
              setIsSimulationPaused(!isSimulationPaused);
              showToast(!isSimulationPaused ? 'Realtime simulation paused' : 'Realtime simulation active', 'info');
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold flex items-center space-x-1.5 transition border ${isSimulationPaused
                ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                : 'bg-white border-[#D2DEC9] text-[#2D3B28] hover:bg-[#EFF4EC]'
              }`}
            title={isSimulationPaused ? 'Resume Realtime Simulation' : 'Pause Realtime Simulation'}
          >
            {isSimulationPaused ? <Play className="w-3.5 h-3.5 fill-current text-amber-800" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
            <span className="hidden sm:inline">{isSimulationPaused ? 'PAUSED' : 'LIVE'}</span>
          </button>

          {/* Demo Engine Control Pill Button */}
          <button
            onClick={() => {
              if (!demoEngine.demoEnabled) {
                demoEngine.startDemo();
                showToast('CityPulse Demo Mode Activated', 'success');
              } else if (demoEngine.demoRunning) {
                demoEngine.pauseDemo();
                showToast('Demo Simulation Paused', 'info');
              } else {
                demoEngine.resumeDemo();
                showToast('Demo Simulation Resumed', 'success');
              }
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-sans font-bold flex items-center space-x-1.5 transition ${demoEngine.demoEnabled && demoEngine.demoRunning
                ? 'bg-[#4B6B40] text-white shadow-sm ring-2 ring-[#4B6B40]/30 animate-pulse'
                : demoEngine.demoEnabled && demoEngine.demoPaused
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-white border border-[#D2DEC9] text-[#3D5034] hover:bg-[#EFF4EC]'
              }`}
            title="Toggle CityPulse Interactive Demo Mode"
          >
            {demoEngine.demoRunning ? (
              <Pause className="w-3 h-3 fill-current" />
            ) : (
              <Play className="w-3 h-3 fill-current" />
            )}
            <span>
              {demoEngine.demoRunning
                ? '⏸ DEMO ACTIVE'
                : demoEngine.demoPaused
                  ? '▶ DEMO PAUSED'
                  : '▶ DEMO'}
            </span>
          </button>

          {/* City Selector */}
          <div className="relative">
            <button
              ref={cityBtnRef}
              onClick={() => showCityDropdown ? setShowCityDropdown(false) : openCityDropdown()}
              aria-haspopup="listbox"
              aria-expanded={showCityDropdown}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white border border-[#D2DEC9] text-xs font-semibold text-[#1A2318] hover:border-[#5E7352] transition shadow-xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#4B6B40] shadow-xs animate-pulse" />
              <span>{selectedCity}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#5A6D53] transition-transform duration-150 ${showCityDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showCityDropdown && dropdownRect && createPortal(
              <div
                id="city-dropdown-portal"
                role="listbox"
                aria-label="Select city"
                style={{
                  position: 'fixed',
                  top: dropdownRect.bottom + 6,
                  right: window.innerWidth - dropdownRect.right,
                  zIndex: 99999,
                  width: 220,
                  background: '#ffffff',
                  border: '1px solid #D2DEC9',
                  borderRadius: 16,
                  boxShadow: '0 12px 40px rgba(26,35,24,0.14)',
                  overflow: 'hidden',
                  animation: 'fade-in 0.15s ease-out',
                }}
              >
                {/* Header label */}
                <div style={{ padding: '10px 14px 6px', borderBottom: '1px solid #EFF4EC' }}>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#768570' }}>Select City</span>
                </div>

                {CITIES.map((city, idx) => {
                  const isSelected = city.name === selectedCity;
                  const isHighlighted = idx === cityHighlight;
                  return (
                    <button
                      key={city.id}
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setCityHighlight(idx)}
                      onClick={() => {
                        setSelectedCityConfig(city);
                        showToast(`Switched to ${city.name}, ${city.state}`, 'info');
                        setShowCityDropdown(false);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        padding: '9px 14px',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        background: isSelected ? '#EAF2E6' : isHighlighted ? '#F4F8F2' : 'transparent',
                        transition: 'background 0.1s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
                        {/* check mark - occupies fixed width so city names align */}
                        <span style={{ width: 14, flexShrink: 0, color: '#5E7352', fontSize: 12, fontWeight: 700 }}>
                          {isSelected ? '✓' : ''}
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: isSelected ? 700 : 500, color: isSelected ? '#3D5034' : '#1A2318', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {city.name}
                          </div>
                          <div style={{ fontSize: 10, color: '#768570', marginTop: 1 }}>{city.state}</div>
                        </div>
                      </div>
                      {city.dataMode === 'demo' && !isSelected && (
                        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#96632B', background: '#FFF3E0', border: '1px solid #FFD49A', borderRadius: 6, padding: '1px 5px', flexShrink: 0 }}>DEMO</span>
                      )}
                    </button>
                  );
                })}
              </div>,
              document.body
            )}
          </div>

          {/* Compare Districts Button */}
          <button
            onClick={() => setIsComparisonModalOpen(true)}
            className="p-2 rounded-full bg-white hover:bg-[#EFF4EC] border border-[#D2DEC9] text-[#3D5034] transition shadow-xs"
            title="Compare District Telemetry"
          >
            <Columns className="w-4 h-4" />
          </button>

          {/* AI Ask Button */}
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="p-2 rounded-full bg-[#5E7352] hover:bg-[#4E6143] text-white transition shadow-sm"
            title="Ask City AI Assistant"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Notifications Dropdown */}
          <NotificationsDropdown />

          {/* User Profile Avatar */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="rounded-2xl cursor-pointer p-0.5 focus:outline-none"
              title={user ? `Operator: ${user.email}` : 'Profile'}
            >
              <UserAvatar user={user} size="md" showStatusDot={true} />
            </button>

            {/* Profile Dropdown Menu */}
            <ProfileMenu
              isOpen={showProfileMenu}
              onClose={() => setShowProfileMenu(false)}
              onOpenSettings={() => setShowSettingsModal(true)}
            />
          </div>

        </div>

      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </header>
  );
};
