import crypto from 'crypto';
import keytar from 'keytar';

const SERVICE = 'AI-PBT-Agent';
const KEY_ACCOUNT = 'encryption-key';

async function getKey(): Promise<Buffer> {
	let base64 = await keytar.getPassword(SERVICE, KEY_ACCOUNT);
	if (!base64) {
		const key = crypto.randomBytes(32);
		base64 = key.toString('base64');
		await keytar.setPassword(SERVICE, KEY_ACCOUNT, base64);
	}
	const buf = Buffer.from(base64, 'base64');
	if (buf.length !== 32) throw new Error('Invalid key length');
	return buf;
}

export async function encrypt(data: Buffer): Promise<{ iv: string; tag: string; ciphertext: string }> {
	const key = await getKey();
	const iv = crypto.randomBytes(12);
	const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
	const enc = Buffer.concat([cipher.update(data), cipher.final()]);
	const tag = cipher.getAuthTag();
	return { iv: iv.toString('base64'), tag: tag.toString('base64'), ciphertext: enc.toString('base64') };
}

export async function decrypt(payload: { iv: string; tag: string; ciphertext: string }): Promise<Buffer> {
	const key = await getKey();
	const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(payload.iv, 'base64'));
	decipher.setAuthTag(Buffer.from(payload.tag, 'base64'));
	const dec = Buffer.concat([decipher.update(Buffer.from(payload.ciphertext, 'base64')), decipher.final()]);
	return dec;
}