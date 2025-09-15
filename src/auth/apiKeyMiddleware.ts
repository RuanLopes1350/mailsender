import { validarApiKey } from "./apiKey.js";

export async function apiKeyMiddleware(req: any, res: any, next: any) {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;

    if (!apiKey) {
        return res.status(401).json({ message: 'x-api-key header ausente ou vazio' });
    }

    const valido = await validarApiKey(apiKey);
    if (!valido) {
        return res.status(403).json({ message: 'API key inválida' });
    }

    next();
}