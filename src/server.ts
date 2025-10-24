import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { apiKeyMiddleware } from './auth/apiKeyMiddleware.js';
import { requestLogger, RequestWithUser } from './middleware/requestLogger.js';
import { sendMail } from './mail/index.js';
import { gerarApiKey, listarApiKeys, revogarApiKey, inicializarSistemaApiKeys, removerApiKey } from './auth/apiKey.js';
import { logEmail, updateEmailStatus, getEmailStats, getRecentEmails } from './services/emailService.js';
import { getRequestStats, getRecentActivity } from './services/requestService.js';

const serverStartTime: Number = Date.now();

dotenv.config()
const app = express();
app.use(express.json());

// Middleware de log de requisições
app.use(requestLogger);

//Swagger
// const swaggerDoc = YAML.load('./openapi.yaml');
// app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// Painel de administração
app.use('/painel', express.static(path.resolve('public')));

// Servir os assets (CSS/JS) pela raiz localmente
app.use(express.static(path.resolve('public'))); 

// Health Check
// Rotas com prefixo /api (compatibilidade com Vercel)
app.get('/api', (_req, res) =>
  res.json({ ok: true, message: 'Micro-serviço online' })
);

app.get('/api/status', (_req, res) => {
  res.json({
    ok: true,
    startTime: serverStartTime
  });
});

app.get('/api/stats', async (_req, res) => {
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

app.post('/api/keys/generate', async (req, res) => {
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

app.get('/api/keys', async (_req, res) => {
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

app.delete('/api/keys/:name', async (req, res) => {
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
    console.error(error);
    return res.status(500).json({ message: 'Erro ao revogar chave', error: (error as Error).message });
  }
});

app.post('/api/emails/send', apiKeyMiddleware, async (req: RequestWithUser, res) => {
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

    if (emailId) {
      console.log(`\n✅ Atualizando status para 'sent'...`);
      await updateEmailStatus(emailId, 'sent');
      console.log(`   ✓ Status atualizado com sucesso`);
    }

    console.log(`\n🎉 Email enviado com sucesso!`);
    res.status(202).json({ message: 'E-mail enfileirado', info });
  } catch (err) {
    console.error(`\n❌ Erro ao processar email:`, err);

    if (emailId) {
      console.log(`\n⚠️ Atualizando status para 'failed'...`);
      await updateEmailStatus(emailId, 'failed', (err as Error).message);
      console.log(`   ✓ Status de erro registrado`);
    }

    res.status(500).json({ message: 'Falha ao enviar e-mail', error: (err as Error).message });
  }
});

const PORT = process.env.PORT || 3010;

// Função para inicializar o servidor
async function inicializarServidor() {
  try {
    console.log('\n🚀 Inicializando servidor Mail-API...\n');
    
    // Inicializa o sistema de API Keys
    console.log('⚙️ Inicializando sistema de API Keys...');
    const apiKeysOk = await inicializarSistemaApiKeys();
    if (!apiKeysOk) {
      console.error('❌ Falha ao inicializar sistema de API Keys');
      process.exit(1);
    }
    console.log('✅ Sistema de API Keys inicializado\n');

    // Inicia o servidor
    app.listen(PORT, () => {
      console.log('═══════════════════════════════════════════════════');
      console.log(`✨ Mail-API rodando na porta ${PORT}`);
      console.log('═══════════════════════════════════════════════════');
      console.log(`📊 Painel administrativo: http://localhost:${PORT}/painel`);
      console.log(`💚 Health check: http://localhost:${PORT}/`);
      console.log(`📧 Endpoint de envio: POST http://localhost:${PORT}/api/emails/send`);
      console.log('═══════════════════════════════════════════════════\n');
      console.log('🔍 Aguardando requisições...\n');
    });
  } catch (erro) {
    console.error('❌ Erro ao inicializar servidor:', erro);
    process.exit(1);
  }
}

// Inicializa o servidor
inicializarServidor();