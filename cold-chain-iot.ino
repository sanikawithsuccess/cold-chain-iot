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
  "https://YOUR-FIREBASE-DATABASE-LINK.firebaseio.com/";

// ---------- GPS ----------
TinyGPSPlus gps;
HardwareSerial GPS(2);

// ---------- DHT ----------
#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// ---------- OLED ----------
U8G2_SH1106_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, U8X8_PIN_NONE);

void setup() {
  Serial.begin(115200);

  // GPS
  GPS.begin(9600, SERIAL_8N1, 16, 17);

  // DHT
  dht.begin();

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
  float temperature = dht.readTemperature();
  float humidity    = dht.readHumidity();

  // ----- OLED DISPLAY -----
  u8g2.clearBuffer();

  u8g2.setCursor(0, 12);
  u8g2.print("Temp: ");
  u8g2.print(temperature, 1);
  u8g2.print(" C");

  u8g2.setCursor(0, 24);
  u8g2.print("Hum : ");
  u8g2.print(humidity, 1);
  u8g2.print(" %");

  u8g2.setCursor(0, 36);
  u8g2.print("Sat : ");
  u8g2.print(gps.satellites.isValid() ? gps.satellites.value() : 0);

  u8g2.setCursor(64, 36);
  u8g2.print("Fix : ");
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
  if (WiFi.status() == WL_CONNECTED && gps.location.isValid()) {

    WiFiClientSecure client;
    client.setInsecure();  // required for Firebase HTTPS

    HTTPClient https;
    https.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);
    https.begin(client, FIREBASE_URL);
    https.addHeader("Content-Type", "application/json");

    String json =
      "{"
      "\"temperature\":" + String(temperature, 1) + ","
      "\"humidity\":" + String(humidity, 1) + ","
      "\"latitude\":" + String(gps.location.lat(), 6) + ","
      "\"longitude\":" + String(gps.location.lng(), 6) +
      "}";

    int httpResponseCode = https.PATCH(json);

    Serial.print("Firebase response: ");
    Serial.println(httpResponseCode);

    https.end();
  }

  delay(5000);   // update every 5 seconds
}
