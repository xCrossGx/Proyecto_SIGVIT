const express = require('express');
const mqtt = require('mqtt');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// --- 1. CONFIGURACIÓN BASE DE DATOS ---
const pool = new Pool({
    user: 'sigvit',      // Tu usuario
    host: 'localhost',
    database: 'db_sigvit',
    password: '1104',
    port: 5432,
});

// --- 2. VARIABLE DE ESTADO (MEMORIA TEMPORAL) ---
// Aquí guardamos los datos administrativos mientras esperamos a la ESP32
let contextoConsulta = null; 

// --- 3. CONEXIÓN MQTT ---
const mqttClient = mqtt.connect('mqtt://localhost:1883');

mqttClient.on('connect', () => {
    console.log('✅ Conectado al Broker MQTT');
    mqttClient.subscribe('esp32/sensores');
});

// --- 4. LÓGICA DE RECEPCIÓN DE SENSORES (MQTT) ---
mqttClient.on('message', async (topic, message) => {
    if (topic === 'esp32/sensores') {
        
        // Si no hay un doctor esperando datos, descartamos el mensaje o solo lo logueamos
        if (!contextoConsulta) {
            console.log('⚠️ Datos recibidos de ESP32, pero no hay consulta activa iniciada por el usuario.');
            return;
        }

        try {
            const data = JSON.parse(message.toString());
            console.log('📡 Datos recibidos de ESP32. Procesando consulta...');

            // Preparamos la inserción combinando:
            // 1. Datos del usuario (contextoConsulta)
            // 2. Datos de la ESP32 (data)
            // 3. Fecha automática (se encarga Postgres)
            
            const query = `
                INSERT INTO consulta 
                (cedula_paciente, cedula_doctor, recipe, temperatura_contacto, temperatura_infrarrojo, electrocardiograma) 
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *;
            `;

            // Validación simple del ECG (por si llega array o float)
            const ecgVal = Array.isArray(data.electrocardiograma) ? data.electrocardiograma[0] : data.electrocardiograma;

            const values = [
                contextoConsulta.cedula_paciente,
                contextoConsulta.cedula_doctor,
                contextoConsulta.recipe || 'Sin indicaciones', // Recipe opcional
                data.temperatura_contacto,
                data.temperatura_infrarrojo,
                ecgVal
            ];

            const res = await pool.query(query, values);
            
            console.log('✅ CONSULTA GUARDADA EXITOSAMENTE:', res.rows[0]);

            // Limpiamos el contexto para evitar guardar datos duplicados por error
            contextoConsulta = null; 
            console.log('🔄 Esperando nueva orden de inicio de consulta...');

        } catch (err) {
            console.error('❌ Error al guardar en base de datos:', err.message);
        }
    }
});

// --- 5. ENDPOINTS HTTP (API) ---

// A. Crear Persona (Doctor o Paciente)
app.post('/api/personas', async (req, res) => {
    const { cedula, nombre, apellido, fecha_nac, esDoctor, esPaciente } = req.body;
    try {
        const query = `
            INSERT INTO persona (cedula, nombre, apellido, fecha_nac, es_doctor, es_paciente) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
        `;
        const result = await pool.query(query, [cedula, nombre, apellido, fecha_nac, esDoctor, esPaciente]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// B. Iniciar Toma de Datos (El usuario presiona "Iniciar Consulta" en el front)
app.post('/api/iniciar-toma', async (req, res) => {
    const { cedula_paciente, cedula_doctor, recipe } = req.body;

    // Validaciones básicas
    if (!cedula_paciente || !cedula_doctor) {
        return res.status(400).json({ error: 'Debe indicar cédula de doctor y paciente' });
    }

    // (Opcional) Verificar en DB si existen, aquí lo omito para brevedad.

    // Guardamos el contexto en memoria
    contextoConsulta = {
        cedula_paciente,
        cedula_doctor,
        recipe
    };

    console.log(`🔓 SISTEMA ARMADO: Esperando datos de ESP32 para Paciente ${cedula_paciente}`);
    
    res.json({ 
        message: 'Sistema listo. Por favor, realice la medición con la ESP32 ahora.',
        status: 'waiting_mqtt'
    });
});

// --- 6. RUTAS GET (Para ver los datos en el navegador) ---

// A. Ver todas las Personas registradas
// Ruta: http://localhost:3000/api/personas
app.get('/api/personas', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM persona ORDER BY apellido ASC');
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// B. Ver el Historial de Consultas
// Ruta: http://localhost:3000/api/consultas
app.get('/api/consultas', async (req, res) => {
    try {
        // Hacemos un JOIN para que en vez de ver solo números de cédula,
        // veas los nombres del paciente y del doctor.
        const query = `
            SELECT 
                c.fecha_hora,
                c.recipe,
                c.temperatura_contacto,
                c.temperatura_infrarrojo,
                c.electrocardiograma,
                p_paciente.nombre as nombre_paciente,
                p_paciente.apellido as apellido_paciente,
                p_doctor.nombre as nombre_doctor,
                p_doctor.apellido as apellido_doctor
            FROM consulta c
            JOIN persona p_paciente ON c.cedula_paciente = p_paciente.cedula
            JOIN persona p_doctor ON c.cedula_doctor = p_doctor.cedula
            ORDER BY c.fecha_hora DESC;
        `;
        
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Iniciar servidor
app.listen(3000, () => console.log('🚀 Servidor Backend corriendo en puerto 3000'));