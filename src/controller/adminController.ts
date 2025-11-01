import mongoose from "mongoose";
import AdminService from "../service/adminService";
import { Request, Response } from "express";
import { IAdmin } from "../models/admin";

class AdminController {
    private service: AdminService;

    constructor() {
        this.service = new AdminService()
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            const { username, password } = req.body;

            // Validação de entrada
            if (!username || !password) {
                res.status(400).json({
                    message: "Username e password são obrigatórios"
                });
                return;
            }

            // Validação de tipos
            if (typeof username !== 'string' || typeof password !== 'string') {
                res.status(400).json({
                    message: "Username e password devem ser strings"
                });
                return;
            }

            // Validação de comprimento
            if (username.trim().length === 0 || password.trim().length === 0) {
                res.status(400).json({
                    message: "Username e password não podem estar vazios"
                });
                return;
            }

            // Tentativa de login
            const admin = await this.service.login(username.trim(), password);

            // Remover senha da resposta por segurança
            const adminResponse = {
                username: admin.username,
                _id: (admin as any)._id
            };

            res.status(200).json({
                message: "Login bem sucedido!",
                admin: adminResponse
            });

        } catch (error) {
            console.error('Erro no login:', error);

            if (error instanceof Error && error.message === "Credenciais inválidas") {
                res.status(401).json({
                    message: "Credenciais inválidas"
                });
            } else {
                res.status(500).json({
                    message: "Erro ao processar login. Tente novamente mais tarde."
                });
            }
        }
    }
}

export default AdminController;