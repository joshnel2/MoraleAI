import { app, BrowserWindow } from 'electron';
import { spawn } from 'child_process';
import path from 'path';
import { loadConfig, saveConfig } from './config';

let win: BrowserWindow | null = null;
let uploader: any = null;

async function createWindow() {
	const cfg = loadConfig();
	win = new BrowserWindow({ width: 480, height: 640, webPreferences: { nodeIntegration: true } });
	await win.loadURL('data:text/html,' + encodeURIComponent(`
		<!doctype html><html><body>
		<h3>AI Business Desktop Agent</h3>
		<label>API URL <input id="api" value="${cfg.apiBase}"/></label><br/>
		<label>Email <input id="email"/></label><br/>
		<label>Password <input id="pass" type="password"/></label><br/>
		<label><input id="consent" type="checkbox" ${cfg.consent ? 'checked' : ''}/> I consent to anonymized tracking</label><br/>
		<button onclick="login()">Login</button>
		<script>
			window.login = async () => {
				const api = document.getElementById('api').value;
				const email = document.getElementById('email').value;
				const pass = document.getElementById('pass').value;
				const consent = document.getElementById('consent').checked;
				if (!consent) { alert('Consent required'); return; }
				const res = await fetch(api + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: pass }) });
				if (!res.ok) { alert('Login failed'); return; }
				const data = await res.json();
				localStorage.setItem('api', api);
				localStorage.setItem('token', data.token);
				localStorage.setItem('consent', 'true');
				alert('Logged in');
			}
		</script>
		</body></html>
	`));

	win.webContents.on('did-finish-load', () => {
		win?.webContents.executeJavaScript('localStorage.getItem("api")').then((api: any) => {
			win?.webContents.executeJavaScript('localStorage.getItem("token")').then((token: any) => {
				win?.webContents.executeJavaScript('localStorage.getItem("consent")').then((consent: any) => {
					if (api) saveConfig({ ...loadConfig(), apiBase: api, consent: consent === 'true' });
					if (api && token && !uploader) {
						uploader = spawn(process.execPath, [path.join(__dirname, 'uploader.js')], { env: { ...process.env, API_BASE: api, TOKEN: token } });
					}
				});
			});
		});
	});
}

app.on('ready', createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });