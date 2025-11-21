import crypto from 'crypto';
import bcrypt from 'bcrypt';
import ApiKeyRepository from '../repository/apiKeyRepository.js';
import { IApiKey } from '../models/apiKey.js';
import ConfigRepository from '../repository/configRepository.js';

const SALT_ROUNDS = 15;

// Service responsável pelas regras de negócio relacionadas às API Keys
class ApiKeyService {
    private apiKeyRepository: ApiKeyRepository;
    private configRepository: ConfigRepository;

    constructor() {
        this.apiKeyRepository = new ApiKeyRepository();
        this.configRepository = new ConfigRepository();
    }

    // Gera uma nova API Key para um usuário
    async gerarApiKey(usuario: string = 'noName', email: string, pass: string): Promise<{ apiKey: string; isActive: boolean }> {
        console.log(`Gerando nova API Key para usuario: ${usuario}`);

        // Verifica se já existe uma chave ativa para este usuário
        console.log('Verificando se usuario ja possui chave...');
        const chaveExistente = await this.apiKeyRepository.buscarPorUsuario(usuario);

        if (chaveExistente) {
            console.log('Usuario ja possui uma chave ativa');
            throw new Error(`Usuário '${usuario}' já possui uma API key ativa`);
        }

        // Busca a configuração para verificar se precisa de aprovação
        console.log('Verificando configuracao de aprovacao...');
        const config = await this.configRepository.obterConfig();
        console.log(`Valor de config.aprovarApiKey: ${config.aprovarApiKey}`);

        // Se aprovarApiKey for true (requer aprovação), a chave inicia como inativa (false)
        const isActive = !config.aprovarApiKey;

        console.log(`isActive calculado: ${isActive}`);
        console.log(`Chave sera criada como: ${isActive ? 'ATIVA' : 'INATIVA (aguardando aprovacao)'}`);

        // Gera a chave aleatória
        console.log('Gerando chave aleatoria...');
        const apiKey = crypto.randomBytes(32).toString('hex');

        // Cria o hash da chave
        console.log('Gerando hash bcrypt...');
        const hash = await bcrypt.hash(apiKey, SALT_ROUNDS);

        // Salva no banco de dados
        console.log('Salvando no banco de dados...');
        await this.apiKeyRepository.criar({
            usuario,
            email: email,
            pass: pass,
            apiKey: hash,
            createdAt: new Date(),
            lastUsed: null,
            isActive: isActive
        });

        console.log(`API Key gerada com sucesso para o usuario: ${usuario}`);
        return { apiKey, isActive };
    }

    // Valida se uma API Key é válida
    async validarApiKey(apiKey: string): Promise<boolean> {
        try {
            const chaves = await this.apiKeyRepository.buscarTodas();
            console.log(`Comparando com ${chaves.length} chave(s) no banco...`);

            for (const chave of chaves) {
                const isValid = await bcrypt.compare(apiKey, chave.apiKey);
                if (isValid) {
                    // Atualiza o lastUsed
                    await this.apiKeyRepository.atualizarUltimoUso(chave.usuario);
                    console.log(`Chave validada com sucesso para usuario: ${chave.usuario}`);
                    return true;
                }
            }

            console.log('Nenhuma chave correspondente encontrada');
            return false;
        } catch (error) {
            console.error('Erro ao validar API key:', error);
            return false;
        }
    }

    // Obtém o usuário associado a uma API Key
    async obterUsuarioPorApiKey(apiKey: string): Promise<IApiKey | null> {
        try {
            const chaves: IApiKey[] = await this.apiKeyRepository.buscarTodas();

            for (const chave of chaves) {
                const isValid = await bcrypt.compare(apiKey, chave.apiKey);
                if (isValid) {
                    let usuario: IApiKey = chave
                    return usuario;
                }
            }

            return null;
        } catch (error) {
            console.error('Erro ao obter usuário por API key:', error);
            return null;
        }
    }

    // Lista todas as API Keys
    async listarApiKeys(): Promise<Array<{
        nome: string;
        email: string;
        prefixo: string;
        criadoEm: Date;
        ultimoUso: Date | null;
        ativa: boolean;
    }>> {
        try {
            const chaves = await this.apiKeyRepository.listarTodas();

            return chaves.map(chave => ({
                nome: chave.usuario,
                email: chave.email,
                prefixo: chave.apiKey.substring(0, 12) + '...',
                criadoEm: chave.createdAt,
                ultimoUso: chave.lastUsed,
                ativa: chave.isActive
            }));
        } catch (error) {
            console.error('Erro ao listar API keys:', error);
            throw error;
        }
    }

    // Revoga (remove permanentemente) uma API Key
    async revogarApiKey(usuario: string): Promise<boolean> {
        console.log(`Revogando API Key do usuario: ${usuario}`);

        const removida = await this.apiKeyRepository.removerPorUsuario(usuario);

        if (removida) {
            console.log('API Key revogada com sucesso');
        } else {
            console.log('Nenhuma chave encontrada para revogar');
        }

        return removida;
    }

    // Inativa uma API Key (soft delete)
    async inativarApiKey(usuario: string): Promise<boolean> {
        console.log(`Inativando API Key do usuario: ${usuario}`);

        const inativada = await this.apiKeyRepository.inativar(usuario);

        if (inativada) {
            console.log('API Key inativada com sucesso');
        } else {
            console.log('Nenhuma chave encontrada para inativar');
        }

        return inativada;
    }

    // Reativa uma API Key
    async reativarApiKey(usuario: string): Promise<boolean> {
        console.log(`Reativando API Key do usuario: ${usuario}`);

        const reativada = await this.apiKeyRepository.reativar(usuario);

        if (reativada) {
            console.log('API Key reativada com sucesso');
        } else {
            console.log('Nenhuma chave encontrada para reativar');
        }

        return reativada;
    }
}

export default ApiKeyService;
