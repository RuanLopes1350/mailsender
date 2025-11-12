import mongoose from "mongoose";
import ConfigModel, { IConfig } from "../models/config";

class ConfigRepository {
    private model: mongoose.Model<IConfig>;

    constructor() {
        this.model = ConfigModel;
    }

    async aprovarApiKey() {
        try {
            // Busca o documento atual para obter o valor de aprovarApiKey
            const currentConfig = await this.model.findOne({});

            if (!currentConfig) {
                throw new Error('Configuração não encontrada no banco de dados');
            }

            // Inverte o valor do campo aprovarApiKey
            const data = await this.model.findOneAndUpdate(
                {},
                { $set: { aprovarApiKey: !currentConfig.aprovarApiKey } },
                { new: true }
            );

            return data;
        } catch (error) {
            console.log(error);
            throw new Error(`Erro ao atualizar aprovarApiKey: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async criarConfigInicial() {
        try {
            // Verifica se já existe configuração
            const existingConfig = await this.model.findOne({});

            if (existingConfig) {
                throw new Error('Configuração já existe');
            }

            // Cria configuração inicial
            const config = await this.model.create({
                aprovarApiKey: true,
                retentativas: 3,
                intervaloRetentativas: 5000,
                rateLimitRequests: 100,
                rateLimitWindowMs: 60000,
            });

            return config;
        } catch (error) {
            throw new Error(`Erro ao criar configuração inicial: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async obterConfig() {
        try {
            const config = await this.model.findOne({});

            if (!config) {
                throw new Error('Configuração não encontrada no banco de dados');
            }

            return config;
        } catch (error) {
            throw new Error(`Erro ao buscar configuração: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}

export default ConfigRepository