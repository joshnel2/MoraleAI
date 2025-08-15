import axios from 'axios';
// @ts-ignore
import activeWin from 'active-win';
import { encrypt } from './crypto';

let apiBase = 'http://localhost:4000';
let token: string | null = null;

function loadConfig() {
	// Replace with persistent config store; for scaffold, use env or defaults
	apiBase = process.env.API_BASE || apiBase;
	token = process.env.TOKEN || token;
}

async function sampleAndUpload() {
	try {
		const aw = await activeWin();
		if (!aw) return;
		if (!apiBase || !token) return;
		const client = axios.create({ baseURL: apiBase, headers: { Authorization: `Bearer ${token}` } });
		const event = { ts: Date.now(), app: aw.owner?.name || aw.owner?.bundleId || 'unknown', windowTitle: aw.title, durationSec: 5, url: (aw as any).url };
		const payload = { period: new Date().toISOString().slice(0,7), events: [event] };
		const enc = await encrypt(Buffer.from(JSON.stringify(payload)));
		await client.post('/platform/agent/ingest', { ...payload, enc });
	} catch {
		// TODO: write to local encrypted cache for retry
	}
}

loadConfig();
setInterval(sampleAndUpload, 5000);