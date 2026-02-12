const mqtt = require('mqtt');

require('dotenv').config()

const mqttHost = process.env.MQTT_HOST || "localhost"
const mqttPort = process.env.MQTT_PORT || 1883
const client = mqtt.connect('mqtt://'+mqttHost+':'+mqttPort, {username: process.env.MQTT_USERNAME, password: process.env.MQTT_PASSWORD});; 

const startTimestampMs = Date.now()
let publishCounter = 0
const publishIntervalMs = 1000

client.on('connect', () => {
    setInterval(() => {
        publishCounter++
        const timestamp = Date.now() - startTimestampMs
        const payload = {
            mac: "1234",
            timestamp: timestamp,
            data: {
                temp1: 30,
                temp2: 40
            }
        };
        client.publish('devices', JSON.stringify(payload));
        console.log({
            "Enviando datos al broker MQTT": {
                "tiempo": timestamp,
                "enviados": publishCounter
            }
        });
    }, publishIntervalMs);
});