import { Router } from 'express';
import { getPacientes, getPaciente, createPaciente, deletePaciente, updatePaciente } from '../services/pacientes.service.js';
import type { CreatePaciente, UpdatePaciente } from '../dtos/paciente.dto.js';
import consultasController from './consultas.controller.js';
import { authenticateJWT } from '../auth/auth.middleware.js';

const router = Router();
router.use('/:cedula/consultas', consultasController);

router.use(authenticateJWT)


// GET: Obtener todos
router.get('/', async (req, res) => {
    try {
        const pacientes = await getPacientes();
        res.json(pacientes);
    } catch (error: any) {
        res.status(500).json({ message: "Error al obtener pacientes", error: error.message });
    }
});
// GET: Obtener uno por cédula
router.get('/:cedula', async (req, res) => {
    try {
        const paciente = await getPaciente(req.params.cedula);
        if (!paciente) {
            return res.status(404).json({ message: "Paciente no encontrado" });
        }
        res.json(paciente);
    } catch (error: any) {
        res.status(500).json({ message: "Error al buscar el paciente" });
    }
});
// POST: Crear nuevo
router.post('/', async (req, res) => { 
    try {
        const paciente: CreatePaciente = req.body;
        // Podrías añadir validación aquí (ej. si falta el nombre)
        const result = await createPaciente(paciente);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(400).json({ message: "Error al registrar paciente", error: error.message });
    }
});
// PATCH: Actualización parcial
router.patch('/:cedula', async (req, res) => {
    try {
        const data: UpdatePaciente = req.body;
        const result = await updatePaciente(req.params.cedula, data);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: "Error al actualizar datos" });
    }
});
// DELETE: Eliminar
router.delete('/:cedula', async (req, res) => {
    try {
        const result = await deletePaciente(req.params.cedula);
        res.json({ message: "Paciente eliminado con éxito", result });
    } catch (error: any) {
        res.status(400).json({ message: "No se pudo eliminar al paciente" });
    }
});

router.use('/:cedula/consultas', consultasController)

export default router;
