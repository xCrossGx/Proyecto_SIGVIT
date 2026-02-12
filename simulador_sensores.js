const mqtt = require('mqtt');

require('dotenv').config()

const mqttHost = process.env.MQTT_HOST || "localhost"
const mqttPort = process.env.MQTT_PORT || 1883
const client = mqtt.connect('mqtt://'+mqttHost+':'+mqttPort, {username: process.env.MQTT_USERNAME, password: process.env.MQTT_PASSWORD});; 

client.on('connect', () => {
    setInterval(() => {
        const payload = {
            mac: "1234",
            timestamp: Date.now(),
            data: {
                temp1: 30,
                temp2: 40
            }
        };
        client.publish('devices', JSON.stringify(payload));
        console.log('🚀 Datos de sensores enviados');
    }, 1000);
});