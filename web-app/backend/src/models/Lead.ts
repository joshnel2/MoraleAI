import mongoose, { Schema, Document, Model } from 'mongoose';

export interface LeadDocument extends Document {
	name: string;
	email: string;
	company?: string;
	message?: string;
	createdAt: Date;
}

const LeadSchema = new Schema<LeadDocument>({
	name: { type: String, required: true },
	email: { type: String, required: true, index: true },
	company: { type: String },
	message: { type: String }
}, { timestamps: { createdAt: true, updatedAt: false } });

export const Lead: Model<LeadDocument> = mongoose.models.Lead || mongoose.model<LeadDocument>('Lead', LeadSchema);