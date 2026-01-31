const express = require('express');
const mqtt = require('mqtt');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Almacenamiento en memoria (Sustituye a la DB)
let pacientes = [];
let dispositivosData = {}; // Guarda el último estado de cada ESP32

// --- CONFIGURACIÓN MQTT ---
const client = mqtt.connect('mqtt://broker.hivemq.com'); // Usa tu broker aquí

client.on('connect', () => {
    console.log('Conectado al broker MQTT');
    client.subscribe('v1/dispositivos/+/signos'); // Suscripción dinámica
});

client.on('message', (topic, message) => {
    const data = JSON.parse(message.toString());
    const espId = topic.split('/')[2]; // Extrae el ID del ESP32 del tópico

    // Actualizamos el estado interno
    dispositivosData[espId] = {
        id: espId,
        ...data,
        timestamp: new Date().toISOString()
    };

    console.log(`Datos recibidos de ${espId}:`, data);
});

// --- ENDPOINTS PACIENTES (CRUD) ---

// Crear
app.post('/api/pacientes', (req, res) => {
    const nuevoPaciente = { id: Date.now(), ...req.body };
    pacientes.push(nuevoPaciente);
    res.status(201).json(nuevoPaciente);
});

// Leer todos
app.get('/api/pacientes', (req, res) => res.json(pacientes));

// Eliminar
app.delete('/api/pacientes/:id', (req, res) => {
    pacientes = pacientes.filter(p => p.id != req.params.id);
    res.send({ mensaje: "Paciente eliminado" });
});

// --- ENDPOINTS DISPOSITIVOS ---

app.get('/api/dispositivos', (req, res) => {
    // Retorna la lista de los últimos signos vitales captados
    res.json(Object.values(dispositivosData));
});

app.listen(3000, () => console.log('Servidor corriendo en el puerto 3000'));