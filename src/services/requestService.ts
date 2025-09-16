import RequestModel, { IRequest } from '../models/request.js';
import DatabaseConnection from '../config/database.js';

let requestModel: RequestModel;

async function initRequestModel() {
    if (!requestModel) {
        const dbConnection = DatabaseConnection.getInstance();
        await dbConnection.connect();
        requestModel = new RequestModel();
    }
}

export async function logRequest(requestData: {
    method: string;
    path: string;
    status: number;
    apiKeyUser?: string | undefined;
    ip: string;
    userAgent?: string | undefined;
    responseTime: number;
    error?: string | undefined;
}): Promise<void> {
    await initRequestModel();

    const request: Omit<IRequest, '_id'> = {
        ...requestData,
        createdAt: new Date().toISOString()
    };

    await requestModel.create(request);
}

export async function getRequestStats() {
    await initRequestModel();
    return await requestModel.getStats();
}

export async function getRecentActivity(limit: number = 10): Promise<IRequest[]> {
    await initRequestModel();
    return await requestModel.getRecentActivity(limit);
}

export async function getUserRequests(apiKeyUser: string, limit: number = 50): Promise<IRequest[]> {
    await initRequestModel();
    return await requestModel.findByUser(apiKeyUser, limit);
}
