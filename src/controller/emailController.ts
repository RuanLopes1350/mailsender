import { Request, Response } from 'express';
import { RequestWithUser } from '../middleware/apiKeyMiddleware.js';
import EmailService from '../service/emailService.js';
import EmailSenderService from '../service/emailSenderService.js';
import ApiKeyService from '../service/apiKeyService.js';
import ConfigService from '../service/configService.js';
import { IApiKey } from '../models/apiKey.js';
import { emailQueue } from '../utils/queue/emailQueue.js';
import { IEmail } from '../models/email.js';

const ServidoresValidos = process.env.SERVIDORES_VALIDOS
    ? process.env.SERVIDORES_VALIDOS.split(',').map(s => s.trim())
    : [];

class EmailController {
    private emailService: EmailService;
    private apiKeyService: ApiKeyService;
    private configService: ConfigService;

    constructor() {
        this.emailService = new EmailService();
        this.apiKeyService = new ApiKeyService();
        this.configService = new ConfigService();
    }

    enviarEmail = async (req: RequestWithUser, res: Response): Promise<void> => {
        const requestId = `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        console.time(`⏱️  [${requestId}] Tempo total da requisição`);
        
        try {
            const { to, subject, template, data = {} } = req.body;

            console.log(`\n📧 Nova requisição de envio de email [${requestId}]`);
            console.log(`   Para: ${to}`);
            console.log(`   Assunto: ${subject}`);
            console.log(`   Template: ${template}`);

            console.time(`⏱️  [${requestId}] Validações`);
            // Validação básica
            if (!to || !subject || !template) {
                console.timeEnd(`⏱️  [${requestId}] Validações`);
                console.timeEnd(`⏱️  [${requestId}] Tempo total da requisição`);
                console.log(`❌ Dados incompletos`);
                res.status(400).json({
                    message: 'Campos obrigatórios: to, subject, template'
                });
                return;
            }

            // Validação do formato do email
            if (!to.includes('@')) {
                console.timeEnd(`⏱️  [${requestId}] Validações`);
                console.timeEnd(`⏱️  [${requestId}] Tempo total da requisição`);
                console.log(`❌ Email inválido (formato incorreto)`);
                res.status(400).json({
                    message: 'Email inválido'
                });
                return;
            }

            // Extrai o domínio do email
            const dominio = to.substring(to.lastIndexOf("@") + 1);

            // Validação do domínio - APENAS servidores válidos são permitidos
            if (!ServidoresValidos.includes(dominio)) {
                console.timeEnd(`⏱️  [${requestId}] Validações`);
                console.timeEnd(`⏱️  [${requestId}] Tempo total da requisição`);
                console.log(`❌ Domínio de email não permitido: ${dominio}`);
                console.log(`   Domínios válidos: ${ServidoresValidos.join(', ')}`);
                res.status(400).json({
                    message: 'Domínio de email não permitido',
                    dominio: dominio,
                    dominiosPermitidos: ServidoresValidos
                });
                return;
            }

            console.log(`   ✓ Domínio válido: ${dominio}`);
            console.timeEnd(`⏱️  [${requestId}] Validações`);

            const apiKeyFromHeader = req.headers['x-api-key'] as string;

            // Busca credenciais
            console.time(`⏱️  [${requestId}] Buscar credenciais`);
            const credentials = await this.apiKeyService.obterUsuarioPorApiKey(apiKeyFromHeader);
            console.timeEnd(`⏱️  [${requestId}] Buscar credenciais`);

            if (!credentials) {
                console.timeEnd(`⏱️  [${requestId}] Tempo total da requisição`);
                console.log(`❌ Credenciais não encontradas`);
                res.status(401).json({ message: 'Credenciais não encontradas' });
                return;
            }

            // 1. Registra o email no banco como 'pending' IMEDIATAMENTE
            console.time(`⏱️  [${requestId}] Registrar email no MongoDB`);
            const emailId = await this.emailService.registrarEmail({
                to,
                sender: credentials.email,
                subject,
                template,
                data,
                apiKeyUser: req.apiKeyUser || credentials
            });
            console.timeEnd(`⏱️  [${requestId}] Registrar email no MongoDB`);

            // 2. Adiciona o trabalho na Fila Redis
            console.time(`⏱️  [${requestId}] Adicionar job na fila Redis`);
            
            // Busca o número atualizado de retentativas
            const config = await this.configService.obterConfig();
            const retentativas = config?.retentativas || 3;
            
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
            }, {
                attempts: retentativas, // Define tentativas dinamicamente
                backoff: {
                    type: 'exponential',
                    delay: 5000, // Espera 5s entre tentativas
                },
                removeOnComplete: true,
                removeOnFail: false,
            });
            console.timeEnd(`⏱️  [${requestId}] Adicionar job na fila Redis`);

            console.log(`✅ Job adicionado à fila para o email ${emailId}`);

            // 3. Responde imediatamente
            console.timeEnd(`⏱️  [${requestId}] Tempo total da requisição`);
            
            res.status(202).json({
                message: 'E-mail na fila de processamento',
                status: 'pending',
                emailId
            });

        } catch (error) {
            console.timeEnd(`⏱️  [${requestId}] Tempo total da requisição`);
            console.error(`❌ Erro ao enfileirar:`, error);
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
    listarEmailsDoUsuario = async (req: Request, res: Response): Promise<void> => {
        try {
            const { apiKey } = req.body;

            if (!apiKey) {
                res.status(400).json({ message: 'API Key é obrigatória no body' });
                return;
            }

            console.log(`\n📋 Validando API Key e listando emails...`);
            console.log(`   🔑 API Key recebida: ${apiKey.substring(0, 8)}...`);

            // Valida a API Key
            const valido = await this.apiKeyService.validarApiKey(apiKey);
            if (!valido) {
                console.log(`   ❌ API Key inválida`);
                res.status(403).json({ message: 'API key inválida' });
                return;
            }

            // Busca o usuário pela API Key
            const apiKeyUser = await this.apiKeyService.obterUsuarioPorApiKey(apiKey);
            if (!apiKeyUser) {
                console.log(`   ❌ Usuário não encontrado`);
                res.status(401).json({ message: 'Usuário não autenticado' });
                return;
            }

            console.log(`   ✓ API Key válida para usuário: ${apiKeyUser.usuario}`);

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

    async buscarEmailPorId(req: Request, res: Response): Promise<void> {
        try {
            const emailId = req.params.id;
            console.log(`\n🔍 Obtendo detalhes do email ID: ${emailId}...`);

            const email = await this.emailService.buscarEmailPorId(emailId);

            if (!email) {
                console.log(`   ⚠️ Email não encontrado`);
                res.status(404).json({ message: 'Email não encontrado' });
                return;
            }

            console.log(`   ✓ Detalhes obtidos com sucesso`);
            res.json(email);

        } catch (error) {
            console.error(`   ❌ Erro ao obter detalhes do email:`, error);
            res.status(500).json({
                message: 'Erro ao obter detalhes do email',
                error: (error as Error).message
            });
        }
    }

    buscarEmailPorIdComApiKey = async (req: Request, res: Response): Promise<void> => {
        try {
            const emailId = req.params.id;
            const { apiKey } = req.body;

            if (!apiKey) {
                res.status(400).json({ message: 'API Key é obrigatória no body' });
                return;
            }

            console.log(`\n🔍 Buscando detalhes do email ID: ${emailId} com API Key...`);
            console.log(`   🔑 API Key recebida: ${apiKey.substring(0, 8)}...`);

            // Valida a API Key
            const valido = await this.apiKeyService.validarApiKey(apiKey);
            if (!valido) {
                console.log(`   ❌ API Key inválida`);
                res.status(403).json({ message: 'API key inválida' });
                return;
            }

            // Busca o usuário pela API Key
            const apiKeyUser = await this.apiKeyService.obterUsuarioPorApiKey(apiKey);
            if (!apiKeyUser) {
                console.log(`   ❌ Usuário não encontrado`);
                res.status(401).json({ message: 'Usuário não autenticado' });
                return;
            }

            console.log(`   ✓ API Key válida para usuário: ${apiKeyUser.usuario}`);

            // Busca o email
            const email = await this.emailService.buscarEmailPorId(emailId);

            if (!email) {
                console.log(`   ⚠️ Email não encontrado`);
                res.status(404).json({ message: 'Email não encontrado' });
                return;
            }

            // Verifica se o email pertence ao usuário
            if (email.sender !== apiKeyUser.email) {
                console.log(`   ❌ Email não pertence ao usuário`);
                res.status(403).json({ message: 'Você não tem permissão para acessar este email' });
                return;
            }

            console.log(`   ✓ Detalhes obtidos com sucesso`);
            res.json(email);

        } catch (error) {
            console.error(`   ❌ Erro ao obter detalhes do email:`, error);
            res.status(500).json({
                message: 'Erro ao obter detalhes do email',
                error: (error as Error).message
            });
        }
    }

    async listarTodosEmails(req: Request, res: Response): Promise<void> {
        try {
            console.log(`\n📋 Listando todos os emails...`);
            const emails = await this.emailService.listarTodosEmails();
            console.log(`   ✓ ${emails.length} email(s) encontrado(s)`);
            res.json(emails);
        } catch (error) {
            console.error(`   ❌ Erro ao listar todos os emails:`, error);
            res.status(500).json({
                message: 'Erro ao listar todos os emails',
                error: (error as Error).message
            });
        }
    }
}

export default EmailController;
