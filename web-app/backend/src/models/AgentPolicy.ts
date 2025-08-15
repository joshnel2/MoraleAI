import mongoose, { Schema, Document, Model } from 'mongoose';

export interface AgentPolicyDocument extends Document {
	companyId: mongoose.Types.ObjectId;
	samplingIntervalSec: number;
	collectUrls: boolean;
	excludeApps: string[]; // simple name matches
	excludeUrlPatterns: string[]; // regex strings
	updatedAt: Date;
}

const AgentPolicySchema = new Schema<AgentPolicyDocument>({
	companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, unique: true, index: true },
	samplingIntervalSec: { type: Number, default: 5 },
	collectUrls: { type: Boolean, default: false },
	excludeApps: { type: [String], default: [] },
	excludeUrlPatterns: { type: [String], default: [] }
}, { timestamps: { createdAt: false, updatedAt: true } });

export const AgentPolicy: Model<AgentPolicyDocument> = mongoose.models.AgentPolicy || mongoose.model<AgentPolicyDocument>('AgentPolicy', AgentPolicySchema);