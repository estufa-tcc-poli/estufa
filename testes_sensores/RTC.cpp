#include <ESP8266WiFi.h>
#include <time.h>

const char *ssid = "Area 121";
const char *password = "computacao123";

void setup()
{

    Serial.begin(115200);

    WiFi.begin(ssid, password);

    Serial.print("Conectando");

    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }

    Serial.println();
    Serial.println("WiFi conectado!");

    configTime(-3 * 3600, 0,
               "pool.ntp.org",
               "time.nist.gov");
}

void loop()
{

    time_t agora = time(nullptr);

    struct tm *tempo = localtime(&agora);

    Serial.printf("%02d/%02d/%04d %02d:%02d:%02d\n",
                  tempo->tm_mday,
                  tempo->tm_mon + 1,
                  tempo->tm_year + 1900,
                  tempo->tm_hour,
                  tempo->tm_min,
                  tempo->tm_sec);

    delay(1000);
}