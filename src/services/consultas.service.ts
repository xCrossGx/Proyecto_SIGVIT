import { error } from 'node:console';
import type { CreateConsulta } from '../dtos/consulta.dto.js';
import { db } from '../utils/database_manager.js';

export const getConsultas = async (cedula: string) => {
    return await db.manyOrNone(`SELECT * FROM consultas WHERE cedula_paciente = $1`, [cedula])
    .then(result => {
        return result;
    })
    .catch(error => {
        return { "type": "error", "message": error.message };
    })
}

export const getConsulta = async (cedula: string, id: string) => {
    return await db.oneOrNone(`SELECT * FROM consultas WHERE cedula_paciente = $1 AND id = $2`, [cedula, id])
    .then(result => {
        return result
    })
    .catch(error => {
        return { "type": "error", "message": error.message };
    })
}

export const createConsulta = async (consulta: CreateConsulta) => {

}