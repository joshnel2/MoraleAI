import mongoose from 'mongoose';
import { ChatSession } from '../models/ChatSession';

export async function purgeExpiredSessions(): Promise<number> {
	const now = new Date();
	const res = await ChatSession.deleteMany({ expireAt: { $lte: now } });
	return res.deletedCount ?? 0;
}

export async function runPurgeJob(mongoUri: string) {
	await mongoose.connect(mongoUri);
	const deleted = await purgeExpiredSessions();
	// eslint-disable-next-line no-console
	console.log(`Purged ${deleted} expired sessions`);
	await mongoose.disconnect();
}