import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Admin from './pages/Admin';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';

export default function App() {
	return (
		<div className="min-h-screen p-6">
			<h1 className="text-2xl font-bold mb-4">AI-Profile-Business-Tool</h1>
			<nav className="space-x-2 mb-6">
				<Link className="px-3 py-2 border rounded inline-block" to="/">Home</Link>
				<Link className="px-3 py-2 border rounded inline-block" to="/admin">Admin</Link>
				<Link className="px-3 py-2 border rounded inline-block" to="/client">Client</Link>
				<Link className="px-3 py-2 border rounded inline-block" to="/employee">Employee</Link>
			</nav>
			<Routes>
				<Route path="/" element={<Admin />} />
				<Route path="/admin" element={<AdminDashboard />} />
				<Route path="/client" element={<ClientDashboard />} />
				<Route path="/employee" element={<EmployeeDashboard />} />
			</Routes>
		</div>
	);
}