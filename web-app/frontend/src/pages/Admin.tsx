import React, { useMemo, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function Admin() {
	const [token, setToken] = useState<string>('');
	const [companyName, setCompanyName] = useState('Acme Inc');
	const [email, setEmail] = useState('admin@example.com');
	const [password, setPassword] = useState('examplePass123');
	const [kpiJson, setKpiJson] = useState('{"records":[{"kpiName":"sales","period":"2025-08","value":12345}]}');

	const client = useMemo(() => {
		const inst = axios.create({ baseURL: API_BASE });
		inst.interceptors.request.use((c) => {
			if (token) c.headers.Authorization = `Bearer ${token}`;
			return c;
		});
		return inst;
	}, [token]);

	async function registerAdmin() {
		await client.post('/auth/register-admin', { companyName, email, password });
	}

	async function login() {
		const res = await client.post('/auth/login', { email, password });
		setToken(res.data.token);
	}

	async function uploadKpis() {
		const payload = JSON.parse(kpiJson);
		await client.post('/metrics/upload', payload);
	}

	return (
		<div className="space-y-4">
			<h2 className="text-xl font-semibold">Admin</h2>
			<div className="grid gap-2 md:grid-cols-2">
				<div className="border p-3 rounded">
					<h3 className="font-medium mb-2">Register Company Admin</h3>
					<input className="border p-2 w-full mb-2" value={companyName} onChange={e=>setCompanyName(e.target.value)} placeholder="Company Name" />
					<input className="border p-2 w-full mb-2" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
					<input className="border p-2 w-full mb-2" value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" />
					<button className="px-3 py-2 bg-green-600 text-white rounded" onClick={registerAdmin}>Register</button>
				</div>
				<div className="border p-3 rounded">
					<h3 className="font-medium mb-2">Login</h3>
					<input className="border p-2 w-full mb-2" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
					<input className="border p-2 w-full mb-2" value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" />
					<button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={login}>Login</button>
					{token && <p className="mt-2 text-sm text-green-700">Token acquired.</p>}
				</div>
			</div>
			<div className="border p-3 rounded">
				<h3 className="font-medium mb-2">Upload KPIs (JSON)</h3>
				<textarea className="border p-2 w-full h-40 font-mono" value={kpiJson} onChange={e=>setKpiJson(e.target.value)} />
				<div className="mt-2">
					<button className="px-3 py-2 bg-purple-600 text-white rounded" onClick={uploadKpis} disabled={!token}>Upload</button>
				</div>
			</div>
		</div>
	);
}