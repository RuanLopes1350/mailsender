import { Response, NextFunction } from 'express';
import { RequestWithUser } from './apiKeyMiddleware.js';
import RequestService from '../service/requestService.js';

const requestService = new RequestService();

// Middleware para logar todas as requisições
export function requestLoggerMiddleware(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
): void {
    const startTime = Date.now();

    // Captura informações da requisição
    const method = req.method;
    const path = req.path;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    // Flag para evitar registro duplicado
    let isLogged = false;

    // Função para registrar a requisição
    const logRequest = () => {
        if (isLogged) return; // Evita registrar duas vezes
        isLogged = true;

        const responseTime = Date.now() - startTime;
        const statusCode = res.statusCode;

        // Registra a requisição no banco de dados de forma assíncrona
        requestService.registrarRequisicao({
            method,
            path,
            statusCode,
            ip,
            userAgent,
            responseTime,
            apiKeyUser: req.apiKeyUser
        }).catch(error => {
            console.error('Erro ao registrar requisição:', error);
        });

        console.log(`📊 ${method} ${path} - ${statusCode} - ${responseTime}ms`);
    };

    // Sobrescreve o método res.json para capturar quando a resposta é enviada
    const originalJson = res.json.bind(res);

    res.json = function (body: any) {
        logRequest();
        return originalJson(body);
    };

    // Também sobrescreve res.send para capturar outras formas de resposta
    const originalSend = res.send.bind(res);

    res.send = function (body: any) {
        logRequest();
        return originalSend(body);
    };

    // Captura quando a resposta termina (fallback para qualquer outro método)
    res.on('finish', () => {
        logRequest();
    });

    next();
}
