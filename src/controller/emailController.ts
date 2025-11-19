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

class EmailController {
    private emailService: EmailService;
    private apiKeyService: ApiKeyService;

    constructor() {
        this.emailService = new EmailService();
        this.apiKeyService = new ApiKeyService();
    }

    enviarEmail = async (req: RequestWithUser, res: Response): Promise<void> => {
        try {
            const { to, subject, template, data = {} } = req.body;

            console.log(`\n Nova requisição de envio de email`);
            console.log(`   Para: ${to}`);
            console.log(`   Assunto: ${subject}`);
            console.log(`   Template: ${template}`);

            // Validação básica
            if (!to || !subject || !template) {
                console.log(`Dados incompletos`);
                res.status(400).json({
                    message: 'Campos obrigatórios: to, subject, template'
                });
                return;
            }

            // Validação do formato do email
            if (!to.includes('@')) {
                console.log(`Email inválido (formato incorreto)`);
                res.status(400).json({
                    message: 'Email inválido'
                });
                return;
            }

            // Extrai o domínio do email
            const dominio = to.substring(to.lastIndexOf("@") + 1);
            
            // Validação do domínio - APENAS servidores válidos são permitidos
            if (!ServidoresValidos.includes(dominio)) {
                console.log(`Domínio de email não permitido: ${dominio}`);
                console.log(`Domínios válidos: ${ServidoresValidos.join(', ')}`);
                res.status(400).json({
                    message: 'Domínio de email não permitido',
                    dominio: dominio,
                    dominiosPermitidos: ServidoresValidos
                });
                return;
            }

            console.log(`   ✓ Domínio válido: ${dominio}`);

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

            console.log(`Job adicionado à fila para o email ${emailId}`);

            // 3. Responde imediatamente (Super Rápido!)
            res.status(202).json({
                message: 'E-mail na fila de processamento',
                status: 'pending',
                emailId
            });

        } catch (error) {
            console.error(`Erro ao enfileirar:`, error);
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
