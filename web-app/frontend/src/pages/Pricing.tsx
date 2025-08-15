import React, { useMemo, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function Pricing() {
	const [plan, setPlan] = useState<'starter'|'growth'|'scale'>('starter');
	const [seats, setSeats] = useState(10);
	const [extension, setExtension] = useState(true);
	const [agent, setAgent] = useState(false);
	const [annual, setAnnual] = useState(false);
	const [quote, setQuote] = useState<any>(null);
	const client = useMemo(() => axios.create({ baseURL: API_BASE }), []);

	async function getQuote() {
		const res = await client.post('/pricing/quote', { plan, seats, extension, agent, annual });
		setQuote(res.data);
	}

	return (
		<div className="space-y-4">
			<h2 className="text-2xl font-bold">Pricing</h2>
			<div className="flex gap-2 items-center">
				<select className="border p-2" value={plan} onChange={e=>setPlan(e.target.value as any)}>
					<option value="starter">Starter</option>
					<option value="growth">Growth</option>
					<option value="scale">Scale</option>
				</select>
				<input className="border p-2 w-24" type="number" value={seats} onChange={e=>setSeats(parseInt(e.target.value||'0'))} />
				<label><input type="checkbox" checked={extension} onChange={e=>setExtension(e.target.checked)} /> Chrome Extension</label>
				<label><input type="checkbox" checked={agent} onChange={e=>setAgent(e.target.checked)} /> Desktop Agent</label>
				<label><input type="checkbox" checked={annual} onChange={e=>setAnnual(e.target.checked)} /> Annual billing (15% off)</label>
				<button className="px-3 py-2 border rounded" onClick={getQuote}>Get Quote</button>
			</div>
			{quote && (
				<div className="border p-3 rounded">
					<p><strong>Seats:</strong> {quote.seats}</p>
					<p><strong>Monthly:</strong> ${quote.monthly}</p>
					{annual && <p><strong>Monthly (effective with annual):</strong> ${quote.monthlyEffective}</p>}
				</div>
			)}
		</div>
	);
}