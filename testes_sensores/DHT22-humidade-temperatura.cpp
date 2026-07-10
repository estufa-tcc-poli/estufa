#include "DHT.h"

#define DHTPIN D2
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

void setup()
{
    Serial.begin(115200);
    dht.begin();
}

void loop()
{
    float h = dht.readHumidity();
    float t = dht.readTemperature();

    Serial.print("Umidade: ");
    Serial.print(h);
    Serial.print("%  Temperatura: ");
    Serial.print(t);
    Serial.println("°C");

    delay(2000);
}