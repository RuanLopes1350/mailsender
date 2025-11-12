import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import DbConnect from './config/DbConnect.js';
import { requestLoggerMiddleware } from './middleware/requestLoggerMiddleware.js';
import { apiKeyMiddleware } from './middleware/apiKeyMiddleware.js';
import ApiKeyController from './controller/apiKeyController.js';
import EmailController from './controller/emailController.js';
import StatsController from './controller/statsController.js';
import cors from 'cors';
import AdminController from './controller/adminController.js';
import AdminService from './service/adminService.js';
import { authMiddleware } from './middleware/authMiddleware.js';
import ConfigController from './controller/configController.js';
import ConfigService from './service/configService.js';

// Carrega variáveis de ambiente
dotenv.config();

// Dados de Admin base
const username: string = process.env.ADMIN_USERNAME || 'admin';
const password: string = process.env.ADMIN_PASSWORD || 'admin123';

// Cria o admin inicial se não existir
const adminService = new AdminService();

// Cria a configuração inicial se não existir
const configService = new ConfigService();

// Registra o tempo de início do servidor
(global as any).serverStartTime = Date.now();

const app = express();
app.use(express.json());
app.use(cors({
    origin: '*'
}));

// Middleware de log de requisições
app.use(requestLoggerMiddleware);

const apiKeyController = new ApiKeyController();
const emailController = new EmailController();
const statsController = new StatsController();
const adminController = new AdminController();
const configController = new ConfigController();

// Painel de administração (arquivos estáticos)
app.use('/painel', express.static(path.resolve('public')));
app.use(express.static(path.resolve('public')));

// Rotas Públicas
app.get('/api', statsController.healthCheck);
app.get('/api/status', statsController.statusDetalhado);
app.post('/api/login', adminController.login.bind(adminController));
app.post('/api/keys/generate', apiKeyController.gerarApiKey);

// Rotas Protegidas por JWT (para o Painel Admin)
app.get('/api/stats', authMiddleware, statsController.obterEstatisticasGerais);
app.get('/api/keys', authMiddleware, apiKeyController.listarApiKeys);
app.delete('/api/keys/:name', authMiddleware, apiKeyController.revogarApiKey);
app.patch('/api/keys/:name/inativar', authMiddleware, apiKeyController.inativarApiKey);
app.patch('/api/keys/:name/reativar', authMiddleware, apiKeyController.reativarApiKey);
app.post('api/keys/nova', authMiddleware, apiKeyController.gerarApiKey);
app.get('/api/emails/recentes', authMiddleware, emailController.listarEmailsRecentes);
app.get('/api/admin/listar', authMiddleware, adminController.listarAdmins.bind(adminController));
app.post('/api/admin/criar', authMiddleware, adminController.criarAdmin.bind(adminController));
app.get('/api/config', authMiddleware, configController.obterConfig.bind(configController));
app.post('/api/config/aprovar', authMiddleware, configController.aprovarApiKey.bind(configController));

// Rotas Protegidas por API Key (para Desenvolvedores)
app.post('/api/emails/send', apiKeyMiddleware, emailController.enviarEmail);
app.get('/api/emails/meus', apiKeyMiddleware, emailController.listarEmailsDoUsuario);

// Rota 404
app.use((req, res) => {
    res.status(404).json({ message: 'Rota não encontrada' });
});

// Conecta ao banco de dados e inicia o servidor
const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
    try {
        console.log('\n🚀 Iniciando Mail Sender Microservice...\n');

        // Conecta ao MongoDB
        console.log('📦 Conectando ao banco de dados...');
        await DbConnect.conectar();

        // Inicia o servidor
        app.listen(PORT, async () => {
            try {
                await adminService.criarAdmin(username, password);
                console.log('✅ Admin inicial criado com sucesso');
            } catch (error) {
                // Admin já existe
                console.log('ℹ️  Admin já existe');
            }

            try {
                await configService.criarConfigInicial();
                console.log('✅ Configuração inicial criada com sucesso');
            } catch (error) {
                // Configuração já existe
                console.log('ℹ️  Configuração já existe');
            }
            console.log(`\n✅ Servidor rodando na porta ${PORT}`);
            console.log(`📡 API disponível em: http://localhost:${PORT}/api`);
            console.log(`📊 Status: http://localhost:${PORT}/api/status`);
            console.log(`📈 Stats: http://localhost:${PORT}/api/stats\n`);
        });
    } catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}

process.on('SIGINT', async () => {
    console.log('\n\n⏸️  Encerrando servidor...');
    await DbConnect.desconectar();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n\n⏸️  Encerrando servidor...');
    await DbConnect.desconectar();
    process.exit(0);
});

// Inicia o servidor
iniciarServidor();

export default app;