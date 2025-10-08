# 📧 Mail Sender - Painel Administrativo

Painel administrativo completo para gerenciamento do serviço de envio de emails.

## 🎨 Funcionalidades

### 📊 Dashboard
- **Estatísticas em tempo real**
  - Total de emails enviados
  - Emails com sucesso
  - Emails falhados
  - Total de requisições
- **Emails recentes** - Visualização dos últimos 5 emails enviados
- **Auto-refresh** - Atualiza automaticamente a cada 30 segundos

### 🔑 Gerenciamento de API Keys
- **Gerar novas chaves** - Crie chaves de API com nomes personalizados
- **Listar chaves** - Visualize todas as chaves ativas
- **Revogar chaves** - Desative chaves de API
- **Copiar para área de transferência** - Copie facilmente as chaves geradas

### ✉️ Testar Emails
- **Interface de teste** - Envie emails de teste diretamente pelo painel
- **Suporte a templates** - Teste os templates disponíveis (bemvindo, generico)
- **Dados personalizados** - Envie dados JSON customizados
- **Feedback em tempo real** - Veja o resultado do envio imediatamente

### 📜 Logs de Atividade
- **Atividade recente** - Visualize as últimas 10 requisições
- **Detalhes completos** - Método, endpoint, status e usuário
- **Códigos de status** - Identificação visual de sucessos e erros

## 🚀 Acesso

### Local
```
http://localhost:3010/painel
```

### Vercel (Produção)
```
https://seu-projeto.vercel.app/painel
```

## 🎯 Como Usar

### 1. Gerar uma API Key
1. Acesse a aba **🔑 API Keys**
2. Digite um nome para a chave (ex: "producao", "desenvolvimento")
3. Clique em **➕ Gerar Chave**
4. **IMPORTANTE**: Copie e salve a chave imediatamente (ela não será mostrada novamente)

### 2. Enviar Email de Teste
1. Acesse a aba **✉️ Testar Email**
2. Cole sua API Key
3. Preencha os campos:
   - Email de destino
   - Assunto
   - Template (escolha entre bemvindo ou generico)
   - Dados JSON (personalize conforme o template)
4. Clique em **🚀 Enviar Email de Teste**

### 3. Monitorar Estatísticas
1. Acesse a aba **📊 Dashboard**
2. Visualize os contadores em tempo real
3. Confira os emails recentes
4. O dashboard atualiza automaticamente

### 4. Visualizar Logs
1. Acesse a aba **📜 Logs Recentes**
2. Veja as últimas requisições ao sistema
3. Identifique erros e sucessos pelos códigos de status

## 📱 Responsivo

O painel é totalmente responsivo e funciona perfeitamente em:
- 💻 Desktop
- 📱 Tablets
- 📱 Smartphones

## 🎨 Interface

- **Design moderno** com gradientes e animações suaves
- **Tema claro** otimizado para leitura
- **Ícones visuais** para melhor experiência
- **Feedback visual** em todas as ações
- **Tabelas responsivas** com scroll horizontal quando necessário

## 🔐 Segurança

- As API Keys são exibidas apenas uma vez após a geração
- Confirmação necessária para revogar chaves
- Senhas em campos de API Key não são visíveis
- Validação de JSON antes de enviar

## 🛠️ Estrutura dos Arquivos

```
public/
├── index.html   # Interface principal
├── styles.css   # Estilos e design
└── script.js    # Lógica e integração com API
```

## 📡 Endpoints Utilizados

- `GET /stats` - Estatísticas e dados do dashboard
- `GET /keys` - Lista de API Keys
- `POST /keys/generate` - Gerar nova chave
- `DELETE /keys/:name` - Revogar chave
- `POST /emails/send` - Enviar email (requer API Key)

## 🎯 Exemplos de Dados JSON

### Template Bem-vindo
```json
{
  "nome": "João Silva",
  "mensagem": "Seja bem-vindo ao nosso sistema!"
}
```

### Template Genérico
```json
{
  "nome": "Maria Santos",
  "mensagem": "Esta é uma mensagem personalizada",
  "titulo": "Notificação Importante"
}
```

## 💡 Dicas

1. **Auto-refresh**: O dashboard atualiza sozinho, mas você pode trocar de aba e voltar para forçar uma atualização
2. **API Keys**: Use nomes descritivos para identificar facilmente cada chave
3. **Teste primeiro**: Sempre teste com um email pessoal antes de usar em produção
4. **Backup de chaves**: Guarde suas API Keys em um gerenciador de senhas seguro

## 🐛 Troubleshooting

### "Erro ao carregar dados"
- Verifique se o servidor está rodando
- Confira as variáveis de ambiente (.env)

### "Erro ao enviar email"
- Valide sua API Key
- Verifique se o JSON dos dados está correto
- Confirme que o template existe

### "Chave não encontrada"
- A chave pode ter sido revogada
- Gere uma nova chave se necessário

---

Desenvolvido com ❤️ para facilitar o gerenciamento de emails
