import { Request, Response, NextFunction } from 'express';
import ApiKeyService from '../service/apiKeyService.js';

// Interface estendida do Request para incluir o usuário da API Key
export interface RequestWithUser extends Request {
    apiKeyUser?: string;
}

const apiKeyService = new ApiKeyService();

// Middleware para validar API Key nas requisições
export async function apiKeyMiddleware(
    req: RequestWithUser, 
    res: Response, 
    next: NextFunction
): Promise<void> {
    console.log(`\n🔐 Validando API Key...`);
    
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;

    if (!apiKey) {
        console.log(`   ❌ API Key ausente`);
        res.status(401).json({ message: 'x-api-key header ausente ou vazio' });
        return;
    }

    console.log(`   🔑 API Key recebida: ${(apiKey as string).substring(0, 8)}...`);

    const valido = await apiKeyService.validarApiKey(apiKey as string);
    
    if (!valido) {
        console.log(`   ❌ API Key inválida`);
        res.status(403).json({ message: 'API key inválida' });
        return;
    }

    console.log(`   ✅ API Key válida`);

    // Adiciona o usuário da API key na requisição
    try {
        const usuario = await apiKeyService.obterUsuarioPorApiKey(apiKey as string);
        if (usuario) {
            req.apiKeyUser = usuario;
            console.log(`   👤 Usuário identificado: ${usuario}`);
        }
    } catch (error) {
        console.error('   ⚠️ Erro ao obter usuário da API key:', error);
    }

    next();
}
