// ---------------- MAP SETUP ----------------
let map = L.map('map').setView([18.9897, 72.8403], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

let marker = L.marker([18.9897, 72.8403]).addTo(map);

// ---------------- FIREBASE (CDN IMPORTS) ----------------
import { initializeApp } from
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getDatabase, ref, onValue } from
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD9jlciHRhjKDNtaRsQgEC6da2-6OnqBLM",
  authDomain: "iot-cold-chain-monitoring.firebaseapp.com",
  databaseURL: "https://iot-cold-chain-monitoring-default-rtdb.firebaseio.com",
  projectId: "iot-cold-chain-monitoring",
  storageBucket: "iot-cold-chain-monitoring.appspot.com",
  messagingSenderId: "800057423384",
  appId: "1:800057423384:web:e25e594358c2d7fb0a756d"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// 🔴 PATH MUST MATCH FIREBASE EXACTLY
const dataRef = ref(database, "coldchain/device1");

// ---------------- READ DATA ----------------
onValue(dataRef, (snapshot) => {
  const data = snapshot.val();

  if (!data) {
    console.log("No data found");
    return;
  }

  console.log("Firebase data:", data); // DEBUG

  // Update values
  document.getElementById("temp").innerText = data.temperature;
  document.getElementById("hum").innerText = data.humidity;

  // Status logic
  let statusText = data.temperature > 8 ? "ALERT 🔴" : "SAFE 🟢";
  document.getElementById("status").innerText = statusText;

  // Update map
  const lat = data.latitude;
  const lng = data.longitude;

  marker.setLatLng([lat, lng]);
  map.setView([lat, lng], 13);
});
