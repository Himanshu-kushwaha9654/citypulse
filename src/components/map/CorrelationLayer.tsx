import React from 'react';
import { Polyline, CircleMarker } from 'react-leaflet';
import { CityMapEvent } from '../../data/mockMapData';

interface CorrelationLayerProps {
  selectedEvent: CityMapEvent | null;
  allEvents: CityMapEvent[];
}

export const CorrelationLayer: React.FC<CorrelationLayerProps> = ({ selectedEvent, allEvents }) => {
  if (!selectedEvent) return null;

  // Find correlated events either explicitly or geographically close (<3km)
  const correlatedEvents = allEvents.filter(evt => {
    if (evt.id === selectedEvent.id) return false;
    
    // Explicit correlation ID match
    if (selectedEvent.correlatedEventIds && selectedEvent.correlatedEventIds.includes(evt.id)) {
      return true;
    }

    // Geolocation distance estimation (lat/lng diff within 0.035 deg ~ 3.5km)
    const latDiff = Math.abs(evt.latitude - selectedEvent.latitude);
    const lngDiff = Math.abs(evt.longitude - selectedEvent.longitude);
    return latDiff < 0.035 && lngDiff < 0.035;
  });

  if (correlatedEvents.length === 0) return null;

  return (
    <>
      {correlatedEvents.map((target) => (
        <React.Fragment key={`corr-${selectedEvent.id}-${target.id}`}>
          {/* Dashed connecting line */}
          <Polyline
            positions={[
              [selectedEvent.latitude, selectedEvent.longitude],
              [target.latitude, target.longitude]
            ]}
            pathOptions={{
              color: '#22D3EE',
              weight: 2,
              dashArray: '6, 8',
              opacity: 0.85
            }}
          />

          {/* Highlight ring around correlated nearby event */}
          <CircleMarker
            center={[target.latitude, target.longitude]}
            radius={22}
            pathOptions={{
              color: '#22D3EE',
              fillColor: '#22D3EE',
              fillOpacity: 0.15,
              weight: 1.5,
              dashArray: '4, 4'
            }}
          />
        </React.Fragment>
      ))}
    </>
  );
};
