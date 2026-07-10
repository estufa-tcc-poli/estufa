#include <ESP8266WiFi.h>
#include <time.h>
#include "DHT.h"

//=======================
// WIFI
//=======================

const char *ssid = "NOME DA REDE";
const char *password = "SENHA DA REDE";

//=======================
// DHT22
//=======================

#define DHTPIN D2
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

//=======================
// HC-SR04
//=======================

#define TRIG D5
#define ECHO D6

//=======================
// Estrutura das leituras
//=======================

struct LeituraSensores
{
    bool rtcOk;

    bool dhtOk;
    float temperatura;
    float umidade;

    bool hcOk;
    float distancia;

    int analogico;

    time_t timestamp;
};

LeituraSensores leitura;

//=======================
// WIFI
//=======================

void conectarWiFi()
{
    Serial.print("Conectando ao WiFi");

    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }

    Serial.println(" OK");
}

//=======================
// RTC
//=======================

void iniciarRTC()
{
    configTime(-3 * 3600, 0,
               "pool.ntp.org",
               "time.nist.gov");

    Serial.print("Sincronizando relógio");

    while (time(nullptr) < 100000)
    {
        delay(500);
        Serial.print(".");
    }

    Serial.println(" OK");
}

//=======================
// Leitura
//=======================

void lerSensores()
{
    // RTC
    leitura.timestamp = time(nullptr);
    leitura.rtcOk = leitura.timestamp > 100000;

    // DHT22

    leitura.temperatura = dht.readTemperature();
    leitura.umidade = dht.readHumidity();

    leitura.dhtOk =
        !(isnan(leitura.temperatura) ||
          isnan(leitura.umidade));

    // Sensor Analógico

    leitura.analogico = analogRead(A0);

    // HC-SR04

    digitalWrite(TRIG, LOW);
    delayMicroseconds(2);

    digitalWrite(TRIG, HIGH);
    delayMicroseconds(10);

    digitalWrite(TRIG, LOW);

    long duracao = pulseIn(ECHO, HIGH, 30000);

    if (duracao == 0)
    {
        leitura.hcOk = false;
        leitura.distancia = -1;
    }
    else
    {
        leitura.hcOk = true;
        leitura.distancia = duracao * 0.034 / 2.0;
    }
}

//=======================
// LOG
//=======================

void imprimirLog()
{
    Serial.println();
    Serial.println("===========================================");

    if (leitura.rtcOk)
    {
        struct tm *tempo = localtime(&leitura.timestamp);

        Serial.printf("%02d/%02d/%04d %02d:%02d:%02d\n",
                      tempo->tm_mday,
                      tempo->tm_mon + 1,
                      tempo->tm_year + 1900,
                      tempo->tm_hour,
                      tempo->tm_min,
                      tempo->tm_sec);
    }
    else
    {
        Serial.println("RTC: NAO CONECTADO");
    }

    Serial.println("-------------------------------------------");

    if (leitura.dhtOk)
    {
        Serial.printf("Temperatura : %.2f C\n", leitura.temperatura);
        Serial.printf("Umidade Ar  : %.2f %%\n", leitura.umidade);
    }
    else
    {
        Serial.println("DHT22       : NAO CONECTADO");
    }

    Serial.printf("Sensor A0   : %d\n", leitura.analogico);

    if (leitura.hcOk)
    {
        Serial.printf("HC-SR04     : %.2f cm\n", leitura.distancia);
    }
    else
    {
        Serial.println("HC-SR04     : NAO CONECTADO");
    }

    Serial.println("===========================================");
}

//=======================
// SETUP
//=======================

void setup()
{
    Serial.begin(115200);

    pinMode(TRIG, OUTPUT);
    pinMode(ECHO, INPUT);

    dht.begin();

    conectarWiFi();
    iniciarRTC();
}

//=======================
// LOOP
//=======================

void loop()
{
    lerSensores();

    imprimirLog();

    delay(2000);
}