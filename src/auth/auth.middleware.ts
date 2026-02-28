import { type Request, type Response, type NextFunction } from "express";
import { verifyToken } from "./jwt.js";
import { inBlacklist } from "./auth.service.js";
import logger from "../utils/logger.js";

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger.debug('Formato de cabecera inválido o ausente')
        return res.status(401).json({ message: 'Formato de cabecera inválido o ausente' });
    }

    // Al asignar el valor tras el split, TS aún cree que puede ser undefined
    const token = authHeader.split(' ')[1];

    // ESTA VALIDACIÓN QUITA EL ERROR ROJO DE TU IMAGEN
    if (!token) {
        logger.debug('Token no proporcionado')
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    try {
        // 1. Verificar Lista Negra
        const isRevoked = await inBlacklist(token);
        if (isRevoked) {
            logger.debug('Sesión cerrada: Token revocado')
            return res.status(401).json({ message: 'Sesión cerrada: Token revocado' });
        }

        // 2. Verificar Firma del JWT
        const decoded = verifyToken(token);
        if (!decoded) {
            logger.debug('Token inválido o expirado')
            return res.status(401).json({ message: 'Token inválido o expirado' });
        }

        (req as any).user = decoded;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Error interno en la autenticación' });
    }
};