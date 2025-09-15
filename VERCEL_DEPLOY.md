# Deploy no Vercel - Guia Completo

Este guia explica como fazer deploy deste microserviço de e-mail na plataforma Vercel.

## 🚀 Deploy Rápido

### 1. Preparação
1. Faça fork deste repositório
2. Conecte sua conta GitHub ao Vercel
3. Configure as variáveis de ambiente necessárias

### 2. Deploy via Vercel Dashboard
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Selecione este repositório
4. Configure as variáveis de ambiente (veja seção abaixo)
5. Clique em "Deploy"

### 3. Deploy via CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel --prod
```

## 🔧 Variáveis de Ambiente Obrigatórias

Configure estas variáveis no painel do Vercel em **Settings → Environment Variables**:

```env
# Configuração do Servidor
NODE_ENV=production

# Chave Mestra para Autenticação
MASTER_KEY=sua-chave-mestra-super-segura-aqui

# Configuração de E-mail (Gmail)
SENDER_EMAIL=seu-email@gmail.com
APP_PASSWORD=sua-app-password-gmail

# Configuração do Banco de Dados (MongoDB)
MONGO_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/sendmail

# Configuração OAuth2 (Opcional - para Gmail OAuth)
CLIENT_ID=seu-client-id-google.apps.googleusercontent.com
CLIENT_SECRET=seu-client-secret
REFRESH_TOKEN=seu-refresh-token
```

### Como obter as credenciais:

#### MongoDB Atlas (Recomendado para Vercel):
1. Acesse [MongoDB Atlas](https://cloud.mongodb.com/)
2. Crie uma conta gratuita
3. Crie um novo cluster (free tier)
4. Configure acesso via username/password
5. Adicione IP 0.0.0.0/0 à whitelist (para Vercel)
6. Obtenha a string de conexão no formato: `mongodb+srv://usuario:senha@cluster.mongodb.net/sendmail`

#### Gmail App Password:
1. Acesse [Google Account Security](https://myaccount.google.com/security)
2. Ative a verificação em 2 etapas
3. Gere uma "Senha de app" para este projeto
4. Use a senha gerada em `APP_PASSWORD`

#### OAuth2 (Opcional):
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a Gmail API
4. Configure OAuth2 e obtenha as credenciais

## 🌐 URLs após o Deploy

Após o deploy, você terá:

- **API Base**: `https://seu-projeto.vercel.app/`
- **Painel Admin**: `https://seu-projeto.vercel.app/painel`
- **Health Check**: `https://seu-projeto.vercel.app/status`

## 📁 Estrutura para Vercel

O projeto foi configurado com:

```
projeto/
├── api/
│   └── index.ts          # Handler principal do Vercel
├── src/
│   ├── app.ts           # App Express (separado do servidor)
│   ├── server.ts        # Servidor local (dev)
│   └── ...              # Outros arquivos
├── public/              # Admin panel (servido estaticamente)
├── vercel.json          # Configuração do Vercel
└── package.json         # Dependências e scripts
```

## 🔄 Configuração Automática

O `vercel.json` está configurado para:

- ✅ Compilar TypeScript automaticamente
- ✅ Servir arquivos estáticos do painel admin
- ✅ Rotear todas as APIs para o handler principal
- ✅ Configurar timeouts apropriados
- ✅ Gerenciar CORS automaticamente

## 🛠️ Scripts NPM para Vercel

```bash
# Desenvolvimento local
npm run dev

# Build para produção
npm run build

# Executar local (simulando produção)
npm start
```

## 🔍 Testando o Deploy

Após o deploy, teste os endpoints:

```bash
# Health check
curl https://seu-projeto.vercel.app/

# Gerar API Key
curl -X POST https://seu-projeto.vercel.app/keys/generate \
  -H "Content-Type: application/json" \
  -d '{"name": "teste"}'

# Testar envio de e-mail
curl -X POST https://seu-projeto.vercel.app/emails/send \
  -H "Content-Type: application/json" \
  -H "x-api-key: sua-chave-gerada" \
  -d '{
    "to": "teste@email.com",
    "subject": "Teste Vercel",
    "template": "bemvindo",
    "data": {"nome": "Teste"}
  }'
```

## 🚨 Limitações do Vercel

⚠️ **Importantes limitações a considerar:**

1. **Timeout**: Máximo 30 segundos por request (Hobby plan)
2. **Memória**: 1024MB por função (Hobby plan)
3. **Armazenamento**: Não há armazenamento persistente
4. **API Keys**: São armazenadas temporariamente (considere usar banco de dados)

## 🗄️ Recomendações para Produção

Para uso em produção, considere:

1. **Banco de dados**: Migre o armazenamento de API Keys para MongoDB/PostgreSQL
2. **Rate Limiting**: Adicione rate limiting nas rotas
3. **Monitoring**: Configure monitoramento e logs
4. **Backup**: Sistema de backup para dados críticos
5. **CDN**: Use CDN para arquivos estáticos grandes

## 🔗 Links Úteis

- [Documentação Vercel](https://vercel.com/docs)
- [Vercel Node.js Runtime](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js)
- [Configuração de Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Limites da Plataforma](https://vercel.com/docs/concepts/limits/overview)

## 🆘 Troubleshooting

### Deploy falhando?
1. Verifique se todas as variáveis de ambiente estão configuradas
2. Confirme que o build local funciona (`npm run build`)
3. Verifique os logs no dashboard do Vercel

### APIs não funcionando?
1. Teste o health check primeiro
2. Verifique se as credenciais de e-mail estão corretas
3. Confirme que a API Key foi gerada corretamente

### Admin panel não carregando?
1. Verifique se os arquivos estão na pasta `public/`
2. Confirme a configuração de rotas no `vercel.json`

---

🎉 **Parabéns!** Seu microserviço de e-mail está agora rodando no Vercel!