import { Router } from "express";
import { createUsuario, revokeToken, verifyUsuario, resetPassword, getUsuarioByUuid } from "./auth.service.js";
import type { CreateUsuario } from "./auth.dto.js";
import { authenticateJWT } from "./auth.middleware.js";

const router = Router();

router.post('/login', async (req, res) => {
    const { email, password } = req.body
    const verify = await verifyUsuario(email, password);
    if(verify.type && verify.type === 'error') {
        return res.status(400).json(verify)
    } 
    
    res.json(verify);
})

router.post('/register', async (req, res) => {
    try {
        const usuario: CreateUsuario = req.body
        console.log("Datos recibidos para registro:", usuario);
        const result = await createUsuario(usuario);
        res.status(201).json(result);
    } catch (error: any) {
        console.error("Error al registrar usuario:", error);
        res.status(500).json({ message: "Error al registrar el usuario" });
    }
})

router.post('/logout', authenticateJWT, async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        // Obtenemos el token quitando la palabra 'Bearer '
        const token = authHeader.split(' ')[1];

        if (token) {
            const result = await revokeToken(token);
            return res.json(result);
        }
    }
    res.status(400).json({ message: "No se proporcionó un token válido" });
});

router.post('/forgot-password', async (req, res) => {
    try {
        const { email, cedula, newPassword } = req.body;
        const result = await resetPassword(email, cedula, newPassword);
        res.json(result);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

router.get('/me', authenticateJWT, async (req, res) => {
    try {
        const uuid = (req as any).user?.uuid;
        if (!uuid) return res.status(401).json({ message: 'No autenticado' });
        const usuario = await getUsuarioByUuid(uuid);
        res.json(usuario);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

export default router;