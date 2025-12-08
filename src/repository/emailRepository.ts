import { IApiKey } from '../models/apiKey.js';
import EmailModel, { IEmail } from '../models/email.js';
import { EmailFilterBuilder } from './filter/emailFilterBuilder.js';

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
        return await EmailModel.find({ apiKeyUser })
            .sort({ createdAt: -1 })
            .lean() as any;
    }

    // Busca emails recentes (limitado)
    async buscarRecentes(limite: number = 10): Promise<IEmail[]> {
        return await EmailModel.find({})
            .sort({ createdAt: -1 })
            .limit(limite)
            .populate('apiKeyUser')
            .lean() as any;
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
    async obterEstatisticas() {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const stats = await EmailModel.aggregate([
            {
                $facet: {
                    porStatus: [
                        { $group: { _id: '$status', count: { $sum: 1 } } }
                    ],
                    total: [
                        { $count: 'count' }
                    ],
                    hoje: [
                        { $match: { createdAt: { $gte: hoje } } },
                        { $count: 'count' }
                    ]
                }
            }
        ]);

        const statusMap = Object.fromEntries(
            stats[0].porStatus.map((s: any) => [s._id, s.count])
        );

        return {
            total: stats[0].total[0]?.count || 0,
            enviados: statusMap.sent || 0,
            falhas: statusMap.failed || 0,
            pendentes: statusMap.pending || 0,
            hoje: stats[0].hoje[0]?.count || 0
        };
    }

    async buscarEmailPorId(id: string): Promise<IEmail | null> {
        return await EmailModel.findById(id)
            .populate('apiKeyUser')
            .lean() as any;
    }

    async listarTodosEmails(filtros: any = {}): Promise<IEmail[]> {
        try {
            const query = EmailFilterBuilder.buildFilter(filtros);

            const resultado = await EmailModel.find(query)
                .sort({ createdAt: -1 })
                .populate('apiKeyUser')
                .lean() as any;

            return resultado;
        } catch (error) {
            console.error('Erro ao listar emails com filtros:', error);

            // Fallback: retorna todos os emails sem filtro
            return await EmailModel.find({})
                .sort({ createdAt: -1 })
                .populate('apiKeyUser')
                .lean() as any;
        }
    }
}

export default EmailRepository;
