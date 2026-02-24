import type { Consulta, CreateConsulta } from '../dtos/consulta.dto.js';
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

export const createConsulta = async (consulta: CreateConsulta): Promise<Consulta | any> => {
    const id = nanoid();
    // Usamos fecha_consulta para coincidir con el DTO
    const sql = `
        INSERT INTO consultas(id, cedula_paciente, cedula_medico, descripcion, fecha_consulta) 
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) 
        RETURNING *`
    
    return await db.oneOrNone(sql, [
        id,
        consulta.cedula_paciente, 
        consulta.cedula_medico, 
        consulta.descripcion,
        consulta.fecha_consulta
    ]).catch(error => ({ "type": "error", "message": error.message }));
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