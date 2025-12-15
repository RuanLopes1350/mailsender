import ConfigService from "../service/configService.js";
import { Request, Response } from "express";
import dotenv from 'dotenv';

dotenv.config();

class ConfigController {
    private service: ConfigService;

    constructor() {
        this.service = new ConfigService()
    }

    async aprovarApiKey(req: Request, res: Response) {
        try {
            const data = await this.service.aprovarApiKey();
            return res.status(200).json({
                success: true,
                message: 'Configuração alterada com sucesso',
                data
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: `Erro ao atualizar configuração: ${error instanceof Error ? error.message : String(error)}`
            });
        }
    }

    async obterConfig(req: Request, res: Response) {
        try {
            const data = await this.service.obterConfig();
            return res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: `Erro ao buscar configuração: ${error instanceof Error ? error.message : String(error)}`
            });
        }
    }

    async retentarEnvio(req: Request, res: Response) {
        try {
            const novoValor = req.body.retentativas;
            const data = await this.service.retentarEnvio(novoValor);
            return res.status(200).json({
                success: true,
                message: 'Retentativa de envio iniciada com sucesso',
                data
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: `Erro ao iniciar retentativa de envio: ${error instanceof Error ? error.message : String(error)}`
            });
        }
    }
}

export default ConfigController;