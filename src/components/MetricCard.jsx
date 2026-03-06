import './MetricCard.css';

const MetricCard = ({ icon, label, value, unit, status }) => {
  const getStatusClass = () => {
    if (status === 'ALERT 🔴') return 'alert';
    if (status === 'SAFE 🟢') return 'safe';
    return '';
  };

  return (
    <div className={`metric-card ${getStatusClass()}`}>
      <div className="metric-icon">{icon}</div>
      <div className="metric-content">
        <div className="metric-label">{label}</div>
        <div className="metric-value">
          {value !== null && value !== undefined ? value : '--'}
          {unit && <span className="metric-unit">{unit}</span>}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
