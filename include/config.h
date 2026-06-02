#pragma once

// --- Wi-Fi (modo ponto de acesso se STA falhar ou estiver vazio) ---
#define AP_SSID "TCC-Estufa"
#define AP_PASSWORD "tcc12345"
#define WIFI_CONNECT_TIMEOUT_MS 15000

// --- Pinos dos atuadores (ajuste conforme seu hardware) ---
#define PIN_FAN 26
#define PIN_PUMP 27
#define PIN_LED 14

// --- Sensor (descomente e instale lib DHT se usar DHT22 real) ---
// #define USE_DHT22
// #define PIN_DHT 4
#define USE_SIMULATED_SENSORS 1

// --- Historico em RAM (amostras circulares) ---
#define HISTORY_SIZE 48

// --- Firmware ---
#define FIRMWARE_VERSION "1.0.0"
#define DEVICE_NAME_DEFAULT "Estufa-01"
