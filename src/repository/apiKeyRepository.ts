import ApiKeyModel, { IApiKey } from '../models/apiKey.js';

// Repositório responsável por todas as operações de API Keys no banco de dados
class ApiKeyRepository {
    
    // Cria uma nova API Key no banco de dados
    async criar(apiKeyData: Partial<IApiKey>): Promise<IApiKey> {
        const apiKey = new ApiKeyModel(apiKeyData);
        return await apiKey.save();
    }

    // Busca uma API Key por nome de usuário
    async buscarPorUsuario(usuario: string): Promise<IApiKey | null> {
        return await ApiKeyModel.findOne({ usuario, isActive: true });
    }

    // Busca todas as API Keys ativas
    async buscarTodas(): Promise<IApiKey[]> {
        return await ApiKeyModel.find({ isActive: true, }).sort({ lastUsed: -1 });
    }

    // Atualiza a data do último uso de uma API Key
    async atualizarUltimoUso(usuario: string): Promise<boolean> {
        const result = await ApiKeyModel.updateOne(
            { usuario, isActive: true },
            { $set: { lastUsed: new Date() } }
        );
        return result.modifiedCount > 0;
    }

    // Inativa uma API Key (soft delete)
    async inativar(usuario: string): Promise<boolean> {
        const result = await ApiKeyModel.updateOne(
            { usuario, isActive: true },
            { $set: { isActive: false } }
        );
        return result.modifiedCount > 0;
    }

    // Reativa uma API Key
    async reativar(usuario: string): Promise<boolean> {
        const result = await ApiKeyModel.updateOne(
            { usuario, isActive: false },
            { $set: { isActive: true } }
        );
        return result.modifiedCount > 0;
    }

    // Remove permanentemente uma API Key do banco de dados
    async removerPorUsuario(usuario: string): Promise<boolean> {
        const result = await ApiKeyModel.deleteOne({ usuario });
        return result.deletedCount > 0;
    }

    // Verifica se existe uma API Key ativa para um usuário
    async existe(usuario: string): Promise<boolean> {
        const count = await ApiKeyModel.countDocuments({ usuario, isActive: true });
        return count > 0;
    }

    // Lista todas as API Keys (incluindo inativas) para administração
    async listarTodas(): Promise<IApiKey[]> {
        return await ApiKeyModel.find({}).sort({ lastUsed: -1 });
    }
}

export default ApiKeyRepository;
