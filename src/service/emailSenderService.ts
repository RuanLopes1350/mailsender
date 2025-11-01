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

// Service responsável pelo envio efetivo de emails
class EmailSenderService {
    private transporter: nodemailer.Transporter | null = null;

    // Obtém ou cria o transporter do Nodemailer
    private async obterTransporter(email: string, pass: string): Promise<nodemailer.Transporter> {
        if (this.transporter) {
            return this.transporter;
        }

        const senderEmail = email;
        const senderPassword = pass;

        if (!senderEmail || !senderPassword) {
            throw new Error('Credenciais de email não configuradas no .env');
        }

        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: senderEmail,
                pass: senderPassword
            }
        });

        return this.transporter;
    }

    // Envia um email usando template MJML
    async enviarEmail({ email, pass, to, subject, template, data = {} }: EnviarEmailParams): Promise<any> {
        try {
            console.log(`   📄 [1/4] Carregando template '${template}.mjml'...`);
            
            // 1. Lê o arquivo MJML
            const mjmlPath = path.join(TEMPLATE_DIR, `${template}.mjml`);
            const rawMjml = await fs.readFile(mjmlPath, 'utf8');
            console.log(`   ✓ Template carregado (${rawMjml.length} caracteres)`);

            console.log(`   🔧 [2/4] Compilando template com Handlebars...`);
            // 2. Compila Handlebars com os dados
            const mjmlWithData = handlebars.compile(rawMjml)(data);
            console.log(`   ✓ Template compilado com dados`);

            console.log(`   🎨 [3/4] Convertendo MJML para HTML...`);
            // 3. Converte MJML para HTML
            const { html, errors } = mjml2html(mjmlWithData, { validationLevel: 'soft' });
            
            if (errors.length) {
                console.warn(`   ⚠️ MJML validation warnings:`, errors);
            } else {
                console.log(`   ✓ HTML gerado (${html.length} caracteres)`);
            }

            console.log(`   📮 [4/4] Enviando email via transporte...`);
            console.log(`   De: ${email}`);
            console.log(`   Para: ${to}`);
            
            // 4. Envia o email
            const transporter = await this.obterTransporter(email, pass);
            const info = await transporter.sendMail({
                from: email,
                to,
                subject,
                html
            });
            
            console.log(`   ✅ Email enviado com sucesso!`);
            console.log(`   Message ID: ${info.messageId}`);
            console.log(`   Response: ${info.response}`);

            return info;
        } catch (error) {
            console.error(`   ❌ Erro durante o envio do email:`);
            console.error(`   Tipo: ${(error as Error).name}`);
            console.error(`   Mensagem: ${(error as Error).message}`);
            throw error;
        }
    }
}

export default EmailSenderService;
