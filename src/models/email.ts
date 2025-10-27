import mongoose, { Schema, Document } from 'mongoose';

// Interface que representa um email no sistema
export interface IEmail extends Document {
    to: string;
    subject: string;
    template: string;
    data: Record<string, any>;
    status: 'sent' | 'failed' | 'pending';
    apiKeyUser: string;
    sentAt?: Date;
    error?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Schema do Mongoose para Emails
const emailSchema = new Schema<IEmail>({
    to: { 
        type: String, 
        required: true 
    },
    subject: { 
        type: String, 
        required: true 
    },
    template: { 
        type: String, 
        required: true 
    },
    data: { 
        type: Schema.Types.Mixed, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['sent', 'failed', 'pending'], 
        default: 'pending',
        index: true 
    },
    apiKeyUser: { 
        type: String, 
        required: true,
        index: true 
    },
    sentAt: { 
        type: Date 
    },
    error: { 
        type: String 
    },
    createdAt: { 
        type: Date, 
        default: Date.now,
        index: true 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Atualiza o campo updatedAt automaticamente
emailSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Model do Mongoose
const EmailModel = mongoose.model<IEmail>('Email', emailSchema);

export default EmailModel;