import EmailRepository from '../repository/emailRepository.js';
import { IEmail } from '../models/email.js';
import { IApiKey } from '../models/apiKey.js';
import { Document } from 'mongoose';

// Service responsável pelas regras de negócio relacionadas aos Emails
class EmailService {
    private emailRepository: EmailRepository;

    constructor() {
        this.emailRepository = new EmailRepository();
    }

    // Registra um novo email no banco de dados
    async registrarEmail(emailData: {
        to: string;
        sender: string;
        subject: string;
        template: string;
        data: Record<string, any>;
        apiKeyUser: IApiKey | Document;
    }): Promise<string> {
        console.log(`   📝 Preparando registro do email...`);

        const email = await this.emailRepository.criar({
            to: emailData.to,
            sender: emailData.sender,
            subject: emailData.subject,
            template: emailData.template,
            data: emailData.data,
            apiKeyUser: emailData.apiKeyUser,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const emailId = email._id!.toString();
        console.log(`   ✓ Registro criado com sucesso (ID: ${emailId})`);

        return emailId;
    }

    // Atualiza o status de um email após tentativa de envio
    async atualizarStatusEmail(
        emailId: string,
        status: 'sent' | 'failed' | 'pending',
        erro?: string
    ): Promise<boolean> {
        console.log(`   📊 Atualizando status do email ${emailId} para '${status}'...`);

        const atualizado = await this.emailRepository.atualizarStatus(emailId, status, erro);

        if (atualizado) {
            console.log(`   ✓ Status atualizado no banco de dados`);
        } else {
            console.log(`   ⚠️ Falha ao atualizar status no banco`);
        }

        return atualizado;
    }

    // Obtém estatísticas de emails
    async obterEstatisticas(): Promise<{
        total: number;
        enviados: number;
        falhas: number;
        pendentes: number;
        hoje: number;
    }> {
        return await this.emailRepository.obterEstatisticas();
    }

    // Busca emails recentes
    async buscarEmailsRecentes(limite: number = 10): Promise<IEmail[]> {
        return await this.emailRepository.buscarRecentes(limite);
    }

    // Busca emails de um usuário específico
    async buscarEmailsDoUsuario(apiKeyUser: IApiKey): Promise<IEmail[]> {
        return await this.emailRepository.buscarPorUsuario(apiKeyUser);
    }

    // Busca detalhes de um email por ID
    async buscarEmailPorId(id: string): Promise<IEmail | null> {
        return await this.emailRepository.buscarEmailPorId(id);
    }

    async listarTodosEmails(): Promise<IEmail[]> {
        return await this.emailRepository.listarTodosEmails();
    }
}

export default EmailService;
