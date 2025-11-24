import { IApiKey } from '../models/apiKey.js';
import EmailModel, { IEmail } from '../models/email.js';

// Repositório responsável por todas as operações de Emails no banco de dados
class EmailRepository {

    // Cria um novo registro de email no banco de dados
    async criar(emailData: Partial<IEmail>): Promise<IEmail> {
        const email = new EmailModel(emailData);
        return await email.save();
    }

    // Busca um email por ID
    async buscarPorId(id: string): Promise<IEmail | null> {
        return await EmailModel.findById(id).populate('apiKeyUser');
    }

    // Busca todos os emails de um usuário específico
    async buscarPorUsuario(apiKeyUser: IApiKey): Promise<IEmail[]> {
        return await EmailModel.find({ apiKeyUser }).sort({ createdAt: -1 });
    }

    // Busca emails recentes (limitado)
    async buscarRecentes(limite: number = 10): Promise<IEmail[]> {
        return await EmailModel.find({}).sort({ createdAt: -1 }).limit(limite).populate('apiKeyUser');
    }

    // Atualiza o status de um email
    async atualizarStatus(
        id: string, 
        status: 'sent' | 'failed' | 'pending', 
        erro?: string
    ): Promise<boolean> {
        const updateData: any = { 
            status, 
            updatedAt: new Date() 
        };
        
        if (erro) {
            updateData.error = erro;
        }
        
        if (status === 'sent') {
            updateData.sentAt = new Date();
        }

        const result = await EmailModel.updateOne(
            { _id: id },
            { $set: updateData }
        );
        
        return result.modifiedCount > 0;
    }

    // Obtém estatísticas de emails
    async obterEstatisticas(): Promise<{
        total: number;
        enviados: number;
        falhas: number;
        pendentes: number;
        hoje: number;
    }> {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const [total, enviados, falhas, pendentes, emailsHoje] = await Promise.all([
            EmailModel.countDocuments({}),
            EmailModel.countDocuments({ status: 'sent' }),
            EmailModel.countDocuments({ status: 'failed' }),
            EmailModel.countDocuments({ status: 'pending' }),
            EmailModel.countDocuments({ createdAt: { $gte: hoje } })
        ]);

        return { 
            total, 
            enviados, 
            falhas, 
            pendentes, 
            hoje: emailsHoje 
        };
    }

    async buscarEmailPorId(id: string): Promise<IEmail | null> {
        return await EmailModel.findById(id).populate('apiKeyUser');
    }
    
    async listarTodosEmails(): Promise<IEmail[]> {
        return await EmailModel.find({}).sort({ createdAt: -1 }).populate('apiKeyUser');
    }
}

export default EmailRepository;
