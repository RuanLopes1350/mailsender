import mongoose, { Schema, Document } from 'mongoose';

// Interface que representa uma API Key no sistema
export interface IApiKey extends Document {
    usuario: string;
    apiKey: string;
    createdAt: Date;
    lastUsed: Date | null;
    isActive: boolean;
}

// Schema do Mongoose para API Keys
const apiKeySchema = new Schema<IApiKey>({
    usuario: { 
        type: String, 
        required: true, 
        unique: true,
        index: true 
    },
    apiKey: { 
        type: String, 
        required: true,
        index: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    lastUsed: { 
        type: Date, 
        default: null 
    },
    isActive: { 
        type: Boolean, 
        default: true,
        index: true 
    }
});

// Model do Mongoose
const ApiKeyModel = mongoose.model<IApiKey>('ApiKey', apiKeySchema);

export default ApiKeyModel;