import { error } from "node:console"
import { db } from "../utils/database_manager.js"
import bcrypt from 'bcrypt'
import type { CreateUsuario } from "./auth.dto.js"
import { generateToken } from "./jwt.js"

const SALT_ROUNDS = 10

export const inBlacklist = async (token: string) => {
    const sql = `SELECT 1 FROM blacklist_token WHERE token = $1`
    return await db.one(sql, [token])
        .then(() => {
            return true
        })
        .catch(() => {
            return false
        })
}

export const verifyUsuario = async (email: string, password: string) => {
    const sql = `SELECT uuid, password_hash, cedula FROM usuarios WHERE email = $1`
    const usuario = await db.oneOrNone(sql, [email])
    if (!usuario) {
        return { "type": "error", "message": "Correo no encontrado" }
    }

    const compare = await bcrypt.compare(password, usuario.password_hash)

    if (!compare) {
        return { "type": "error", "message": "La contraseña no coincide" }
    }
    const token = generateToken({ uuid: usuario.uuid, cedula: usuario.cedula })
    return { "token": token };
}

export const createUsuario = async (usuario: CreateUsuario) => {
    try {
        const password_hash = await bcrypt.hash(usuario.password, SALT_ROUNDS);

        // Añadimos la columna de fecha (asumiendo que se llama fecha_registro)
        // y usamos DEFAULT o NOW() en los VALUES
        const sql = `INSERT INTO usuarios(username, email, password_hash, cedula, nombre, apellido, fecha_registro) 
                    VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING username`;

        const result = await db.one(sql, [
            usuario.username,
            usuario.email,
            password_hash,
            usuario.cedula,
            usuario.nombre,
            usuario.apellido
        ]);
        return result;
    } catch (err: any) {
        console.error("Error al insertar en DB:", err.message);
        throw new Error(err.message);
    }
}

export const revokeToken = async (token: string) => {
    const sql = `INSERT INTO blacklist_token(token) VALUES ($1) RETURNING 1`
    return await db.one(sql, [token])
        .then(() => {
            return { message: "Sesión cerrada" }
        })
        .catch(error => {
            return { type: "error", message: error.message }
        })
}

export const resetPassword = async (email: string, cedula: string, newPassword: string) => {
    try {
        const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);

        const sql = `UPDATE usuarios 
                    SET password_hash = $1 
                    WHERE email = $2 AND cedula = $3 
                    RETURNING username`;

        const result = await db.oneOrNone(sql, [password_hash, email, cedula]);

        if (!result) {
            throw new Error("Los datos no coinciden con nuestros registros.");
        }

        return { message: "Contraseña actualizada exitosamente" };
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const getUsuarioByUuid = async (uuid: string) => {
    const sql = `SELECT nombre, apellido, username FROM usuarios WHERE uuid = $1`;
    const usuario = await db.oneOrNone(sql, [uuid]);
    if (!usuario) throw new Error("Usuario no encontrado");
    return usuario;
}