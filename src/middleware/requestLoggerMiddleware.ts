import { Response, NextFunction } from 'express';
import { RequestWithUser } from './apiKeyMiddleware.js';
import { RequestWithAdmin } from './authMiddleware.js';
import RequestService from '../service/requestService.js';

// Interface combinada para suportar ambos os tipos de autenticação
interface RequestWithAuth extends RequestWithUser, RequestWithAdmin {}

const requestService = new RequestService();

// Middleware para logar requisições autenticadas (JWT ou API Key)
export function requestLoggerMiddleware(
    req: RequestWithAuth,
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

        // Determina o usuário baseado no tipo de autenticação
        let userIdentifier: string | undefined = undefined;

        // 1. Verifica se é uma requisição com JWT (admin logado)
        if (req.admin && typeof req.admin === 'object' && 'username' in req.admin) {
            userIdentifier = `Admin: ${req.admin.username}`;
        }
        // 2. Verifica se é uma requisição com API Key válida
        else if (req.apiKeyUser && typeof req.apiKeyUser === 'object' && 'usuario' in req.apiKeyUser) {
            userIdentifier = `API Key: ${req.apiKeyUser.usuario}`;
        }

        // Só registra se houver usuário identificado (JWT ou API Key)
        if (!userIdentifier) {
            // Não registra requisições não autenticadas (públicas)
            console.log(`📊 ${method} ${path} - ${statusCode} - ${responseTime}ms [Público]`);
            return;
        }

        // Registra a requisição no banco de dados de forma assíncrona
        requestService.registrarRequisicao({
            method,
            path,
            statusCode,
            ip,
            userAgent,
            responseTime,
            apiKeyUser: userIdentifier
        }).catch(error => {
            console.error('Erro ao registrar requisição:', error);
        });

        console.log(`📊 ${method} ${path} - ${statusCode} - ${responseTime}ms [${userIdentifier}]`);
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
