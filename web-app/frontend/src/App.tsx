import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import ChatPreview from './components/ChatPreview';
import Admin from './pages/Admin';
import { saveToken, getToken, clearToken } from './utils/auth';
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

function useAuthToken() {
	const [token, setToken] = useState<string | null>(getToken());
	const login = async () => {
		const res = await axios.post(`${API_BASE}/auth/login`, { email: 'admin@example.com', password: 'examplePass123' });
		saveToken(res.data.token);
		setToken(res.data.token);
	};
	const logout = () => { clearToken(); setToken(null); };
	return { token, login, logout };
}

export default function App() {
	const { token, login, logout } = useAuthToken();
	const client = useMemo(() => {
		const instance = axios.create({ baseURL: API_BASE });
		instance.interceptors.request.use((config) => {
			const t = getToken();
			if (t) config.headers.Authorization = `Bearer ${t}`;
			return config;
		});
		return instance;
	}, [token]);

	const [route, setRoute] = useState<'home' | 'admin'>('home');

	return (
		<div className="min-h-screen p-6">
			<h1 className="text-2xl font-bold mb-4">AI-Profile-Business-Tool</h1>
			<div className="space-x-2 mb-6">
				<button className="px-3 py-2 border rounded" onClick={() => setRoute('home')}>Home</button>
				<button className="px-3 py-2 border rounded" onClick={() => setRoute('admin')}>Admin</button>
				{token ? (
					<button className="px-3 py-2 border rounded" onClick={logout}>Logout</button>
				) : (
					<button className="px-3 py-2 border rounded" onClick={login}>Quick Login</button>
				)}
			</div>

			{route === 'admin' ? (
				<Admin />
			) : (
				<>
					<section className="grid gap-6 md:grid-cols-2">
						<div className="border rounded p-4">
							<h2 className="font-semibold mb-2">Data Upload (metrics)</h2>
							<p>Use Admin tab for KPI uploads.</p>
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
				</>
			)}
		</div>
	);
}