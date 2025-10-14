import fs from 'fs/promises'
import path from 'path'
import mjml2html from 'mjml'
import handlebars from 'handlebars'
import { getTransport } from '../config/mail.js'

const TEMPLATE_DIR = path.resolve('src', 'mail', 'templates');

interface SendMailParams {
    to: string;
    subject: string;
    template: string;
    data?: Record<string, any>;
}

export async function sendMail({ to, subject, template, data = {} }: SendMailParams) {
    try {
        console.log(`   📄 [1/4] Carregando template '${template}.mjml'...`);
        
        // 1. Lê o arquivo MJML
        const mjmlPath = path.join(TEMPLATE_DIR, `${template}.mjml`);
        const rawMjml = await fs.readFile(mjmlPath, 'utf8');
        console.log(`   ✓ Template carregado (${rawMjml.length} caracteres)`);

        console.log(`   🔧 [2/4] Compilando template com Handlebars...`);
        // 2. Compila Handlebars → MJML com dados injetados
        const mjmlWithData = handlebars.compile(rawMjml)(data);
        console.log(`   ✓ Template compilado com dados`);

        console.log(`   🎨 [3/4] Convertendo MJML para HTML...`);
        // 3. Converte MJML → HTML
        const { html, errors } = mjml2html(mjmlWithData, { validationLevel: 'soft' });
        if (errors.length) {
            console.warn(`   ⚠️ MJML validation warnings:`, errors);
        } else {
            console.log(`   ✓ HTML gerado (${html.length} caracteres)`);
        }

        console.log(`   📮 [4/4] Enviando email via transporte...`);
        console.log(`   De: ${process.env.SENDER_EMAIL}`);
        console.log(`   Para: ${to}`);
        
        // 4. Envia
        const transport = await getTransport();
        const info = await transport.sendMail({
            from: process.env.SENDER_EMAIL,
            to,
            subject,
            html,
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