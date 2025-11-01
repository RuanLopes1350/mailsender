# 📧 Mail Sender - Sistema de Envio de Emails

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.0+-red.svg)](https://expressjs.com/)
[![MJML](https://img.shields.io/badge/MJML-4.15+-orange.svg)](https://mjml.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)

**Microserviço profissional para envio de emails com templates personalizáveis, painel administrativo completo e autenticação por API Keys.**

[🚀 Ver Demo](https://mailsender-one.vercel.app/painel) • [📖 Tutorial](TUTORIAL.md) • [� Autenticação](AUTHENTICATION.md) • [�🐛 Reportar Bug](https://github.com/RuanLopes1350/mailsender-ts/issues) • [📄 Documentação](PROJETO.md)

</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Características](#-características)
- [Tecnologias](#️-tecnologias)
- [Instalação](#-instalação)
- [Arquitetura de Autenticação](#-arquitetura-de-autenticação)
- [Configuração](#️-configuração)
- [Como Usar](#-como-usar)
- [Templates](#-templates)
- [Painel Administrativo](#-painel-administrativo)
- [Deploy na Vercel](#-deploy-na-vercel)
- [API Endpoints](#-api-endpoints)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Segurança](#-segurança)
- [Boas Práticas de Segurança](#-boas-práticas-de-segurança)
- [Troubleshooting](#-troubleshooting)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

---

## 🎯 Sobre o Projeto

**Mail Sender** é um microserviço completo e profissional para envio de emails transacionais, desenvolvido com Node.js, TypeScript e Express. Ele foi projetado para ser facilmente integrado a qualquer aplicação, oferecendo templates flexíveis e personalizáveis em MJML.

### Por que usar?

- ✅ **Fácil Integração** - API REST simples e documentada
- ✅ **Templates Profissionais** - Emails responsivos que funcionam em todos os clientes
- ✅ **Totalmente Personalizável** - Adapte cores, textos, botões e logos ao seu sistema
- ✅ **Seguro** - Autenticação por API Keys com hash bcrypt
- ✅ **Monitoramento** - Painel administrativo com estatísticas em tempo real
- ✅ **Pronto para Produção** - Deploy fácil na Vercel ou qualquer plataforma
- ✅ **Open Source** - Código aberto e gratuito

---

## ✨ Características

### 🎯 Core
- 🚀 **API RESTful** completa para envio de emails
- 🔐 **Autenticação segura** com API Keys (bcrypt hash)
- � **Sistema de autenticação JWT** para painel administrativo
- �📧 **Templates MJML** responsivos e profissionais
- 🎨 **Altamente personalizável** - cores, textos, botões, logos
- 📊 **MongoDB** para persistência de dados
- ⚡ **Performance** otimizada para produção

### 🖥️ Painel Administrativo
- 🔒 **Login seguro** com JWT (8 horas de expiração)
- 📈 **Dashboard** com métricas em tempo real
- 🔑 **Gerenciamento de API Keys** (criar, listar, revogar, ativar/desativar)
- ✉️ **Teste de emails** diretamente pelo painel
- 📜 **Logs de atividade** recentes
- 📱 **Interface responsiva** para todos os dispositivos
- 🎯 **Auto-refresh** de estatísticas

### � Templates Flexíveis
- **Bem-vindo** - Para onboarding de usuários
- **Genérico** - Para notificações, confirmações, alertas
- **Componentes opcionais** - botões, listas, tabelas, destaques
- **Suporte a HTML** em conteúdos
- **Cores customizáveis** por email
- **Logo e branding** personalizados

### 🚀 Deploy
- ✅ **Servidor local** com hot reload
- ✅ **Vercel** pronto para serverless
- ✅ **Variáveis de ambiente** configuráveis
- ✅ **TypeScript** compilado para produção

---

## 🛠️ Tecnologias

<table>
<tr>
<td valign="top" width="33%">

### Backend
- Node.js 18+
- TypeScript 5.9
- Express 5.1
- MongoDB 6.19
- Nodemailer 7.0
- MJML 4.15
- Handlebars 4.7
- bcrypt 6.0
- jsonwebtoken 9.0
- cors 2.8

</td>
<td valign="top" width="33%">

### Frontend
- HTML5
- CSS3 (Grid/Flexbox)
- JavaScript ES6+
- Design Responsivo
- Fetch API
- Animations/Transitions

</td>
<td valign="top" width="33%">

### DevOps
- tsx (dev runtime)
- TypeScript compiler
- Vercel (serverless)
- dotenv
- Git

</td>
</tr>
</table>

---

## � Instalação

### Pré-requisitos

- **Node.js** 18 ou superior
- **MongoDB** (local ou Atlas)
- **Conta Gmail** com App Password configurada
- **Git**

### 1️⃣ Clone o Repositório

```bash
git clone https://github.com/RuanLopes1350/mailsender-ts.git
cd mailsender-ts
```

### 2️⃣ Instale as Dependências

```bash
npm install
```

### 3️⃣ Configure as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Servidor
PORT=5015

# MongoDB
DB_URL=mongodb://localhost:27017/mailsender
# Ou MongoDB Atlas:
# DB_URL=mongodb+srv://usuario:senha@cluster.mongodb.net/mailsender

# Email (Gmail)
SENDER_EMAIL=seu-email@gmail.com
SENDER_PASSWORD=sua-senha-ou-app-password

# Segurança
MASTER_KEY=sua-chave-mestra-secreta
JWT_SECRET=sua-chave-jwt-super-secreta-aqui

# Admin Inicial (credenciais do painel administrativo)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=SuaSenhaSegura123
```

⚠️ **IMPORTANTE**: 
- Altere `ADMIN_PASSWORD` para uma senha forte em produção
- Nunca commite o arquivo `.env` no Git
- Use senhas diferentes para `MASTER_KEY` e `JWT_SECRET`

### 4️⃣ Configure o Gmail App Password

1. Acesse [Google Account Security App Passwords](http://myaccount.google.com/apppasswords)
2. Ative a **Verificação em 2 etapas**
3. Vá em **Senhas de app**
4. Selecione "Outro" e dê um nome (ex: "Mail Sender")
5. Copie a senha gerada (16 caracteres)
6. Cole no `.env` como `SENDER_PASSWORD`

### 5️⃣ Execute o Projeto

**Desenvolvimento (com hot reload):**
```bash
npm run dev
```

**Produção:**
```bash
npm run build
npm start
```

### 6️⃣ Acesse o Painel Administrativo

```
http://localhost:5015/painel
```

**Credenciais padrão:**
- **Usuário**: `admin` (ou o valor de `ADMIN_USERNAME`)
- **Senha**: `admin` (ou o valor de `ADMIN_PASSWORD`)

⚠️ **IMPORTANTE**: Altere a senha padrão em produção!

---

## 🔐 Arquitetura de Autenticação

O Mail Sender implementa **dois sistemas de autenticação independentes**:

### 1. JWT (JSON Web Token) - Painel Administrativo

**Usado para:** Acesso ao painel administrativo e gerenciamento do sistema

**Como funciona:**
1. Admin faz login com username/password
2. Servidor valida credenciais e gera um JWT
3. JWT é retornado ao cliente com validade de 8 horas
4. Cliente envia o JWT no header `Authorization: Bearer <token>`
5. Middleware `authMiddleware` valida o token em cada requisição

**Rotas protegidas por JWT:**
- `GET /api/stats` - Estatísticas
- `GET /api/keys` - Listar API Keys
- `DELETE /api/keys/:name` - Revogar chave
- `PATCH /api/keys/:name/inativar` - Desativar chave
- `PATCH /api/keys/:name/reativar` - Reativar chave
- `GET /api/emails/recentes` - Listar emails

**Payload do JWT:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "username": "admin",
  "iat": 1730419200,
  "exp": 1730448000
}
```

### 2. API Key - Desenvolvedores

**Usado para:** Integração de aplicações externas para enviar emails

**Como funciona:**
1. Admin gera uma API Key com um nome identificador
2. Sistema gera uma chave única e a retorna (hash é armazenado)
3. Desenvolvedor usa a chave no header `x-api-key: <chave>`
4. Middleware `apiKeyMiddleware` valida a chave e identifica o usuário
5. Chave permanece válida até ser revogada ou desativada

**Rotas protegidas por API Key:**
- `POST /api/emails/send` - Enviar email
- `GET /api/emails/meus` - Listar meus emails

**Formato da API Key:**
```
mail_1234567890abcdef_ghijklmnopqrstuv
```

### Por que dois sistemas?

- **JWT**: Sessões temporárias para humanos (admin)
- **API Key**: Autenticação permanente para máquinas (aplicações)

Isso garante:
- ✅ Segurança granular por tipo de acesso
- ✅ Revogação independente (token expira, key persiste)
- ✅ Rastreabilidade (quem fez o quê)
- ✅ Facilidade de integração

---

## ⚙️ Configuração

### MongoDB

**Opção 1: Local**
```bash
# Instale o MongoDB
# Windows: https://www.mongodb.com/try/download/community
# Linux: sudo apt install mongodb
# Mac: brew install mongodb-community

# Inicie o serviço
mongod

# Use no .env:
DB_URL=mongodb://localhost:27017/mailsender
```

**Opção 2: MongoDB Atlas (Cloud - Grátis)**
1. Acesse [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crie uma conta e um cluster gratuito
3. Configure o acesso (IP e usuário)
4. Copie a connection string
5. Use no `.env`:
```env
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/mailsender
```

### Outros Provedores de Email

Por padrão, o sistema usa Gmail. Para usar outros provedores, edite `src/config/mail.ts`:

**Outlook/Hotmail:**
```typescript
host: 'smtp-mail.outlook.com',
port: 587,
```

**SendGrid:**
```typescript
host: 'smtp.sendgrid.net',
port: 587,
auth: {
  user: 'apikey',
  pass: process.env.SENDGRID_API_KEY
}
```

---

## 🚀 Como Usar

### Passo 1: Gerar uma API Key

**Via Painel:**
1. Acesse `http://localhost:5015/painel`
2. Vá na aba "🔑 API Keys"
3. Digite um nome (ex: "producao")
4. Clique em "Gerar Chave"
5. **Copie e guarde a chave** (não será mostrada novamente)

**Via API:**
```bash
curl -X POST http://localhost:5015/keys/generate \
  -H "Content-Type: application/json" \
  -d '{"name": "meu-app"}'
```

### Passo 2: Enviar um Email

```bash
curl -X POST http://localhost:5015/api/emails/send \
  -H "Content-Type: application/json" \
  -H "x-api-key: SUA_API_KEY" \
  -d '{
    "to": "destinatario@exemplo.com",
    "subject": "Bem-vindo!",
    "template": "bemvindo",
    "data": {
      "nomeSistema": "Meu Sistema",
      "nome": "João Silva",
      "mostrarBotao": true,
      "textoBotao": "Acessar",
      "urlBotao": "https://meuapp.com"
    }
  }'
```

### Passo 3: Integrar no seu Código

**JavaScript/Node.js:**
```javascript
const response = await fetch('http://localhost:5015/api/emails/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'SUA_API_KEY'
  },
  body: JSON.stringify({
    to: 'usuario@exemplo.com',
    subject: 'Bem-vindo!',
    template: 'bemvindo',
    data: {
      nomeSistema: 'Meu App',
      nome: 'Maria',
      mostrarBotao: true,
      textoBotao: 'Começar',
      urlBotao: 'https://app.com'
    }
  })
});

const result = await response.json();
console.log(result);
```

**Python:**
```python
import requests

response = requests.post('http://localhost:5015/api/emails/send',
  headers={
    'Content-Type': 'application/json',
    'x-api-key': 'SUA_API_KEY'
  },
  json={
    'to': 'usuario@exemplo.com',
    'subject': 'Bem-vindo!',
    'template': 'bemvindo',
    'data': {
      'nomeSistema': 'Meu App',
      'nome': 'João'
    }
  }
)

print(response.json())
```

📚 **[Ver Tutorial Completo](TUTORIAL.md)** com mais exemplos e todos os campos disponíveis.

---

## 📧 Templates

O sistema oferece 2 templates profissionais e totalmente personalizáveis:

### 🎉 Template Bem-vindo

Email de boas-vindas para onboarding de usuários.

**Campos principais:**
- `nomeSistema` - Nome do seu sistema
- `nome` - Nome do usuário
- `mensagem` - Mensagem customizada
- `mostrarBotao` - Exibir botão (true/false)
- `textoBotao` / `urlBotao` - Configuração do botão
- `corPrimaria` / `corBotao` - Cores personalizadas
- `logoUrl` - Logo da empresa

**Exemplo:**
```json
{
  "to": "usuario@exemplo.com",
  "subject": "Bem-vindo à Vitrine!",
  "template": "bemvindo",
  "data": {
    "nomeSistema": "Vitrine",
    "nome": "João Silva",
    "mensagem": "Estamos felizes em tê-lo conosco!",
    "mostrarBotao": true,
    "textoBotao": "Acessar Plataforma",
    "urlBotao": "https://vitrine.com/login"
  }
}
```

### 📨 Template Genérico

Template versátil para notificações, confirmações, alertas, etc.

**Componentes disponíveis:**
- Título e subtítulo
- Mensagem com HTML
- Caixa de destaque
- Lista de itens (bullets)
- Tabela de dados
- Até 2 botões
- Notas e avisos

**Exemplo - Confirmação de Pedido:**
```json
{
  "to": "cliente@exemplo.com",
  "subject": "Pedido Confirmado",
  "template": "generico",
  "data": {
    "titulo": "Pedido Confirmado! 🎉",
    "nome": "Maria",
    "mensagem": "Seu pedido foi confirmado com sucesso.",
    "dados": [
      { "label": "Pedido", "valor": "#12345" },
      { "label": "Total", "valor": "R$ 299,90" }
    ],
    "mostrarBotao": true,
    "textoBotao": "Rastrear Pedido",
    "urlBotao": "https://loja.com/rastreio/12345"
  }
}
```

**Todos os campos e exemplos completos no [TUTORIAL.md](TUTORIAL.md)**

---

## 🖥️ Painel Administrativo

Acesse `http://localhost:5015/painel` para gerenciar o sistema.

**Login Obrigatório:**
- O painel agora requer autenticação via JWT
- Após o login, o token é válido por 8 horas
- Use as credenciais configuradas nas variáveis de ambiente

### Funcionalidades

#### 📊 Dashboard
- Estatísticas em tempo real
- Total de emails enviados (sucesso/falha)
- Requisições à API
- Emails recentes
- Auto-refresh a cada 30 segundos

#### 🔑 API Keys
- **Gerar** novas chaves com nomes personalizados
- **Listar** todas as chaves ativas
- **Ativar/Desativar** chaves temporariamente
- **Revogar** chaves permanentemente com confirmação
- **Copiar** chaves para clipboard
- Visualizar prefixo, status e data de criação

#### ✉️ Testar Emails
- Enviar emails de teste diretamente
- Escolher template (bemvindo/generico)
- Editor JSON com exemplos
- **Info box dinâmica** mostrando campos disponíveis
- Feedback imediato de sucesso/erro

#### 📜 Logs de Atividade
- Últimas 10 requisições
- Método, endpoint e status
- Usuário que fez a requisição
- Códigos de status coloridos

### Interface

- ✨ **Design moderno** com gradiente e animações
- 📱 **Totalmente responsivo** (mobile, tablet, desktop)
- 🎨 **Tema claro** otimizado para leitura
- 🔄 **Atualização automática** de dados
- 🎯 **Navegação por tabs** intuitiva

---

## 🚀 Deploy na Vercel

O projeto está pronto para deploy serverless na Vercel.

### 1️⃣ Preparação

O arquivo `vercel.json` já está configurado:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/api/api.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    { "src": "/painel/(.*)", "dest": "/public/$1" },
    { "src": "/(.*)", "dest": "/src/api/api.ts" }
  ]
}
```

### 2️⃣ Deploy

**Via CLI:**
```bash
npm install -g vercel
vercel
```

**Via GitHub:**
1. Conecte seu repositório no [Vercel Dashboard](https://vercel.com)
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### 3️⃣ Variáveis de Ambiente

Configure no painel da Vercel:
```
DB_URL=mongodb+srv://usuario:senha@cluster.mongodb.net/mailsender
SENDER_EMAIL=seu-email@gmail.com
SENDER_PASSWORD=app-password
MASTER_KEY=sua-chave-mestra-secreta
JWT_SECRET=sua-chave-jwt-super-secreta
ADMIN_USERNAME=admin
ADMIN_PASSWORD=SuaSenhaSeguraDeProducao123
NODE_ENV=production
```

⚠️ **IMPORTANTE**: Use senhas fortes diferentes em produção!

### 4️⃣ Diferenças de URL

**Local:**
```
http://localhost:5015/api/emails/send
```

**Vercel:**
```
https://seu-projeto.vercel.app/api/emails/send
```

⚠️ **Nota:** Na Vercel, todas as rotas têm prefixo `/api/`

---

## 📡 API Endpoints

### Tipos de Autenticação

O sistema usa **dois tipos de autenticação**:

1. **JWT Token** - Para o painel administrativo
   ```
   Authorization: Bearer SEU_JWT_TOKEN
   ```

2. **API Key** - Para desenvolvedores enviarem emails
   ```
   x-api-key: SUA_API_KEY
   ```

### Rotas Disponíveis

| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| `GET` | `/api` | ❌ | Health check |
| `GET` | `/api/status` | ❌ | Status do servidor |
| `POST` | `/api/login` | ❌ | Login admin (retorna JWT) |
| `POST` | `/api/keys/generate` | ❌ | Gerar API Key |
| `GET` | `/api/stats` | 🔑 JWT | Estatísticas gerais |
| `GET` | `/api/keys` | 🔑 JWT | Listar todas as chaves |
| `DELETE` | `/api/keys/:name` | 🔑 JWT | Revogar chave |
| `PATCH` | `/api/keys/:name/inativar` | 🔑 JWT | Desativar chave |
| `PATCH` | `/api/keys/:name/reativar` | 🔑 JWT | Reativar chave |
| `GET` | `/api/emails/recentes` | 🔑 JWT | Listar emails recentes |
| `POST` | `/api/emails/send` | 🔐 API Key | Enviar email |
| `GET` | `/api/emails/meus` | 🔐 API Key | Listar meus emails |

### Exemplos de Requisição

**Health Check:**
```bash
curl http://localhost:5015/api
```

**Login (obter JWT):**
```bash
curl -X POST http://localhost:5015/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin"
  }'
```

**Resposta do Login:**
```json
{
  "success": true,
  "message": "Login bem sucedido!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "admin",
    "email": "admin"
  }
}
```

**Gerar API Key:**
```bash
curl -X POST http://localhost:5015/api/keys/generate \
  -H "Content-Type: application/json" \
  -d '{"name": "producao"}'
```

**Enviar Email (requer API Key):**
```bash
curl -X POST http://localhost:5015/api/emails/send \
  -H "Content-Type: application/json" \
  -H "x-api-key: SUA_API_KEY" \
  -d '{
    "to": "usuario@exemplo.com",
    "subject": "Teste",
    "template": "bemvindo",
    "data": {
      "nomeSistema": "Meu App",
      "nome": "João"
    }
  }'
```

**Listar API Keys (requer JWT):**
```bash
curl http://localhost:5015/api/keys \
  -H "Authorization: Bearer SEU_JWT_TOKEN"
```

**Desativar API Key (requer JWT):**
```bash
curl -X PATCH http://localhost:5015/api/keys/producao/inativar \
  -H "Authorization: Bearer SEU_JWT_TOKEN"
```

**Revogar API Key (requer JWT):**
```bash
curl -X DELETE http://localhost:5015/api/keys/producao \
  -H "Authorization: Bearer SEU_JWT_TOKEN"
```

### Respostas

**Sucesso (202):**
```json
{
  "message": "E-mail enfileirado",
  "info": {
    "accepted": ["usuario@exemplo.com"],
    "messageId": "<abc123@servidor.com>"
  }
}
```

**Erro - API Key Inválida (401):**
```json
{
  "message": "API key inválida ou não fornecida"
}
```

**Erro - Template Não Encontrado (500):**
```json
{
  "message": "Falha ao enviar e-mail",
  "error": "Template não encontrado"
}
```

---

## 📁 Estrutura do Projeto

```
mailsender-ts/
├── src/
│   ├── api/
│   │   └── api.ts              # API serverless (Vercel)
│   ├── auth/
│   │   ├── apiKey.ts           # Gerenciamento de API Keys
│   │   ├── apiKeyMiddleware.ts # Middleware de autenticação
│   │   └── masterKey.ts        # Validação de chave mestra
│   ├── config/
│   │   ├── database.ts         # Conexão MongoDB
│   │   └── mail.ts             # Configuração Nodemailer
│   ├── mail/
│   │   ├── index.ts            # Serviço de envio
│   │   └── templates/
│   │       ├── bemvindo.mjml   # Template de boas-vindas
│   │       └── generico.mjml   # Template genérico
│   ├── middleware/
│   │   └── requestLogger.ts    # Log de requisições
│   ├── models/
│   │   ├── apiKey.ts           # Model de API Keys
│   │   ├── email.ts            # Model de emails
│   │   └── request.ts          # Model de requisições
│   ├── services/
│   │   ├── emailService.ts     # Serviço de emails
│   │   └── requestService.ts   # Serviço de requisições
│   └── server.ts               # Servidor Express (local)
├── public/
│   ├── index.html              # Painel administrativo
│   ├── styles.css              # Estilos do painel
│   └── script.js               # Lógica do painel
├── .env                        # Variáveis de ambiente
├── .vercelignore               # Arquivos ignorados no deploy
├── vercel.json                 # Configuração Vercel
├── package.json                # Dependências
├── tsconfig.json               # Configuração TypeScript
├── TUTORIAL.md                 # Tutorial completo de uso
├── README.md                   # Este arquivo
├── docker-compose.yml          # Script YAML para docker
└── dockerfile                  # Instruções para o docker
```

---

## 🔧 Scripts NPM

```bash
npm run dev      # Servidor local com hot reload
npm run watch    # Servidor com watch mode
npm run build    # Compilar TypeScript
npm start        # Executar versão compilada
npm run clean    # Limpar pasta dist
```

---

## 🎨 Personalização de Templates

### Criar Novo Template

1. **Crie o arquivo MJML:**
```bash
src/mail/templates/meutemplate.mjml
```

2. **Use Handlebars para variáveis:**
```mjml
<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text font-size="20px">
          Olá {{nome}}!
        </mj-text>
        <mj-text>
          {{{mensagem}}}
        </mj-text>
        {{#if mostrarBotao}}
        <mj-button href="{{urlBotao}}">
          {{textoBotao}}
        </mj-button>
        {{/if}}
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
```

3. **Use o template:**
```json
{
  "template": "meutemplate",
  "data": {
    "nome": "João",
    "mensagem": "Conteúdo aqui",
    "mostrarBotao": true,
    "textoBotao": "Clicar Aqui",
    "urlBotao": "https://exemplo.com"
  }
}
```

### Recursos Handlebars Disponíveis

- **Variáveis**: `{{nome}}`, `{{email}}`
- **HTML**: `{{{conteudo}}}` (3 chaves = HTML não escapado)
- **Condicionais**: `{{#if condicao}}...{{/if}}`
- **Loops**: `{{#each itens}}{{this}}{{/each}}`
- **Else**: `{{#if}}...{{else}}...{{/if}}`

---

## 🔒 Segurança

### Medidas Implementadas

- ✅ **JWT Authentication** - Tokens com expiração de 8 horas
- ✅ **Bcrypt** - Hash de senhas e API Keys com 15 salt rounds
- ✅ **MongoDB** - Armazenamento seguro de dados
- ✅ **Variáveis de Ambiente** - Credenciais não commitadas
- ✅ **Validação** - Entrada sanitizada em todas as rotas
- ✅ **Autenticação Dupla** - JWT para admin, API Keys para devs
- ✅ **Logs** - Rastreabilidade de todas as ações
- ✅ **CORS** - Configurável por ambiente

### Recomendações para Produção

- 🔒 **Use HTTPS** em produção (obrigatório para JWT)
- � **Altere as senhas padrão** imediatamente
- 🎲 **Gere JWT_SECRET forte** (mínimo 32 caracteres aleatórios)
- ⏱️ **Configure expiração de tokens** adequadamente (padrão: 8h)
- �🚦 **Implemente rate limiting** para prevenir ataques
- 📊 **Configure monitoramento** (Sentry, DataDog)
- 🔄 **Rotacione API Keys** periodicamente
- 🛡️ **Use WAF** (Web Application Firewall)
- 📧 **Configure SPF, DKIM e DMARC** no domínio
- 🔐 **Nunca exponha tokens** em logs ou URLs
- 💾 **Armazene tokens** em localStorage/cookies HTTP-only

---

## 📊 Monitoramento

### Métricas no Dashboard

- **Emails**: Total, enviados, falhados
- **Requisições**: Total de chamadas à API
- **API Keys**: Quantidade de chaves ativas
- **Atividade**: Últimas requisições com detalhes

### Logs

O sistema registra automaticamente:
- Todas as requisições (método, endpoint, status)
- Envios de email (sucesso/falha)
- Uso de API Keys
- Erros e exceções

Acesse os logs em tempo real na aba "📜 Logs Recentes" do painel.

---

## � Troubleshooting

### Email não está sendo enviado

**1. Verifique as credenciais:**
```bash
# Teste a conexão SMTP
node -e "require('./dist/config/mail.js').getTransport().then(t => t.verify().then(console.log))"
```

**2. Confira o App Password do Gmail:**
- Deve ter 16 caracteres
- Sem espaços
- Verificação em 2 etapas ativada

**3. Verifique os logs:**
```bash
npm run dev
# Observe o console para erros
```

### API Key inválida

**1. Verifique se a chave está correta:**
```bash
curl http://localhost:5015/keys
# Confirme que a chave existe
```

**2. Teste com nova chave:**
```bash
curl -X POST http://localhost:5015/keys/generate \
  -H "Content-Type: application/json" \
  -d '{"name": "teste"}'
```

### MongoDB não conecta

**1. Verifique a URL:**
```env
# Local
MONGODB_URI=mongodb://localhost:27017/mailsender

# Atlas
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/mailsender
```

**2. Teste a conexão:**
```bash
mongosh "mongodb://localhost:27017/mailsender"
```

### Erro no deploy da Vercel

**1. Verifique as variáveis de ambiente**
**2. Confira os logs no painel Vercel**
**3. Teste localmente primeiro:**
```bash
npm run build
npm start
```

### Não consigo fazer login no painel

**1. Verifique as credenciais:**
```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin
```

**2. Verifique se JWT_SECRET está configurado:**
```env
JWT_SECRET=uma-chave-secreta-longa
```

**3. Limpe o localStorage do navegador:**
- Abra DevTools (F12)
- Vá em Application > Local Storage
- Limpe todos os dados
- Tente fazer login novamente

**4. Verifique os logs do servidor:**
```bash
npm run dev
# Observe erros relacionados a JWT ou admin
```

### Token JWT expirado

- O token expira após **8 horas**
- Faça login novamente no painel
- O sistema vai gerar um novo token automaticamente

### API Key não funciona

**1. Verifique se a chave está ativa:**
```bash
curl http://localhost:5015/api/keys \
  -H "Authorization: Bearer SEU_JWT_TOKEN"
```

**2. Verifique o header:**
```
x-api-key: SUA_CHAVE_COMPLETA_AQUI
```

**3. Reative a chave se estiver desativada**

---

## 💡 Casos de Uso

### E-commerce
- Confirmação de pedido
- Notificação de envio
- Recuperação de carrinho
- Avaliação de produto

### SaaS
- Boas-vindas
- Confirmação de email
- Reset de senha
- Notificações de sistema
- Relatórios periódicos

### Educacional
- Matrícula confirmada
- Lembretes de aula
- Certificados
- Comunicados

### Newsletter
- Boletins informativos
- Atualizações de produto
- Convites para eventos

---

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. **Fork** o projeto
2. **Crie uma branch** para sua feature
   ```bash
   git checkout -b feature/MinhaFeature
   ```
3. **Commit** suas mudanças
   ```bash
   git commit -m 'Adiciona MinhaFeature'
   ```
4. **Push** para a branch
   ```bash
   git push origin feature/MinhaFeature
   ```
5. **Abra um Pull Request**

### Diretrizes

- Use TypeScript
- Siga os padrões de código existentes
- Adicione testes se possível
- Documente mudanças significativas
- Atualize o README se necessário

---

## 📄 Licença

Este projeto está sob a licença **ISC**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

<table>
<tr>
<td align="center">
<a href="https://github.com/RuanLopes1350">
<img src="https://github.com/RuanLopes1350.png" width="100px;" alt="Ruan Lopes"/>
<br />
<sub><b>Ruan Lopes</b></sub>
</a>
<br />
<a href="https://www.linkedin.com/in/ruan-lopes-1350s" title="LinkedIn">💼</a>
<a href="mailto:contatoruanlopes1350@gmail.com" title="Email">📧</a>
</td>
</tr>
</table>

---

## 🌟 Mostre seu Apoio

Se este projeto foi útil para você, considere:

- ⭐ **Dar uma estrela** no GitHub
- 🐛 **Reportar bugs** ou sugerir features
- 📢 **Compartilhar** com outros desenvolvedores
- 💬 **Contribuir** com código ou documentação

---



<div align="center">

**Desenvolvido por [Ruan Lopes](https://github.com/RuanLopes1350)**

⭐ **[mailsender-ts](https://github.com/RuanLopes1350/mailsender-ts)** ⭐

</div>

