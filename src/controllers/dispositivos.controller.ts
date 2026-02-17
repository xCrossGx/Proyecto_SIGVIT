import express from 'express';
import { getData, getDeviceData } from '../services/dispositivos.service.js';
import { authenticateJWT } from '../auth/auth.middleware.js';

const router = express.Router();

router.use(authenticateJWT)

router.get('/', (req, res) => {
    const array = Array.from(getData(), ([mac, data]) => ({ 
        mac, 
        ...data 
    }));

    res.json(array)
})

router.get('/:mac', (req, res) => {
    const mac = req.params.mac;
    const deviceData = getDeviceData(mac);

    if (deviceData) {
        res.json(deviceData);
    } else {
        res.status(404).json({ "type": "error", "message": 'Dispositivo no encontrado' });
    }
});

export default router;