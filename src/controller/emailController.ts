import { Response } from 'express';
import { RequestWithUser } from '../middleware/apiKeyMiddleware.js';
import EmailService from '../service/emailService.js';
import EmailSenderService from '../service/emailSenderService.js';

// Controller responsável por gerenciar as requisições relacionadas aos Emails
class EmailController {
    private emailService: EmailService;
    private emailSenderService: EmailSenderService;

    constructor() {
        this.emailService = new EmailService();
        this.emailSenderService = new EmailSenderService();
    }

    // Envia um email usando template MJML
    enviarEmail = async (req: RequestWithUser, res: Response): Promise<void> => {
        try {
            const { to, subject, template, data = {} } = req.body;

            console.log(`\n📧 Nova requisição de envio de email`);
            console.log(`   Para: ${to}`);
            console.log(`   Assunto: ${subject}`);
            console.log(`   Template: ${template}`);
            console.log(`   Usuário: ${req.apiKeyUser || 'desconhecido'}`);

            // Validação básica
            if (!to || !subject || !template) {
                console.log(`   ❌ Dados incompletos`);
                res.status(400).json({ 
                    message: 'Campos obrigatórios: to, subject, template' 
                });
                return;
            }

            // Registra o email no banco como 'pending'
            const emailId = await this.emailService.registrarEmail({
                to,
                subject,
                template,
                data,
                apiKeyUser: req.apiKeyUser || 'unknown'
            });

            // Tenta enviar o email
            try {
                await this.emailSenderService.enviarEmail({ to, subject, template, data });
                
                // Atualiza o status para 'sent'
                await this.emailService.atualizarStatusEmail(emailId, 'sent');
                
                res.status(202).json({
                    message: 'Email enviado com sucesso',
                    emailId
                });
            } catch (sendError) {
                // Atualiza o status para 'failed'
                await this.emailService.atualizarStatusEmail(
                    emailId, 
                    'failed', 
                    (sendError as Error).message
                );
                
                console.error(`   ❌ Falha no envio do email:`, sendError);
                res.status(500).json({
                    message: 'Falha ao enviar email',
                    error: (sendError as Error).message,
                    emailId
                });
            }
        } catch (error) {
            console.error(`   ❌ Erro ao processar requisição:`, error);
            res.status(500).json({
                message: 'Erro ao processar requisição de envio',
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
            
            const emails = await this.emailService.buscarEmailsDoUsuario(req.apiKeyUser);
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
