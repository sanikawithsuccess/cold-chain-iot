import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';
import { useState, useEffect } from 'react';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export const useFirebaseData = () => {
  const [data, setData] = useState({
    sensor1: { temperature: null, humidity: null },
    sensor2: { temperature: null, humidity: null },
    latitude: 18.9897,
    longitude: 72.8403,
    status1: 'LOADING',
    status2: 'LOADING'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const dataRef = ref(database, 'coldchain/device1');

    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        const firebaseData = snapshot.val();

        if (!firebaseData) {
          console.log('No data found');
          setError('No data available');
          setLoading(false);
          return;
        }

        console.log('Firebase data:', firebaseData);

        // Support both nested (sensor1/sensor2) and flat (legacy) structure
        const s1 = firebaseData.sensor1 ?? {
          temperature: firebaseData.temperature,
          humidity: firebaseData.humidity
        };
        const s2 = firebaseData.sensor2 ?? { temperature: null, humidity: null };

        const status1 = s1.temperature != null
          ? (s1.temperature > 8 ? 'ALERT 🔴' : 'SAFE 🟢')
          : 'NO DATA';
        const status2 = s2.temperature != null
          ? (s2.temperature > 8 ? 'ALERT 🔴' : 'SAFE 🟢')
          : 'NO DATA';

        setData({
          sensor1: s1,
          sensor2: s2,
          latitude: firebaseData.latitude || 18.9897,
          longitude: firebaseData.longitude || 72.8403,
          status1,
          status2
        });
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Firebase error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { data, loading, error };
};
