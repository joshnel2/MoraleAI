import mongoose, { Schema, Document, Model } from 'mongoose';

export interface AggregatedRecordDocument extends Document {
	companyId: mongoose.Types.ObjectId;
	employeeAnonymizedId: string;
	period?: string;
	emotionalState?: { happiness?: number; stress?: number; energy?: number };
	opinions?: { whatsRight?: string; whatsWrong?: string };
	metrics?: Record<string, unknown>;
	createdAt: Date;
	updatedAt: Date;
}

const AggregatedRecordSchema = new Schema<AggregatedRecordDocument>({
	companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
	employeeAnonymizedId: { type: String, required: true, index: true },
	period: { type: String },
	emotionalState: { happiness: Number, stress: Number, energy: Number },
	opinions: { whatsRight: String, whatsWrong: String },
	metrics: { type: Schema.Types.Mixed }
}, { timestamps: true });

export const AggregatedRecord: Model<AggregatedRecordDocument> = mongoose.models.AggregatedRecord || mongoose.model<AggregatedRecordDocument>('AggregatedRecord', AggregatedRecordSchema);