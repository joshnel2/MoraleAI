import React, { useMemo, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export function Login() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const client = useMemo(() => axios.create({ baseURL: API_BASE }), []);
	async function submit() {
		const r = await client.post('/auth/login', { email, password });
		localStorage.setItem('token', r.data.token);
		alert('Logged in');
	}
	return (
		<div className="max-w-md space-y-2">
			<h2 className="text-xl font-semibold">Sign in</h2>
			<input className="border p-2 w-full" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
			<input className="border p-2 w-full" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
			<button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={submit}>Login</button>
		</div>
	);
}

export function SignupAdmin() {
	const [companyName, setCompany] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const client = useMemo(() => axios.create({ baseURL: API_BASE }), []);
	async function submit() {
		await client.post('/auth/register-admin', { companyName, email, password });
		alert('Registered admin');
	}
	return (
		<div className="max-w-md space-y-2">
			<h2 className="text-xl font-semibold">Create company admin</h2>
			<input className="border p-2 w-full" placeholder="Company" value={companyName} onChange={e=>setCompany(e.target.value)} />
			<input className="border p-2 w-full" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
			<input className="border p-2 w-full" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
			<button className="px-3 py-2 bg-green-600 text-white rounded" onClick={submit}>Sign up</button>
		</div>
	);
}