import type { Request, Response, NextFunction } from 'express';

export function requireMasterKey(req: Request, res: Response, next: NextFunction) {
    const masterKey = req.header('x-master-key') || req.query.masterKey;
    if (masterKey === process.env.MASTER_KEY) {
        next();
    } else {
        res.status(403).json({ error: 'Forbidden: Master Key inválido' });
    }
}