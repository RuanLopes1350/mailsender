import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import bcrypt from 'bcrypt'

const CAMINHO_API_KEY = path.resolve('src', 'auth', 'apiKeys.json');
const SALT_ROUNDS = 15;

// Função para garantir que o arquivo apiKeys.json existe
async function inicializarArquivoApiKeys() {
    try {
        await fs.access(CAMINHO_API_KEY);
        console.log('Arquivo apiKeys.json encontrado');
    } catch (erro) {
        console.log('Arquivo apiKeys.json não encontrado, criando...');
        try {
            // Cria o diretório se não existir
            const dirPath = path.dirname(CAMINHO_API_KEY);
            await fs.mkdir(dirPath, { recursive: true });

            // Cria o arquivo com array vazio
            await fs.writeFile(CAMINHO_API_KEY, JSON.stringify([], null, 2));
            console.log('Arquivo apiKeys.json criado com sucesso');
        } catch (erroCreation) {
            console.error('Erro ao criar apiKeys.json:', erroCreation);
            throw erroCreation;
        }
    }
}

async function lerApiKeys() {
    // Garante que o arquivo existe antes de tentar ler
    await inicializarArquivoApiKeys();

    try {
        const dados = await fs.readFile(CAMINHO_API_KEY, 'utf-8');
        return JSON.parse(dados);
    } catch (erro) {
        console.error('Erro ao ler as API keys:', erro);
        return [];
    }
}

async function salvarApiKeys(apiKeys: any[]) {
    await fs.writeFile(CAMINHO_API_KEY, JSON.stringify(apiKeys, null, 2));
}

export async function gerarApiKey(usuario: string = 'noName') {
    const apiKey = crypto.randomBytes(32).toString('hex');
    const hash = await bcrypt.hash(apiKey, SALT_ROUNDS);

    const chaves = await lerApiKeys();
    chaves.push({
        usuario,
        apiKey: hash,
        createdAt: new Date().toISOString(),
        lastUsed: null
    });
    await salvarApiKeys(chaves);

    return apiKey;
}

export async function validarApiKey(apiKey: string) {
    const chaves = await lerApiKeys();
    for (const { apiKey: hash } of chaves) {
        if (await bcrypt.compare(apiKey, hash)) return true;
    }
    return false;
}

export async function listarApiKeys() {
    const chaves = await lerApiKeys();
    return chaves.map(({ usuario, createdAt }: any) => ({ usuario, createdAt }));
}

export async function revogarApiKey(nomeUsuario: string) {
    const chaves = await lerApiKeys();
    const index = chaves.findIndex((chave: { usuario: string; }) => chave.usuario === nomeUsuario);
    if (index === -1) return false;
    chaves.splice(index, 1);
    await salvarApiKeys(chaves);
    return true;
}

// Função pública para inicializar o sistema de API keys
export async function inicializarSistemaApiKeys() {
    try {
        await inicializarArquivoApiKeys();
        console.log('Sistema de API Keys inicializado com sucesso');
        return true;
    } catch (erro) {
        console.error('Erro ao inicializar sistema de API Keys:', erro);
        return false;
    }
}