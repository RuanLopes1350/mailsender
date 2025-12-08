import { Request, Response, NextFunction } from 'express';
import ApiKeyService from '../service/apiKeyService.js';
import { IApiKey } from '../models/apiKey.js';

// Interface estendida do Request para incluir o usuário da API Key
export interface RequestWithUser extends Request {
    apiKeyUser?: IApiKey;
}

const apiKeyService = new ApiKeyService();

// Middleware para validar API Key nas requisições
export async function apiKeyMiddleware(
    req: RequestWithUser, 
    res: Response, 
    next: NextFunction
): Promise<void> {
    const middlewareId = `middleware-${Date.now()}`;
    console.time(`⏱️  [${middlewareId}] Validação API Key (middleware)`);
    
    console.log(`\n🔐 Validando API Key...`);
    
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;

    if (!apiKey) {
        console.timeEnd(`⏱️  [${middlewareId}] Validação API Key (middleware)`);
        console.log(`   ❌ API Key ausente`);
        res.status(401).json({ message: 'x-api-key header ausente ou vazio' });
        return;
    }

    console.log(`   🔑 API Key recebida: ${(apiKey as string).substring(0, 8)}...`);

    console.time(`⏱️  [${middlewareId}] Validar chave (bcrypt ou cache)`);
    const valido = await apiKeyService.validarApiKey(apiKey as string);
    console.timeEnd(`⏱️  [${middlewareId}] Validar chave (bcrypt ou cache)`);
    
    if (!valido) {
        console.timeEnd(`⏱️  [${middlewareId}] Validação API Key (middleware)`);
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
            console.log(`   👤 Usuário identificado: ${usuario.usuario}`);
        }
    } catch (error) {
        console.error('   ⚠️ Erro ao obter usuário da API key:', error);
    }

    console.timeEnd(`⏱️  [${middlewareId}] Validação API Key (middleware)`);
    next();
}
