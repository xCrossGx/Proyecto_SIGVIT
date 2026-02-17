import type { CreateConsulta } from '../dtos/consulta.dto.js';
import { db } from '../utils/database_manager.js';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('0123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 6);

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
        return result;
    })
    .catch(error => {
        return { "type": "error", "message": error.message };
    })
}

export const createConsulta = async (consulta: CreateConsulta) => {
    // la cedula del medico la obtiene de la sesion.
    const id = nanoid();
    const sql = `INSERT INTO consultas(id, cedula_paciente, cedula_medico, descripcion) VALUES ($1, $2, $3, $4) RETURNING *`
    return await db.oneOrNone(sql, [id, consulta.cedula_paciente, consulta.cedula_medico, consulta.descripcion])
    .then( result => {
        return result;
    })
    .catch( error => {
        return { "type": "error", "message": error.message }
    })
}

export const deleteConsulta = async (cedulaPaciente: string, idConsulta: string) => {
    const sql = `DELETE FROM consultas WHERE cedula_paciente = $1 AND id = $2 RETURNING *`
    return await db.oneOrNone(sql, [cedulaPaciente, idConsulta])
    .then( result => {
        return result
    })
    .catch( error => {
        return { "type": "error", "message": error.message }
    })
}