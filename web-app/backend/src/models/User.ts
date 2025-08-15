import mongoose, { Schema, Document, Model } from 'mongoose';

export type UserRole = 'admin' | 'ceo' | 'employee';

export interface UserDocument extends Document {
	email: string;
	passwordHash: string;
	role: UserRole;
	companyId: mongoose.Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
	{
		email: { type: String, required: true, unique: true, index: true },
		passwordHash: { type: String, required: true },
		role: { type: String, enum: ['admin', 'ceo', 'employee'], required: true },
		companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true }
	},
	{ timestamps: true }
);

export const User: Model<UserDocument> = mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);