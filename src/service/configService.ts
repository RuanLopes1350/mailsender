import ConfigRepository from "../repository/configRepository.js";

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

    async retentarEnvio(novoValor: number) {
        try {
            if(isNaN(novoValor) || novoValor < 1 || novoValor > 5 || !Number.isInteger(novoValor)) {
                throw new Error('O valor de retentativas deve ser um número inteiro entre 1 e 5');
            }

            const data = await this.repository.retentarEnvio(novoValor);
            return data;
        } catch (error) {
            console.log(error);
            throw new Error(`Erro ao iniciar retentativa de envio: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}

export default ConfigService;