const { readPatients, savePatient, updatePatient } = require('./file_manager')
const express = require('express');
const mqtt = require('mqtt');
require('dotenv').config()

const app = express();
app.use(express.json());

let dispositivosData = new Map(); 
const mqttHost = process.env.MQTT_HOST || "localhost"
const mqttPort = process.env.MQTT_PORT || 1883
const client = mqtt.connect('mqtt://'+mqttHost+':'+mqttPort, {username: process.env.MQTT_USERNAME, password: process.env.MQTT_PASSWORD});; 

client.on('connect', () => {
    console.log('✅ Conectado al Broker MQTT');
    client.subscribe('devices/#'); 
});

client.on('message', (topic, message) => {
    try {
        const payload = JSON.parse(message.toString());
        const id = payload.mac
        
        if(id) {
            dispositivosData.set(id, {
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

// --- ENDPOINTS MODIFICADOS PARA USAR EL ARCHIVO ---

app.get('/api/pacientes', async (req, res) => {
    const pacientes = await readPatients(); // Lee del archivo antes de enviar
    console.log(pacientes)
    res.json(pacientes);
});

app.post('/api/pacientes', async (req, res) => {
    console.log(req.body)
    const { cedula, nombre, apellido, fechaNacimiento } = req.body;

    // Validación de campos obligatorios
    if (!nombre || !cedula) {
        return res.status(400).json({ error: "Faltan datos obligatorios (nombre o cedula)" });
    }
    
    const nuevoPaciente = {
        cedula,
        nombre, 
        apellido,  
        fechaNacimiento,
        fechaRegistro: new Date().toISOString()
    };
    
    const isSaved = await savePatient(nuevoPaciente)

    if (isSaved) {
        res.status(201).send("Paciente registrado con éxito.");
    } else {
        res.status(400).send("El paciente ya existe o hubo un error.");
    }
});

app.put('/api/pacientes/:id', (req, res) => {
    let pacientes = leerArchivo();
    const index = pacientes.findIndex(p => p.id == req.params.id);

    if (index !== -1) {
        pacientes[index] = { ...pacientes[index], ...req.body };
        guardarArchivo(pacientes); // Guardar cambios
        res.json(pacientes[index]);
    } else {
        res.status(404).json({ error: "No encontrado" });
    }
});

app.patch('/api/pacientes/:cedula', async (req, res) => {
    const cedula = Number(req.params.cedula);
    const { nombre, apellido, fechaNacimiento } = req.body;
    
    const nuevoPaciente = {
        nombre, 
        apellido,  
        fechaNacimiento,
    };

    await updatePatient(cedula, nuevoPaciente)
    res.json("Fino")
})

app.delete('/api/pacientes/:id', (req, res) => {
    let pacientes = leerArchivo();
    const nuevosPacientes = pacientes.filter(p => p.id != req.params.id);

    if (pacientes.length !== nuevosPacientes.length) {
        guardarArchivo(nuevosPacientes); // Guardar lista actualizada
        res.json({ mensaje: "Eliminado" });
    } else {
        res.status(404).json({ error: "No encontrado" });
    }
});

app.get('/api/dispositivos', (req, res) => {
    res.json(Array.from(dispositivosData.keys()))
})

app.get('/api/dispositivos/:id', (req, res) => {
    const id = req.params.id;
    console.log(id)
    if(dispositivosData.has(id)) {
        res.json(dispositivosData.get(id))
    } else {
        res.json("No se ha encontrado ese id")
    }
})

app.listen(process.env.SERVER_PORT, () => console.log('🚀 Servidor con persistencia en puerto '));