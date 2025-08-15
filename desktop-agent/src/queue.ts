import fs from 'fs';
import path from 'path';
import os from 'os';
import { encrypt, decrypt } from './crypto';

function queueDir(): string {
	const base = process.env.AGENT_DATA_DIR || path.join(os.homedir(), '.ai-pbt-agent');
	if (!fs.existsSync(base)) fs.mkdirSync(base, { recursive: true });
	return base;
}

function queuePath(): string {
	return path.join(queueDir(), 'queue.jsonl.enc');
}

export async function appendEncrypted(obj: unknown): Promise<void> {
	const buf = Buffer.from(JSON.stringify(obj));
	const enc = await encrypt(buf);
	const line = JSON.stringify(enc) + '\n';
	fs.appendFileSync(queuePath(), line);
}

export async function readAndClear(): Promise<Array<any>> {
	const p = queuePath();
	if (!fs.existsSync(p)) return [];
	const content = fs.readFileSync(p, 'utf-8');
	if (!content.trim()) return [];
	const lines = content.split('\n').filter(Boolean);
	const out: Array<any> = [];
	for (const line of lines) {
		try {
			const payload = JSON.parse(line);
			const dec = await decrypt(payload);
			out.push(JSON.parse(dec.toString('utf-8')));
		} catch {}
	}
	// Clear file after reading
	fs.writeFileSync(p, '');
	return out;
}