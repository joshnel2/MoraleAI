import mongoose, { Schema } from 'mongoose';
const AuditLogSchema = new Schema({
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true },
    meta: { type: Schema.Types.Mixed }
}, { timestamps: { createdAt: true, updatedAt: false } });
export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
//# sourceMappingURL=AuditLog.js.map