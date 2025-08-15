import crypto from 'crypto';

function getKey(): Buffer {
	const base64 = process.env.ENCRYPTION_KEY_BASE64;
	if (base64) {
		const key = Buffer.from(base64, 'base64');
		if (key.length !== 32) throw new Error('ENCRYPTION_KEY_BASE64 must decode to 32 bytes');
		return key;
	}
	// Dev fallback only
	return crypto.createHash('sha256').update('insecure-dev-key-change-me').digest();
}

export function encryptString(plaintext: string): { ciphertext: string; iv: string; tag: string } {
	const key = getKey();
	const iv = crypto.randomBytes(12);
	const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
	const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
	const tag = cipher.getAuthTag();
	return {
		ciphertext: encrypted.toString('base64'),
		iv: iv.toString('base64'),
		tag: tag.toString('base64')
	};
}

export function decryptString({ ciphertext, iv, tag }: { ciphertext: string; iv: string; tag: string }): string {
	const key = getKey();
	const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'));
	decipher.setAuthTag(Buffer.from(tag, 'base64'));
	const decrypted = Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64')), decipher.final()]);
	return decrypted.toString('utf8');
}