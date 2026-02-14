const { getDB } = require('../database_manager')

const readPacientes = async () => {
    try {
        const result = await getDB().query(`SELECT * FROM pacientes`)
        return result.rows
    } catch (error) {
        console.log('Error:', error.message)
    }
}

const readPaciente = async (cedula) => {
    try {
        const result = await getDB().query(`SELECT * FROM pacientes WHERE cedula = $1`, [cedula])
        return result.rows
    } catch (error) {
        return error.message
    }
}

const createPaciente = async (paciente) => {
    try {
        const result = await getDB().query(`INSERT INTO pacientes(cedula, nombre, apellido, fecha_nacimiento) 
            VALUES ($1, $2, $3, $4) RETURNING *`, [paciente.cedula, paciente.nombre, paciente.apellido, paciente.fechaNacimiento])
        return result.rows[0]
    } catch (error) {
        return error.message
    }
}

const updatePaciente = (cedula) => {

}

const deletePaciente = async (cedula) => {
    try {
        const result = await getDB().query(`DELETE FROM pacientes WHERE cedula = $1 RETURNING *`, [cedula])
        return result.rows[0];
    } catch (error) {
        return error.message
    }
}

module.exports = { readPacientes, readPaciente, createPaciente, updatePaciente, deletePaciente }