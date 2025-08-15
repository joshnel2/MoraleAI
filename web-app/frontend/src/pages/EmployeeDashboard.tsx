import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function EmployeeDashboard() {
	const [message, setMessage] = useState('');
	const [recs, setRecs] = useState<any>(null);
	const client = useMemo(() => axios.create({ baseURL: API_BASE }), []);
	useEffect(() => { client.get('/platform/recommendations').then(r=>setRecs(r.data.recommendations)).catch(()=>{}); }, []);
	return (
		<div className="space-y-4">
			<h2 className="text-2xl font-bold">Employee Assistant</h2>
			<p>Ask the AI for assistance and provide consent-based personal insights.</p>
			<div className="flex gap-2">
				<input className="border p-2 flex-1" value={message} onChange={e=>setMessage(e.target.value)} placeholder="Type your question" />
				<button className="px-3 py-2 bg-blue-600 text-white rounded">Send</button>
			</div>
			{recs && (
				<div className="grid md:grid-cols-3 gap-3">
					<div className="border p-3 rounded"><h3 className="font-semibold">Strategy</h3><pre className="text-xs">{JSON.stringify(recs.strategy, null, 2)}</pre></div>
					<div className="border p-3 rounded"><h3 className="font-semibold">Automations</h3><pre className="text-xs">{JSON.stringify(recs.automations, null, 2)}</pre></div>
					<div className="border p-3 rounded"><h3 className="font-semibold">Tasks</h3><pre className="text-xs">{JSON.stringify(recs.tasks, null, 2)}</pre></div>
				</div>
			)}
		</div>
	);
}