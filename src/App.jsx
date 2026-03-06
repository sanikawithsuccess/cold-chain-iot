import { useFirebaseData } from './hooks/useFirebaseData';
import { useRouteHistory } from './hooks/useRouteHistory';
import MetricCard from './components/MetricCard';
import MapView from './components/MapView';
import RouteHistory from './components/RouteHistory';
import './App.css';

function App() {
  const { data, loading, error } = useFirebaseData();
  const { routeHistory, isTracking, clearHistory, toggleTracking } = useRouteHistory(data);

  return (
    <div className="app">
      <div className="background-gradient"></div>
      
      <header className="header">
        <h1 className="title">
          <span className="title-icon">❄️</span>
          Cold Chain Monitoring System
        </h1>
        <p className="subtitle">Real-time IoT Temperature &amp; Location Tracking</p>
      </header>

      {error && (
        <div className="error-banner">
          ⚠️ Connection Error: {error}
        </div>
      )}

      {loading && (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Connecting to Firebase...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Sensor 1 */}
          <div className="sensor-section">
            <h2 className="sensor-label">🌡️ DHT 1</h2>
            <div className="metrics-grid">
              <MetricCard
                icon="🌡️"
                label="Temperature"
                value={data.sensor1.temperature}
                unit="°C"
              />
              <MetricCard
                icon="💧"
                label="Humidity"
                value={data.sensor1.humidity}
                unit="%"
              />
              <MetricCard
                icon="📦"
                label="Status"
                value={data.status1}
                status={data.status1}
              />
            </div>
          </div>

          {/* Sensor 2 */}
          <div className="sensor-section">
            <h2 className="sensor-label">🌡️ DHT 2</h2>
            <div className="metrics-grid">
              <MetricCard
                icon="🌡️"
                label="Temperature"
                value={data.sensor2.temperature}
                unit="°C"
              />
              <MetricCard
                icon="💧"
                label="Humidity"
                value={data.sensor2.humidity}
                unit="%"
              />
              <MetricCard
                icon="📦"
                label="Status"
                value={data.status2}
                status={data.status2}
              />
            </div>
          </div>

          <MapView
            latitude={data.latitude}
            longitude={data.longitude}
            routeHistory={routeHistory}
          />

          <RouteHistory
            history={routeHistory}
            onClear={clearHistory}
            isTracking={isTracking}
            onToggleTracking={toggleTracking}
          />

          <footer className="footer">
            <p>IoT Cold Chain Monitoring | ESP32 + GPS + Firebase</p>
            <p className="footer-tech">Built with React + Vite + Leaflet</p>
          </footer>
        </>
      )}
    </div>
  );
}

export default App;

