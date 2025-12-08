import crypto from 'crypto';
import bcrypt from 'bcrypt';
import ApiKeyRepository from '../repository/apiKeyRepository.js';
import { IApiKey } from '../models/apiKey.js';
import ConfigRepository from '../repository/configRepository.js';

const SALT_ROUNDS = 8;

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
        const prefix = crypto.randomBytes(4).toString('hex');
        const secret = crypto.randomBytes(32).toString('hex');
        const fullApiKey = `${prefix}.${secret}`;

        // Cria o hash da chave
        console.log('Gerando hash bcrypt...');
        const hash = await bcrypt.hash(fullApiKey, SALT_ROUNDS);

        // Salva no banco de dados
        console.log('Salvando no banco de dados...');
        await this.apiKeyRepository.criar({
            usuario,
            email,
            pass,
            prefix,
            apiKey: hash,
            createdAt: new Date(),
            lastUsed: null,
            isActive
        });

        console.log(`API Key gerada: ${fullApiKey}`);
        return { apiKey: fullApiKey, isActive };
    }

    // Implementar cache em memória com TTL
    private apiKeyCache = new Map<string, { valid: boolean, expires: number, usuario?: IApiKey }>();
    
    // Valida se uma API Key é válida
    async validarApiKey(apiKeyInput: string): Promise<boolean> {
        try {
            // Validação básica de formato
            if (!apiKeyInput || !apiKeyInput.includes('.')) {
                console.log('Formato de chave inválido (esperado: prefix.secret)');
                return false;
            }

            // 1. Verifica cache primeiro
            const cached = this.apiKeyCache.get(apiKeyInput);
            if (cached && cached.expires > Date.now()) {
                console.log('✅ API Key validada via cache');
                return cached.valid;
            }

            // 2. Se não estiver em cache, valida com bcrypt
            const [prefix] = apiKeyInput.split('.');
            console.log(`Buscando chave com prefixo: ${prefix}`);
            
            const chave = await this.apiKeyRepository.buscarPorPrefix(prefix);

            if (!chave) {
                console.log('Nenhuma chave encontrada com este prefixo.');
                // Cache negativo por 1 minuto para evitar ataques
                this.apiKeyCache.set(apiKeyInput, {
                    valid: false,
                    expires: Date.now() + 60000
                });
                return false;
            }

            // Verifica se a chave está ativa
            if (!chave.isActive) {
                console.log('Chave encontrada mas está INATIVA');
                this.apiKeyCache.set(apiKeyInput, {
                    valid: false,
                    expires: Date.now() + 60000
                });
                return false;
            }

            const isValid = await bcrypt.compare(apiKeyInput, chave.apiKey);

            if (isValid) {
                await this.apiKeyRepository.atualizarUltimoUso(chave.usuario);
                console.log(`Chave validada com sucesso para: ${chave.usuario}`);
            }

            // 3. Armazena no cache por 5 minutos (válidas) ou 1 minuto (inválidas)
            this.apiKeyCache.set(apiKeyInput, {
                valid: isValid,
                expires: Date.now() + (isValid ? 300000 : 60000),
                usuario: isValid ? chave : undefined // 🚀 Cacheia o usuário também!
            });

            return isValid;
        } catch (error) {
            console.error('Erro na validação da API key:', error);
            return false;
        }
    }

    // Obtém o usuário associado a uma API Key
    async obterUsuarioPorApiKey(apiKeyInput: string): Promise<IApiKey | null> {
        try {
            if (!apiKeyInput.includes('.')) return null;

            // 🚀 OTIMIZAÇÃO: Busca no cache primeiro
            const cached = this.apiKeyCache.get(apiKeyInput);
            if (cached && cached.expires > Date.now() && cached.valid && cached.usuario) {
                return cached.usuario;
            }

            // Se não estiver em cache, busca no banco
            const [prefix] = apiKeyInput.split('.');
            const chave = await this.apiKeyRepository.buscarPorPrefix(prefix);

            if (chave) {
                const isValid = await bcrypt.compare(apiKeyInput, chave.apiKey);
                if (isValid) {
                    // Atualiza o cache com o usuário
                    this.apiKeyCache.set(apiKeyInput, {
                        valid: true,
                        expires: Date.now() + 300000,
                        usuario: chave
                    });
                    return chave;
                }
            }
            return null;
        } catch (error) {
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
                prefixo: chave.prefix,
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
            // Limpa o cache para forçar revalidação
            this.limparCache();
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
            // Limpa o cache para forçar revalidação
            this.limparCache();
        } else {
            console.log('Nenhuma chave encontrada para reativar');
        }

        return reativada;
    }

    // Limpa o cache de API Keys (para quando uma chave for inativada ou reativada)
    public limparCache(): void {
        const tamanhoAntes = this.apiKeyCache.size;
        this.apiKeyCache.clear();
        console.log(`🧹 Cache limpo: ${tamanhoAntes} entradas removidas`);
    }

    // Remove entradas expiradas do cache (chamado periodicamente)
    public limparCacheExpirado(): void {
        const agora = Date.now();
        let removidos = 0;
        
        for (const [key, value] of this.apiKeyCache.entries()) {
            if (value.expires < agora) {
                this.apiKeyCache.delete(key);
                removidos++;
            }
        }
        
        if (removidos > 0) {
            console.log(`🧹 Cache: ${removidos} entradas expiradas removidas`);
        }
    }
}

export default ApiKeyService;
