import mongoose, { Schema, Document } from 'mongoose';

// Interface que representa um log de requisição no sistema
export interface IRequest extends Document {
    method: string;
    path: string;
    statusCode: number;
    ip: string;
    userAgent: string;
    responseTime: number;
    apiKeyUser?: string;
    createdAt: Date;
}

// Schema do Mongoose para Logs de Requisições
const requestSchema = new Schema<IRequest>({
    method: { 
        type: String, 
        required: true 
    },
    path: { 
        type: String, 
        required: true 
    },
    statusCode: { 
        type: Number, 
        required: true 
    },
    ip: { 
        type: String, 
        required: true 
    },
    userAgent: { 
        type: String, 
        required: true 
    },
    responseTime: { 
        type: Number, 
        required: true 
    },
    apiKeyUser: { 
        type: String 
    },
    createdAt: { 
        type: Date, 
        default: Date.now,
        index: true 
    }
});

// Model do Mongoose
const RequestModel = mongoose.model<IRequest>('Request', requestSchema);

export default RequestModel;
