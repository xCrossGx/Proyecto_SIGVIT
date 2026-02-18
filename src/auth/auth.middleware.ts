import { type Request, type Response, type NextFunction } from "express";
import { verifyToken } from "./jwt.js";
import { inBlacklist } from "./auth.service.js";

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if(authHeader) {
        const token = authHeader.split(' ')[1]!;
        const isValid = await inBlacklist(token);
        if(isValid) {
            res.status(401).json({ message: 'Este token ya no es válido (Sesión cerrada)' });
            return;
        }
        const decoded = verifyToken(token);
        if(decoded) {
            (req as any).user = decoded;
            return next();
        }
    }
    res.status(401).json({ message: 'No autorizado: Token inválido o ausente' });
}