import { Worker, Job } from 'bullmq';
import { redisConfig } from '../../config/redis.js';
import EmailSenderService from '../../service/emailSenderService.js';
import EmailService from '../../service/emailService.js';

const emailSenderService = new EmailSenderService();
const emailService = new EmailService();

// Define o que o Worker vai fazer com cada job
const worker = new Worker(
  'email-sending', // Mesmo nome da fila
  async (job: Job) => {
    const { emailId, to, subject, template, data, credentials } = job.data;
    const workerId = `worker-${emailId}`;

    console.time(`⏱️  [${workerId}] Processamento total do worker`);
    console.log(`[Worker] Processando email ID: ${emailId}`);

    try {
      // 1. Tenta enviar o email (Nodemailer + MJML)
      console.time(`⏱️  [${workerId}] Compilar MJML + Enviar SMTP`);
      await emailSenderService.enviarEmail({
        to,
        subject,
        template,
        data,
        email: credentials.email,
        pass: credentials.pass
      });
      console.timeEnd(`⏱️  [${workerId}] Compilar MJML + Enviar SMTP`);

      // 2. Se deu certo, atualiza o status no Mongo
      console.time(`⏱️  [${workerId}] Atualizar status no MongoDB`);
      await emailService.atualizarStatusEmail(emailId, 'sent');
      console.timeEnd(`⏱️  [${workerId}] Atualizar status no MongoDB`);
      
      console.timeEnd(`⏱️  [${workerId}] Processamento total do worker`);
      console.log(`✅ [Worker] Email ${emailId} enviado com sucesso!`);
      
      return { success: true };

    } catch (error) {
      // 3. Se deu erro, atualiza status para failed
      const errorMessage = (error as Error).message;
      console.error(`❌ [Worker] Falha ao enviar ${emailId}:`, errorMessage);
      
      await emailService.atualizarStatusEmail(emailId, 'failed', errorMessage);
      console.timeEnd(`⏱️  [${workerId}] Processamento total do worker`);
      
      // Lança o erro para o BullMQ saber que falhou (e tentar de novo se configurado)
      throw error;
    }
  },
  { 
    connection: redisConfig,
    concurrency: 15 // Processa até 15 emails simultaneamente
  }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completado!`);
});

worker.on('failed', (job, err) => {
  console.log(`Job ${job?.id} falhou: ${err.message}`);
});

export default worker;