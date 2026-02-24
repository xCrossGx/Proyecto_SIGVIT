import type { CreatePaciente, UpdatePaciente } from '../dtos/paciente.dto.js'
import { db } from '../utils/database_manager.js'

export const getPacientes = async () => {
    return await db.manyOrNone(`SELECT * FROM pacientes`)
    .then(result => result)
    .catch(error => {
        return { "type": "error", "message": error.message };
    });
}
export const getPaciente = async (cedula: string) => {
    return await db.oneOrNone(`SELECT * FROM pacientes WHERE cedula = $1`, [cedula])
    .then(result => result)
    .catch(error => {
        return { "type": "error", "message": error.message };
    });
}

export const createPaciente = async (paciente: CreatePaciente) => {
    return await db.one(`INSERT INTO pacientes(cedula, nombre, apellido, fecha_nacimiento) 
        VALUES ($1, $2, $3, $4) RETURNING *`, 
        [paciente.cedula, paciente.nombre, paciente.apellido, paciente.fecha_nacimiento])
        .catch(error => ({ "type": "error", "message": error.message }));
}

export const updatePaciente = async (cedula: string, paciente: UpdatePaciente) => { 
    const keys = Object.keys(paciente).filter(
        (key) => paciente[key as keyof UpdatePaciente] !== undefined
    );
    if(keys.length === 0) return { "type": "error", "message": "No hay datos para actualizar" };

    const setClauses = keys.map((key, index) => `${key} = $${index + 1}`);
    const values = keys.map((key) => paciente[key as keyof UpdatePaciente]);
    values.push(cedula);
    
    const queryText = `UPDATE pacientes SET ${setClauses.join(', ')} WHERE cedula = $${values.length} RETURNING *;`;
    return await db.oneOrNone(queryText, values)
    .catch(error => ({ "type": "error", "message": error.message }));
}

export const deletePaciente = async (cedula: string) => {
    return await db.oneOrNone(`DELETE FROM pacientes WHERE cedula = $1 RETURNING *`, [cedula])
    .catch(error => ({ "type": "error", "message": error.message }));
}