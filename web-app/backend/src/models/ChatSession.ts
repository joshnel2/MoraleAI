import mongoose, { Schema, Document, Model } from 'mongoose';

export interface EncryptedMessageDocument extends Document {
	role: 'user' | 'assistant' | 'system';
	ciphertext: string;
	iv: string;
	tag: string;
	createdAt: Date;
}

const EncryptedMessageSchema = new Schema<EncryptedMessageDocument>(
	{
		role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
		ciphertext: { type: String, required: true },
		iv: { type: String, required: true },
		tag: { type: String, required: true },
		createdAt: { type: Date, default: () => new Date() }
	},
	{ _id: false }
);

export interface ChatSessionDocument extends Document {
	companyId: mongoose.Types.ObjectId;
	employeeAnonymizedId: string;
	consent: {
		granted: boolean;
		grantedAt?: Date;
		expiresAt?: Date;
		scope?: string[];
	};
	anonymizationPending: boolean;
	messagesEncrypted: EncryptedMessageDocument[];
	createdAt: Date;
	updatedAt: Date;
}

const ChatSessionSchema = new Schema<ChatSessionDocument>(
	{
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
	},
	{ timestamps: true }
);

export const ChatSession: Model<ChatSessionDocument> = mongoose.models.ChatSession || mongoose.model<ChatSessionDocument>('ChatSession', ChatSessionSchema);