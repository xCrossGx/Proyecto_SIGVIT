const express = require('express');
const mqtt = require('mqtt');
const pacientes = require('./pacientes/pacientes.controller')
const { initDB } = require('./database_manager')

require('dotenv').config()

const postgresConfig = {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD
}

initDB(postgresConfig)

const mqttHost = process.env.MQTT_HOST || "localhost"
const mqttPort = process.env.MQTT_PORT || 1883
const serverPort = process.env.SERVER_PORT || 3000

const app = express();
app.use(express.json());

let dispositivosData = new Map(); 

const client = mqtt.connect('mqtt://'+mqttHost+':'+mqttPort, {username: process.env.MQTT_USERNAME, password: process.env.MQTT_PASSWORD});; 

client.on('connect', () => {
    console.log('✅ Conectado al Broker MQTT');
    client.subscribe('devices/#'); 
});

const startTimestampMs = Date.now()
const simularSensores = () => {
    setInterval( () => {
        dispositivosData.set("AB:CD:EF:GH:" + Math.floor((Math.random() * (20 - 10)) + 10), {
            timestamp: (Date.now() - startTimestampMs),
            data: {
                temp1: Math.round((Math.random() * (60 - 10)) + 10),
                temp2: Math.round((Math.random() * (60 - 10)) + 10)
            } 
        })
    }, 1000)
}

client.on('message', (topic, message) => {
    try {
        const payload = JSON.parse(message.toString());
        const mac = payload.mac
        
        if(mac) {
            dispositivosData.set(mac, {
                timestamp: payload.timestamp,
                data: {
                    temp1: payload.data.temp1,
                    temp2: payload.data.temp2,
                }
            })
            //console.log(dispositivosData[id])
        }
    } catch (e) { console.log("Error MQTT"); }
});

app.use('/pacientes', pacientes)

app.get('/api/dispositivos', (req, res) => {
    const array = Array.from(dispositivosData, ([mac, data]) => ({ 
        mac, 
        ...data 
    }));

    res.status(200).json(array)
})

app.get('/api/dispositivos/:id', (req, res) => {
    const id = req.params.id;
    if(dispositivosData.has(id)) {
        res.status(200).json(dispositivosData.get(id))
    } else {
        res.status(404).json("No se ha encontrado el id")
    }
})

simularSensores()
app.listen(serverPort, () => console.log('🚀 Servidor con persistencia en puerto '));