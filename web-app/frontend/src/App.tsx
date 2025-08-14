import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import ChatPreview from './components/ChatPreview';
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

function useAuthToken() {
	const [token, setToken] = useState<string | null>(null);
	const login = async () => {
		const res = await axios.post(`${API_BASE}/auth/login`, { username: 'demo', password: 'demo' });
		setToken(res.data.token);
	};
	return { token, login };
}

export default function App() {
	const { token, login } = useAuthToken();
	const client = useMemo(() => {
		const instance = axios.create({ baseURL: API_BASE });
		instance.interceptors.request.use((config) => {
			if (token) config.headers.Authorization = `Bearer ${token}`;
			return config;
		});
		return instance;
	}, [token]);

	return (
		<div className="min-h-screen p-6">
			<h1 className="text-2xl font-bold mb-4">AI-Profile-Business-Tool</h1>
			<div className="space-x-2 mb-6">
				<button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={login}>Login</button>
				<button className="px-4 py-2 bg-green-600 text-white rounded" onClick={async () => {
					await client.post('/company/register', {});
				}}>Register Company</button>
				<button className="px-4 py-2 bg-purple-600 text-white rounded" onClick={async () => {
					await client.post('/chatbot/deploy', {});
				}}>Deploy Chatbot</button>
			</div>

			<section className="grid gap-6 md:grid-cols-2">
				<div className="border rounded p-4">
					<h2 className="font-semibold mb-2">Data Upload (metrics)</h2>
					<button className="px-3 py-2 bg-gray-800 text-white rounded" onClick={async () => {
						await client.post('/data/aggregate', {
							consent: { granted: true },
							businessMetrics: { kpiReferences: [ { kpiName: 'sales', period: '2025-08', value: 12345 } ] }
						});
					}}>Upload & Aggregate</button>
				</div>

				<div className="border rounded p-4">
					<h2 className="font-semibold mb-2">Visualization</h2>
					<p>Charts driven by aggregated anonymized data (stub).</p>
				</div>
			</section>

			<section className="mt-6 border rounded p-4">
				<h2 className="font-semibold mb-2">Chatbot Setup (admin)</h2>
				<p>Configure prompts, tone, and data collection scopes (stub).</p>
			</section>

			<section className="mt-6 border rounded p-4">
				<h2 className="font-semibold mb-2">Chatbot Preview</h2>
				<ChatPreview />
			</section>
		</div>
	);
}