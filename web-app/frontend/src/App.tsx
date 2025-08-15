import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Admin from './pages/Admin';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Pricing from './pages/Pricing';
import { Login, SignupAdmin } from './pages/Auth';

function Home() {
	async function submitDemo(e: any) {
		e.preventDefault();
		const form = new FormData(e.currentTarget);
		await fetch((import.meta as any).env?.VITE_API_BASE || 'http://localhost:4000' + '/marketing/leads', {
			method: 'POST', headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: form.get('name'), email: form.get('email'), company: form.get('company'), message: form.get('message') })
		});
		alert('Demo request submitted');
	}
	return (
		<div className="space-y-6">
			<section className="text-center">
				<h2 className="text-3xl font-extrabold">Private Business AI for Strategy & Employee Insights</h2>
				<p className="text-gray-600 mt-2">Deploy privacy-first chatbots, collect consented insights, and train custom models securely.</p>
				<div className="mt-4 space-x-2">
					<Link className="px-4 py-2 bg-blue-600 text-white rounded inline-block" to="/pricing">See Pricing</Link>
					<a className="px-4 py-2 border rounded inline-block" href="#demo">Request Demo</a>
				</div>
			</section>
			<section className="grid md:grid-cols-3 gap-4">
				<div className="border p-4 rounded"><h3 className="font-semibold">Anonymized Insights</h3><p>Collect emotional and operational signals with strict consent.</p></div>
				<div className="border p-4 rounded"><h3 className="font-semibold">Custom AI Training</h3><p>Train on your data in AWS with ethical alignment.</p></div>
				<div className="border p-4 rounded"><h3 className="font-semibold">Desktop Agent Add-on</h3><p>Assist employees and gather guided feedback securely.</p></div>
			</section>
			<section id="demo" className="border p-4 rounded">
				<h3 className="font-semibold mb-2">Request a Free Demo</h3>
				<form className="grid gap-2 max-w-md" onSubmit={submitDemo}>
					<input name="name" className="border p-2" placeholder="Your name" />
					<input name="email" className="border p-2" placeholder="Business email" />
					<input name="company" className="border p-2" placeholder="Company" />
					<input name="message" className="border p-2" placeholder="Message (optional)" />
					<button className="px-3 py-2 bg-green-600 text-white rounded" type="submit">Request Demo</button>
				</form>
			</section>
		</div>
	);
}

export default function App() {
	return (
		<div className="min-h-screen p-6">
			<h1 className="text-2xl font-bold mb-4">AI-Profile-Business-Tool</h1>
			<nav className="space-x-2 mb-6">
				<Link className="px-3 py-2 border rounded inline-block" to="/">Home</Link>
				<Link className="px-3 py-2 border rounded inline-block" to="/pricing">Pricing</Link>
				<Link className="px-3 py-2 border rounded inline-block" to="/login">Login</Link>
				<Link className="px-3 py-2 border rounded inline-block" to="/signup">Sign up</Link>
				<Link className="px-3 py-2 border rounded inline-block" to="/admin">Admin</Link>
				<Link className="px-3 py-2 border rounded inline-block" to="/client">Client</Link>
				<Link className="px-3 py-2 border rounded inline-block" to="/employee">Employee</Link>
			</nav>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/pricing" element={<Pricing />} />
				<Route path="/login" element={<Login />} />
				<Route path="/signup" element={<SignupAdmin />} />
				<Route path="/admin" element={<AdminDashboard />} />
				<Route path="/client" element={<ClientDashboard />} />
				<Route path="/employee" element={<EmployeeDashboard />} />
			</Routes>
		</div>
	);
}