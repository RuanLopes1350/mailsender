import mongoose from "mongoose";
import AdminModel, { IAdmin } from "../models/admin.js";

class AdminRepository {
    private model: mongoose.Model<IAdmin>;

    constructor() {
        this.model = AdminModel;
    }

    async login(username: string, password: string): Promise<IAdmin> {
        const admin = await this.model.findOne({ username, password });
        if (!admin) {
            throw new Error("Credenciais inválidas");
        }
        return admin
    }

    async criarAdmin(username: string, password: string): Promise<IAdmin> {
        const admin = new this.model({ username, password });
        await admin.save();
        return admin;
    }

    async alterarSenha(username: string, newPassword: string): Promise<IAdmin> {
        const admin = await this.model.findByIdAndUpdate(
            { username },
            { password: newPassword },
            { new: true }
        );
        if (!admin) {
            throw new Error("Admin não encontrado");
        }
        return admin;
    }

    async listarAdmins(): Promise<IAdmin[]> {
        return this.model.find();
    }

    async deletarAdmin(id: string): Promise<{ deletedCount?: number }> {
        return this.model.deleteOne({ _id: id });
    }
}

export default AdminRepository;