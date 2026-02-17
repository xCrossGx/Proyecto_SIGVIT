import express from 'express';
import { SERVER_PORT } from './utils/config.js';
import './services/dispositivos.service.js'
import { crearTablas } from './utils/database_manager.js'; 

import pacientesController from'./controllers/pacientes.controller.js';
import dispositivosController from './controllers/dispositivos.controller.js';
import authController from './auth/auth.controller.js'

crearTablas();
const app = express();
app.use(express.json())

app.use('/pacientes', pacientesController);
app.use('/dispositivos', dispositivosController);
app.use('/auth', authController)

app.listen(SERVER_PORT, () => {
    console.log(`Server running on port ${SERVER_PORT}`);
})