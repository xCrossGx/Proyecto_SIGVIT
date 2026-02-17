import { type Request, type Response, type NextFunction } from "express";
import { verifyToken } from "./jwt.js";

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if(authHeader) {
        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token!);
        if(decoded) {
            (req as any).user = decoded;
            return next();
        }
    }
    res.status(401).json({ message: 'No autorizado: Token inválido o ausente' });
}