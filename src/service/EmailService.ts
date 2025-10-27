import EmailRepository from '../repository/EmailRepository.js';
import { IEmail } from '../models/email.js';

// Service responsável pelas regras de negócio relacionadas aos Emails
class EmailService {
    private emailRepository: EmailRepository;

    constructor() {
        this.emailRepository = new EmailRepository();
    }

    // Registra um novo email no banco de dados
    async registrarEmail(emailData: {
        to: string;
        subject: string;
        template: string;
        data: Record<string, any>;
        apiKeyUser: string;
    }): Promise<string> {
        console.log(`   📝 Preparando registro do email...`);

        const email = await this.emailRepository.criar({
            ...emailData,
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
    async buscarEmailsDoUsuario(apiKeyUser: string): Promise<IEmail[]> {
        return await this.emailRepository.buscarPorUsuario(apiKeyUser);
    }
}

export default EmailService;
