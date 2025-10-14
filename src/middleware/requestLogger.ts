import { Request, Response, NextFunction } from 'express';
import { logRequest } from '../services/requestService.js';

export interface RequestWithUser extends Request {
    apiKeyUser?: string;
}

export function requestLogger(req: RequestWithUser, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log(`\n🔵 [${requestId}] Nova requisição recebida`);
    console.log(`   Método: ${req.method}`);
    console.log(`   Path: ${req.path}`);
    console.log(`   IP: ${req.ip || req.connection.remoteAddress || 'unknown'}`);
    console.log(`   User-Agent: ${req.get('User-Agent') || 'N/A'}`);

    // Intercepta o final da resposta para capturar o status
    res.on('finish', async () => {
        const responseTime = Date.now() - startTime;
        
        console.log(`\n✅ [${requestId}] Requisição finalizada`);
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Tempo de resposta: ${responseTime}ms`);

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
