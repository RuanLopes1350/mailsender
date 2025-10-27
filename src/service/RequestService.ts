import RequestRepository from '../repository/RequestRepository.js';
import { IRequest } from '../models/Request.js';

// Service responsável pelas regras de negócio relacionadas aos logs de requisições
class RequestService {
    private requestRepository: RequestRepository;

    constructor() {
        this.requestRepository = new RequestRepository();
    }

    // Registra uma nova requisição no banco de dados
    async registrarRequisicao(requestData: {
        method: string;
        path: string;
        statusCode: number;
        ip: string;
        userAgent: string;
        responseTime: number;
        apiKeyUser?: string;
    }): Promise<IRequest> {
        return await this.requestRepository.criar({
            ...requestData,
            createdAt: new Date()
        });
    }

    // Obtém estatísticas de requisições
    async obterEstatisticas(): Promise<{
        total: number;
        sucesso: number;
        erros: number;
        hoje: number;
    }> {
        return await this.requestRepository.obterEstatisticas();
    }

    // Busca atividades recentes
    async buscarAtividadesRecentes(limite: number = 10): Promise<IRequest[]> {
        return await this.requestRepository.buscarRecentes(limite);
    }

    // Busca requisições de um usuário específico
    async buscarRequisicoesDoUsuario(apiKeyUser: string): Promise<IRequest[]> {
        return await this.requestRepository.buscarPorUsuario(apiKeyUser);
    }
}

export default RequestService;
