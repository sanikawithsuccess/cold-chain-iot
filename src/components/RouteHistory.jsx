import './RouteHistory.css';

const RouteHistory = ({ history, onClear, isTracking, onToggleTracking }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const calculateDistance = (index) => {
    if (index === 0) return null;
    
    const prev = history[index - 1];
    const curr = history[index];
    
    // Haversine formula for distance in meters
    const R = 6371e3; // Earth radius in meters
    const φ1 = prev.lat * Math.PI / 180;
    const φ2 = curr.lat * Math.PI / 180;
    const Δφ = (curr.lat - prev.lat) * Math.PI / 180;
    const Δλ = (curr.lng - prev.lng) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const distance = R * c;
    
    if (distance < 1000) {
      return `${distance.toFixed(0)}m`;
    }
    return `${(distance / 1000).toFixed(2)}km`;
  };

  return (
    <div className="route-history-panel">
      <div className="history-header">
        <h3>📍 Route History</h3>
        <div className="history-controls">
          <button 
            className={`tracking-toggle ${isTracking ? 'active' : ''}`}
            onClick={onToggleTracking}
            title={isTracking ? 'Stop tracking' : 'Start tracking'}
          >
            {isTracking ? '⏸️' : '▶️'}
          </button>
          <button 
            className="clear-btn"
            onClick={onClear}
            disabled={history.length === 0}
            title="Clear history"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="history-stats">
        <div className="stat">
          <span className="stat-label">Points</span>
          <span className="stat-value">{history.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Status</span>
          <span className="stat-value">{isTracking ? '🟢 Live' : '🔴 Paused'}</span>
        </div>
      </div>

      <div className="history-list">
        {history.length === 0 ? (
          <div className="empty-state">
            <p>No route data yet</p>
            <p className="empty-hint">Start tracking to see history</p>
          </div>
        ) : (
          [...history].reverse().map((entry, index) => {
            const actualIndex = history.length - 1 - index;
            const distance = calculateDistance(actualIndex);
            
            return (
              <div key={entry.timestamp} className="history-entry">
                <div className="entry-header">
                  <span className="entry-time">{formatTime(entry.timestamp)}</span>
                  <span className="entry-date">{formatDate(entry.timestamp)}</span>
                </div>
                <div className="entry-coords">
                  📌 {entry.lat.toFixed(5)}, {entry.lng.toFixed(5)}
                </div>
                <div className="entry-metrics">
                  <span className="metric">🌡️ {entry.temperature}°C</span>
                  <span className="metric">💧 {entry.humidity}%</span>
                  {distance && <span className="metric">📏 {distance}</span>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RouteHistory;
