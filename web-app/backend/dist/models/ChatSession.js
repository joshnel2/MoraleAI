import mongoose, { Schema } from 'mongoose';
const EncryptedMessageSchema = new Schema({
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    ciphertext: { type: String, required: true },
    iv: { type: String, required: true },
    tag: { type: String, required: true },
    createdAt: { type: Date, default: () => new Date() }
}, { _id: false });
const ChatSessionSchema = new Schema({
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    employeeAnonymizedId: { type: String, required: true, index: true },
    consent: {
        granted: { type: Boolean, required: true },
        grantedAt: { type: Date },
        expiresAt: { type: Date },
        scope: [{ type: String }]
    },
    anonymizationPending: { type: Boolean, default: true },
    messagesEncrypted: { type: [EncryptedMessageSchema], default: [] }
}, { timestamps: true });
export const ChatSession = mongoose.models.ChatSession || mongoose.model('ChatSession', ChatSessionSchema);
//# sourceMappingURL=ChatSession.js.map