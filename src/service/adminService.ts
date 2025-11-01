import mongoose from "mongoose";
import AdminRepository from "../repository/adminRepository.js";
import { IAdmin } from "../models/admin.js";

class AdminService {
    private repository: AdminRepository;

    constructor() {
        this.repository = new AdminRepository();
    }

    async login(username: string, password: string): Promise<IAdmin> {
        return await this.repository.login(username, password)
    }

    async criarAdmin(username: string, password: string): Promise<IAdmin> { 
        return await this.repository.criarAdmin(username, password)
    }
}

export default AdminService