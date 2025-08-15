import mongoose, { Schema, Document, Model } from 'mongoose';

export interface KpiRecordDocument extends Document {
	companyId: mongoose.Types.ObjectId;
	kpiName: string;
	period: string; // e.g., 2025-08 or 2025-Q1
	value: number | string | null;
	unit?: string | null;
	createdAt: Date;
	updatedAt: Date;
}

const KpiRecordSchema = new Schema<KpiRecordDocument>(
	{
		companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
		kpiName: { type: String, required: true },
		period: { type: String, required: true },
		value: { type: Schema.Types.Mixed },
		unit: { type: String }
	},
	{ timestamps: true }
);

KpiRecordSchema.index({ companyId: 1, kpiName: 1, period: 1 });

export const KpiRecord: Model<KpiRecordDocument> = mongoose.models.KpiRecord || mongoose.model<KpiRecordDocument>('KpiRecord', KpiRecordSchema);