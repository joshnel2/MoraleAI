import React, { useState } from 'react';

export default function EmployeeDashboard() {
	const [message, setMessage] = useState('');
	return (
		<div className="space-y-4">
			<h2 className="text-2xl font-bold">Employee Assistant</h2>
			<p>Ask the AI for assistance and provide consent-based personal insights.</p>
			<div className="flex gap-2">
				<input className="border p-2 flex-1" value={message} onChange={e=>setMessage(e.target.value)} placeholder="Type your question" />
				<button className="px-3 py-2 bg-blue-600 text-white rounded">Send</button>
			</div>
		</div>
	);
}