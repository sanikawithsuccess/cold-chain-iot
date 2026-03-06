import { useState, useEffect } from 'react';

export const useRouteHistory = (currentData) => {
  const [routeHistory, setRouteHistory] = useState(() => {
    // Load from localStorage on init
    const saved = localStorage.getItem('routeHistory');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isTracking, setIsTracking] = useState(true);

  // Add new position to history when data changes
  useEffect(() => {
    if (!currentData || !isTracking) return;
    
    const { latitude, longitude, temperature, humidity } = currentData;
    
    // Only add if coordinates are valid and different from last entry
    if (latitude && longitude) {
      setRouteHistory(prev => {
        const lastEntry = prev[prev.length - 1];
        
        // Check if position has changed significantly (avoid duplicates)
        if (lastEntry && 
            Math.abs(lastEntry.lat - latitude) < 0.0001 && 
            Math.abs(lastEntry.lng - longitude) < 0.0001) {
          return prev;
        }
        
        const newEntry = {
          lat: latitude,
          lng: longitude,
          temperature,
          humidity,
          timestamp: new Date().toISOString()
        };
        
        const updated = [...prev, newEntry];
        
        // Keep only last 100 entries to avoid memory issues
        const trimmed = updated.slice(-100);
        
        // Save to localStorage
        localStorage.setItem('routeHistory', JSON.stringify(trimmed));
        
        return trimmed;
      });
    }
  }, [currentData, isTracking]);

  const clearHistory = () => {
    setRouteHistory([]);
    localStorage.removeItem('routeHistory');
  };

  const toggleTracking = () => {
    setIsTracking(prev => !prev);
  };

  return {
    routeHistory,
    isTracking,
    clearHistory,
    toggleTracking
  };
};
