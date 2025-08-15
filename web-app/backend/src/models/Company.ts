import mongoose, { Schema, Document, Model } from 'mongoose';

export interface CompanyDocument extends Document {
	name: string;
	createdAt: Date;
	updatedAt: Date;
}

const CompanySchema = new Schema<CompanyDocument>(
	{
		name: { type: String, required: true, unique: true }
	},
	{ timestamps: true }
);

export const Company: Model<CompanyDocument> = mongoose.models.Company || mongoose.model<CompanyDocument>('Company', CompanySchema);