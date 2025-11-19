import { Queue } from 'bullmq';
import { redisConfig } from '../../config/redis.js';

// Cria a fila chamada 'email-sending'
export const emailQueue = new Queue('email-sending', {
  connection: redisConfig,
  defaultJobOptions: {
    attempts: 3, // Tenta reenviar 3 vezes se falhar
    backoff: {
      type: 'exponential',
      delay: 5000, // Espera 5s, 10s, 20s entre tentativas
    },
    removeOnComplete: true, // Remove job da memória após sucesso
    removeOnFail: false, // Mantém logs de erro
  },
});