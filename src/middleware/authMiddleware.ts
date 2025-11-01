// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Interface para adicionar o payload do admin ao Request
export interface RequestWithAdmin extends Request {
    admin?: string | jwt.JwtPayload;
}

const jwtSecret = process.env.JWT_SECRET;

export function authMiddleware(
    req: RequestWithAdmin, 
    res: Response, 
    next: NextFunction
): void {
    
    // O token deve vir no header "Authorization" como "Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        console.log('Auth middleware: Acesso negado. Nenhum token fornecido.');
        res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
        return;
    }

    if (!jwtSecret) {
        console.error('Auth middleware: JWT_SECRET não configurado no servidor.');
        res.status(500).json({ message: 'Erro interno do servidor.' });
        return;
    }

    try {
        // Verifica se o token é válido
        const payload = jwt.verify(token, jwtSecret);
        
        // Adiciona o payload do admin à requisição
        req.admin = payload; 
        
        console.log(`Auth middleware: Token verificado para ${JSON.stringify(payload)}`);
        next();
    } catch (error) {
        console.log('Auth middleware: Token inválido ou expirado.');
        res.status(401).json({ message: 'Token inválido ou expirado.' });
    }
}