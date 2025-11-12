import mongoose from "mongoose";

export interface IConfig {
    aprovarApiKey: boolean;
    retentativas: number;
    intervaloRetentativas: number;
    rateLimitRequests: number;
    rateLimitWindowMs: number;
}

const configSchema = new mongoose.Schema({
    aprovarApiKey: { type: Boolean, required: true },
    retentativas: { type: Number, required: true },
    intervaloRetentativas: { type: Number, required: true },
    rateLimitRequests: { type: Number, required: true },
    rateLimitWindowMs: { type: Number, required: true },
});

const ConfigModel = mongoose.models.Config || mongoose.model<IConfig>('Config', configSchema);

export default ConfigModel