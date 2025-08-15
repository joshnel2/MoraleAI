import mongoose, { Schema, Document, Model } from 'mongoose';

export interface AuditLogDocument extends Document {
	companyId: mongoose.Types.ObjectId;
	userId: mongoose.Types.ObjectId;
	action: string;
	meta?: Record<string, unknown>;
	createdAt: Date;
}

const AuditLogSchema = new Schema<AuditLogDocument>(
	{
		companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
		userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		action: { type: String, required: true },
		meta: { type: Schema.Types.Mixed }
	},
	{ timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditLog: Model<AuditLogDocument> = mongoose.models.AuditLog || mongoose.model<AuditLogDocument>('AuditLog', AuditLogSchema);