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

    console.log(`[Worker] Processando email ID: ${emailId}`);

    try {
      // 1. Tenta enviar o email (Nodemailer + MJML)
      // Nota: Passamos credentials.email e credentials.pass
      await emailSenderService.enviarEmail({
        to,
        subject,
        template,
        data,
        email: credentials.email,
        pass: credentials.pass
      });

      // 2. Se deu certo, atualiza o status no Mongo
      await emailService.atualizarStatusEmail(emailId, 'sent');
      console.log(`[Worker] Email ${emailId} enviado com sucesso!`);
      
      return { success: true };

    } catch (error) {
      // 3. Se deu erro, atualiza status para failed
      const errorMessage = (error as Error).message;
      console.error(`[Worker] Falha ao enviar ${emailId}:`, errorMessage);
      
      await emailService.atualizarStatusEmail(emailId, 'failed', errorMessage);
      
      // Lança o erro para o BullMQ saber que falhou (e tentar de novo se configurado)
      throw error;
    }
  },
  { 
    connection: redisConfig,
    concurrency: 5 // Processa até 5 emails simultaneamente
  }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completado!`);
});

worker.on('failed', (job, err) => {
  console.log(`Job ${job?.id} falhou: ${err.message}`);
});

export default worker;