import { Response } from 'express';
import { RequestWithUser } from '../middleware/apiKeyMiddleware.js';
import ApiKeyService from '../service/ApiKeyService.js';

// Controller responsável por gerenciar as requisições relacionadas às API Keys
class ApiKeyController {
    private apiKeyService: ApiKeyService;

    constructor() {
        this.apiKeyService = new ApiKeyService();
    }

    // Gera uma nova API Key
    gerarApiKey = async (req: RequestWithUser, res: Response): Promise<void> => {
        try {
            const { name = 'semNome' } = req.body ?? {};
            console.log(`\n🔐 Requisição para gerar API Key`);
            console.log(`   Nome: ${name}`);
            
            const apiKey = await this.apiKeyService.gerarApiKey(name);
            
            console.log(`   ✅ Chave gerada com sucesso`);
            res.status(201).json({
                name,
                message: 'Chave criada – salve em local seguro (não será mostrada de novo)',
                apiKey
            });
        } catch (erro) {
            console.error(`   ❌ Erro ao gerar chave:`, erro);
            res.status(500).json({ 
                message: 'Falha ao gerar chave', 
                error: (erro as Error).message 
            });
        }
    };

    // Lista todas as API Keys
    listarApiKeys = async (req: RequestWithUser, res: Response): Promise<void> => {
        try {
            console.log(`\n📋 Listando API Keys...`);
            const keys = await this.apiKeyService.listarApiKeys();
            console.log(`   ✓ ${keys.length} chave(s) encontrada(s)`);
            res.json(keys);
        } catch (error) {
            console.error(`   ❌ Erro ao listar chaves:`, error);
            res.status(500).json({ 
                message: 'Erro ao listar chaves', 
                error: (error as Error).message 
            });
        }
    };

    // Revoga (remove permanentemente) uma API Key
    revogarApiKey = async (req: RequestWithUser, res: Response): Promise<void> => {
        try {
            const { name } = req.params;
            console.log(`\n🗑️  Requisição para revogar API Key: ${name}`);
            
            const removida = await this.apiKeyService.revogarApiKey(name);
            
            if (removida) {
                console.log(`   ✅ Chave revogada com sucesso`);
                res.json({ message: 'Chave revogada com sucesso' });
            } else {
                console.log(`   ⚠️  Chave não encontrada`);
                res.status(404).json({ message: 'Chave não encontrada' });
            }
        } catch (error) {
            console.error(`   ❌ Erro ao revogar chave:`, error);
            res.status(500).json({ 
                message: 'Erro ao revogar chave', 
                error: (error as Error).message 
            });
        }
    };

    // Inativa uma API Key (soft delete)
    inativarApiKey = async (req: RequestWithUser, res: Response): Promise<void> => {
        try {
            const { name } = req.params;
            console.log(`\n⏸️  Requisição para inativar API Key: ${name}`);
            
            const inativada = await this.apiKeyService.inativarApiKey(name);
            
            if (inativada) {
                console.log(`   ✅ Chave inativada com sucesso`);
                res.json({ message: 'Chave inativada com sucesso' });
            } else {
                console.log(`   ⚠️  Chave não encontrada ou já inativa`);
                res.status(404).json({ message: 'Chave não encontrada ou já inativa' });
            }
        } catch (error) {
            console.error(`   ❌ Erro ao inativar chave:`, error);
            res.status(500).json({ 
                message: 'Erro ao inativar chave', 
                error: (error as Error).message 
            });
        }
    };

    // Reativa uma API Key
    reativarApiKey = async (req: RequestWithUser, res: Response): Promise<void> => {
        try {
            const { name } = req.params;
            console.log(`\n▶️  Requisição para reativar API Key: ${name}`);
            
            const reativada = await this.apiKeyService.reativarApiKey(name);
            
            if (reativada) {
                console.log(`   ✅ Chave reativada com sucesso`);
                res.json({ message: 'Chave reativada com sucesso' });
            } else {
                console.log(`   ⚠️  Chave não encontrada ou já ativa`);
                res.status(404).json({ message: 'Chave não encontrada ou já ativa' });
            }
        } catch (error) {
            console.error(`   ❌ Erro ao reativar chave:`, error);
            res.status(500).json({ 
                message: 'Erro ao reativar chave', 
                error: (error as Error).message 
            });
        }
    };
}

export default ApiKeyController;
