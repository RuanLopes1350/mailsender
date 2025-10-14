import EmailModel, { IEmail } from '../models/email.js';
import DatabaseConnection from '../config/database.js';

let emailModel: EmailModel;

async function initEmailModel() {
    if (!emailModel) {
        const dbConnection = DatabaseConnection.getInstance();
        await dbConnection.connect();
        emailModel = new EmailModel();
    }
}

export async function logEmail(emailData: {
    to: string;
    subject: string;
    template: string;
    data: Record<string, any>;
    apiKeyUser: string;
}): Promise<string> {
    console.log(`   📝 Preparando registro do email...`);
    await initEmailModel();

    const email: Omit<IEmail, '_id'> = {
        ...emailData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    console.log(`   💽 Salvando no MongoDB...`);
    const result = await emailModel.create(email);
    const emailId = result._id!.toString();
    console.log(`   ✓ Registro criado com sucesso (ID: ${emailId})`);
    
    return emailId;
}

export async function updateEmailStatus(
    emailId: string,
    status: IEmail['status'],
    error?: string
): Promise<boolean> {
    console.log(`   📊 Atualizando status do email ${emailId} para '${status}'...`);
    await initEmailModel();

    const sentAt = status === 'sent' ? new Date().toISOString() : undefined;
    const result = await emailModel.updateStatus(emailId, status, error, sentAt);
    
    if (result) {
        console.log(`   ✓ Status atualizado no banco de dados`);
    } else {
        console.log(`   ⚠️ Falha ao atualizar status no banco`);
    }
    
    return result;
}

export async function getEmailStats() {
    await initEmailModel();
    return await emailModel.getStats();
}

export async function getRecentEmails(limit: number = 10): Promise<IEmail[]> {
    await initEmailModel();
    return await emailModel.findAll(limit);
}

export async function getUserEmails(apiKeyUser: string): Promise<IEmail[]> {
    await initEmailModel();
    return await emailModel.findByUser(apiKeyUser);
}
