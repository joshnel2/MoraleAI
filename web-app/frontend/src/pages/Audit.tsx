import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { getToken } from '../utils/auth';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

interface AuditRow { _id: string; action: string; createdAt: string; meta?: Record<string, unknown>; }

export default function Audit() {
	const [rows, setRows] = useState<AuditRow[]>([]);
	const [cursor, setCursor] = useState<string | null>(null);
	const client = useMemo(() => {
		const inst = axios.create({ baseURL: API_BASE });
		inst.interceptors.request.use((c) => {
			const t = getToken();
			if (t) c.headers.Authorization = `Bearer ${t}`;
			return c;
		});
		return inst;
	}, []);

	async function load(next?: string | null) {
		const res = await client.get('/audit/logs', { params: { limit: 50, cursor: next ?? undefined } });
		setRows(next ? [...rows, ...res.data.logs] : res.data.logs);
		setCursor(res.data.nextCursor);
	}

	useEffect(() => { load(); }, []);

	return (
		<div>
			<h2 className="text-xl font-semibold mb-2">Audit Logs</h2>
			<div className="border rounded p-3 h-72 overflow-auto bg-white">
				{rows.map((r) => (
					<div key={r._id} className="text-sm border-b py-1">
						<span className="font-mono text-gray-600">{new Date(r.createdAt).toLocaleString()}</span>
						<span className="ml-2 font-semibold">{r.action}</span>
					</div>
				))}
			</div>
			{cursor && <button className="mt-2 px-3 py-1 border rounded" onClick={() => load(cursor)}>Load more</button>}
		</div>
	);
}