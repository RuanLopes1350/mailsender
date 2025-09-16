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
    await initEmailModel();

    const email: Omit<IEmail, '_id'> = {
        ...emailData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    const result = await emailModel.create(email);
    return result._id!.toString();
}

export async function updateEmailStatus(
    emailId: string,
    status: IEmail['status'],
    error?: string
): Promise<boolean> {
    await initEmailModel();

    const sentAt = status === 'sent' ? new Date().toISOString() : undefined;
    return await emailModel.updateStatus(emailId, status, error, sentAt);
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
