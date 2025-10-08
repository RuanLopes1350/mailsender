import { Collection, ObjectId } from 'mongodb';
import DatabaseConnection from '../config/database.js';

export interface IEmail {
    _id?: ObjectId;
    to: string;
    subject: string;
    template: string;
    data: Record<string, any>;
    status: 'sent' | 'failed' | 'pending';
    apiKeyUser: string;
    sentAt?: string;
    error?: string;
    createdAt: string;
    updatedAt: string;
}

export class EmailModel {
    private collection: Collection<IEmail>;

    constructor() {
        const db = DatabaseConnection.getInstance().getDb();
        this.collection = db.collection<IEmail>('emails');
        this.createIndexes();
    }

    private async createIndexes() {
        try {
            await this.collection.createIndex({ apiKeyUser: 1 });
            await this.collection.createIndex({ status: 1 });
            await this.collection.createIndex({ createdAt: -1 });
        } catch (error) {
            console.log('Índices de emails já existem ou erro ao criar:', error);
        }
    }

    async create(emailData: Omit<IEmail, '_id'>): Promise<IEmail> {
        const result = await this.collection.insertOne(emailData);
        return { ...emailData, _id: result.insertedId };
    }

    async findById(id: string): Promise<IEmail | null> {
        return await this.collection.findOne({ _id: new ObjectId(id) });
    }

    async findByUser(apiKeyUser: string): Promise<IEmail[]> {
        return await this.collection.find({ apiKeyUser }).sort({ createdAt: -1 }).toArray();
    }

    async findAll(limit: number = 100): Promise<IEmail[]> {
        return await this.collection.find({}).sort({ createdAt: -1 }).limit(limit).toArray();
    }

    async updateStatus(id: string, status: IEmail['status'], error?: string, sentAt?: string): Promise<boolean> {
        const updateData: any = { status, updatedAt: new Date().toISOString() };
        if (error) updateData.error = error;
        if (sentAt) updateData.sentAt = sentAt;

        const result = await this.collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        return result.modifiedCount > 0;
    }

    async getStats(): Promise<{
        total: number;
        sent: number;
        failed: number;
        pending: number;
        today: number;
    }> {
        const today = new Date().toISOString().split('T')[0];

        const [total, sent, failed, pending, todayEmails] = await Promise.all([
            this.collection.countDocuments({}),
            this.collection.countDocuments({ status: 'sent' }),
            this.collection.countDocuments({ status: 'failed' }),
            this.collection.countDocuments({ status: 'pending' }),
            this.collection.countDocuments({
                createdAt: { $regex: `^${today}` }
            })
        ]);

        return { total, sent, failed, pending, today: todayEmails };
    }
}

export default EmailModel;