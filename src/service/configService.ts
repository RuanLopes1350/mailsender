import ConfigRepository from "../repository/configRepository";
import { IConfig } from "../models/config";

class ConfigService {
    private repository: ConfigRepository;

    constructor() {
        this.repository = new ConfigRepository()
    }

    async aprovarApiKey() {
        try {
            const data = await this.repository.aprovarApiKey();
            return data;
        } catch (error) {
            console.log(error);
            throw new Error(`Erro ao atualizar aprovarApiKey: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async criarConfigInicial() {
        try {
            const data = await this.repository.criarConfigInicial();
            return data;
        } catch (error) {
            throw new Error(`Erro ao criar configuração inicial: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async obterConfig() {
        try {
            const data = await this.repository.obterConfig();
            return data;
        } catch (error) {
            console.log(error);
            throw new Error(`Erro ao buscar configuração: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}

export default ConfigService;