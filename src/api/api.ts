import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import DbConnect from '../config/DbConnect.js';
import { requestLoggerMiddleware } from '../middleware/requestLoggerMiddleware.js';
import { apiKeyMiddleware } from '../middleware/apiKeyMiddleware.js';
import ApiKeyController from '../controller/ApiKeyController.js';
import EmailController from '../controller/EmailController.js';
import StatsController from '../controller/StatsController.js';

// Carrega variáveis de ambiente
dotenv.config();

// Registra o tempo de início do servidor (Vercel)
(global as any).serverStartTime = Date.now();

const app = express();
app.use(express.json());

// Middleware de log de requisições
app.use(requestLoggerMiddleware);

// Instância dos controllers
const apiKeyController = new ApiKeyController();
const emailController = new EmailController();
const statsController = new StatsController();

// Rotas públicas (sem autenticação)
app.get('/api', statsController.healthCheck);
app.get('/api/status', statsController.statusDetalhado);

// Rotas de API Keys (sem autenticação para permitir geração)
app.post('/api/keys/generate', apiKeyController.gerarApiKey);
app.get('/api/keys', apiKeyController.listarApiKeys);
app.delete('/api/keys/:name', apiKeyController.revogarApiKey);
app.patch('/api/keys/:name/inativar', apiKeyController.inativarApiKey);
app.patch('/api/keys/:name/reativar', apiKeyController.reativarApiKey);

// Rotas protegidas por API Key
app.post('/api/emails/send', apiKeyMiddleware, emailController.enviarEmail);
app.get('/api/emails/recentes', apiKeyMiddleware, emailController.listarEmailsRecentes);
app.get('/api/emails/meus', apiKeyMiddleware, emailController.listarEmailsDoUsuario);

// Rota de estatísticas gerais
app.get('/api/stats', statsController.obterEstatisticasGerais);

// Controle de inicialização para ambiente Vercel
let isInitialized = false;

async function initializeOnce() {
    if (!isInitialized) {
        console.log('🔄 Inicializando conexão com banco de dados (Vercel)...');
        await DbConnect.conectar();
        isInitialized = true;
        console.log('✅ Banco de dados conectado');
    }
}

// Handler principal para a Vercel
export default async function handler(req: Request, res: Response) {
    try {
        await initializeOnce();
        return app(req, res);
    } catch (error) {
        console.error('❌ Erro ao inicializar serviço:', error);
        return res.status(500).json({ 
            message: 'Erro ao inicializar serviço', 
            error: (error as Error).message 
        });
    }
}