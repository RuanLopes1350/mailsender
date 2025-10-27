import mongoose from 'mongoose';

class AdminModel {

    constructor() {
        const adminSchema = new mongoose.Schema({
            username: { type: String, required: true, unique: true },
            password: { type: String, required: true },
        })
        mongoose.model('Admin', adminSchema);
    }
}

export default AdminModel;