const { readPatients, savePatient, updatePatient, deletePatient } = require('./file_manager')
const express = require('express');
const mqtt = require('mqtt');

require('dotenv').config()
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

app.get('/api/pacientes', async (req, res) => {
    const pacientes = await readPatients();
    res.status(200).json(pacientes);
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
    
    const result = await savePatient(nuevoPaciente)

    if (result) {
        res.status(201).send("Paciente registrado con éxito.");
    } else {
        res.status(400).send("El paciente ya existe o hubo un error.");
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

    const result = await updatePatient(cedula, nuevoPaciente)
    if(result) {
       res.status(200).json(result)
    } else {
        res.status(204).json("El paciente no existe o hubo un error.")
    }
})

app.delete('/api/pacientes/:cedula', async (req, res) => {
    const cedula = Number(req.params.cedula)
    const result = await deletePatient(cedula);
    if(result) {
        res.json("Eliminado correctamente.")
    } else {
        res.status(404).json("El paciente ya no existe o nunca existió.")
    }
});

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

app.listen(serverPort, () => console.log('🚀 Servidor con persistencia en puerto '));