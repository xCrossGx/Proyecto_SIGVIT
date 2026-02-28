import express from 'express';
import cors from 'cors'; // <-- 1. Importa cors
import { SERVER_PORT, SERVER_ENV } from './utils/config.js';

import pacientesController from './controllers/pacientes.controller.js';
import dispositivosController from './controllers/dispositivos.controller.js';
import authController from './auth/auth.controller.js'
import morganMiddleware from './middlewares/morgan.middleware.js';
import logger from './utils/logger.js';

const app = express();

// 2. Configura CORS antes de cualquier ruta
app.use(cors());
app.use(express.json());

// Aplicamos el middleware de logs HTTP
app.use(morganMiddleware);

// Tus rutas actuales
app.use('/pacientes', pacientesController);
<<<<<<< HEAD
app.use('/consultas', consultasController);
=======
>>>>>>> 79486ee272675c72b528ce3a2f25b7930c5d7c18
app.use('/dispositivos', dispositivosController);
app.use('/auth', authController);

app.listen(SERVER_PORT, () => {
    logger.info('=============================================');
    logger.info(`  SERVIDOR CORRIENDO EN MODO: ${SERVER_ENV.toUpperCase()}`);
    logger.info(`  Puerto: ${SERVER_PORT}`);
    logger.info(`  Nivel de log activo: ${logger.level}`);
    logger.info('=============================================');
});