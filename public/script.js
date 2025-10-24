// Configuração da API
const API_BASE = window.location.origin + '/api';

// Gerenciamento de Tabs
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.dataset.tab;
        
        // Remove active de todos
        document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Adiciona active no clicado
        button.classList.add('active');
        document.getElementById(tabName).classList.add('active');
        
        // Carrega dados específicos da tab
        loadTabData(tabName);
    });
});

// Carrega dados ao iniciar
window.addEventListener('DOMContentLoaded', () => {
    console.log('🎬 DOM carregado, aguardando 100ms...');
    // Aguarda um pouco para garantir que tudo está renderizado
    setTimeout(() => {
        console.log('✅ Iniciando carregamento do dashboard...');
        loadTabData('dashboard');
    }, 100);
});

// Carrega dados específicos de cada tab
function loadTabData(tabName) {
    switch(tabName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'keys':
            loadApiKeys();
            break;
        case 'logs':
            loadActivityLogs();
            break;
    }
}

// ==================== DASHBOARD ====================

async function loadDashboardData() {
    console.log('🔄 Carregando dashboard...');
    console.log('📍 API_BASE:', API_BASE);
    console.log('📡 Chamando:', `${API_BASE}/stats`);
    
    try {
        const response = await fetch(`${API_BASE}/stats`);
        console.log('📥 Response status:', response.status);
        
        if (!response.ok) {
            console.error('❌ Response não OK:', response.status, response.statusText);
            throw new Error('Erro ao carregar estatísticas');
        }
        
        const data = await response.json();
        console.log('✅ Dados recebidos:', data);
        
        // Atualiza contadores
        document.getElementById('totalEmails').textContent = data.emails?.total || 0;
        document.getElementById('successEmails').textContent = data.emails?.sent || 0;
        document.getElementById('failedEmails').textContent = data.emails?.failed || 0;
        document.getElementById('totalRequests').textContent = data.requests?.total || 0;
        
        // Atualiza tabela de emails recentes
        const tbody = document.getElementById('recentEmailsBody');
        console.log('📧 Recent emails recebidos:', data.recentEmails); // DEBUG
        if (data.recentEmails && data.recentEmails.length > 0) {
            tbody.innerHTML = data.recentEmails.map(email => `
                <tr>
                    <td>${formatDate(email.createdAt)}</td>
                    <td>${email.to}</td>
                    <td>${email.subject}</td>
                    <td><code>${email.template}</code></td>
                    <td><span class="status status-${email.status}">${getStatusText(email.status)}</span></td>
                </tr>
            `).join('');
        } else {
            console.log('⚠️ Nenhum email recente encontrado'); // DEBUG
            tbody.innerHTML = '<tr><td colspan="5" class="loading">Nenhum email enviado ainda</td></tr>';
        }
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        showError('Erro ao carregar dados do dashboard');
    }
}

// ==================== API KEYS ====================

async function loadApiKeys() {
    try {
        const response = await fetch(`${API_BASE}/keys`);
        if (!response.ok) throw new Error('Erro ao carregar chaves');
        
        const keys = await response.json();
        const tbody = document.getElementById('apiKeysBody');
        
        if (keys && keys.length > 0) {
            tbody.innerHTML = keys.map(key => `
                <tr>
                    <td><strong>${key.name}</strong></td>
                    <td><code>${key.prefix || 'N/A'}</code></td>
                    <td>${formatDate(key.createdAt)}</td>
                    <td>
                        <button class="btn btn-danger btn-small" onclick="revokeApiKey('${key.name}')">
                            🗑️ Deletar
                        </button>
                    </td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="4" class="loading">Nenhuma chave cadastrada</td></tr>';
        }
    } catch (error) {
        console.error('Erro ao carregar chaves:', error);
        showError('Erro ao carregar lista de chaves');
    }
}

async function generateApiKey() {
    const nameInput = document.getElementById('keyName');
    const name = nameInput.value.trim();
    
    if (!name) {
        alert('Por favor, informe um nome para a chave');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/keys/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        
        if (!response.ok) throw new Error('Erro ao gerar chave');
        
        const data = await response.json();
        
        // Mostra a chave gerada
        document.getElementById('generatedKey').textContent = data.apiKey;
        document.getElementById('newKeyDisplay').style.display = 'block';
        
        // Limpa o input
        nameInput.value = '';
        
        // Recarrega a lista de chaves
        loadApiKeys();
        
        // Esconde a mensagem após 30 segundos
        setTimeout(() => {
            document.getElementById('newKeyDisplay').style.display = 'none';
        }, 30000);
        
    } catch (error) {
        console.error('Erro ao gerar chave:', error);
        alert('Erro ao gerar chave API');
    }
}

async function revokeApiKey(name) {
    if (!confirm(`Tem certeza que deseja DELETAR PERMANENTEMENTE a chave "${name}"? Esta ação não pode ser desfeita e a chave será removida do banco de dados.`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/keys/${encodeURIComponent(name)}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Chave deletada com sucesso');
            loadApiKeys();
        } else {
            throw new Error('Erro ao deletar chave');
        }
    } catch (error) {
        console.error('Erro ao deletar chave:', error);
        alert('Erro ao deletar chave');
    }
}

function copyToClipboard() {
    const key = document.getElementById('generatedKey').textContent;
    navigator.clipboard.writeText(key).then(() => {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✅ Copiado!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    });
}

// ==================== TEST EMAIL ====================

async function sendTestEmail() {
    const apiKey = document.getElementById('testApiKey').value.trim();
    const to = document.getElementById('testTo').value.trim();
    const subject = document.getElementById('testSubject').value.trim();
    const template = document.getElementById('testTemplate').value;
    const dataText = document.getElementById('testData').value.trim();
    
    if (!apiKey || !to || !subject) {
        showTestResult('error', 'Por favor, preencha todos os campos obrigatórios');
        return;
    }
    
    let data;
    try {
        data = JSON.parse(dataText);
    } catch (error) {
        showTestResult('error', 'JSON inválido no campo de dados');
        return;
    }
    
    try {
        showTestResult('info', '📤 Enviando email...');
        
        const response = await fetch(`${API_BASE}/emails/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            },
            body: JSON.stringify({
                to,
                subject,
                template,
                data
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showTestResult('success', `✅ Email enviado com sucesso! ${result.message || ''}`);
        } else {
            showTestResult('error', `❌ Erro: ${result.message || 'Falha ao enviar email'}`);
        }
    } catch (error) {
        console.error('Erro ao enviar email:', error);
        showTestResult('error', `❌ Erro de conexão: ${error.message}`);
    }
}

function showTestResult(type, message) {
    const resultDiv = document.getElementById('testResult');
    const alertClass = type === 'success' ? 'alert-success' : type === 'error' ? 'alert-error' : 'alert-info';
    resultDiv.innerHTML = `<div class="alert ${alertClass}">${message}</div>`;
}

// ==================== ACTIVITY LOGS ====================

async function loadActivityLogs() {
    try {
        const response = await fetch(`${API_BASE}/stats`);
        if (!response.ok) throw new Error('Erro ao carregar logs');
        
        const data = await response.json();
        const tbody = document.getElementById('activityBody');
        
        if (data.recentActivity && data.recentActivity.length > 0) {
            tbody.innerHTML = data.recentActivity.map(activity => `
                <tr>
                    <td>${formatDate(activity.timestamp)}</td>
                    <td><code>${activity.method}</code></td>
                    <td><code>${activity.endpoint}</code></td>
                    <td><span class="status status-${getStatusClass(activity.statusCode)}">${activity.statusCode}</span></td>
                    <td>${activity.apiKeyUser || 'N/A'}</td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="5" class="loading">Nenhuma atividade registrada</td></tr>';
        }
    } catch (error) {
        console.error('Erro ao carregar logs:', error);
        showError('Erro ao carregar logs de atividade');
    }
}

// ==================== HELPERS ====================

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getStatusText(status) {
    const statusMap = {
        'sent': 'Enviado',
        'failed': 'Falhado',
        'pending': 'Pendente'
    };
    return statusMap[status] || status;
}

function getStatusClass(statusCode) {
    if (statusCode >= 200 && statusCode < 300) return 'success';
    if (statusCode >= 400) return 'failed';
    return 'pending';
}

function showError(message) {
    console.error(message);
    // Você pode adicionar um toast/notification aqui
}

// Auto-refresh do dashboard a cada 30 segundos
setInterval(() => {
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab && activeTab.id === 'dashboard') {
        loadDashboardData();
    }
}, 30000);

// ==================== TEMPLATE EXAMPLES ====================

function updateTemplateExample() {
    const template = document.getElementById('testTemplate').value;
    const infoDiv = document.getElementById('templateInfo');
    const dataTextarea = document.getElementById('testData');
    
    const templates = {
        bemvindo: {
            info: `<strong>📝 Campos do template "Bem-vindo":</strong>
                <ul style="margin: 10px 0; padding-left: 20px; font-size: 0.9rem;">
                    <li><code>nomeSistema</code> - Nome do seu sistema/empresa</li>
                    <li><code>nome</code> - Nome do destinatário</li>
                    <li><code>mensagem</code> - Mensagem de boas-vindas customizada</li>
                    <li><code>mensagemSecundaria</code> - Texto adicional</li>
                    <li><code>itens</code> - Array com lista de benefícios/recursos</li>
                    <li><code>mostrarBotao</code> (true/false) - Exibir botão</li>
                    <li><code>textoBotao</code> - Texto do botão</li>
                    <li><code>urlBotao</code> - URL do botão</li>
                    <li><code>corPrimaria</code> - Cor do header (ex: "#4F46E5")</li>
                    <li><code>corBotao</code> - Cor do botão</li>
                    <li><code>logoUrl</code> - URL do logo</li>
                    <li><code>infoAdicional</code> - Informações extras no rodapé</li>
                </ul>`,
            example: `{
  "nomeSistema": "Vitrine",
  "nome": "João Silva",
  "mensagem": "Estamos felizes em tê-lo conosco! Explore todas as funcionalidades da nossa plataforma.",
  "mensagemSecundaria": "Preparamos algumas dicas para você começar:",
  "itens": [
    "Complete seu perfil para personalizar sua experiência",
    "Explore os recursos disponíveis no menu principal",
    "Entre em contato com nosso suporte se tiver dúvidas"
  ],
  "mostrarBotao": true,
  "textoBotao": "Acessar Plataforma",
  "urlBotao": "https://exemplo.com/login",
  "corPrimaria": "#4F46E5"
}`
        },
        generico: {
            info: `<strong>📝 Campos do template "Genérico":</strong>
                <ul style="margin: 10px 0; padding-left: 20px; font-size: 0.9rem;">
                    <li><code>nomeSistema</code> - Nome do sistema (aparece no header)</li>
                    <li><code>mostrarHeader</code> (true/false) - Exibir header</li>
                    <li><code>titulo</code> - Título principal do email</li>
                    <li><code>subtitulo</code> - Subtítulo</li>
                    <li><code>nome</code> - Nome do destinatário (para saudação)</li>
                    <li><code>mensagem</code> - Conteúdo principal (HTML permitido)</li>
                    <li><code>conteudo</code> - Conteúdo alternativo/adicional</li>
                    <li><code>textoDestaque</code> - Texto em caixa destacada</li>
                    <li><code>itens</code> - Array com lista de itens</li>
                    <li><code>dados</code> - Array de {label, valor} para tabela</li>
                    <li><code>mostrarBotao</code> (true/false) - Botão principal</li>
                    <li><code>textoBotao</code> / <code>urlBotao</code> - Configurações do botão</li>
                    <li><code>mostrarBotaoSecundario</code> - Segundo botão</li>
                    <li><code>nota</code> - Nota/aviso no final</li>
                    <li><code>corPrimaria</code> / <code>corBotao</code> - Cores customizadas</li>
                    <li><code>logoUrl</code> - URL do logo</li>
                </ul>`,
            example: `{
  "nomeSistema": "Sistema de Notificações",
  "mostrarHeader": true,
  "titulo": "Confirmação de Pedido",
  "subtitulo": "Pedido #12345",
  "nome": "Maria Santos",
  "mensagem": "Seu pedido foi confirmado com sucesso e está sendo processado.",
  "textoDestaque": "⏱️ <strong>Previsão de entrega:</strong> 3-5 dias úteis",
  "dados": [
    { "label": "Número do Pedido", "valor": "#12345" },
    { "label": "Data", "valor": "07/10/2025" },
    { "label": "Valor Total", "valor": "R$ 299,90" }
  ],
  "mostrarBotao": true,
  "textoBotao": "Rastrear Pedido",
  "urlBotao": "https://exemplo.com/rastreio/12345",
  "nota": "Você receberá atualizações por email sobre o status da entrega.",
  "corPrimaria": "#10B981"
}`
        }
    };
    
    const selectedTemplate = templates[template];
    if (selectedTemplate) {
        infoDiv.innerHTML = selectedTemplate.info;
        dataTextarea.value = selectedTemplate.example;
    }
}

// Inicializa o exemplo do primeiro template
document.addEventListener('DOMContentLoaded', () => {
    updateTemplateExample();
});
