const { Pool } = require('pg')

let pool = null;

const initDB = async (config) => {
    if(!pool) {
        pool = new Pool(config)
        crearTablas()
    }
}

const getDB = () => {
    if(!pool) {
        throw new Error('LLamada a base de datos no inicializada:')
    }
    return pool;
};

const crearTablas = async () => {
    try {
        await pool.query(`CREATE TABLE IF NOT EXISTS pacientes (
                        cedula VARCHAR(20) PRIMARY KEY,
                        nombre VARCHAR(100) NOT NULL,
                        apellido VARCHAR(100) NOT NULL,
                        fecha_nacimiento DATE NOT NULL,
                        fecha_registro DATE NOT NULL DEFAULT CURRENT_DATE
                        );`
                    )
        await pool.query(`CREATE TABLE IF NOT EXISTS consultas (
                        cedula VARCHAR(20) NOT NULL,
                        fecha_consulta TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        descripcion TEXT NOT NULL,
                        PRIMARY KEY (cedula, fecha_consulta),
                        FOREIGN KEY (cedula) REFERENCES pacientes(cedula) ON DELETE CASCADE
                    );`
                )
    } catch (error) {
        console.log('Error:', error)
    }
}

module.exports = { initDB, getDB };