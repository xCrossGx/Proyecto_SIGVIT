import express from 'express';
import { getData, getDeviceData } from '../services/dispositivos.service.js';
import { authenticateJWT } from '../auth/auth.middleware.js';
import { SERVER_ENV } from '../utils/config.js';
import logger from '../utils/logger.js';

const router = express.Router();

router.use(authenticateJWT)

router.get('/', (req, res) => {
    const array = Array.from(getData(), ([mac, data]) => ({ 
        mac, 
        ...data 
    }));

    if(SERVER_ENV === 'debug') {
        logger.debug(array.map(disp => disp.mac));
    }
    res.json(array)
})

router.get('/:mac', (req, res) => {
    const mac = req.params.mac;
    logger.debug(mac);
    const deviceData = getDeviceData(mac);

    if (deviceData) {
        res.json(deviceData);
    } else {
        res.status(404).json({ "type": "error", "message": 'Dispositivo no encontrado' });
    }
});

export default router;