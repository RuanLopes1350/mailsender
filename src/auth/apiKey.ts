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
    console.log(`\n🔑 Gerando nova API Key para usuário: ${usuario}`);
    await inicializarApiKeyModel();

    // Verifica se já existe uma chave para este usuário
    console.log(`   🔍 Verificando se usuário já possui chave...`);
    const existingKey = await apiKeyModel.findByUser(usuario);
    if (existingKey) {
        console.log(`   ❌ Usuário já possui uma chave ativa`);
        throw new Error(`Usuário '${usuario}' já possui uma API key ativa`);
    }

    console.log(`   🎲 Gerando chave aleatória...`);
    const apiKey = crypto.randomBytes(32).toString('hex');
    console.log(`   🔐 Gerando hash bcrypt...`);
    const hash = await bcrypt.hash(apiKey, SALT_ROUNDS);

    const apiKeyData: Omit<IApiKey, '_id'> = {
        usuario,
        apiKey: hash,
        createdAt: new Date().toISOString(),
        lastUsed: null,
        isActive: true
    };

    console.log(`   💾 Salvando no banco de dados...`);
    await apiKeyModel.create(apiKeyData);
    console.log(`   ✅ API Key gerada com sucesso para o usuário: ${usuario}`);

    return apiKey;
}

export async function validarApiKey(apiKey: string): Promise<boolean> {
    await inicializarApiKeyModel();

    try {
        const chaves = await apiKeyModel.findAll();
        console.log(`   🔍 Comparando com ${chaves.length} chave(s) no banco...`);

        for (const chave of chaves) {
            const isValid = await bcrypt.compare(apiKey, chave.apiKey);
            if (isValid) {
                // Atualiza o lastUsed
                await apiKeyModel.updateLastUsed(chave.usuario);
                console.log(`   ✓ Chave validada com sucesso para usuário: ${chave.usuario}`);
                return true;
            }
        }
        console.log(`   ✗ Nenhuma chave correspondente encontrada`);
        return false;
    } catch (error) {
        console.error('   ❌ Erro ao validar API key:', error);
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

export async function listarApiKeys(): Promise<{ name: string; prefix: string; createdAt: string; lastUsed: string | null }[]> {
    await inicializarApiKeyModel();

    try {
        const chaves = await apiKeyModel.findAll();
        return chaves.map(({ usuario, apiKey, createdAt, lastUsed }: IApiKey) => ({
            name: usuario as string,
            prefix: (apiKey as string).substring(0, 12) + '...', // Mostra apenas os primeiros 12 caracteres
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
        console.log(`   🔍 Buscando chave ativa para usuário: ${nomeUsuario}`);
        const sucesso = await apiKeyModel.deactivate(nomeUsuario);
        if (sucesso) {
            console.log(`   ✓ API Key revogada para o usuário: ${nomeUsuario}`);
        } else {
            console.log(`   ⚠️ Nenhuma API Key ativa encontrada para o usuário: ${nomeUsuario}`);
        }
        return sucesso;
    } catch (error) {
        console.error('   ❌ Erro ao revogar API key:', error);
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
        console.log('   🔌 Conectando ao MongoDB...');
        await inicializarApiKeyModel();
        console.log('   ✅ Sistema de API Keys inicializado com sucesso (MongoDB)');
        return true;
    } catch (erro) {
        console.error('   ❌ Erro ao inicializar sistema de API Keys:', erro);
        return false;
    }
}