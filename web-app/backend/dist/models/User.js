import mongoose, { Schema } from 'mongoose';
const UserSchema = new Schema({
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'ceo', 'employee'], required: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true }
}, { timestamps: true });
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
//# sourceMappingURL=User.js.map