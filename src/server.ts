import app from './app.js';
import { inicializarSistemaApiKeys } from './auth/apiKey.js';

const PORT = process.env.PORT || 3010;

// Função para inicializar o servidor local
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

// Inicializa o servidor apenas se não estiver em ambiente serverless
if (process.env.VERCEL !== '1') {
  inicializarServidor();
}