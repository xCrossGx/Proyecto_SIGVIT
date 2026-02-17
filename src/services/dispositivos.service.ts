import mqtt from 'mqtt';
import { MQTT_HOST, MQTT_PASSWORD, MQTT_PORT, MQTT_USER } from '../utils/config.js';

const data = new Map();

const mqttClient = mqtt.connect(MQTT_HOST, 
    { 
        protocol: 'mqtt', 
        username: MQTT_USER, 
        password: MQTT_PASSWORD, 
        port: MQTT_PORT 
    }
);

mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
    mqttClient.subscribe('devices/#');
});

mqttClient.on('message', (topic, message) => {
    try {  
        const payload = JSON.parse(message.toString());
        const mac = payload.mac

        if(mac) {
            data.set(mac, {
                timestamp: payload.timestamp,
                data: {
                    temp1: payload.data.temp1,
                    temp2: payload.data.temp2,
                }
            })
        }

    } catch (error) {
        console.log("Error:", error);        
    }
})

mqttClient.on('error', (err) => {
  console.log('Error de conexión:', err);
});

mqttClient.on('offline', () => {
  console.log('El cliente está offline');
});

export const getData = () => {
    return data;
}

export const getDeviceData = (mac: string) => {
    return data.get(mac);
}

export default mqttClient;