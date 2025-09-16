import { Collection, ObjectId } from 'mongodb';
import DatabaseConnection from '../config/database.js';

export interface IApiKey {
    _id?: ObjectId;
    usuario: string;
    apiKey: string;
    createdAt: string;
    lastUsed: string | null;
    isActive: boolean;
}

export class ApiKeyModel {
    private collection: Collection<IApiKey>;

    constructor() {
        const db = DatabaseConnection.getInstance().getDb();
        this.collection = db.collection<IApiKey>('apiKeys');

        // Cria índices para otimizar consultas
        this.createIndexes();
    }

    private async createIndexes() {
        try {
            // Índice único para o usuário
            await this.collection.createIndex({ usuario: 1 }, { unique: true });
            // Índice para apiKey para buscas rápidas
            await this.collection.createIndex({ apiKey: 1 });
            // Índice para chaves ativas
            await this.collection.createIndex({ isActive: 1 });
        } catch (error) {
            console.log('Índices já existem ou erro ao criar:', error);
        }
    }

    async create(apiKeyData: Omit<IApiKey, '_id'>): Promise<IApiKey> {
        const result = await this.collection.insertOne(apiKeyData);
        return { ...apiKeyData, _id: result.insertedId };
    }

    async findByUser(usuario: string): Promise<IApiKey | null> {
        return await this.collection.findOne({ usuario, isActive: true });
    }

    async findByApiKey(apiKey: string): Promise<IApiKey | null> {
        return await this.collection.findOne({ apiKey, isActive: true });
    }

    async findAll(): Promise<IApiKey[]> {
        return await this.collection.find({ isActive: true }).toArray();
    }

    async updateLastUsed(usuario: string): Promise<boolean> {
        const result = await this.collection.updateOne(
            { usuario, isActive: true },
            { $set: { lastUsed: new Date().toISOString() } }
        );
        return result.modifiedCount > 0;
    }

    async deactivate(usuario: string): Promise<boolean> {
        const result = await this.collection.updateOne(
            { usuario, isActive: true },
            { $set: { isActive: false } }
        );
        return result.modifiedCount > 0;
    }

    async deleteByUser(usuario: string): Promise<boolean> {
        const result = await this.collection.deleteOne({ usuario });
        return result.deletedCount > 0;
    }

    async exists(usuario: string): Promise<boolean> {
        const count = await this.collection.countDocuments({ usuario, isActive: true });
        return count > 0;
    }
}

export default ApiKeyModel;
