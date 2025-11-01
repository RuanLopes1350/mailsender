import mongoose from 'mongoose';

export interface IAdmin {
    username: string;
    password: string;
}

// Schema do Admin
const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const AdminModel = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', adminSchema);

export default AdminModel;