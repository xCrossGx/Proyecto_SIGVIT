import express from 'express';
import cors from 'cors'; // <-- 1. Importa cors
import { SERVER_PORT } from './utils/config.js';
//import './services/dispositivos.service.js'

import pacientesController from './controllers/pacientes.controller.js';
//import dispositivosController from './controllers/dispositivos.controller.js';
import authController from './auth/auth.controller.js'
import consultasController from './controllers/consultas.controller.js';

const app = express();

// 2. Configura CORS antes de cualquier ruta
app.use(cors()); 
app.use(express.json());

// Tus rutas actuales
app.use('/pacientes', pacientesController);
app.use('/consultas', consultasController);
//app.use('/dispositivos', dispositivosController);
app.use('/auth', authController);

app.listen(SERVER_PORT, () => {
    console.log(`Server running on port ${SERVER_PORT}`);
});