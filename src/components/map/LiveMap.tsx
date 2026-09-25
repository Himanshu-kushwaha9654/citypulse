import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import { CityMap } from './CityMap';
import { MapToolbar } from './MapToolbar';
import { MapControls } from './MapControls';
import { MapLegend } from './MapLegend';
import { CityPulseHUD } from './CityPulseHUD';
import { 
  DEFAULT_CITY, 
  CityMapEvent, 
  CityTrafficSegment, 
  SearchLocation 
} from '../../data/mockMapData';
import { getMapEvents, getTrafficSegments } from '../../services/mapDataService';
import { useCityPulse } from '../../context/CityPulseContext';

interface LiveMapProps {
  heightClass?: string;
  isExpanded?: boolean;
}

export const LiveMap: React.FC<LiveMapProps> = ({
  heightClass = 'h-[520px]',
  isExpanded = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const { setSelectedNeighborhood, setActivePage, selectedCityConfig, focusedCoordinates, setFocusedCoordinates } = useCityPulse();

  const [mapEvents, setMapEvents] = useState<CityMapEvent[]>([]);
  const [trafficSegments, setTrafficSegments] = useState<CityTrafficSegment[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [mapCenter, setMapCenter] = useState<[number, number]>([DEFAULT_CITY.lat, DEFAULT_CITY.lng]);
  const [mapZoom, setMapZoom] = useState<number>(DEFAULT_CITY.zoom);
  const [selectedEvent, setSelectedEvent] = useState<CityMapEvent | null>(null);
  const [searchedLocation, setSearchedLocation] = useState<SearchLocation | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isLegendOpen, setIsLegendOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [lastUpdatedSecAgo, setLastUpdatedSecAgo] = useState<number>(4);

  // Fetch telemetry events & traffic corridors for selected city
  useEffect(() => {
    getMapEvents(selectedCityConfig.id).then(events => setMapEvents(events));
    getTrafficSegments().then(segments => setTrafficSegments(segments));
    setMapCenter([selectedCityConfig.latitude, selectedCityConfig.longitude]);
    setMapZoom(selectedCityConfig.zoom);
    setSelectedEvent(null);
  }, [selectedCityConfig]);

  // Consume the shared "focus this location" request set by district
  // search, the "Locate"/"View on Map" buttons on alert/anomaly cards, and
  // the district search dropdown (CityPulseContext.focusedCoordinates).
  // Without this, those controls set the request but nothing ever panned
  // the map to it.
  useEffect(() => {
    if (!focusedCoordinates) return;
    setMapCenter(focusedCoordinates);
    setMapZoom(15);
    setFocusedCoordinates(null);
  }, [focusedCoordinates, setFocusedCoordinates]);

  // Section 24 & 25: Controlled Mock Realtime Simulation Engine
  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdatedSecAgo(prev => {
        if (prev >= 8) {
          // Fluctuate 1 random telemetry event value slightly
          setMapEvents(currEvents => {
            if (currEvents.length === 0) return currEvents;
            const randomIndex = Math.floor(Math.random() * currEvents.length);
            const targetEvt = currEvents[randomIndex];

            if (targetEvt.value !== undefined) {
              const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
              const newValue = Math.max(10, targetEvt.value + delta);
              const updatedEvts = [...currEvents];
              updatedEvts[randomIndex] = {
                ...targetEvt,
                value: newValue,
                timestamp: "Just now"
              };
              return updatedEvts;
            }
            return currEvents;
          });
          return 1;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Section 6: Filter events by selected category
  const filteredEvents = mapEvents.filter(evt => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'traffic') return evt.type === 'traffic';
    if (activeFilter === 'air_quality') return evt.type === 'air_quality';
    if (activeFilter === 'weather') return evt.type === 'weather';
    if (activeFilter === 'transit') return evt.type === 'transit';
    if (activeFilter === 'incidents') return evt.type === 'incident';
    if (activeFilter === 'utilities') return evt.type === 'utility';
    return true;
  });

  // Section 5: Search Selection Handler
  const handleSelectSearchLocation = useCallback((loc: SearchLocation) => {
    setSearchedLocation(loc);
    setMapCenter([loc.latitude, loc.longitude]);
    setMapZoom(15);
  }, []);

  // Section 14: Browser Geolocation Handler (ONLY on user click)
  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLocation([lat, lng]);
          setMapCenter([lat, lng]);
          setMapZoom(15);
          setGeoError(null);
        },
        (err) => {
          setGeoError('Location access unavailable');
          setTimeout(() => setGeoError(null), 3500);
        }
      );
    } else {
      setGeoError('Geolocation not supported');
      setTimeout(() => setGeoError(null), 3500);
    }
  };

  // Section 15: Reset Map Handler
  const handleResetView = () => {
    setMapCenter([selectedCityConfig.latitude, selectedCityConfig.longitude]);
    setMapZoom(selectedCityConfig.zoom);
    setActiveFilter('all');
    setSelectedEvent(null);
    setSearchedLocation(null);
  };

  // Section 16: Fullscreen Toggle Handler
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full ${isFullscreen ? 'h-screen rounded-none' : heightClass} rounded-2xl overflow-hidden smart-card`}
    >
      {/* Section 4: Redesigned Floating Map Toolbar */}
      <MapToolbar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onSelectSearchLocation={handleSelectSearchLocation}
        isLegendOpen={isLegendOpen}
        onToggleLegend={() => setIsLegendOpen(prev => !prev)}
        lastUpdatedSecAgo={lastUpdatedSecAgo}
      />

      {/* Section 17: Compact Expandable Map Legend */}
      <MapLegend
        isOpen={isLegendOpen}
        onClose={() => setIsLegendOpen(false)}
      />

      {/* Section 26: Floating Command Center HUD */}
      <CityPulseHUD events={filteredEvents} />

      {/* Section 13: Floating Dark Glass Map Controls */}
      <MapControls
        onZoomIn={() => setMapZoom(prev => Math.min(prev + 1, 18))}
        onZoomOut={() => setMapZoom(prev => Math.max(prev - 1, 8))}
        onLocateMe={handleLocateMe}
        onResetView={handleResetView}
        onToggleFullscreen={handleToggleFullscreen}
        isFullscreen={isFullscreen}
        geoError={geoError}
      />

      {/* Interactive OpenStreetMap Base & Glowing Overlays */}
      <CityMap
        events={filteredEvents}
        trafficSegments={trafficSegments}
        center={mapCenter}
        zoom={mapZoom}
        selectedEvent={selectedEvent}
        onSelectEvent={setSelectedEvent}
        searchedLocation={searchedLocation}
        userLocation={userLocation}
        onMapReady={(map) => { mapInstanceRef.current = map; }}
      />
    </div>
  );
};
