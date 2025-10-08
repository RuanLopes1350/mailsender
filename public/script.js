// Configuração da API
const API_BASE = window.location.origin;

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
    loadTabData('dashboard');
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
    try {
        const response = await fetch(`${API_BASE}/stats`);
        if (!response.ok) throw new Error('Erro ao carregar estatísticas');
        
        const data = await response.json();
        
        // Atualiza contadores
        document.getElementById('totalEmails').textContent = data.emails?.total || 0;
        document.getElementById('successEmails').textContent = data.emails?.sent || 0;
        document.getElementById('failedEmails').textContent = data.emails?.failed || 0;
        document.getElementById('totalRequests').textContent = data.requests?.total || 0;
        
        // Atualiza tabela de emails recentes
        const tbody = document.getElementById('recentEmailsBody');
        if (data.recentEmails && data.recentEmails.length > 0) {
            tbody.innerHTML = data.recentEmails.map(email => `
                <tr>
                    <td>${formatDate(email.timestamp)}</td>
                    <td>${email.to}</td>
                    <td>${email.subject}</td>
                    <td><code>${email.template}</code></td>
                    <td><span class="status status-${email.status}">${getStatusText(email.status)}</span></td>
                </tr>
            `).join('');
        } else {
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
                            🗑️ Revogar
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
    if (!confirm(`Tem certeza que deseja revogar a chave "${name}"? Esta ação não pode ser desfeita.`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/keys/${encodeURIComponent(name)}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Chave revogada com sucesso');
            loadApiKeys();
        } else {
            throw new Error('Erro ao revogar chave');
        }
    } catch (error) {
        console.error('Erro ao revogar chave:', error);
        alert('Erro ao revogar chave');
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
