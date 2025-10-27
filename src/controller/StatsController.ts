import { Response } from 'express';
import { RequestWithUser } from '../middleware/apiKeyMiddleware.js';
import RequestService from '../service/RequestService.js';
import EmailService from '../service/EmailService.js';

// Controller responsável por gerenciar estatísticas e status do sistema
class StatsController {
    private requestService: RequestService;
    private emailService: EmailService;

    constructor() {
        this.requestService = new RequestService();
        this.emailService = new EmailService();
    }

    // Obtém estatísticas gerais do sistema
    obterEstatisticasGerais = async (req: RequestWithUser, res: Response): Promise<void> => {
        try {
            console.log(`\n📊 Obtendo estatísticas gerais do sistema...`);
            
            const [emailStats, requestStats, recentEmails, recentActivity] = await Promise.all([
                this.emailService.obterEstatisticas(),
                this.requestService.obterEstatisticas(),
                this.emailService.buscarEmailsRecentes(5),
                this.requestService.buscarAtividadesRecentes(10)
            ]);

            console.log(`   ✓ Estatísticas coletadas com sucesso`);
            
            res.json({
                emails: emailStats,
                requests: requestStats,
                recentEmails,
                recentActivity
            });
        } catch (error) {
            console.error(`   ❌ Erro ao obter estatísticas:`, error);
            res.status(500).json({ 
                message: 'Erro ao obter estatísticas',
                error: (error as Error).message 
            });
        }
    };

    // Health check do sistema
    healthCheck = async (req: RequestWithUser, res: Response): Promise<void> => {
        res.json({ 
            ok: true, 
            message: 'Micro-serviço online',
            timestamp: new Date().toISOString()
        });
    };

    // Status detalhado do sistema
    statusDetalhado = async (req: RequestWithUser, res: Response): Promise<void> => {
        const serverStartTime = (global as any).serverStartTime || Date.now();
        const uptime = Date.now() - serverStartTime;
        
        res.json({
            ok: true,
            startTime: serverStartTime,
            uptime: uptime,
            uptimeFormatted: this.formatarUptime(uptime)
        });
    };

    // Formata o uptime em formato legível
    private formatarUptime(milliseconds: number): string {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days}d ${hours % 24}h ${minutes % 60}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }
}

export default StatsController;
