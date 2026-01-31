const express = require('express');
const mqtt = require('mqtt');

const app = express();

// --- MIDDLEWARE ---
// Esto es vital para que app.post y app.put puedan leer el JSON que envías
app.use(express.json());

// --- "Base de Datos" en memoria ---
let pacientes = [];
let dispositivosData = {}; 

// --- CONFIGURACIÓN MQTT ---
const client = mqtt.connect('mqtt://broker.hivemq.com'); 

client.on('connect', () => {
    console.log('✅ Conectado al Broker MQTT');
    client.subscribe('hospital/monitores/+/data'); 
});

client.on('message', (topic, message) => {
    try {
        const payload = JSON.parse(message.toString());
        const espId = topic.split('/')[2]; 

        dispositivosData[espId] = {
            espId: espId,
            tempInfrarrojo: payload.tempIR,    
            tempContacto: payload.tempContact, 
            ecg: payload.ecgValue,             
            ultimaActualizacion: new Date().toLocaleTimeString()
        };

        console.log(`📥 Datos de ${espId}: IR:${payload.tempIR}° | Tacto:${payload.tempContact}° | ECG:${payload.ecgValue}`);
    } catch (error) {
        console.error("Error procesando mensaje MQTT", error);
    }
});

// --- ENDPOINTS PARA PACIENTES (Procesando el JSON solicitado) ---

// 1. Obtener todos los pacientes
app.get('/api/pacientes', (req, res) => {
    res.json(pacientes);
});

// 2. Crear paciente (Recibe: nombre, apellido, cedula, fecha_nac)
app.post('/api/pacientes', (req, res) => {
    // Extraemos los datos del JSON recibido en req.body
    const { nombre, apellido, cedula, fecha_nac } = req.body;

    // Validación básica
    if (!nombre || !cedula) {
        return res.status(400).json({ error: "Faltan datos obligatorios (nombre o cedula)" });
    }

    const nuevoPaciente = {
        id: Date.now(), // Generamos ID único numérico
        nombre,
        apellido,
        cedula,
        fecha_nac
    };

    pacientes.push(nuevoPaciente);
    console.log("👤 Nuevo paciente registrado:", nuevoPaciente);
    res.status(201).json(nuevoPaciente);
});

// 3. Modificar paciente por ID
app.put('/api/pacientes/:id', (req, res) => {
    const { id } = req.params;
    const index = pacientes.findIndex(p => p.id == id);

    if (index !== -1) {
        // Combinamos los datos actuales con los nuevos del JSON recibido
        pacientes[index] = { ...pacientes[index], ...req.body };
        console.log(`📝 Paciente ID ${id} actualizado`);
        res.json(pacientes[index]);
    } else {
        res.status(404).json({ error: "Paciente no encontrado" });
    }
});

// 4. Eliminar paciente
app.delete('/api/pacientes/:id', (req, res) => {
    const { id } = req.params;
    const inicialLength = pacientes.length;
    pacientes = pacientes.filter(p => p.id != id);

    if (pacientes.length < inicialLength) {
        res.json({ mensaje: `Paciente con ID ${id} eliminado correctamente` });
    } else {
        res.status(404).json({ error: "Paciente no encontrado" });
    }
});

// --- ENDPOINT PARA DISPOSITIVOS ---

app.get('/api/dispositivos', (req, res) => {
    res.json(Object.values(dispositivosData));
});

app.listen(3000, () => console.log('🚀 Servidor API en puerto 3000'));