import { Collection, ObjectId } from 'mongodb';
import DatabaseConnection from '../config/database.js';

export interface IRequest {
    _id?: ObjectId;
    method: string;
    path: string;
    status: number;
    apiKeyUser?: string | undefined;
    ip: string;
    userAgent?: string | undefined;
    responseTime: number;
    createdAt: string;
    error?: string | undefined;
}

export class RequestModel {
    private collection: Collection<IRequest>;

    constructor() {
        const db = DatabaseConnection.getInstance().getDb();
        this.collection = db.collection<IRequest>('requests');
        this.createIndexes();
    }

    private async createIndexes() {
        try {
            await this.collection.createIndex({ apiKeyUser: 1 });
            await this.collection.createIndex({ status: 1 });
            await this.collection.createIndex({ createdAt: -1 });
            await this.collection.createIndex({ path: 1 });
        } catch (error) {
            console.log('Índices de requests já existem ou erro ao criar:', error);
        }
    }

    async create(requestData: Omit<IRequest, '_id'>): Promise<IRequest> {
        const result = await this.collection.insertOne(requestData);
        return { ...requestData, _id: result.insertedId };
    }

    async findAll(limit: number = 100): Promise<IRequest[]> {
        return await this.collection.find({}).sort({ createdAt: -1 }).limit(limit).toArray();
    }

    async findByUser(apiKeyUser: string, limit: number = 50): Promise<IRequest[]> {
        return await this.collection.find({ apiKeyUser }).sort({ createdAt: -1 }).limit(limit).toArray();
    }

    async getStats(): Promise<{
        total: number;
        today: number;
        success: number;
        errors: number;
        avgResponseTime: number;
    }> {
        const today = new Date().toISOString().split('T')[0];

        const [total, todayRequests, success, errors] = await Promise.all([
            this.collection.countDocuments({}),
            this.collection.countDocuments({
                createdAt: { $regex: `^${today}` }
            }),
            this.collection.countDocuments({ status: { $gte: 200, $lt: 400 } }),
            this.collection.countDocuments({ status: { $gte: 400 } })
        ]);

        // Calcular tempo médio de resposta
        const pipeline = [
            { $group: { _id: null, avgResponseTime: { $avg: "$responseTime" } } }
        ];
        const avgResult = await this.collection.aggregate(pipeline).toArray();
        const avgResponseTime = avgResult[0]?.avgResponseTime || 0;

        return {
            total,
            today: todayRequests,
            success,
            errors,
            avgResponseTime: Math.round(avgResponseTime)
        };
    }

    async getRecentActivity(limit: number = 10): Promise<IRequest[]> {
        return await this.collection.find({})
            .sort({ createdAt: -1 })
            .limit(limit)
            .toArray();
    }
}

export default RequestModel;
