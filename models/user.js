import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    date: { type: Date, default: Date.now },
    member_status: { type: Boolean, default: false },
    admin: { type: Boolean, default: false }
});

const User = mongoose.model('User', UserSchema);

export default User;