import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { apiKeyMiddleware } from '../auth/apiKeyMiddleware.js';
import { requestLogger, RequestWithUser } from '../middleware/requestLogger.js';
import { sendMail } from '../mail/index.js';
import { gerarApiKey, listarApiKeys, revogarApiKey, inicializarSistemaApiKeys, removerApiKey } from '../auth/apiKey.js';
import { logEmail, updateEmailStatus, getEmailStats, getRecentEmails } from '../services/emailService.js';
import { getRequestStats, getRecentActivity } from '../services/requestService.js';

dotenv.config();

const app = express();
app.use(express.json());

// Middleware de log de requisições
app.use(requestLogger);

// Health Check
app.get('/api', (_req: Request, res: Response) =>
  res.json({ ok: true, message: 'Micro-serviço online (Vercel)' })
);

app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    ok: true,
    environment: 'vercel'
  });
});

// Rota para estatísticas do dashboard
app.get('/api/stats', async (_req: Request, res: Response) => {
  try {
    console.log(`\n📊 Obtendo estatísticas do sistema...`);
    const [emailStats, requestStats, recentEmails, recentActivity] = await Promise.all([
      getEmailStats(),
      getRequestStats(),
      getRecentEmails(5),
      getRecentActivity(10)
    ]);

    console.log(`   ✓ Estatísticas coletadas com sucesso`);
    res.json({
      emails: emailStats,
      requests: requestStats,
      recentEmails,
      recentActivity
    });
  } catch (error) {
    console.error(`   ❌ Erro ao obter estatísticas:`, error);
    res.status(500).json({ message: 'Erro ao obter estatísticas' });
  }
});

app.post('/api/keys/generate', async (req: Request, res: Response) => {
  try {
    const { name = 'semNome' } = req.body ?? {};
    console.log(`\n🔐 Requisição para gerar API Key`);
    console.log(`   Nome: ${name}`);
    
    const apiKey = await gerarApiKey(name);
    
    console.log(`   ✅ Chave gerada com sucesso`);
    res.status(201).json({
      name,
      message: 'Chave criada – salve em local seguro (não será mostrada de novo)',
      apiKey,
    });
  } catch (erro) {
    console.error(`   ❌ Erro ao gerar chave:`, erro);
    res.status(500).json({ message: 'Falha ao gerar chave', error: (erro as Error).message });
  }
});

// Chaves API
app.get('/api/keys', async (_req: Request, res: Response) => {
  try {
    console.log(`\n📋 Listando API Keys...`);
    const keys = await listarApiKeys();
    console.log(`   ✓ ${keys.length} chave(s) encontrada(s)`);
    res.json(keys);
  } catch (error) {
    console.error(`   ❌ Erro ao listar chaves:`, error);
    res.status(500).json({ message: 'Erro ao listar chaves', error: (error as Error).message });
  }
});

app.delete('/api/keys/:name', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    console.log(`\n🗑️ Requisição para revogar API Key`);
    console.log(`   Nome: ${name}`);
    
    if (!name) {
      console.log(`   ❌ Nome não fornecido`);
      return res.status(400).json({ message: 'Nome da chave não fornecido' });
    }
    
    const ok = await removerApiKey(name);
    if (ok) {
      console.log(`   ✅ Chave revogada com sucesso`);
      return res.status(204).end();
    } else {
      console.log(`   ⚠️ Chave não encontrada`);
      return res.status(404).json({ message: 'Chave não encontrada' });
    }
  } catch (error) {
    console.error(`   ❌ Erro ao revogar chave:`, error);
    return res.status(500).json({ message: 'Erro ao revogar chave', error: (error as Error).message });
  }
});

// Envio dos emails
app.post('/api/emails/send', apiKeyMiddleware, async (req: RequestWithUser, res: Response) => {
  let emailId: string | null = null;

  try {
    console.log(`\n📧 Processando envio de email...`);
    console.log(`   Para: ${req.body.to}`);
    console.log(`   Assunto: ${req.body.subject}`);
    console.log(`   Template: ${req.body.template}`);
    console.log(`   Usuário: ${req.apiKeyUser || 'N/A'}`);

    const emailData = {
      ...req.body.data,
      ano: new Date().getFullYear(),
    };

    // Log do email antes de enviar
    if (req.apiKeyUser) {
      console.log(`\n💾 Registrando email no banco de dados...`);
      emailId = await logEmail({
        to: req.body.to,
        subject: req.body.subject,
        template: req.body.template,
        data: emailData,
        apiKeyUser: req.apiKeyUser
      });
      console.log(`   ✓ Email registrado com ID: ${emailId}`);
    }

    console.log(`\n📤 Iniciando envio do email...`);
    const info = await sendMail({ ...req.body, data: emailData });

    // Atualiza status para sucesso
    if (emailId) {
      console.log(`\n✅ Atualizando status para 'sent'...`);
      await updateEmailStatus(emailId, 'sent');
      console.log(`   ✓ Status atualizado com sucesso`);
    }

    console.log(`\n🎉 Email enviado com sucesso!`);
    res.status(202).json({ message: 'E-mail enfileirado', info });
  } catch (err) {
    console.error(`\n❌ Erro ao processar email:`, err);

    // Atualiza status para erro
    if (emailId) {
      console.log(`\n⚠️ Atualizando status para 'failed'...`);
      await updateEmailStatus(emailId, 'failed', (err as Error).message);
      console.log(`   ✓ Status de erro registrado`);
    }

    res.status(500).json({ message: 'Falha ao enviar e-mail', error: (err as Error).message });
  }
});

// Inicializa o sistema de API Keys antes de processar as requisições
let isInitialized = false;

async function initializeOnce() {
  if (!isInitialized) {
    const apiKeysOk = await inicializarSistemaApiKeys();
    if (!apiKeysOk) {
      console.error('Falha ao inicializar sistema de API Keys');
      throw new Error('Falha ao inicializar sistema de API Keys');
    }
    isInitialized = true;
  }
}

// Handler principal para a Vercel
export default async function handler(req: Request, res: Response) {
  try {
    await initializeOnce();
    return app(req, res);
  } catch (error) {
    console.error('Erro ao inicializar:', error);
    return res.status(500).json({ 
      message: 'Erro ao inicializar serviço', 
      error: (error as Error).message 
    });
  }
}
