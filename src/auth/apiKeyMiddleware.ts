import { validarApiKey, obterUsuarioPorApiKey } from "./apiKey.js";
import { RequestWithUser } from "../middleware/requestLogger.js";
import { Response, NextFunction } from 'express';

export async function apiKeyMiddleware(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;

    if (!apiKey) {
        res.status(401).json({ message: 'x-api-key header ausente ou vazio' });
        return;
    }

    const valido = await validarApiKey(apiKey as string);
    if (!valido) {
        res.status(403).json({ message: 'API key inválida' });
        return;
    }

    // Adiciona o usuário da API key na requisição
    try {
        const usuario = await obterUsuarioPorApiKey(apiKey as string);
        if (usuario) {
            req.apiKeyUser = usuario;
        }
    } catch (error) {
        console.error('Erro ao obter usuário da API key:', error);
    }

    next();
}