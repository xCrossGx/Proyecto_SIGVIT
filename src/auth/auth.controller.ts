import { Router } from "express";
import { createUsuario, revokeToken, verifyUsuario } from "./auth.service.js";
import type { CreateUsuario } from "./auth.dto.js";
import { authenticateJWT } from "./auth.middleware.js";

const router = Router();

router.post('/login', async (req, res) => {
    const { email, password } = req.body
    const verify = await verifyUsuario(email, password);
    res.json(verify);
})

router.post('/register', async (req, res) => {
    const usuario: CreateUsuario = req.body
    const result = await createUsuario(usuario);
    res.json(result);
})

router.post('/logout', authenticateJWT, async(req, res) => {
    const authHeader = req.headers.authorization;
    if(authHeader) {
        const token = authHeader.split(' ')[1]!;
        const result = await revokeToken(token)
        res.json(result);
    }
    
})

export default router;