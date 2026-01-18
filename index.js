// index.js
const express = require('express')
const app = express();
app.use(express.json());

// Endpoint de pacientes
app.get('/api/personas', (req, res) => {
  // Aqui estara la logica para mostrar todos los pacientes/medicos.
    res.json({ message: 'Listando personas', data: req.body });
});

app.post('/api/personas', (req, res) => {
  // Aquí guardarías datos del paciente
    res.json({ message: 'Paciente registrado', data: req.body });
});

// Endpoint de dispositivos (ESP32)

app.get('/api/dispositivos', (req, res) => {
  // Aqui estara la logica para mostrar todos los signos vitales.
    res.json({ message: 'Listando dispositivos', data: req.body });
});

app.get('/', (req, res) => {
  res.send('SignosVit-API');
})

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});