const express = require('express');
const mqtt = require('mqtt');
const fs = require('fs'); // <--- 1. Importar el módulo de archivos
const path = './pacientes.json'; // Nombre del archivo

const app = express();
app.use(express.json());

// --- FUNCIONES DE AYUDA (Lectura/Escritura) ---

const leerArchivo = () => {
    try {
        const data = fs.readFileSync(path, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Si el archivo no existe, devolvemos un array vacío
        return [];
    }
};

const guardarArchivo = (data) => {
    try {
        fs.writeFileSync(path, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error al guardar el archivo:", error);
    }
};

// --- MQTT (Se mantiene igual) ---
let dispositivosData = {}; 
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
            espId,
            tempInfrarrojo: payload.tempIR,
            tempContacto: payload.tempContact,
            ecg: payload.ecgValue,
            ultimaActualizacion: new Date().toLocaleTimeString()
        };
    } catch (e) { console.log("Error MQTT"); }
});

// --- ENDPOINTS MODIFICADOS PARA USAR EL ARCHIVO ---

app.get('/api/pacientes', (req, res) => {
    const pacientes = leerArchivo(); // Lee del archivo antes de enviar
    res.json(pacientes);
});

app.post('/api/pacientes', (req, res) => {
    const pacientes = leerArchivo(); // 1. Cargamos la lista actual desde el archivo
    const { nombre, apellido, cedula, fecha_nac } = req.body;

    // Validación de campos obligatorios
    if (!nombre || !cedula) {
        return res.status(400).json({ error: "Faltan datos obligatorios (nombre o cedula)" });
    }

    // --- NUEVA VALIDACIÓN DE CÉDULA ---
    // Buscamos si ya existe alguien con la misma cédula
    const existe = pacientes.some(p => p.cedula === cedula);

    if (existe) {
        console.log(`⚠️ Intento de duplicado: La cédula ${cedula} ya existe.`);
        return res.status(400).json({ 
            error: "Operación fallida", 
            mensaje: "Ya existe un paciente registrado con esta cédula." 
        });
    }
    // ----------------------------------

    const nuevoPaciente = { 
        id: Date.now(), 
        nombre, 
        apellido, 
        cedula, 
        fecha_nac 
    };
    
    pacientes.push(nuevoPaciente); 
    guardarArchivo(pacientes); // 3. Guardamos en el archivo físico

    console.log("👤 Nuevo paciente registrado con éxito:", nombre);
    res.status(201).json(nuevoPaciente);
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

app.get('/api/dispositivos', (req, res) => res.json(Object.values(dispositivosData)));

app.listen(3000, () => console.log('🚀 Servidor con persistencia en puerto 3000'));