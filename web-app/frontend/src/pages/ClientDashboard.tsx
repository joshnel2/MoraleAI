import React, { useMemo, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function ClientDashboard() {
	const [token, setToken] = useState<string>('');
	const [seats, setSeats] = useState(10);
	const client = useMemo(() => {
		const inst = axios.create({ baseURL: API_BASE });
		inst.interceptors.request.use((c) => {
			if (token) c.headers.Authorization = `Bearer ${token}`;
			return c;
		});
		return inst;
	}, [token]);

	async function login() {
		const res = await client.post('/auth/login', { email: 'admin@example.com', password: 'examplePass123' });
		setToken(res.data.token);
	}

	async function activate() { await client.post('/platform/extension/activate', { seats }); }
	async function deactivate() { await client.post('/platform/extension/deactivate', {}); }
	async function saveSeats() { await client.post('/platform/extension/seats', { seats }); }
	// Agent controls
	const [agentSeats, setAgentSeats] = useState(10);
	async function agentActivate() { await client.post('/platform/agent/activate', { seats: agentSeats }); }
	async function agentDeactivate() { await client.post('/platform/agent/deactivate', {}); }
	async function agentSaveSeats() { await client.post('/platform/agent/seats', { seats: agentSeats }); }

	// Agent policy
	const [samplingIntervalSec, setSampling] = useState(5);
	const [collectUrls, setCollectUrls] = useState(false);
	const [excludeApps, setExcludeApps] = useState('');
	const [excludeUrlPatterns, setExcludeUrls] = useState('');
	async function loadPolicy() {
		const res = await client.get('/platform/agent/policy');
		const p = res.data.policy;
		setSampling(p.samplingIntervalSec);
		setCollectUrls(p.collectUrls);
		setExcludeApps((p.excludeApps || []).join(','));
		setExcludeUrls((p.excludeUrlPatterns || []).join(','));
	}
	async function savePolicy() {
		await client.post('/platform/agent/policy', {
			samplingIntervalSec: samplingIntervalSec,
			collectUrls,
			excludeApps: excludeApps.split(',').map(s=>s.trim()).filter(Boolean),
			excludeUrlPatterns: excludeUrlPatterns.split(',').map(s=>s.trim()).filter(Boolean)
		});
		alert('Policy saved');
	}

	return (
		<div className="space-y-4">
			<h2 className="text-2xl font-bold">Client Dashboard</h2>
			<p>Business owners can upload metrics, view insights, and interact with the Business AI.</p>
			<div className="space-x-2">
				<button className="px-3 py-2 border rounded" onClick={login}>Quick Login</button>
			</div>
			<div className="border p-3 rounded">
				<h3 className="font-medium mb-2">Chrome Extension Add-on</h3>
				<div className="flex items-center gap-2">
					<label>Seats <input className="border p-1 w-24" type="number" value={seats} onChange={e=>setSeats(parseInt(e.target.value||'0'))} /></label>
					<button className="px-3 py-2 border rounded" onClick={saveSeats} disabled={!token}>Save Seats</button>
					<button className="px-3 py-2 border rounded" onClick={activate} disabled={!token}>Activate</button>
					<button className="px-3 py-2 border rounded" onClick={deactivate} disabled={!token}>Deactivate</button>
				</div>
				<p className="text-sm text-gray-600 mt-2">Add-on is billed per month. Employees can chat, receive assistance, and answer periodic questions to improve business insights.</p>
			</div>
			<div className="border p-3 rounded">
				<h3 className="font-medium mb-2">Desktop Agent Add-on</h3>
				<div className="flex items-center gap-2">
					<label>Seats <input className="border p-1 w-24" type="number" value={agentSeats} onChange={e=>setAgentSeats(parseInt(e.target.value||'0'))} /></label>
					<button className="px-3 py-2 border rounded" onClick={agentSaveSeats} disabled={!token}>Save Seats</button>
					<button className="px-3 py-2 border rounded" onClick={agentActivate} disabled={!token}>Activate</button>
					<button className="px-3 py-2 border rounded" onClick={agentDeactivate} disabled={!token}>Deactivate</button>
				</div>
				<p className="text-sm text-gray-600 mt-2">Desktop app tracks work activity (apps, window titles, time on task) with consent, to enrich business AI training. Priced higher than extension.</p>
			</div>
			<div className="border p-3 rounded">
				<h3 className="font-medium mb-2">Agent Policy</h3>
				<div className="grid gap-2 max-w-xl">
					<label>Sampling (sec) <input className="border p-1 w-24" type="number" value={samplingIntervalSec} onChange={e=>setSampling(parseInt(e.target.value||'5'))} /></label>
					<label><input type="checkbox" checked={collectUrls} onChange={e=>setCollectUrls(e.target.checked)} /> Collect URLs</label>
					<label>Exclude Apps (comma) <input className="border p-1" value={excludeApps} onChange={e=>setExcludeApps(e.target.value)} /></label>
					<label>Exclude URL Patterns (comma regex) <input className="border p-1" value={excludeUrlPatterns} onChange={e=>setExcludeUrls(e.target.value)} /></label>
					<div className="space-x-2">
						<button className="px-3 py-2 border rounded" onClick={loadPolicy} disabled={!token}>Load Policy</button>
						<button className="px-3 py-2 border rounded" onClick={savePolicy} disabled={!token}>Save Policy</button>
					</div>
				</div>
			</div>
		</div>
	);
}