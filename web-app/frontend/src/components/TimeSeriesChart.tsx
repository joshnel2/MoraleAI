import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Chart, LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { getToken } from '../utils/auth';

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

interface SeriesPoint { period: string; count: number; sum: number; avg: number | null }

export default function TimeSeriesChart() {
	const [kpis, setKpis] = useState<string[]>([]);
	const [selected, setSelected] = useState<string>('');
	const [points, setPoints] = useState<SeriesPoint[]>([]);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	const client = useMemo(() => {
		const inst = axios.create({ baseURL: API_BASE });
		inst.interceptors.request.use((c) => {
			const t = getToken();
			if (t) c.headers.Authorization = `Bearer ${t}`;
			return c;
		});
		return inst;
	}, []);

	useEffect(() => {
		client.get('/metrics/kpis').then((res)=> {
			setKpis(res.data.kpis || []);
			if ((res.data.kpis || []).length > 0) setSelected(res.data.kpis[0]);
		}).catch(()=>setKpis([]));
	}, [client]);

	useEffect(() => {
		if (!selected) return;
		client.get('/metrics/series', { params: { kpi: selected } }).then((res) => setPoints(res.data.series || [])).catch(()=>setPoints([]));
	}, [client, selected]);

	useEffect(() => {
		if (!canvasRef.current) return;
		const labels = points.map(p => p.period);
		const chart = new Chart(canvasRef.current, {
			type: 'line',
			data: {
				labels,
				datasets: [
					{ label: 'Count', data: points.map(p => p.count), borderColor: 'hsl(210 80% 50%)', backgroundColor: 'hsl(210 80% 50% / 0.2)', tension: 0.2 },
					{ label: 'Average', data: points.map(p => p.avg ?? null), borderColor: 'hsl(140 60% 45%)', backgroundColor: 'hsl(140 60% 45% / 0.2)', tension: 0.2 }
				]
			},
			options: { responsive: true, maintainAspectRatio: false }
		});
		return () => chart.destroy();
	}, [points]);

	return (
		<div className="border rounded p-3">
			<h3 className="font-medium mb-2">Time Series</h3>
			<div className="mb-2">
				<select className="border p-2" value={selected} onChange={(e)=>setSelected(e.target.value)}>
					{kpis.map((k) => <option key={k} value={k}>{k}</option>)}
				</select>
			</div>
			<div style={{ height: 300 }}>
				<canvas ref={canvasRef} />
			</div>
		</div>
	);
}