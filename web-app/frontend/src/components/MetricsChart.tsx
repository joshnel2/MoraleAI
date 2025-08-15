import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Chart } from 'chart.js';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

type SummaryRow = { _id: { kpiName: string; period: string }; count: number };

export default function MetricsChart() {
	const [data, setData] = useState<SummaryRow[]>([]);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const [token, setToken] = useState<string | null>(null);

	const client = useMemo(() => {
		const inst = axios.create({ baseURL: API_BASE });
		inst.interceptors.request.use((c) => {
			if (token) c.headers.Authorization = `Bearer ${token}`;
			return c;
		});
		return inst;
	}, [token]);

	useEffect(() => {
		(async () => {
			try {
				const res = await fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'admin@example.com', password: 'examplePass123' }) });
				if (res.ok) {
					const d = await res.json();
					setToken(d.token);
				}
			} catch {}
		})();
	}, []);

	useEffect(() => {
		if (!token) return;
		client.get('/metrics/summary').then((res) => setData(res.data.summary)).catch(() => setData([]));
	}, [client, token]);

	useEffect(() => {
		if (!canvasRef.current) return;
		const grouped = new Map<string, Array<{ period: string; count: number }>>();
		for (const r of data) {
			const kpi = r._id.kpiName;
			if (!grouped.has(kpi)) grouped.set(kpi, []);
			grouped.get(kpi)!.push({ period: r._id.period, count: r.count });
		}
		const labels = Array.from(new Set(data.map((r) => r._id.period))).sort();
		const datasets = Array.from(grouped.entries()).map(([kpiName, rows], i) => ({
			label: kpiName,
			backgroundColor: `hsl(${(i * 77) % 360} 70% 60%)`,
			data: labels.map((p) => rows.find((r) => r.period === p)?.count ?? 0)
		}));
		const chart = new Chart(canvasRef.current, {
			type: 'bar',
			data: { labels, datasets },
			options: { responsive: true, maintainAspectRatio: false }
		});
		return () => chart.destroy();
	}, [data]);

	return (
		<div style={{ height: 320 }}>
			<canvas ref={canvasRef} />
		</div>
	);
}