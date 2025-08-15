import fs from 'fs';
import path from 'path';
import os from 'os';

export interface AgentConfig { apiBase: string; companyId?: string; consent?: boolean }

function configPath(): string {
	const dir = process.env.AGENT_DATA_DIR || path.join(os.homedir(), '.ai-pbt-agent');
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
	return path.join(dir, 'config.json');
}

export function loadConfig(): AgentConfig {
	try {
		const p = configPath();
		if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf-8'));
	} catch {}
	return { apiBase: 'http://localhost:4000' };
}

export function saveConfig(cfg: AgentConfig) {
	fs.writeFileSync(configPath(), JSON.stringify(cfg, null, 2));
}