import { Router, type Request } from 'express';
import { getConsultas, getConsulta, createConsulta, deleteConsulta } from '../services/consultas.service.js';
import type { CreateConsulta } from '../dtos/consulta.dto.js';
import { authenticateJWT } from '../auth/auth.middleware.js';
import { verifyPacienteExists } from '../middlewares/pacientes.middleware.js';

const router = Router({ mergeParams: true });

interface UserParams extends Request {
    user?: {
        cedula: string;
    };
    params: {      
        cedula: string;
        idConsulta: string;
    }
}

router.use(authenticateJWT)
router.use(verifyPacienteExists)

router.get('/', async (req: UserParams, res) => {
    const cedula = req.params.cedula;
    const result = await getConsultas(cedula)
    res.send(result)
})

router.get('/:idConsulta', async (req: UserParams, res) => {
    const { cedula, idConsulta } = req.params;
    
    const result = await getConsulta(cedula, idConsulta)
    res.send(result)
})

router.post('/', async (req: UserParams, res) => {
    const cedulaPaciente = req.params.cedula;
    const cedulaMedico = req.user!.cedula
    const { descripcion } = req.body
    const consulta: CreateConsulta = { 
        cedula_paciente: cedulaPaciente,
        cedula_medico: cedulaMedico,
        descripcion: descripcion
    }
    const result = await createConsulta(consulta);
    res.send(result);
})

router.delete('/:idConsulta', async (req: UserParams, res) => {
    const { cedula, idConsulta } = req.params
    const result = await deleteConsulta(cedula, idConsulta);
    res.send(result);
})

export default router;