import mongoose, { Schema, Document, Model } from 'mongoose';

export interface CompanyDocument extends Document {
	name: string;
	extensionAddonActive?: boolean;
	extensionSeats?: number;
	agentAddonActive?: boolean;
	agentSeats?: number;
	plan?: 'starter' | 'growth' | 'scale';
	baseSeats?: number;
	createdAt: Date;
	updatedAt: Date;
}

const CompanySchema = new Schema<CompanyDocument>(
	{
		name: { type: String, required: true, unique: true },
		extensionAddonActive: { type: Boolean, default: false },
		extensionSeats: { type: Number, default: 0 },
		agentAddonActive: { type: Boolean, default: false },
		agentSeats: { type: Number, default: 0 },
		plan: { type: String, enum: ['starter', 'growth', 'scale'], default: 'starter' },
		baseSeats: { type: Number, default: 10 }
	},
	{ timestamps: true }
);

export const Company: Model<CompanyDocument> = mongoose.models.Company || mongoose.model<CompanyDocument>('Company', CompanySchema);