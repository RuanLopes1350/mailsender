# 📧 Tutorial: Como Usar o Mail Sender

Guia rápido e prático para integrar o sistema de envio de emails ao seu projeto.

---

## 🚀 Início Rápido

### 1. Gerar uma API Key

Antes de enviar emails, você precisa de uma chave de API.

**Endpoint:**
```
POST /keys/generate
```

**Body (JSON):**
```json
{
  "name": "meu-sistema-producao"
}
```

**Exemplo com cURL:**
```bash
curl -X POST http://localhost:5015/keys/generate \
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

### Listar Chaves
```bash
GET /keys
```

### Revogar Chave
```bash
DELETE /keys/{nome-da-chave}
```

**Exemplo:**
```bash
curl -X DELETE http://localhost:5015/keys/meu-sistema-producao
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

- Painel Administrativo: `http://localhost:5015/painel`
- Teste seus emails diretamente pelo painel
- Monitore estatísticas em tempo real

---

## 📋 Checklist de Integração

- [ ] Gerar API Key
- [ ] Guardar a chave em variável de ambiente
- [ ] Testar envio pelo painel administrativo
- [ ] Implementar no código do seu sistema
- [ ] Testar com email real
- [ ] Configurar variáveis de ambiente na Vercel (se for fazer deploy)
- [ ] Ajustar URL base para produção

---

**Pronto! Agora você pode enviar emails profissionais e personalizados facilmente! 🎉**
