import fs from 'fs/promises';
import path from 'path';
import mjml2html from 'mjml';
import handlebars from 'handlebars';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const TEMPLATE_DIR = path.resolve('src', 'mail', 'templates');

// Interface para os parâmetros de envio de email
interface EnviarEmailParams {
    email: string;
    pass: string;
    to: string;
    subject: string;
    template: string;
    data?: Record<string, any>;
}

class EmailSenderService {
    // 1. Criamos um Map estático ou de instância para guardar os transporters ativos
    // Chave: email do remetente, Valor: Instância do Transporter
    private transporters = new Map<string, nodemailer.Transporter>();

    // Obtém ou cria o transporter do Nodemailer
    private async obterTransporter(email: string, pass: string): Promise<nodemailer.Transporter> {
        
        // 2. Verifica se já temos um transporter ativo para este email
        if (this.transporters.has(email)) {
            console.log(`   ⚡ Reutilizando conexão SMTP para: ${email}`);
            return this.transporters.get(email)!;
        }

        console.log(`   🔐 Criando NOVA conexão (Pool) para: ${email}`);
        // console.log(`      Senha: ${pass ? '***' + pass.slice(-4) : 'UNDEFINED'}`);

        // 3. Configura com pool: true
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            pool: true, // <--- Habilita o uso de pool
            maxConnections: 5, // Máximo de conexões simultâneas por usuário
            maxMessages: 100, // Reinicia conexão após 100 envios (bom para Gmail)
            rateDelta: 1000, // Janela de tempo para rate limit
            rateLimit: 5, // Máximo de 5 mensagens por segundo (evita bloqueio do Gmail)
            auth: {
                user: email,
                pass: pass
            }
        });

        // Verifica a conexão antes de salvar no cache (opcional, mas recomendado)
        try {
            await transporter.verify();
            // 4. Salva no cache
            this.transporters.set(email, transporter);
        } catch (error) {
            console.error(`   ❌ Falha ao autenticar SMTP para ${email}:`, error);
            throw error;
        }

        return transporter;
    }

    // Método para limpar conexões inativas (útil para não estourar memória se tiver muitos usuários)
    public limparTransportersInativos() {
        this.transporters.forEach((transporter, email) => {
            if (transporter.isIdle()) {
                transporter.close();
                this.transporters.delete(email);
                console.log(`   🧹 Conexão inativa fechada para: ${email}`);
            }
        });
    }

    // Envia um email usando template MJML
    async enviarEmail({ email, pass, to, subject, template, data = {} }: EnviarEmailParams): Promise<any> {
        try {
            // ... (Lógica de template MJML permanece igual) ...
            const mjmlPath = path.join(TEMPLATE_DIR, `${template}.mjml`);
            const rawMjml = await fs.readFile(mjmlPath, 'utf8');
            const mjmlWithData = handlebars.compile(rawMjml)(data);
            const { html, errors } = mjml2html(mjmlWithData, { validationLevel: 'soft' });
            
            if (errors.length) console.warn(`   ⚠️ MJML validation warnings:`, errors);

            // 5. Obtém o transporter (agora com cache)
            const transporter = await this.obterTransporter(email, pass);
            
            const info = await transporter.sendMail({
                from: email,
                to,
                subject,
                html
            });
            
            return info;
        } catch (error) {
            // Se der erro de autenticação, remove do cache para forçar recriação na próxima
            // caso a senha tenha mudado
            this.transporters.delete(email); 
            
            console.error(`   ❌ Erro durante o envio do email: ${(error as Error).message}`);
            throw error;
        }
    }
}

export default EmailSenderService;