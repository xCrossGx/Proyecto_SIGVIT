import type { Request, Response, NextFunction } from 'express';
import { checkPacienteExists } from '../services/pacientes.service.js';

export const verifyPacienteExists = async (req: Request<{ cedula: string;}>, res: Response, next: NextFunction) => {
    const { cedula } = req.params;
    const exists = await checkPacienteExists(cedula);
    if(!exists) {
        return res.status(404).json({ "type": "error", "message": "Paciente no encontrado" });
    }
    next();
}
