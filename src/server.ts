import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { apiKeyMiddleware } from './auth/apiKeyMiddleware.js';
import { sendMail } from './mail/index.js';
import { gerarApiKey, listarApiKeys, revogarApiKey, inicializarSistemaApiKeys } from './auth/apiKey.js';

const serverStartTime: Number = Date.now();

dotenv.config()
const app = express();
app.use(express.json());

//Swagger
// const swaggerDoc = YAML.load('./openapi.yaml');
// app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// Painel de administração
app.use('/painel', express.static(path.resolve('public')));

// Health Check
app.get('/', (_req, res) =>
  res.json({ ok: true, message: 'Micro-serviço online' })
);

app.get('/status', (_req, res) => {
  res.json({
    ok: true,
    startTime: serverStartTime
  });
});

app.post('/keys/generate', async (req, res) => {
  try {
    const { name = 'semNome' } = req.body ?? {};
    const apiKey = await gerarApiKey(name);
    res.status(201).json({
      name,
      message: 'Chave criada – salve em local seguro (não será mostrada de novo)',
      apiKey,
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ message: 'Falha ao gerar chave', error: (erro as Error).message });
  }
});

// Chaves API
app.get('/keys', async (_req, res) => {
  try {
    const keys = await listarApiKeys();
    res.json(keys);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao listar chaves', error: (error as Error).message });
  }
});

app.delete('/keys/:name', async (req, res) => {
  try {
    const ok = await revogarApiKey(req.params.name);
    if (ok) {
      return res.status(204).end();
    } else {
      return res.status(404).json({ message: 'Chave não encontrada' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao revogar chave', error: (error as Error).message });
  }
});

// Envio dos emails
app.post('/emails/send', apiKeyMiddleware, async (req, res) => {
  try {
    const emailData = {
      ...req.body.data,
      ano: new Date().getFullYear(),
    };
    const info = await sendMail({ ...req.body, data: emailData });
    res.status(202).json({ message: 'E-mail enfileirado', info });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Falha ao enviar e-mail', error: (err as Error).message });
  }
});

const PORT = process.env.PORT || 3010;

// Função para inicializar o servidor
async function inicializarServidor() {
  try {
    // Inicializa o sistema de API Keys
    const apiKeysOk = await inicializarSistemaApiKeys();
    if (!apiKeysOk) {
      console.error('Falha ao inicializar sistema de API Keys');
      process.exit(1);
    }

    // Inicia o servidor
    app.listen(PORT, () => {
      console.log(`Mail-API rodando na porta ${PORT}`);
      console.log(`Painel administrativo: http://localhost:${PORT}/painel`);
      console.log(`Health check: http://localhost:${PORT}/`);
    });
  } catch (erro) {
    console.error('Erro ao inicializar servidor:', erro);
    process.exit(1);
  }
}

// Inicializa o servidor
inicializarServidor();