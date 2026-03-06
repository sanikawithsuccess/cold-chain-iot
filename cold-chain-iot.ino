#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <TinyGPSPlus.h>
#include <DHT.h>
#include <U8g2lib.h>
#include <Wire.h>

// ---------- WIFI ----------
const char* WIFI_SSID = "YOUR-WIFI-NAME";
const char* WIFI_PASS = "YOUR-WIFI-PASSWORD";

// ---------- FIREBASE (Realtime DB URL) ----------
String FIREBASE_URL =
  "YOUR-FIREBASE-REAL-TIME-DATABASE-URL";

// ---------- GPS ----------
TinyGPSPlus gps;
HardwareSerial GPS(2);

// ---------- DHT SENSORS ----------
#define DHTPIN1   4       // DHT sensor 1 (e.g. inside cargo)
#define DHTPIN2   5       // DHT sensor 2 (e.g. outside / ambient)
#define DHTTYPE   DHT22

DHT dht1(DHTPIN1, DHTTYPE);
DHT dht2(DHTPIN2, DHTTYPE);

// ---------- OLED ----------
U8G2_SH1106_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, U8X8_PIN_NONE);

void setup() {
  Serial.begin(115200);

  // GPS
  GPS.begin(9600, SERIAL_8N1, 16, 17);

  // DHT sensors
  dht1.begin();
  dht2.begin();

  // OLED
  Wire.begin(21, 22);
  u8g2.begin();
  u8g2.setFont(u8g2_font_6x12_tf);

  u8g2.clearBuffer();
  u8g2.drawStr(0, 12, "Cold Chain");
  u8g2.drawStr(0, 28, "Monitoring");
  u8g2.sendBuffer();

  // WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected");
}

void loop() {

  // ----- GPS READ -----
  while (GPS.available()) {
    gps.encode(GPS.read());
  }

  // ----- SENSOR READ -----
  float temp1 = dht1.readTemperature();
  float hum1  = dht1.readHumidity();
  float temp2 = dht2.readTemperature();
  float hum2  = dht2.readHumidity();

  // Validate readings (NaN check)
  if (isnan(temp1)) { temp1 = 0.0; Serial.println("DHT1 temp read failed!"); }
  if (isnan(hum1))  { hum1  = 0.0; Serial.println("DHT1 hum read failed!"); }
  if (isnan(temp2)) { temp2 = 0.0; Serial.println("DHT2 temp read failed!"); }
  if (isnan(hum2))  { hum2  = 0.0; Serial.println("DHT2 hum read failed!"); }

  // ----- OLED DISPLAY -----
  u8g2.clearBuffer();

  // DHT1 row
  u8g2.setCursor(0, 12);
  u8g2.print("S1 T:");
  u8g2.print(temp1, 1);
  u8g2.print("C H:");
  u8g2.print(hum1, 0);
  u8g2.print("%");

  // DHT2 row
  u8g2.setCursor(0, 24);
  u8g2.print("S2 T:");
  u8g2.print(temp2, 1);
  u8g2.print("C H:");
  u8g2.print(hum2, 0);
  u8g2.print("%");

  // GPS status
  u8g2.setCursor(0, 36);
  u8g2.print("Sat:");
  u8g2.print(gps.satellites.isValid() ? gps.satellites.value() : 0);

  u8g2.setCursor(48, 36);
  u8g2.print("Fix:");
  u8g2.print(gps.location.isValid() ? "YES" : "NO");

  if (gps.location.isValid()) {
    u8g2.setCursor(0, 50);
    u8g2.print("Lat:");
    u8g2.print(gps.location.lat(), 4);

    u8g2.setCursor(0, 62);
    u8g2.print("Lng:");
    u8g2.print(gps.location.lng(), 4);
  } else {
    u8g2.setCursor(0, 54);
    u8g2.print("Waiting for GPS");
  }

  u8g2.sendBuffer();

  // ----- UPLOAD TO FIREBASE -----
  if (WiFi.status() == WL_CONNECTED) {

    // Use GPS if available, otherwise use default coordinates (Mumbai)
    float latitude  = gps.location.isValid() ? gps.location.lat() : 18.9897;
    float longitude = gps.location.isValid() ? gps.location.lng() : 72.8403;

    Serial.println("\n--- Uploading to Firebase ---");
    Serial.print("Sensor1 Temp: ");  Serial.print(temp1); Serial.print(" C  Hum: "); Serial.println(hum1);
    Serial.print("Sensor2 Temp: ");  Serial.print(temp2); Serial.print(" C  Hum: "); Serial.println(hum2);
    Serial.print("Latitude: ");      Serial.println(latitude, 6);
    Serial.print("Longitude: ");     Serial.println(longitude, 6);
    Serial.print("GPS Valid: ");     Serial.println(gps.location.isValid() ? "YES" : "NO (using default)");

    WiFiClientSecure client;
    client.setInsecure();  // required for Firebase HTTPS

    HTTPClient https;
    https.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);

    Serial.print("Connecting to: ");
    Serial.println(FIREBASE_URL);

    https.begin(client, FIREBASE_URL);
    https.addHeader("Content-Type", "application/json");

    String json =
      "{"
      "\"sensor1\":{"
        "\"temperature\":" + String(temp1, 1) + ","
        "\"humidity\":"    + String(hum1,  1) +
      "},"
      "\"sensor2\":{"
        "\"temperature\":" + String(temp2, 1) + ","
        "\"humidity\":"    + String(hum2,  1) +
      "},"
      "\"latitude\":"  + String(latitude,  6) + ","
      "\"longitude\":" + String(longitude, 6) +
      "}";

    Serial.print("JSON payload: ");
    Serial.println(json);

    int httpResponseCode = https.PATCH(json);

    Serial.print("Firebase HTTP Response Code: ");
    Serial.println(httpResponseCode);

    if (httpResponseCode > 0) {
      String response = https.getString();
      Serial.print("Response: ");
      Serial.println(response);
    } else {
      Serial.print("Error: ");
      Serial.println(https.errorToString(httpResponseCode));
    }

    https.end();
  } else {
    Serial.println("WiFi not connected!");
  }

  delay(5000);  // update every 5 seconds
}
