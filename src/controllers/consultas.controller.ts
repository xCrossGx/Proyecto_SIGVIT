import { Router, type NextFunction, type Request, type Response } from 'express';
import { getConsultas, getConsulta } from '../services/consultas.service.js';
import { isPaciente } from '../services/pacientes.service.js';

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


export default router;