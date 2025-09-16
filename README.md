# 📧 Mail Service - Microserviço de E-mail

[Aplicação Online](https://mailsenderts.onrender.com/painel/)

Um microserviço profissional para envio de e-mails com templates MJML, desenvolvido com **Node.js**, **TypeScript** e **Express**. Inclui painel administrativo completo e sistema de autenticação por API Keys.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.0+-red.svg)](https://expressjs.com/)
[![MJML](https://img.shields.io/badge/MJML-4.15+-orange.svg)](https://mjml.io/)

## ✨ Características

- 🚀 **API RESTful** para envio de e-mails
- 🔐 **Autenticação** por API Keys com hash bcrypt
- 📧 **Templates MJML** responsivos e profissionais
- 🎨 **Painel administrativo** moderno e intuitivo
- 📊 **Dashboard** com métricas e estatísticas
- 🔑 **Gerenciamento de API Keys** completo
- 📝 **Sistema de logs** em tempo real
- 📚 **Documentação** integrada da API
- 📱 **Design responsivo** para todos os dispositivos
- ⚡ **TypeScript** para desenvolvimento mais seguro

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **TypeScript** - Tipagem estática
- **Express** - Framework web
- **Nodemailer** - Envio de e-mails
- **MJML** - Templates de e-mail responsivos
- **Handlebars** - Engine de templates
- **bcrypt** - Hash de senhas/tokens
- **dotenv** - Gerenciamento de variáveis ambiente

### Frontend
- **HTML5** - Estrutura
- **CSS3** - Estilização moderna
- **JavaScript ES6+** - Funcionalidades interativas
- **Font Awesome** - Ícones
- **Design Responsivo** - Mobile-first

### Ferramentas de Desenvolvimento
- **tsx** - Execução TypeScript
- **nodemon** - Hot reload
- **eslint** - Linting
- **prettier** - Formatação de código

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta Gmail com App Password configurada

### 1. Clone o repositório
```bash
git clone https://github.com/RuanLopes1350/mailsender.git
cd mailsender
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env`:
```env
PORT=5015
NODE_ENV=development
MASTER_KEY=sua-chave-mestra-aqui
SENDER_EMAIL=seu-email@gmail.com
APP_PASSWORD=sua-app-password-gmail
```

### 4. Configure o Gmail App Password
1. Acesse [Google Account Security](https://myaccount.google.com/security)
2. Ative a verificação em 2 etapas
3. Gere uma "Senha de app" para este projeto
4. Use a senha gerada no arquivo `.env`

### 5. Execute o projeto

#### Desenvolvimento
```bash
npm run dev        # Execução com hot reload
npm run watch      # Execução com watch mode
```

#### Produção
```bash
npm run build      # Compilar TypeScript
npm start          # Executar versão compilada
```

## 📖 Uso da API

### Autenticação
Todas as rotas (exceto health check e geração de keys) requerem autenticação via header:
```bash
x-api-key: sua-chave-api-aqui
```

### Endpoints

#### 🔍 Health Check
```http
GET /
```

#### 🔑 Gerar API Key
```http
POST /keys/generate
Content-Type: application/json

{
  "name": "nome-da-chave"
}
```

#### 📋 Listar API Keys
```http
GET /keys
```

#### 🗑️ Revogar API Key
```http
DELETE /keys/:name
```

#### 📧 Enviar E-mail
```http
POST /emails/send
Content-Type: application/json
x-api-key: sua-chave-api

{
  "to": "destinatario@email.com",
  "subject": "Assunto do e-mail",
  "template": "bemvindo",
  "data": {
    "nome": "João Silva",
    "empresa": "Empresa XYZ"
  }
}
```

### Exemplo com cURL
```bash
# Gerar API Key
curl -X POST http://localhost:5015/keys/generate \
  -H "Content-Type: application/json" \
  -d '{"name": "minha-aplicacao"}'

# Enviar E-mail
curl -X POST http://localhost:5015/emails/send \
  -H "Content-Type: application/json" \
  -H "x-api-key: sua-chave-aqui" \
  -d '{
    "to": "teste@email.com",
    "subject": "Bem-vindo!",
    "template": "bemvindo",
    "data": {"nome": "Usuário Teste"}
  }'
```

## 🎨 Painel Administrativo

Acesse `http://localhost:5015/painel` para usar o painel administrativo:

### Funcionalidades
- 📊 **Dashboard** - Métricas e status do sistema
- 📧 **Envio de E-mails** - Interface para teste de envios
- 🔑 **API Keys** - Gerenciamento completo de chaves
- 📝 **Logs** - Visualização de logs do sistema
- 📚 **Documentação** - Guia completo da API

## 📁 Estrutura do Projeto

```
sendmail/
├── src/
│   ├── auth/
│   │   ├── apiKey.ts           # Funções de API Keys
│   │   ├── apiKeys.json        # Armazenamento de chaves
│   │   ├── apiKeyMiddleware.ts # Middleware de autenticação
│   │   └── masterKey.ts        # Chave mestra
│   ├── config/
│   │   └── mail.ts             # Configuração de e-mail
│   ├── mail/
│   │   ├── index.ts            # Serviço de envio
│   │   └── templates/          # Templates MJML
│   │       ├── bemvindo.mjml
│   │       └── generico.mjml
│   └── server.ts               # Servidor principal
├── public/
│   └── index.html              # Painel administrativo
├── dist/                       # Código compilado
├── .env                        # Variáveis de ambiente
├── package.json                # Dependências
├── tsconfig.json              # Configuração TypeScript
└── README.md                   # Este arquivo
```

## 🔧 Scripts Disponíveis

```bash
npm run dev      # Desenvolvimento com tsx
npm run watch    # Desenvolvimento com auto-reload
npm run build    # Compilar TypeScript
npm start        # Executar versão compilada
npm run clean    # Limpar arquivos compilados
```

## 🎯 Templates de E-mail

### Templates Disponíveis
- **bemvindo** - Template de boas-vindas
- **generico** - Template genérico customizável

### Criando Novos Templates
1. Crie um arquivo `.mjml` em `src/mail/templates/`
2. Use Handlebars para variáveis: `{{nome}}`, `{{empresa}}`
3. Teste via painel administrativo

### Exemplo de Template
```mjml
<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text>
          Olá {{nome}}, bem-vindo à {{empresa}}!
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
```

## 🔒 Segurança

- ✅ **API Keys** com hash bcrypt (salt rounds: 15)
- ✅ **Validação** de entrada em todas as rotas
- ✅ **Isolamento** de credenciais via variáveis ambiente
- ✅ **CORS** configurado adequadamente
- ✅ **Rate limiting** (recomendado para produção)

## 📊 Monitoramento

### Métricas Disponíveis
- Status do serviço (online/offline)
- Número de e-mails enviados
- Requisições à API
- Chaves ativas
- Uptime do sistema

### Logs
- Logs estruturados
- Níveis: INFO, WARN, ERROR
- Visualização em tempo real no painel

## 🚀 Deploy

### Variáveis de Ambiente Necessárias
```env
PORT=5015
NODE_ENV=production
MASTER_KEY=chave-mestra-segura
SENDER_EMAIL=email-producao@dominio.com
APP_PASSWORD=senha-app-gmail
```

### Comandos de Deploy
```bash
# Build
npm run build

# Executar
npm start
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Desenvolvedor

**Ruan Lopes**
- 🔗 LinkedIn: [ruan-lopes-1350s](https://www.linkedin.com/in/ruan-lopes-1350s)
- 📧 E-mail: contatoruanlopes1350@gmail.com

---

⭐ **Se este projeto foi útil para você, considere dar uma estrela!** ⭐

