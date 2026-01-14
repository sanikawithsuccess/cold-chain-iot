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
    temperature: null,
    humidity: null,
    latitude: 18.9897,
    longitude: 72.8403,
    status: 'LOADING'
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

        const temp = firebaseData.temperature;
        const status = temp > 8 ? 'ALERT 🔴' : 'SAFE 🟢';

        setData({
          temperature: temp,
          humidity: firebaseData.humidity,
          latitude: firebaseData.latitude || 18.9897,
          longitude: firebaseData.longitude || 72.8403,
          status
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
