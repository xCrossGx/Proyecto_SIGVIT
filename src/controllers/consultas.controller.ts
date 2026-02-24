import { Router, type Request, type Response } from 'express';
import { getConsultas, getConsulta, createConsulta, deleteConsulta } from '../services/consultas.service.js';
import { authenticateJWT } from '../auth/auth.middleware.js';

// 1. Extendemos la interfaz para que TS reconozca 'user' y sea estricto con 'params'
interface AuthRequest extends Request {
    user?: {
        cedula: string;
        rol?: string;
    };
    // Forzamos que params siempre traiga estos campos como strings
    params: {
        cedula: string;
        id: string;
    };
}

const router = Router({ mergeParams: true });

router.use(authenticateJWT);

// Obtener todas las consultas de un paciente
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        // SOLUCIÓN AL ERROR DE TU IMAGEN: Aseguramos que sea un string
        const cedula = req.params.cedula;
        
        if (!cedula) {
            return res.status(400).json({ type: 'error', message: 'Cédula de paciente requerida' });
        }

        const result = await getConsultas(cedula);
        res.send(result);
    } catch (error: any) {
        res.status(500).json({ type: 'error', message: error.message });
    }
});

// Obtener una consulta específica
router.get('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { cedula, id } = req.params;
        const result = await getConsulta(cedula, id);
        res.send(result);
    } catch (error: any) {
        res.status(500).json({ type: 'error', message: error.message });
    }
});

// Crear consulta
router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const { descripcion } = req.body;
        
        // SOLUCIÓN AL ERROR DE LA TERMINAL: Validar que el médico esté logueado
        if (!req.user || !req.user.cedula) {
            return res.status(401).json({ type: 'error', message: 'Sesión no válida' });
        }

        const consulta = { 
            cedula_paciente: req.params.cedula || req.body.cedula_paciente,
            cedula_medico: req.user.cedula, 
            descripcion: descripcion,
            fecha_consulta: new Date() 
        };

        const result = await createConsulta(consulta);
        res.send(result);
    } catch (error: any) {
        res.status(500).send({ type: 'error', message: error.message });
    }
});

// Eliminar consulta
router.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { cedula, id } = req.params;
        const result = await deleteConsulta(cedula, id);
        res.send(result);
    } catch (error: any) {
        res.status(500).json({ type: 'error', message: error.message });
    }
});

export default router;