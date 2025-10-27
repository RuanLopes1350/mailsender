import crypto from 'crypto';
import bcrypt from 'bcrypt';
import ApiKeyRepository from '../repository/apiKeyRepository.js';

const SALT_ROUNDS = 15;

// Service responsável pelas regras de negócio relacionadas às API Keys
class ApiKeyService {
    private apiKeyRepository: ApiKeyRepository;

    constructor() {
        this.apiKeyRepository = new ApiKeyRepository();
    }

    // Gera uma nova API Key para um usuário
    async gerarApiKey(usuario: string = 'noName'): Promise<string> {
        console.log(`\n🔑 Gerando nova API Key para usuário: ${usuario}`);

        // Verifica se já existe uma chave ativa para este usuário
        console.log(`   🔍 Verificando se usuário já possui chave...`);
        const chaveExistente = await this.apiKeyRepository.buscarPorUsuario(usuario);
        
        if (chaveExistente) {
            console.log(`   ❌ Usuário já possui uma chave ativa`);
            throw new Error(`Usuário '${usuario}' já possui uma API key ativa`);
        }

        // Gera a chave aleatória
        console.log(`   🎲 Gerando chave aleatória...`);
        const apiKey = crypto.randomBytes(32).toString('hex');
        
        // Cria o hash da chave
        console.log(`   🔐 Gerando hash bcrypt...`);
        const hash = await bcrypt.hash(apiKey, SALT_ROUNDS);

        // Salva no banco de dados
        console.log(`   💾 Salvando no banco de dados...`);
        await this.apiKeyRepository.criar({
            usuario,
            apiKey: hash,
            createdAt: new Date(),
            lastUsed: null,
            isActive: true
        });

        console.log(`   ✅ API Key gerada com sucesso para o usuário: ${usuario}`);
        return apiKey;
    }

    // Valida se uma API Key é válida
    async validarApiKey(apiKey: string): Promise<boolean> {
        try {
            const chaves = await this.apiKeyRepository.buscarTodas();
            console.log(`   🔍 Comparando com ${chaves.length} chave(s) no banco...`);

            for (const chave of chaves) {
                const isValid = await bcrypt.compare(apiKey, chave.apiKey);
                if (isValid) {
                    // Atualiza o lastUsed
                    await this.apiKeyRepository.atualizarUltimoUso(chave.usuario);
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

    // Obtém o usuário associado a uma API Key
    async obterUsuarioPorApiKey(apiKey: string): Promise<string | null> {
        try {
            const chaves = await this.apiKeyRepository.buscarTodas();

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

    // Lista todas as API Keys
    async listarApiKeys(): Promise<Array<{
        nome: string;
        prefixo: string;
        criadoEm: Date;
        ultimoUso: Date | null;
        ativa: boolean;
    }>> {
        try {
            const chaves = await this.apiKeyRepository.listarTodas();
            
            return chaves.map(chave => ({
                nome: chave.usuario,
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
        console.log(`\n🗑️  Revogando API Key do usuário: ${usuario}`);
        
        const removida = await this.apiKeyRepository.removerPorUsuario(usuario);
        
        if (removida) {
            console.log(`   ✅ API Key revogada com sucesso`);
        } else {
            console.log(`   ⚠️  Nenhuma chave encontrada para revogar`);
        }
        
        return removida;
    }

    // Inativa uma API Key (soft delete)
    async inativarApiKey(usuario: string): Promise<boolean> {
        console.log(`\n⏸️  Inativando API Key do usuário: ${usuario}`);
        
        const inativada = await this.apiKeyRepository.inativar(usuario);
        
        if (inativada) {
            console.log(`   ✅ API Key inativada com sucesso`);
        } else {
            console.log(`   ⚠️  Nenhuma chave encontrada para inativar`);
        }
        
        return inativada;
    }

    // Reativa uma API Key
    async reativarApiKey(usuario: string): Promise<boolean> {
        console.log(`\n▶️  Reativando API Key do usuário: ${usuario}`);
        
        const reativada = await this.apiKeyRepository.reativar(usuario);
        
        if (reativada) {
            console.log(`   ✅ API Key reativada com sucesso`);
        } else {
            console.log(`   ⚠️  Nenhuma chave encontrada para reativar`);
        }
        
        return reativada;
    }
}

export default ApiKeyService;
