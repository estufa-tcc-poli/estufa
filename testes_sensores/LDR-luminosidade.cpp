void setup()
{
    Serial.begin(115200);
}

void loop()
{
    int luz = analogRead(A0);

    Serial.print("Luz: ");
    Serial.println(luz);

    delay(500);
}