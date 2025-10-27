import RequestModel, { IRequest } from '../models/request.js';

// Repositório responsável por todas as operações de Logs de Requisições no banco de dados
class RequestRepository {

    // Cria um novo log de requisição no banco de dados
    async criar(requestData: Partial<IRequest>): Promise<IRequest> {
        const request = new RequestModel(requestData);
        return await request.save();
    }

    // Busca requisições recentes (limitado)
    async buscarRecentes(limite: number = 10): Promise<IRequest[]> {
        return await RequestModel.find({}).sort({ createdAt: -1 }).limit(limite);
    }

    // Busca requisições de um usuário específico
    async buscarPorUsuario(apiKeyUser: string): Promise<IRequest[]> {
        return await RequestModel.find({ apiKeyUser }).sort({ createdAt: -1 });
    }

    // Obtém estatísticas de requisições
    async obterEstatisticas(): Promise<{
        total: number;
        sucesso: number;
        erros: number;
        hoje: number;
    }> {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const [total, sucesso, erros, requisicoesHoje] = await Promise.all([
            RequestModel.countDocuments({}),
            RequestModel.countDocuments({ statusCode: { $gte: 200, $lt: 300 } }),
            RequestModel.countDocuments({ statusCode: { $gte: 400 } }),
            RequestModel.countDocuments({ createdAt: { $gte: hoje } })
        ]);

        return { 
            total, 
            sucesso, 
            erros, 
            hoje: requisicoesHoje 
        };
    }
}

export default RequestRepository;
