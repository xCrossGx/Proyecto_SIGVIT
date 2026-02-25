import { config } from "dotenv";

config();

export const MQTT_HOST = process.env.MQTT_HOST || 'localhost';
export const MQTT_PORT = Number(process.env.MQTT_PORT) || 1883;
export const MQTT_USER = process.env.MQTT_USER || 'mqtt';
export const MQTT_PASSWORD = process.env.MQTT_PASSWORD || 'mqtt';

const POSTGRES_PORT = Number(process.env.POSTGRES_PORT) || 5432;
const POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost';
const POSTGRES_USER = process.env.POSTGRES_USER || 'postgres'; 
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'postgres';
const POSTGRES_DB = process.env.POSTGRES_DB || 'postgres';

export const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_super_secreta'; 

export const POSTGRES_CONFIG = {
    host: POSTGRES_HOST,
    port: POSTGRES_PORT,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB
}

export const SERVER_ENV = process.env.NODE_ENV || 'development';
export const SERVER_PORT = process.env.SERVER_PORT || 3000;
const SERVER_HOST = process.env.SERVER_HOST || 'localhost';

export const SERVER_URL = `http://${SERVER_HOST}:${SERVER_PORT}`;