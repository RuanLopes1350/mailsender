# 📧 Tutorial: Como Usar o Mail Sender

Guia rápido e prático para integrar o sistema de envio de emails ao seu projeto.

---

## 🔐 Autenticação

O sistema possui **dois tipos de autenticação**:

### 1️⃣ JWT Token (Painel Administrativo)
- 👤 **Usado por:** Administradores humanos
- 🎯 **Propósito:** Gerenciar o sistema (keys, stats, emails)
- 🔑 **Login:** `POST /api/login` com username/password
- ⏱️ **Validade:** 8 horas (renovável com novo login)
- 🔒 **Credenciais padrão:** `admin` / `admin` (altere em produção!)

### 2️⃣ API Key (Desenvolvedores)
- 🤖 **Usado por:** Aplicações e sistemas automatizados
- 🎯 **Propósito:** Enviar emails programaticamente
- 🔑 **Geração:** Pelo painel administrativo ou via API
- ⏱️ **Validade:** Permanente até ser revogada/desativada
- 🔒 **Formato:** `mail_1234567890abcdef_ghijklmnopqrstuv`

---

### 🔄 Fluxo de Autenticação

```
┌─────────────────────────────────────────────────────────────┐
│                    PAINEL ADMINISTRATIVO                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Admin faz login (username/password)                     │
│           ↓                                                  │
│  2. Servidor valida e retorna JWT                           │
│           ↓                                                  │
│  3. Cliente salva JWT (localStorage)                        │
│           ↓                                                  │
│  4. Requisições incluem: Authorization: Bearer <JWT>        │
│           ↓                                                  │
│  5. Middleware valida JWT e permite acesso                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    INTEGRAÇÃO (API KEY)                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Admin gera API Key pelo painel                          │
│           ↓                                                  │
│  2. Sistema retorna chave única (copiar!)                   │
│           ↓                                                  │
│  3. Dev adiciona chave na aplicação (.env)                  │
│           ↓                                                  │
│  4. Requisições incluem: x-api-key: <API_KEY>               │
│           ↓                                                  │
│  5. Middleware valida chave e permite envio                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## �🚀 Início Rápido

### 1. Fazer Login no Painel (Opcional)

Se você quiser usar o painel administrativo, primeiro faça login:

**Endpoint:**
```
POST /api/login
```

**Body (JSON):**
```json
{
  "username": "admin",
  "password": "admin"
}
```

**Resposta:**
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

💡 **Dica:** Salve o `token` - ele será usado nas requisições ao painel.

**Exemplo de Login com JavaScript:**
```javascript
async function fazerLogin() {
  const response = await fetch('http://localhost:5015/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'admin',
      password: 'admin'
    })
  });

  const data = await response.json();
  
  if (data.success) {
    // Salva o token para usar depois
    localStorage.setItem('jwt_token', data.token);
    console.log('Login bem-sucedido!', data.user);
  } else {
    console.error('Erro no login:', data.message);
  }
}
```

**Exemplo de Login com Python:**
```python
import requests
import json

def fazer_login():
    url = 'http://localhost:5015/api/login'
    payload = {
        'username': 'admin',
        'password': 'admin'
    }
    
    response = requests.post(url, json=payload)
    data = response.json()
    
    if data.get('success'):
        token = data['token']
        # Salva o token em variável ou arquivo
        print(f'Login bem-sucedido! Token: {token[:20]}...')
        return token
    else:
        print(f'Erro no login: {data.get("message")}')
        return None
```

---

### 2. Gerar uma API Key

Antes de enviar emails, você precisa de uma chave de API.

**Endpoint:**
```
POST /api/keys/generate
```

**Body (JSON):**
```json
{
  "name": "meu-sistema-producao"
}
```

**Exemplo com cURL:**
```bash
curl -X POST http://localhost:5015/api/keys/generate \
  -H "Content-Type: application/json" \
  -d '{"name": "meu-sistema-producao"}'
```

**Resposta:**
```json
{
  "name": "meu-sistema-producao",
  "message": "Chave criada – salve em local seguro (não será mostrada de novo)",
  "apiKey": "abc123def456..."
}
```

⚠️ **IMPORTANTE:** Guarde esta chave em local seguro! Ela não será mostrada novamente.

---

## ✉️ Enviar Email

### Como Funciona

1. **Gere uma API Key** (passo acima)
2. **Use a chave no header** `x-api-key`
3. **Envie o JSON** com os dados do email

### Endpoint Principal
```
POST /api/emails/send
```

### Headers Obrigatórios
```
Content-Type: application/json
x-api-key: SUA_API_KEY_AQUI
```

---

## 📝 Template: Bem-vindo

Email de boas-vindas personalizável com botão opcional.

### Exemplo Básico (Mínimo)

**Body:**
```json
{
  "to": "usuario@exemplo.com",
  "subject": "Bem-vindo!",
  "template": "bemvindo",
  "data": {
    "nomeSistema": "Vitrine",
    "nome": "João Silva"
  }
}
```

**Resultado:** Email dizendo "Bem-vindo à Vitrine, João Silva!"

---

### Exemplo Completo (Com Botão)

**Body:**
```json
{
  "to": "usuario@exemplo.com",
  "subject": "Bem-vindo à Vitrine!",
  "template": "bemvindo",
  "data": {
    "nomeSistema": "Vitrine",
    "nome": "João Silva",
    "mensagem": "Estamos felizes em tê-lo conosco! Sua conta foi criada com sucesso.",
    "mensagemSecundaria": "Para começar, complete seu perfil e explore nossos recursos.",
    "itens": [
      "Acesso ilimitado a todos os recursos",
      "Suporte técnico 24/7",
      "Atualizações gratuitas"
    ],
    "mostrarBotao": true,
    "textoBotao": "Acessar Minha Conta",
    "urlBotao": "https://vitrine.com/login",
    "corPrimaria": "#4F46E5",
    "corBotao": "#10B981"
  }
}
```

---

### Exemplo sem Botão

**Body:**
```json
{
  "to": "usuario@exemplo.com",
  "subject": "Bem-vindo!",
  "template": "bemvindo",
  "data": {
    "nomeSistema": "Meu Sistema",
    "nome": "Maria",
    "mensagem": "Obrigado por se cadastrar!",
    "mostrarBotao": false
  }
}
```

---

### Exemplo com Logo

**Body:**
```json
{
  "to": "usuario@exemplo.com",
  "subject": "Bem-vindo!",
  "template": "bemvindo",
  "data": {
    "nome": "Pedro",
    "logoUrl": "https://exemplo.com/logo.png",
    "mensagem": "Sua jornada começa agora!",
    "mostrarBotao": true,
    "textoBotao": "Começar",
    "urlBotao": "https://exemplo.com/inicio"
  }
}
```

---

### Campos Disponíveis - Template Bem-vindo

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `nomeSistema` | string | Não | Nome do sistema/empresa (ex: "Vitrine") |
| `nome` | string | Não | Nome do destinatário |
| `mensagem` | string/HTML | Não | Mensagem principal customizada |
| `mensagemSecundaria` | string/HTML | Não | Texto adicional após a mensagem principal |
| `itens` | array | Não | Lista de benefícios/recursos (bullets) |
| `mostrarBotao` | boolean | Não | `true` para exibir botão, `false` para ocultar |
| `textoBotao` | string | Não* | Texto do botão (padrão: "Começar Agora") |
| `urlBotao` | string | Não* | URL do botão |
| `corPrimaria` | string | Não | Cor do header em hex (ex: "#4F46E5") |
| `corBotao` | string | Não | Cor do botão em hex |
| `corDestaque` | string | Não | Cor para textos em destaque |
| `logoUrl` | string | Não | URL do logo (substitui nomeSistema no header) |
| `infoAdicional` | string/HTML | Não | Informações extras antes do footer |
| `textoFooter` | string/HTML | Não | Texto customizado do rodapé |
| `mostrarLinks` | boolean | Não | Exibir links no footer |
| `linkSite` | string | Não | URL do site |
| `linkSuporte` | string | Não | URL do suporte |
| `linkPrivacidade` | string | Não | URL da política de privacidade |

\* Obrigatório apenas se `mostrarBotao` for `true`

---

## 📨 Template: Genérico

Template versátil para notificações, confirmações, alertas, etc.

### Exemplo: Confirmação de Pedido

**Body:**
```json
{
  "to": "cliente@exemplo.com",
  "subject": "Pedido Confirmado #12345",
  "template": "generico",
  "data": {
    "mostrarHeader": true,
    "nomeSistema": "Loja Online",
    "titulo": "Pedido Confirmado! 🎉",
    "subtitulo": "Pedido #12345",
    "nome": "Maria Santos",
    "mensagem": "Seu pedido foi confirmado e está sendo processado.",
    "textoDestaque": "⏱️ <strong>Previsão de entrega:</strong> 3-5 dias úteis",
    "dados": [
      { "label": "Número do Pedido", "valor": "#12345" },
      { "label": "Data", "valor": "08/10/2025" },
      { "label": "Valor Total", "valor": "R$ 299,90" },
      { "label": "Forma de Pagamento", "valor": "Cartão de Crédito" }
    ],
    "mostrarBotao": true,
    "textoBotao": "Rastrear Pedido",
    "urlBotao": "https://loja.com/rastreio/12345",
    "nota": "Você receberá atualizações por email sobre o status da entrega."
  }
}
```

---

### Exemplo: Notificação Simples

**Body:**
```json
{
  "to": "usuario@exemplo.com",
  "subject": "Atualização Importante",
  "template": "generico",
  "data": {
    "titulo": "Nova Funcionalidade Disponível",
    "mensagem": "Olá! Implementamos melhorias significativas na plataforma.",
    "itens": [
      "Interface redesenhada",
      "Novos relatórios analíticos",
      "Melhor desempenho"
    ],
    "mostrarBotao": true,
    "textoBotao": "Conferir Novidades",
    "urlBotao": "https://app.com/novidades"
  }
}
```

---

### Exemplo: Alerta/Aviso

**Body:**
```json
{
  "to": "usuario@exemplo.com",
  "subject": "Ação Necessária",
  "template": "generico",
  "data": {
    "titulo": "⚠️ Confirme seu Email",
    "nome": "João",
    "mensagem": "Para continuar usando nosso serviço, precisamos que você confirme seu endereço de email.",
    "textoDestaque": "Este link expira em 24 horas.",
    "mostrarBotao": true,
    "textoBotao": "Confirmar Email",
    "urlBotao": "https://app.com/confirmar/abc123",
    "corBotao": "#EF4444"
  }
}
```

---

### Exemplo: Email com Dois Botões

**Body:**
```json
{
  "to": "usuario@exemplo.com",
  "subject": "Confirme sua presença",
  "template": "generico",
  "data": {
    "titulo": "Convite para Evento",
    "nome": "Pedro",
    "mensagem": "Você está convidado para nosso evento anual. Confirme sua presença até 15/10.",
    "mostrarBotao": true,
    "textoBotao": "✅ Confirmar Presença",
    "urlBotao": "https://app.com/evento/confirmar",
    "mostrarBotaoSecundario": true,
    "textoBotaoSecundario": "❌ Não Poderei Comparecer",
    "urlBotaoSecundario": "https://app.com/evento/recusar"
  }
}
```

---

### Campos Disponíveis - Template Genérico

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `nomeSistema` | string | Não | Nome exibido no header |
| `mostrarHeader` | boolean | Não | Exibir header colorido (padrão: false) |
| `logoUrl` | string | Não | URL do logo no header |
| `titulo` | string | Não | Título principal |
| `subtitulo` | string | Não | Subtítulo abaixo do título |
| `nome` | string | Não | Nome para saudação ("Olá, João") |
| `mensagem` | string/HTML | Não | Conteúdo principal |
| `conteudo` | string/HTML | Não | Conteúdo adicional/alternativo |
| `textoDestaque` | string/HTML | Não | Texto em caixa destacada |
| `itens` | array | Não | Lista de itens (bullets) |
| `dados` | array | Não | Tabela de dados `[{label, valor}, ...]` |
| `mostrarBotao` | boolean | Não | Exibir botão principal |
| `textoBotao` | string | Não* | Texto do botão principal |
| `urlBotao` | string | Não* | URL do botão principal |
| `mostrarBotaoSecundario` | boolean | Não | Exibir segundo botão |
| `textoBotaoSecundario` | string | Não** | Texto do botão secundário |
| `urlBotaoSecundario` | string | Não** | URL do botão secundário |
| `nota` | string/HTML | Não | Nota/aviso no final |
| `infoAdicional` | string/HTML | Não | Informações extras |
| `corPrimaria` | string | Não | Cor do header em hex |
| `corBotao` | string | Não | Cor do botão em hex |
| `corDestaque` | string | Não | Cor da caixa de destaque |
| `mostrarDivisor` | boolean | Não | Linha divisória após o título |
| `alinharTitulo` | string | Não | Alinhamento do título: "left", "center", "right" |
| `textoFooter` | string/HTML | Não | Rodapé customizado |
| `enderecoEmpresa` | string | Não | Endereço físico da empresa |
| `mostrarLinks` | boolean | Não | Exibir links no footer |
| `linkSite` | string | Não | URL do site |
| `linkSuporte` | string | Não | URL do suporte |
| `linkPrivacidade` | string | Não | URL da política de privacidade |

\* Obrigatório se `mostrarBotao` for `true`  
\** Obrigatório se `mostrarBotaoSecundario` for `true`

---

## 🔧 Exemplos de Código

### JavaScript (Fetch API)

```javascript
async function enviarEmail() {
  const response = await fetch('http://localhost:5015/api/emails/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'SUA_API_KEY_AQUI'
    },
    body: JSON.stringify({
      to: 'usuario@exemplo.com',
      subject: 'Bem-vindo!',
      template: 'bemvindo',
      data: {
        nomeSistema: 'Meu App',
        nome: 'João',
        mostrarBotao: true,
        textoBotao: 'Começar',
        urlBotao: 'https://app.com/login'
      }
    })
  });

  const result = await response.json();
  console.log(result);
}
```

---

### Node.js (Axios)

```javascript
const axios = require('axios');

async function enviarEmail() {
  try {
    const response = await axios.post('http://localhost:5015/api/emails/send', {
      to: 'usuario@exemplo.com',
      subject: 'Pedido Confirmado',
      template: 'generico',
      data: {
        titulo: 'Pedido #12345',
        mensagem: 'Seu pedido foi confirmado!',
        mostrarBotao: true,
        textoBotao: 'Ver Detalhes',
        urlBotao: 'https://loja.com/pedido/12345'
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'SUA_API_KEY_AQUI'
      }
    });

    console.log(response.data);
  } catch (error) {
    console.error('Erro:', error.response?.data || error.message);
  }
}
```

---

### Python (Requests)

```python
import requests

def enviar_email():
    url = 'http://localhost:5015/api/emails/send'
    headers = {
        'Content-Type': 'application/json',
        'x-api-key': 'SUA_API_KEY_AQUI'
    }
    data = {
        'to': 'usuario@exemplo.com',
        'subject': 'Bem-vindo!',
        'template': 'bemvindo',
        'data': {
            'nomeSistema': 'Meu Sistema',
            'nome': 'Maria',
            'mostrarBotao': True,
            'textoBotao': 'Acessar',
            'urlBotao': 'https://app.com'
        }
    }

    response = requests.post(url, json=data, headers=headers)
    print(response.json())

enviar_email()
```

---

### PHP

```php
<?php

function enviarEmail() {
    $url = 'http://localhost:5015/api/emails/send';
    $data = [
        'to' => 'usuario@exemplo.com',
        'subject' => 'Bem-vindo!',
        'template' => 'bemvindo',
        'data' => [
            'nomeSistema' => 'Meu Sistema',
            'nome' => 'Carlos',
            'mostrarBotao' => true,
            'textoBotao' => 'Começar',
            'urlBotao' => 'https://app.com/login'
        ]
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'x-api-key: SUA_API_KEY_AQUI'
    ]);

    $response = curl_exec($ch);
    curl_close($ch);

    echo $response;
}

enviarEmail();
?>
```

---

## ✅ Respostas da API

### Sucesso (202)
```json
{
  "message": "E-mail enfileirado",
  "info": {
    "accepted": ["usuario@exemplo.com"],
    "messageId": "<abc123@servidor.com>"
  }
}
```

### Erro - API Key Inválida (401)
```json
{
  "message": "API key inválida ou não fornecida"
}
```

### Erro - Dados Inválidos (500)
```json
{
  "message": "Falha ao enviar e-mail",
  "error": "Template não encontrado"
}
```

---

## 🎨 Dicas de Customização

### Cores em Hexadecimal
```json
{
  "corPrimaria": "#4F46E5",  // Índigo
  "corBotao": "#10B981",      // Verde
  "corDestaque": "#F59E0B"    // Laranja
}
```

### HTML Permitido em Mensagens
```json
{
  "mensagem": "Olá! <strong>Bem-vindo</strong> ao sistema.<br><br>Aproveite nossos <em>recursos exclusivos</em>."
}
```

### URLs Dinâmicas
```json
{
  "urlBotao": "https://app.com/confirmar?token=abc123&user=456"
}
```

---

## 🔐 Gerenciar API Keys

⚠️ **Todas as rotas de gerenciamento requerem JWT Token** (obtido no login)

### Listar Chaves
```bash
GET /api/keys
Authorization: Bearer SEU_JWT_TOKEN
```

**Exemplo:**
```bash
curl http://localhost:5015/api/keys \
  -H "Authorization: Bearer SEU_JWT_TOKEN"
```

### Desativar Chave Temporariamente
```bash
PATCH /api/keys/{nome-da-chave}/inativar
Authorization: Bearer SEU_JWT_TOKEN
```

**Exemplo:**
```bash
curl -X PATCH http://localhost:5015/api/keys/meu-sistema-producao/inativar \
  -H "Authorization: Bearer SEU_JWT_TOKEN"
```

### Reativar Chave
```bash
PATCH /api/keys/{nome-da-chave}/reativar
Authorization: Bearer SEU_JWT_TOKEN
```

**Exemplo:**
```bash
curl -X PATCH http://localhost:5015/api/keys/meu-sistema-producao/reativar \
  -H "Authorization: Bearer SEU_JWT_TOKEN"
```

### Revogar Chave Permanentemente
```bash
DELETE /api/keys/{nome-da-chave}
Authorization: Bearer SEU_JWT_TOKEN
```

**Exemplo:**
```bash
curl -X DELETE http://localhost:5015/api/keys/meu-sistema-producao \
  -H "Authorization: Bearer SEU_JWT_TOKEN"
```

---

## 🌐 URLs de Produção

Quando fizer deploy na Vercel, substitua a URL base:

**Local:**
```
http://localhost:5015
```

**Vercel:**
```
https://seu-projeto.vercel.app
```

**Exemplo:**
```javascript
const API_URL = 'https://seu-projeto.vercel.app/api/emails/send';
```

⚠️ **Nota:** Na Vercel, as rotas têm prefixo `/api/`

---

## 📞 Suporte

- **Painel Administrativo**: `http://localhost:5015/painel`
- **Login Padrão**: `admin` / `admin` (altere em produção!)
- Teste seus emails diretamente pelo painel
- Monitore estatísticas em tempo real
- Gerencie API Keys com interface visual

---

## 📋 Checklist de Integração

- [ ] Configurar variáveis de ambiente (`.env`)
- [ ] Alterar senha padrão do admin (`ADMIN_PASSWORD`)
- [ ] Gerar `JWT_SECRET` forte e único
- [ ] Fazer login no painel administrativo
- [ ] Gerar API Key pelo painel
- [ ] Guardar a chave em variável de ambiente no seu projeto
- [ ] Testar envio pelo painel administrativo
- [ ] Implementar no código do seu sistema
- [ ] Testar com email real
- [ ] Configurar variáveis de ambiente na Vercel (se for fazer deploy)
- [ ] Ajustar URL base para produção
- [ ] Desativar chaves de teste em produção

---

**Pronto! Agora você pode enviar emails profissionais e personalizados facilmente! 🎉**

---

## 📚 Documentação Adicional

- 🔐 **[Guia Completo de Autenticação](AUTHENTICATION.md)** - Tudo sobre JWT e API Keys
- 📖 **[README Principal](README.md)** - Visão geral do projeto
- 📄 **[Documentação Técnica](PROJETO.md)** - Detalhes de implementação
