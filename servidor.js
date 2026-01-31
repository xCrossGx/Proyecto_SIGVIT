const express = require('express');
const mqtt = require('mqtt');

const app = express();
app.use(express.json());

// --- "Base de Datos" en memoria ---
let pacientes = [];
let dispositivosData = {}; 

// --- CONFIGURACIÓN MQTT ---
// Conexión al broker (usa la IP de tu servidor o un broker público)
const client = mqtt.connect('mqtt://broker.hivemq.com'); 

client.on('connect', () => {
    console.log('✅ Conectado al Broker MQTT');
    // Suscribirse a los tópicos de los monitores
    client.subscribe('hospital/monitores/+/data'); 
});

client.on('message', (topic, message) => {
    try {
        const payload = JSON.parse(message.toString());
        const espId = topic.split('/')[2]; // Extrae el ID del ESP32

        // Estructura que viene de los sensores del ESP32
        dispositivosData[espId] = {
            espId: espId,
            tempInfrarrojo: payload.tempIR,    // Sensor IR
            tempContacto: payload.tempContact, // Sensor Tacto
            ecg: payload.ecgValue,             // Valor del Electrocardiograma
            ultimaActualizacion: new Date().toLocaleTimeString()
        };

        console.log(`📥 Datos de ${espId}: IR:${payload.tempIR}° | Tacto:${payload.tempContact}° | ECG:${payload.ecgValue}`);
    } catch (error) {
        console.error("Error procesando mensaje MQTT", error);
    }
});

// --- ENDPOINTS PARA PACIENTES ---

// Obtener todos
app.get('/api/pacientes', (req, res) => res.json(pacientes));

// Crear paciente
app.post('/api/pacientes', (req, res) => {
    const nuevo = { id: Date.now(), ...req.body };
    pacientes.push(nuevo);
    res.status(201).json(nuevo);
});

// Modificar paciente
app.put('/api/pacientes/:id', (req, res) => {
    const index = pacientes.findIndex(p => p.id == req.params.id);
    if (index !== -1) {
        pacientes[index] = { ...pacientes[index], ...req.body };
        res.json(pacientes[index]);
    } else {
        res.status(404).send("Paciente no encontrado");
    }
});

// Eliminar paciente
app.delete('/api/pacientes/:id', (req, res) => {
    pacientes = pacientes.filter(p => p.id != req.params.id);
    res.send({ mensaje: "Paciente eliminado" });
});

// --- ENDPOINT PARA DISPOSITIVOS (Signos Vitales) ---

app.get('/api/dispositivos', (req, res) => {
    // Retorna la lista de todos los ESP32 activos con sus sensores
    res.json(Object.values(dispositivosData));
});

app.listen(3000, () => console.log('🚀 Servidor API en puerto 3000'));