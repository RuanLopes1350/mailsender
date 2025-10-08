import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

class DatabaseConnection {
    private static instance: DatabaseConnection;
    private client: MongoClient | null = null;
    private db: Db | null = null;

    private constructor() { }

    public static getInstance(): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }

    public async connect(): Promise<Db> {
        if (this.db) {
            return this.db;
        }

        try {
            const mongoUri = process.env.MONGO_URI;
            if (!mongoUri) {
                throw new Error('MONGO_URI não encontrada nas variáveis de ambiente');
            }

            this.client = new MongoClient(mongoUri);
            await this.client.connect();

            // Extrai o nome do banco da URI ou usa um padrão
            const dbName = 'sendmail';
            this.db = this.client.db(dbName);

            console.log('Conectado ao MongoDB com sucesso');
            return this.db;
        } catch (error) {
            console.error('Erro ao conectar com o MongoDB:', error);
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.close();
            this.client = null;
            this.db = null;
            console.log('Desconectado do MongoDB');
        }
    }

    public getDb(): Db {
        if (!this.db) {
            throw new Error('Banco de dados não conectado. Chame connect() primeiro.');
        }
        return this.db;
    }
}

export default DatabaseConnection;
