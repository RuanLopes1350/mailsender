import { ConnectionOptions } from 'bullmq';
import dotenv from 'dotenv';

dotenv.config();

// Configuração de conexão para o BullMQ
export const redisConfig: ConnectionOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};