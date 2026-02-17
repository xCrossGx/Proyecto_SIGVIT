import { Router, type NextFunction, type Request, type Response } from 'express';
import { getConsultas, getConsulta, createConsulta, deleteConsulta } from '../services/consultas.service.js';
import { isPaciente } from '../services/pacientes.service.js';
import type { CreateConsulta } from '../dtos/consulta.dto.js';
import { authenticateJWT } from '../auth/auth.middleware.js';

const router = Router({ mergeParams: true });

interface UserParams {
    cedula: string;
    id: string;
}

export const isPacienteMiddleware = async (req: Request<UserParams>, res: Response, next: NextFunction) => {
    const { cedula } = req.params;
    const exists = await isPaciente(cedula);
    if(!exists) {
        return res.status(404).json({ "type": "error", "message": "Paciente no encontrado" });
    }
    next();
}

router.use(isPacienteMiddleware)
router.use(authenticateJWT)

router.get('/', async (req: Request<UserParams>, res) => {
    const cedula = req.params.cedula;
    const result = await getConsultas(cedula)
    res.send(result)

})

router.get('/:id', async (req: Request<UserParams>, res) => {
    const { cedula, id } = req.params;
    
    const result = await getConsulta(cedula, id)
    res.send(result)
})

router.post('/', async (req: Request<UserParams>, res) => {
    const cedulaPaciente = req.params.cedula;
    const cedulaMedico = (req as any).user.cedula
    const { descripcion } = req.body
    const consulta: CreateConsulta = { 
        cedula_paciente: cedulaPaciente,
        cedula_medico: cedulaMedico,
        descripcion: descripcion
    }
    const result = await createConsulta(consulta);
    res.send(result);
})

router.delete('/:id', async (req: Request<UserParams>, res) => {
    const { cedula, id } = req.params
    const result = await deleteConsulta(cedula, id);
    res.send(result);
})

export default router;