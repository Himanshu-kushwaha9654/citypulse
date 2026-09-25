import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { CityMapEvent, CityTrafficSegment, SearchLocation } from '../../data/mockMapData';
import { TrafficLayer } from './TrafficLayer';
import { CorrelationLayer } from './CorrelationLayer';
import { useCityPulse } from '../../context/CityPulseContext';

// Helper controller component to programmatically animate pan & zoom via flyTo
const MapController: React.FC<{ 
  center: [number, number]; 
  zoom: number; 
  onMapReady?: (map: L.Map) => void;
}> = ({ center, zoom, onMapReady }) => {
  const map = useMap();
  
  useEffect(() => {
    if (onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  useEffect(() => {
    map.flyTo(center, zoom, {
      duration: 1.4,
      easeLinearity: 0.25
    });
  }, [center, zoom, map]);

  return null;
};

// Custom Glowing HTML Leaflet DivIcon Factory (Section 7 & 8)
const createCustomMarkerIcon = (
  type: CityMapEvent['type'], 
  severity: CityMapEvent['severity'],
  isSelected: boolean
) => {
  let color = '#10B981';
  let glowColor = 'rgba(16, 185, 129, 0.5)';
  let iconSvg = '';

  switch (type) {
    case 'traffic':
      color = '#F59E0B';
      glowColor = 'rgba(245, 158, 11, 0.6)';
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`;
      break;
    case 'air_quality':
      color = '#22D3EE';
      glowColor = 'rgba(34, 211, 238, 0.6)';
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>`;
      break;
    case 'weather':
      color = '#60A5FA';
      glowColor = 'rgba(96, 165, 250, 0.6)';
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>`;
      break;
    case 'transit':
      color = '#A78BFA';
      glowColor = 'rgba(167, 139, 250, 0.6)';
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="3" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><path d="m8 19-2 3"/><path d="m18 22-2-3"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/></svg>`;
      break;
    case 'incident':
      color = '#EF4444';
      glowColor = 'rgba(239, 68, 68, 0.7)';
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>`;
      break;
    case 'utility':
      color = '#FACC15';
      glowColor = 'rgba(250, 204, 21, 0.6)';
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;
      break;
  }

  // Severity Pulse & Glow Dynamics
  let pulseRing = '';
  let scaleStyle = isSelected ? 'transform: scale(1.25);' : '';
  let extraBorder = isSelected ? `outline: 3px solid ${color}; outline-offset: 3px;` : '';

  if (severity === 'critical') {
    pulseRing = `<div style="position: absolute; inset: -8px; border-radius: 50%; background: ${glowColor}; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.75;"></div>`;
  } else if (severity === 'high') {
    pulseRing = `<div style="position: absolute; inset: -5px; border-radius: 50%; background: ${glowColor}; animation: pulse 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite; opacity: 0.5;"></div>`;
  }

  const html = `
    <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; ${scaleStyle}">
      ${pulseRing}
      <div style="
        position: relative; 
        width: 38px; 
        height: 38px; 
        border-radius: 50%; 
        background: #0e1017; 
        border: 2px solid ${color}; 
        box-shadow: 0 0 ${isSelected ? '24px' : '14px'} ${glowColor}; 
        color: ${color}; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        transition: all 0.25s ease-out;
        ${extraBorder}
      ">
        ${iconSvg}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'citypulse-custom-marker',
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -22]
  });
};

// Search Location Pin Icon Factory
const createSearchPinIcon = () => {
  const html = `
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; inset: -6px; border-radius: 50%; background: rgba(16, 185, 129, 0.4); animation: ping 2s infinite;"></div>
      <div style="width: 28px; height: 28px; border-radius: 50%; background: #10B981; border: 2px solid #ffffff; box-shadow: 0 0 16px #10B981; color: #000; display: flex; align-items: center; justify-content: center; font-weight: bold;">
        📍
      </div>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'citypulse-search-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
};

// Viewport-aware Marker Layer component
const ViewportMarkerLayer: React.FC<{
  events: CityMapEvent[];
  selectedEvent: CityMapEvent | null;
  onSelectEvent: (event: CityMapEvent) => void;
  selectNeighborhoodById: (id: string) => void;
}> = ({ events, selectedEvent, onSelectEvent, selectNeighborhoodById }) => {
  const map = useMap();
  const [visibleEvents, setVisibleEvents] = useState<CityMapEvent[]>(events);

  const updateVisibleEvents = useCallback(() => {
    if (!map) return;

    try {
      const rawBounds = map.getBounds();
      // Add a light 5% padding so markers near edge do not disappear abruptly
      const paddedBounds = rawBounds.pad(0.05);
      const zoomLevel = map.getZoom();

      // 1. Filter events inside padded viewport bounds
      const inBounds = events.filter(evt => {
        const point = L.latLng(evt.latitude, evt.longitude);
        return paddedBounds.contains(point);
      });

      // 2. Zoom density capping (Section 5 & 6)
      // City level (zoom <= 12): ~18-22 markers
      // Medium zoom (zoom 13-14): ~25-34 markers
      // High zoom (zoom >= 15): show all in-bounds
      let maxAllowed = inBounds.length;
      if (zoomLevel <= 12) {
        maxAllowed = Math.min(22, inBounds.length);
      } else if (zoomLevel <= 14) {
        maxAllowed = Math.min(34, inBounds.length);
      }

      if (inBounds.length <= maxAllowed) {
        setVisibleEvents(inBounds);
      } else {
        const severityWeight: Record<string, number> = {
          critical: 4,
          high: 3,
          medium: 2,
          low: 1
        };

        const sorted = [...inBounds].sort((a, b) => {
          if (selectedEvent?.id === a.id) return -1;
          if (selectedEvent?.id === b.id) return 1;
          return (severityWeight[b.severity] || 1) - (severityWeight[a.severity] || 1);
        });

        setVisibleEvents(sorted.slice(0, maxAllowed));
      }
    } catch {
      setVisibleEvents(events);
    }
  }, [events, map, selectedEvent]);

  useEffect(() => {
    updateVisibleEvents();

    map.on('moveend', updateVisibleEvents);
    map.on('zoomend', updateVisibleEvents);

    return () => {
      map.off('moveend', updateVisibleEvents);
      map.off('zoomend', updateVisibleEvents);
    };
  }, [map, updateVisibleEvents]);

  return (
    <>
      {/* Heatmap intensity circles for critical events in active viewport */}
      {visibleEvents.map((evt) => {
        if (evt.type === 'traffic' && evt.severity === 'critical') {
          return (
            <Circle
              key={`circle-traffic-${evt.id}`}
              center={[evt.latitude, evt.longitude]}
              radius={750}
              pathOptions={{ fillColor: '#EF4444', fillOpacity: 0.22, color: '#EF4444', weight: 1.5 }}
            />
          );
        }
        if (evt.type === 'air_quality' && evt.severity === 'high') {
          return (
            <Circle
              key={`circle-aqi-${evt.id}`}
              center={[evt.latitude, evt.longitude]}
              radius={950}
              pathOptions={{ fillColor: '#22D3EE', fillOpacity: 0.18, color: '#22D3EE', weight: 1.5 }}
            />
          );
        }
        return null;
      })}

      {/* Glowing CityPulse Data Markers Layer */}
      {visibleEvents.map((evt) => {
        const isSelected = selectedEvent?.id === evt.id;

        return (
          <Marker
            key={evt.id}
            position={[evt.latitude, evt.longitude]}
            icon={createCustomMarkerIcon(evt.type, evt.severity, isSelected)}
            zIndexOffset={isSelected ? 1000 : 100}
            eventHandlers={{
              click: () => onSelectEvent(evt)
            }}
          >
            {/* Quick Hover Tooltip */}
            <Tooltip direction="top" offset={[0, -20]} opacity={0.98} className="citypulse-hover-tooltip">
              <div className="px-2.5 py-1.5 bg-white border border-[#D2DEC9] rounded-xl text-[#1A2318] text-xs font-mono shadow-lg">
                <strong className="text-[#5E7352] uppercase text-micro block font-bold">{evt.type.replace('_', ' ')}</strong>
                <span className="font-semibold">{evt.locationName}</span>
                {evt.value !== undefined && (
                  <span className="block text-[#52604D] text-micro font-bold mt-0.5">
                    {evt.value} {evt.unit}
                  </span>
                )}
              </div>
            </Tooltip>

            {/* Polished Glass CityPulse Popup */}
            <Popup className="citypulse-leaflet-popup">
              <div className="p-3.5 bg-white border border-[#D2DEC9] rounded-2xl text-[#1A2318] min-w-[240px] font-sans shadow-xl">
                
                {/* Category Header */}
                <div className="flex items-center justify-between gap-2 border-b border-[#E4ECE0] pb-2 mb-2">
                  <span className="text-micro font-mono font-bold uppercase tracking-wider text-[#5E7352] flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#5E7352]" />
                    <span>{evt.type.replace('_', ' ')}</span>
                  </span>
                  <span className="text-micro font-mono text-[#768570]">{evt.timestamp}</span>
                </div>

                {/* Title & Description */}
                <h4 className="text-xs font-bold text-[#1A2318] font-heading">{evt.title}</h4>
                <div className="text-micro font-mono text-[#768570] mt-0.5">📍 {evt.locationName}</div>
                <p className="text-micro text-[#52604D] mt-1.5 leading-snug">{evt.description}</p>

                {/* Key Metrics Grid */}
                {evt.value !== undefined && (
                  <div className="mt-2.5 p-2 rounded-xl bg-[#F4F8F2] border border-[#D2DEC9] grid grid-cols-2 gap-2 text-xs font-mono">
                    <div>
                      <span className="text-micro text-[#768570] block">Current Reading</span>
                      <strong className="text-[#1A2318] font-bold">{evt.value} {evt.unit}</strong>
                    </div>
                    {evt.change && (
                      <div>
                        <span className="text-micro text-[#768570] block">Baseline Shift</span>
                        <strong className="text-[#96632B] font-bold">{evt.change}</strong>
                      </div>
                    )}
                  </div>
                )}

                {/* Impact */}
                {evt.impact && (
                  <div className="mt-2 text-micro font-mono text-[#52604D] bg-[#F4F8F2] p-1.5 rounded-lg border border-[#D2DEC9]">
                    <span className="text-[#1A2318] font-semibold">Impact: </span>
                    <span>{evt.impact}</span>
                  </div>
                )}

                {/* View Details Button */}
                <button
                  onClick={() => {
                    onSelectEvent(evt);
                    selectNeighborhoodById(evt.districtId);
                  }}
                  className="mt-3 w-full py-2 rounded-xl bg-[#5E7352] hover:bg-[#4D5F43] text-white font-extrabold text-xs transition shadow-md flex items-center justify-center space-x-1"
                >
                  <span>View Details</span>
                  <span>→</span>
                </button>

              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

interface CityMapProps {
  events: CityMapEvent[];
  trafficSegments?: CityTrafficSegment[];
  center: [number, number];
  zoom: number;
  selectedEvent: CityMapEvent | null;
  onSelectEvent: (event: CityMapEvent) => void;
  searchedLocation: SearchLocation | null;
  userLocation: [number, number] | null;
  onMapReady?: (map: L.Map) => void;
}

export const CityMap: React.FC<CityMapProps> = ({
  events,
  trafficSegments = [],
  center,
  zoom,
  selectedEvent,
  onSelectEvent,
  searchedLocation,
  userLocation,
  onMapReady
}) => {
  const { selectNeighborhoodById } = useCityPulse();

  return (
    <div className="relative w-full h-full">
      
      {/* Subtle Vignette Mask around map edges */}
      <div className="absolute inset-0 pointer-events-none z-20 shadow-[inset_0_0_50px_rgba(0,0,0,0.65)] rounded-2xl" />

      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full rounded-2xl z-10"
        attributionControl={true}
      >
        <MapController center={center} zoom={zoom} onMapReady={onMapReady} />

        {/* Official OpenStreetMap Tile Layer */}
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          maxZoom={19}
        />

        {/* Traffic Corridor Segments */}
        <TrafficLayer segments={trafficSegments} />

        {/* Correlation Relationship Layer */}
        <CorrelationLayer selectedEvent={selectedEvent} allEvents={events} />

        {/* Search Result Highlight Circle & Marker */}
        {searchedLocation && (
          <>
            <Circle
              center={[searchedLocation.latitude, searchedLocation.longitude]}
              radius={600}
              pathOptions={{ fillColor: '#10B981', fillOpacity: 0.2, color: '#10B981', weight: 2, dashArray: '4, 4' }}
            />
            <Marker
              position={[searchedLocation.latitude, searchedLocation.longitude]}
              icon={createSearchPinIcon()}
              zIndexOffset={1200}
            >
              <Popup className="citypulse-leaflet-popup">
                <div className="p-3 bg-white border border-[#D2DEC9] rounded-2xl text-[#1A2318] min-w-[200px] font-sans shadow-xl">
                  <div className="flex items-center space-x-1.5 border-b border-[#E4ECE0] pb-1.5 mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#5E7352]" />
                    <span className="text-micro font-mono font-bold uppercase tracking-wider text-[#5E7352]">
                      SEARCHED LOCATION
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#1A2318] font-heading">{searchedLocation.name}</h4>
                  <p className="text-micro text-[#52604D] mt-1">{searchedLocation.description || 'District Location'}</p>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Browser Geolocation User Marker */}
        {userLocation && (
          <>
            <Circle
              center={userLocation}
              radius={300}
              pathOptions={{ fillColor: '#5E7352', fillOpacity: 0.25, color: '#5E7352', weight: 1.5 }}
            />
            <Marker
              position={userLocation}
              icon={L.divIcon({
                html: `<div style="width: 16px; height: 16px; border-radius: 50%; background: #5E7352; border: 2.5px solid #ffffff; box-shadow: 0 0 10px rgba(94,115,82,0.4);"></div>`,
                className: 'citypulse-user-location-marker',
                iconSize: [16, 16],
                iconAnchor: [8, 8]
              })}
              zIndexOffset={1500}
            />
          </>
        )}

        {/* Viewport-aware & Zoom Density Cap Marker Layer */}
        <ViewportMarkerLayer
          events={events}
          selectedEvent={selectedEvent}
          onSelectEvent={onSelectEvent}
          selectNeighborhoodById={selectNeighborhoodById}
        />

      </MapContainer>
    </div>
  );
};
