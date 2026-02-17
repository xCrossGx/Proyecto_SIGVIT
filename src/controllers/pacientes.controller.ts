import { Router } from 'express';

const router = Router();

import { getPacientes, getPaciente, createPaciente, deletePaciente, updatePaciente } from '../services/pacientes.service.js';
import type { CreatePaciente, UpdatePaciente } from '../dtos/paciente.dto.js';
import consultasController from './consultas.controller.js';
import { authenticateJWT } from '../auth/auth.middleware.js';

router.use(authenticateJWT)

router.get('/', async (req, res) => {
    const pacientes = await getPacientes()
    res.json(pacientes)
});

router.get('/:cedula', async (req, res) => {
    const paciente = await getPaciente(req.params.cedula)
    res.json(paciente)
})

router.post('/', async (req, res) => { 
    const paciente: CreatePaciente = req.body
    const result = await createPaciente(paciente)
    res.json(result)
})

router.patch('/:cedula', async (req, res) => {
    const data: UpdatePaciente = req.body
    const result = await updatePaciente(req.params.cedula, data)
    res.json(result)
})

router.delete('/:cedula', async (req, res) => {
    const result = await deletePaciente(req.params.cedula)
    res.json(result)
})

router.use('/:cedula/consultas', consultasController)

export default router;
