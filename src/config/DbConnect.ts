import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

class DbConnect {
    static async conectar() {
        try {
            let mongoUri = process.env.DB_URL;
            if (!mongoUri) {
                throw new Error("A variável de ambiente DB_URL não está definida.")
            }

            mongoose.connection.on('connected', () => {
            });

            mongoose.connection.on('error', (err) => {
            });

            mongoose.connection.on('disconnected', () => {
            });

            await mongoose.connect(mongoUri, {
                maxPoolSize: 20,           // Máximo de 20 conexões simultâneas
                minPoolSize: 5,            // Mantém 5 conexões sempre abertas
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                family: 4                  // Force IPv4
            }).then(() =>
                console.log('✅ Conexão com MongoDB estabelecida (Pool: 5-20 conexões)')
            )

        } catch (erro) {
            console.error('Erro ao conectar ao banco!')
            throw erro;
        }
    }

    static async desconectar() {
        try {
            await mongoose.disconnect();
            console.log('Conexão com o banco de dados encerrada sem erros!')
        } catch (erro) {
            console.error('Erro ao desconectar do banco!')
            throw erro;
        }
    }
}

export default DbConnect;