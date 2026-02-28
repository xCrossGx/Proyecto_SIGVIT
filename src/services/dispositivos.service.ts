import mqtt from 'mqtt';
import { MQTT_HOST, MQTT_PASSWORD, MQTT_PORT, MQTT_USER } from '../utils/config.js';
import logger from '../utils/logger.js'

const isDebug = process.env.NODE_ENV === 'debug'; // O 'development'

export interface DeviceData {
    mac?: string; // Opcional porque a veces viene en el payload y otras es la llave del Map
    timestamp: string;
    data: {
        temp1: number;
        temp2: number;
        ecg: number;
        bpm: number;
        spo2: number;
    };
}

const data = new Map<string, DeviceData>();

let mqttClient:mqtt.MqttClient | null = null;

// Función auxiliar para generar aleatorios
const randomRange = (min: number, max: number, decimals: number = 2): number => {
    const val = Math.random() * (max - min) + min;
    return parseFloat(val.toFixed(decimals));
};

if (isDebug) {
    
    logger.debug('Generando datos aleatorios');
    // Simulamos la llegada de datos cada 5 segundos
    setInterval(() => {
        const mockMac = '00:1A:2B:3C:4D:5E';
        const mockPayload: DeviceData = {
            timestamp: new Date().toISOString(),
            data: {
                temp1: randomRange(20, 30),
                temp2: randomRange(15, 25),
                ecg: randomRange(1500, 1600),
                bpm: Math.floor(randomRange(60, 100, 0)),
                spo2: randomRange(95, 100, 1)
            }
        };

        data.set(mockMac, mockPayload);
    }, 5000);

} else {
    // Configuración real de MQTT
    mqttClient = mqtt.connect(MQTT_HOST, { 
        protocol: 'mqtt', 
        username: MQTT_USER, 
        password: MQTT_PASSWORD, 
        port: MQTT_PORT 
    });

    mqttClient.on('connect', () => {
        logger.info('Usando MQTT')
        mqttClient!.subscribe('devices/#');
    });

    mqttClient.on('message', (topic, message) => {
        try {  
            const payload: DeviceData & { mac: string } = JSON.parse(message.toString());
            if (payload.mac) {
                data.set(payload.mac, {
                    timestamp: payload.timestamp,
                    data: payload.data
                });
            }
        } catch (error) {
            logger.error('Error parseando mensaje MQTT: ', {error})      
        }
    });

    mqttClient.on('error', (error) => logger.error('Error de conexión:', {error}));
    mqttClient.on('offline', () => logger.error('El cliente está offline'));
}

export const getData = () => data;
export const getDeviceData = (mac: string) => data.get(mac);

export default mqttClient;