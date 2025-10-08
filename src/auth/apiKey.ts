import crypto from 'crypto'
import bcrypt from 'bcrypt'
import DatabaseConnection from '../config/database.js'
import ApiKeyModel, {IApiKey} from '../models/apiKey.js';

const SALT_ROUNDS = 15;
let apiKeyModel: ApiKeyModel;

// Função para garantir que o modelo está inicializado
async function inicializarApiKeyModel() {
    if (!apiKeyModel) {
        const dbConnection = DatabaseConnection.getInstance();
        await dbConnection.connect();
        apiKeyModel = new ApiKeyModel();
    }
}

export async function gerarApiKey(usuario: string = 'noName'): Promise<string> {
    await inicializarApiKeyModel();

    // Verifica se já existe uma chave para este usuário
    const existingKey = await apiKeyModel.findByUser(usuario);
    if (existingKey) {
        throw new Error(`Usuário '${usuario}' já possui uma API key ativa`);
    }

    const apiKey = crypto.randomBytes(32).toString('hex');
    const hash = await bcrypt.hash(apiKey, SALT_ROUNDS);

    const apiKeyData: Omit<IApiKey, '_id'> = {
        usuario,
        apiKey: hash,
        createdAt: new Date().toISOString(),
        lastUsed: null,
        isActive: true
    };

    await apiKeyModel.create(apiKeyData);
    console.log(`API Key gerada para o usuário: ${usuario}`);

    return apiKey;
}

export async function validarApiKey(apiKey: string): Promise<boolean> {
    await inicializarApiKeyModel();

    try {
        const chaves = await apiKeyModel.findAll();

        for (const chave of chaves) {
            const isValid = await bcrypt.compare(apiKey, chave.apiKey);
            if (isValid) {
                // Atualiza o lastUsed
                await apiKeyModel.updateLastUsed(chave.usuario);
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error('Erro ao validar API key:', error);
        return false;
    }
}

export async function obterUsuarioPorApiKey(apiKey: string): Promise<string | null> {
    await inicializarApiKeyModel();

    try {
        const chaves = await apiKeyModel.findAll();

        for (const chave of chaves) {
            const isValid = await bcrypt.compare(apiKey, chave.apiKey);
            if (isValid) {
                return chave.usuario;
            }
        }
        return null;
    } catch (error) {
        console.error('Erro ao obter usuário por API key:', error);
        return null;
    }
}

export async function listarApiKeys(): Promise<{ usuario: string; createdAt: string; lastUsed: string | null }[]> {
    await inicializarApiKeyModel();

    try {
        const chaves = await apiKeyModel.findAll();
        return chaves.map(({ usuario, createdAt, lastUsed }: IApiKey) => ({
            usuario: usuario as string,
            createdAt: createdAt as string,
            lastUsed: lastUsed as string | null
        }));
    } catch (error) {
        console.error('Erro ao listar API keys:', error);
        return [];
    }
}

export async function revogarApiKey(nomeUsuario: string): Promise<boolean> {
    await inicializarApiKeyModel();

    try {
        const sucesso = await apiKeyModel.deactivate(nomeUsuario);
        if (sucesso) {
            console.log(`API Key revogada para o usuário: ${nomeUsuario}`);
        } else {
            console.log(`Nenhuma API Key ativa encontrada para o usuário: ${nomeUsuario}`);
        }
        return sucesso;
    } catch (error) {
        console.error('Erro ao revogar API key:', error);
        return false;
    }
}

export async function removerApiKey(nomeUsuario: string): Promise<boolean> {
    await inicializarApiKeyModel();

    try {
        const sucesso = await apiKeyModel.deleteByUser(nomeUsuario);
        if (sucesso) {
            console.log(`API Key removida permanentemente para o usuário: ${nomeUsuario}`);
        } else {
            console.log(`Nenhuma API Key encontrada para o usuário: ${nomeUsuario}`);
        }
        return sucesso;
    } catch (error) {
        console.error('Erro ao remover API key:', error);
        return false;
    }
}

export async function verificarUsuarioExiste(usuario: string): Promise<boolean> {
    await inicializarApiKeyModel();

    try {
        return await apiKeyModel.exists(usuario);
    } catch (error) {
        console.error('Erro ao verificar usuário:', error);
        return false;
    }
}

// Função pública para inicializar o sistema de API keys
export async function inicializarSistemaApiKeys(): Promise<boolean> {
    try {
        await inicializarApiKeyModel();
        console.log('Sistema de API Keys inicializado com sucesso (MongoDB)');
        return true;
    } catch (erro) {
        console.error('Erro ao inicializar sistema de API Keys:', erro);
        return false;
    }
}