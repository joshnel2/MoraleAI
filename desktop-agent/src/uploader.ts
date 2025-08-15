import axios from 'axios';
// @ts-ignore
import activeWin from 'active-win';

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
		const payload = {
			period: new Date().toISOString().slice(0,7),
			events: [{ ts: Date.now(), app: aw.owner?.name || aw.owner?.bundleId || 'unknown', windowTitle: aw.title, durationSec: 5, url: (aw as any).url }]
		};
		await client.post('/platform/agent/ingest', payload);
	} catch {
		// ignore
	}
}

loadConfig();
setInterval(sampleAndUpload, 5000);