import { Request, Response, NextFunction } from 'express';
import { logRequest } from '../services/requestService.js';

export interface RequestWithUser extends Request {
    apiKeyUser?: string;
}

export function requestLogger(req: RequestWithUser, res: Response, next: NextFunction) {
    const startTime = Date.now();

    // Intercepta o final da resposta para capturar o status
    res.on('finish', async () => {
        const responseTime = Date.now() - startTime;

        try {
            await logRequest({
                method: req.method,
                path: req.path,
                status: res.statusCode,
                ...(req.apiKeyUser && { apiKeyUser: req.apiKeyUser }),
                ip: req.ip || req.connection.remoteAddress || 'unknown',
                ...(req.get('User-Agent') && { userAgent: req.get('User-Agent') }),
                responseTime,
                ...(res.statusCode >= 400 && { error: `HTTP ${res.statusCode}` })
            });
        } catch (error) {
            console.error('Erro ao registrar request:', error);
        }
    });

    next();
}
