import { Response } from 'express';
import { RequestWithUser } from '../middleware/apiKeyMiddleware.js';
import EmailService from '../service/emailService.js';
import EmailSenderService from '../service/emailSenderService.js';
import ApiKeyService from '../service/apiKeyService.js';
import { IApiKey } from '../models/apiKey.js';
import { emailQueue } from '../utils/queue/emailQueue.js';

const ServidoresValidos = process.env.SERVIDORES_VALIDOS
    ? process.env.SERVIDORES_VALIDOS.split(',').map(s => s.trim())
    : [];

// Controller responsável por gerenciar as requisições relacionadas aos Emails
class EmailController {
    private emailService: EmailService;
    private apiKeyService: ApiKeyService;
    // Removemos emailSenderService daqui, pois o Worker é quem vai usar

    constructor() {
        this.emailService = new EmailService();
        this.apiKeyService = new ApiKeyService();
    }

    enviarEmail = async (req: RequestWithUser, res: Response): Promise<void> => {
        try {
            const { to, subject, template, data = {} } = req.body;
            
            // ... (MANTENHA SUAS VALIDAÇÕES EXISTENTES AQUI: campos, formato, domínio) ...

            const apiKeyUser = req.apiKeyUser ? String(req.apiKeyUser) : 'unknown';
            const apiKeyFromHeader = req.headers['x-api-key'] as string;
            
            // Busca credenciais
            const credentials = await this.apiKeyService.obterUsuarioPorApiKey(apiKeyFromHeader);
            
            if (!credentials) {
                res.status(401).json({ message: 'Credenciais não encontradas' });
                return;
            }

            // 1. Registra o email no banco como 'pending' IMEDIATAMENTE
            const emailId = await this.emailService.registrarEmail({
                to,
                subject,
                template,
                data,
                apiKeyUser: apiKeyUser
            });

            // 2. Adiciona o trabalho na Fila Redis
            await emailQueue.add('send-email-job', {
                emailId, // Passamos o ID para o worker atualizar o status depois
                to,
                subject,
                template,
                data,
                credentials: { // Passamos as credenciais para o worker usar
                    email: credentials.email,
                    pass: credentials.pass
                }
            });

            console.log(`   🚀 Job adicionado à fila para o email ${emailId}`);

            // 3. Responde imediatamente (Super Rápido!)
            res.status(202).json({
                message: 'E-mail na fila de processamento',
                status: 'pending',
                emailId
            });

        } catch (error) {
            console.error(`   ❌ Erro ao enfileirar:`, error);
            res.status(500).json({
                message: 'Erro ao processar requisição',
                error: (error as Error).message
            });
        }
    };

    // Obtém estatísticas de emails
    obterEstatisticas = async (req: RequestWithUser, res: Response): Promise<void> => {
        try {
            console.log(`\n📊 Obtendo estatísticas de emails...`);
            const stats = await this.emailService.obterEstatisticas();
            console.log(`   ✓ Estatísticas coletadas com sucesso`);
            res.json(stats);
        } catch (error) {
            console.error(`   ❌ Erro ao obter estatísticas:`, error);
            res.status(500).json({
                message: 'Erro ao obter estatísticas',
                error: (error as Error).message
            });
        }
    };

    // Lista emails recentes
    listarEmailsRecentes = async (req: RequestWithUser, res: Response): Promise<void> => {
        try {
            const limite = parseInt(req.query.limit as string) || 10;
            console.log(`\n📋 Listando ${limite} emails recentes...`);

            const emails = await this.emailService.buscarEmailsRecentes(limite);
            console.log(`   ✓ ${emails.length} email(s) encontrado(s)`);

            res.json(emails);
        } catch (error) {
            console.error(`   ❌ Erro ao listar emails:`, error);
            res.status(500).json({
                message: 'Erro ao listar emails',
                error: (error as Error).message
            });
        }
    };

    // Lista emails do usuário autenticado
    listarEmailsDoUsuario = async (req: RequestWithUser, res: Response): Promise<void> => {
        try {
            if (!req.apiKeyUser) {
                res.status(401).json({ message: 'Usuário não autenticado' });
                return;
            }

            console.log(`\n📋 Listando emails do usuário: ${req.apiKeyUser}...`);
            const apiKeyUser = req.apiKeyUser as IApiKey;

            const emails = await this.emailService.buscarEmailsDoUsuario(apiKeyUser);
            console.log(`   ✓ ${emails.length} email(s) encontrado(s)`);

            res.json(emails);
        } catch (error) {
            console.error(`   ❌ Erro ao listar emails do usuário:`, error);
            res.status(500).json({
                message: 'Erro ao listar emails do usuário',
                error: (error as Error).message
            });
        }
    };
}

export default EmailController;
