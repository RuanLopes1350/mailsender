import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

const { SENDER_EMAIL, APP_PASSWORD } = process.env

export async function getTransport() {
    console.log('🔧 Configurando transporte de email...');
    console.log('📧 Email:', SENDER_EMAIL);
    console.log('🔑 Password length:', APP_PASSWORD?.length || 0);
    console.log('🔑 Password exists:', !!APP_PASSWORD);

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: SENDER_EMAIL,
            pass: APP_PASSWORD
        }
    });
}