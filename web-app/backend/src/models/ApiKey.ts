import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ApiKeyDocument extends Document {
	companyId: mongoose.Types.ObjectId;
	hash: string; // sha256 hex
	createdAt: Date;
}

const ApiKeySchema = new Schema<ApiKeyDocument>({
	companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
	hash: { type: String, required: true, unique: true }
}, { timestamps: { createdAt: true, updatedAt: false } });

export const ApiKey: Model<ApiKeyDocument> = mongoose.models.ApiKey || mongoose.model<ApiKeyDocument>('ApiKey', ApiKeySchema);