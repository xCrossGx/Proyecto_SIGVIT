import pgp from "pg-promise";
import { POSTGRES_CONFIG } from "./config.js";

const pg = pgp();
export const db = pg(POSTGRES_CONFIG);

export const crearTablas = async () => {
    await db.none(`
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; 
        CREATE EXTENSION IF NOT EXISTS "citext";

        CREATE TABLE IF NOT EXISTS usuarios (
            uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            username CITEXT NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            cedula VARCHAR(20) UNIQUE NOT NULL,
            nombre VARCHAR(100) NOT NULL,
            apellido VARCHAR(100) NOT NULL,
            fecha_registro timestamp DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS pacientes (
            cedula VARCHAR(20) PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL,
            apellido VARCHAR(100) NOT NULL,
            fecha_nacimiento DATE NOT NULL,
            fecha_registro DATE NOT NULL DEFAULT CURRENT_DATE
        );

        CREATE TABLE IF NOT EXISTS consultas (
            id VARCHAR(6) NOT NULL,
            cedula_paciente VARCHAR(20) NOT NULL,
            cedula_medico VARCHAR(20) NOT NULL,
            fecha_consulta TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            descripcion TEXT NOT NULL,
            PRIMARY KEY (cedula_paciente, id),
            FOREIGN KEY (cedula_paciente) REFERENCES pacientes(cedula) ON DELETE CASCADE,
            FOREIGN KEY (cedula_medico) REFERENCES usuarios(cedula) ON DELETE CASCADE
        );
    `).catch(Error => {
        console.log(Error);
    })
}