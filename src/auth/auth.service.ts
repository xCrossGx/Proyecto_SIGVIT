import { error } from "node:console"
import { db } from "../utils/database_manager.js"
import bcrypt from 'bcrypt'
import type { CreateUsuario } from "./auth.dto.js"
import { generateToken } from "./jwt.js"

const SALT_ROUNDS = 10

export const verifyUsuario = async (email: string, password: string) => {
    const sql = `SELECT uuid, password_hash, cedula FROM usuarios WHERE email = $1`
    const usuario = await db.oneOrNone(sql, [email])
    if(!usuario) {
        return { "type": "error", "message": "Correo no encontrado" }
    }

    const compare = await bcrypt.compare(password, usuario.password_hash)
    
    if (!compare) {
        return { "type": "error", "message": "La contraseña no coincide" }
    }
    const token = generateToken({uuid: usuario.uuid, cedula: usuario.cedula})
    return { "token": token};
}

export const createUsuario = async (usuario: CreateUsuario) => {
    const password_hash = await bcrypt.hash(usuario.password, SALT_ROUNDS);
    const sql = `INSERT INTO usuarios(username, email, password_hash, cedula, nombre, apellido) 
    VALUES ($1, $2, $3, $4, $5, $6)`
    return await db.oneOrNone(sql, [usuario.username, usuario.email, password_hash, usuario.cedula, usuario.nombre, usuario.apellido])
    .then(result => {
        return result;
    })
    .catch(error => {
        return error;
    })
}