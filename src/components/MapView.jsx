import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './MapView.css';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MapView = ({ latitude, longitude, routeHistory = [] }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView([latitude, longitude], 13);
    }
  }, [latitude, longitude]);

  // Convert route history to polyline coordinates
  const routePath = routeHistory.map(point => [point.lat, point.lng]);

  // Get start and end points
  const startPoint = routeHistory.length > 0 ? routeHistory[0] : null;
  const endPoint = routeHistory.length > 0 ? routeHistory[routeHistory.length - 1] : null;

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <div className="map-container">
      <h3 className="map-title">📍 Live Location & Route</h3>
      <MapContainer
        center={[latitude, longitude]}
        zoom={13}
        ref={mapRef}
        className="map-view"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Route path polyline */}
        {routePath.length > 1 && (
          <Polyline
            positions={routePath}
            pathOptions={{
              color: '#667eea',
              weight: 4,
              opacity: 0.7,
              lineJoin: 'round'
            }}
          />
        )}

        {/* Waypoint markers */}
        {routeHistory.map((point, index) => (
          <CircleMarker
            key={point.timestamp}
            center={[point.lat, point.lng]}
            radius={5}
            pathOptions={{
              fillColor: index === 0 ? '#22c55e' : index === routeHistory.length - 1 ? '#ef4444' : '#667eea',
              fillOpacity: 0.8,
              color: '#ffffff',
              weight: 2
            }}
          >
            <Popup>
              <div style={{ minWidth: '150px' }}>
                <strong>{index === 0 ? '🟢 Start' : index === routeHistory.length - 1 ? '🔴 Current' : `📍 Point ${index + 1}`}</strong><br />
                <small>{formatTime(point.timestamp)}</small><br />
                Lat: {point.lat.toFixed(5)}<br />
                Lng: {point.lng.toFixed(5)}<br />
                Temp: {point.temperature}°C<br />
                Humidity: {point.humidity}%
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Current position marker (main marker) */}
        <Marker position={[latitude, longitude]}>
          <Popup>
            <strong>📍 Current Device Location</strong><br />
            Lat: {latitude.toFixed(4)}<br />
            Lng: {longitude.toFixed(4)}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapView;

