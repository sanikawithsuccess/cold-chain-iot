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
  apiKey: "AIzaSyBjaKjjNBQd_10AHGp0yGs4MRCSzZfDaBA",
  authDomain: "cold-chain-monitoring-ddd33.firebaseapp.com",
  databaseURL: "https://cold-chain-monitoring-ddd33-default-rtdb.firebaseio.com",
  projectId: "cold-chain-monitoring-ddd33",
  storageBucket: "cold-chain-monitoring-ddd33.firebasestorage.app",
  messagingSenderId: "941440366744",
  appId: "1:941440366744:web:8bc530c01327809355b8ed",
  measurementId: "G-QXYLVV2SSY"
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
