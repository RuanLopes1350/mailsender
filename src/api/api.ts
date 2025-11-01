import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import DbConnect from '../config/DbConnect.js';
import { requestLoggerMiddleware } from '../middleware/requestLoggerMiddleware.js';
import { apiKeyMiddleware } from '../middleware/apiKeyMiddleware.js';
import ApiKeyController from '../controller/apiKeyController.js';
import EmailController from '../controller/emailController.js';
import StatsController from '../controller/statsController.js';
import cors from 'cors';
import AdminController from '../controller/adminController.js';
import AdminService from '../service/adminService.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

// Carrega variáveis de ambiente
dotenv.config();

// Dados de Admin base
const username: string = process.env.ADMIN_USERNAME || 'admin';
const password: string = process.env.ADMIN_PASSWORD || 'admin123';

// Cria o admin inicial se não existir
const adminService = new AdminService();

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
const adminController = new AdminController();

// Rotas públicas
app.get('/api', statsController.healthCheck);
app.get('/api/status', statsController.statusDetalhado);
app.post('/api/login', adminController.login.bind(adminController));

// Rotas Protegidas por JWT (para o Painel Admin)
app.get('/api/stats', authMiddleware, statsController.obterEstatisticasGerais);
app.get('/api/keys', authMiddleware, apiKeyController.listarApiKeys);
app.post('/api/keys/generate', authMiddleware, apiKeyController.gerarApiKey);
app.delete('/api/keys/:name', authMiddleware, apiKeyController.revogarApiKey);
app.patch('/api/keys/:name/inativar', authMiddleware, apiKeyController.inativarApiKey);
app.patch('/api/keys/:name/reativar', authMiddleware, apiKeyController.reativarApiKey);


// Rotas Protegidas por API Key (para Desenvolvedores)
app.post('/api/emails/send', apiKeyMiddleware, emailController.enviarEmail);
app.get('/api/emails/recentes', apiKeyMiddleware, emailController.listarEmailsRecentes);
app.get('/api/emails/meus', apiKeyMiddleware, emailController.listarEmailsDoUsuario);

// Rota 404
app.use((req, res) => {
    res.status(404).json({ message: 'Rota não encontrada' });
});

// Controle de inicialização para ambiente Vercel
let isInitialized = false;

async function initializeOnce() {
    try {
        await adminService.criarAdmin(username, password);
        console.log('✅ Admin inicial criado com sucesso');
    } catch (error) {
        // Admin já existe
        console.log('ℹ️  Admin já existe');
    }

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