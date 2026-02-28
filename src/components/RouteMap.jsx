import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

const TYPE_COLORS = {
  FLIGHT: '#1890ff',
  BUS: '#52c41a',
  SUBWAY: '#fa8c16',
  UBER: '#722ed1',
  DESTINATION: '#ff4d4f',
};

const TYPE_EMOJIS = {
  FLIGHT: '✈',
  BUS: '🚌',
  SUBWAY: '🚇',
  UBER: '🚗',
  DESTINATION: '🏁',
};

const createCustomIcon = (type) => {
  const color = TYPE_COLORS[type] || '#666';
  const emoji = TYPE_EMOJIS[type] || '📍';

  return L.divIcon({
    html: `
      <div style="
        background: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      ">
        ${emoji}
      </div>
    `,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
};

const FitBounds = ({ positions }) => {
  const map = useMap();
  useEffect(() => {
    if (positions.length >= 2) {
      const bounds = L.latLngBounds([positions[0], positions[1]]);
      map.fitBounds(bounds, { padding: [60, 60] });
    } else if (positions.length === 1) {
      map.setView(positions[0], 10);
    }
  }, [positions, map]);
  return null;
};

const RouteMap = ({ route }) => {
  if (!route) return null;

  const segments = [];

  if (route.beforeFlight) {
    segments.push({
      from: route.beforeFlight.originLocation,
      to: route.beforeFlight.destinationLocation,
      type: route.beforeFlight.transportationType,
    });
  }

  segments.push({
    from: route.flight.originLocation,
    to: route.flight.destinationLocation,
    type: 'FLIGHT',
  });

  if (route.afterFlight) {
    segments.push({
      from: route.afterFlight.originLocation,
      to: route.afterFlight.destinationLocation,
      type: route.afterFlight.transportationType,
    });
  }

  const stops = [];
  segments.forEach((seg, index) => {
    if (index === 0) {
      stops.push({ location: seg.from, type: seg.type });
    }
    stops.push({
      location: seg.to,
      type: segments[index + 1]?.type || 'DESTINATION',
    });
  });

  const validStops = stops.filter(
    s => s.location?.latitude && s.location?.longitude
  );

  const validSegments = segments.filter(
    s => s.from?.latitude && s.from?.longitude && s.to?.latitude && s.to?.longitude
  );

  const positions = validStops.map(s => [s.location.latitude, s.location.longitude]);

  if (positions.length === 0) return <p>No coordinates available</p>;

  return (
    <MapContainer
      style={{ height: '350px', width: '100%', borderRadius: 8 }}
      center={positions[0]}
      zoom={5}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds positions={positions} />

      {validStops.map((stop, index) => (
        <Marker
          key={index}
          position={[stop.location.latitude, stop.location.longitude]}
          icon={createCustomIcon(stop.type)}
        >
          <Popup>
            <strong>{stop.location.name}</strong>
            <br />
            {stop.location.locationCode}
          </Popup>
        </Marker>
      ))}

      {validSegments.map((segment, index) => (
        <Polyline
          key={index}
          positions={[
            [segment.from.latitude, segment.from.longitude],
            [segment.to.latitude, segment.to.longitude],
          ]}
          color={TYPE_COLORS[segment.type] || '#666'}
          weight={3}
          dashArray={segment.type === 'FLIGHT' ? '8, 8' : null}
        />
      ))}
    </MapContainer>
  );
};

export default RouteMap;