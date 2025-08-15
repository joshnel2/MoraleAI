import crypto from 'crypto';

export function anonymizeIdentifier(raw: string): string {
	const hash = crypto.createHash('sha256').update(raw).digest('hex');
	// Format as UUID v4-like for consistency (not a real UUID from raw)
	return `${hash.slice(0,8)}-${hash.slice(8,12)}-${hash.slice(12,16)}-${hash.slice(16,20)}-${hash.slice(20,32)}`;
}