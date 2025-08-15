import React, { useMemo, useState } from 'react';
import Papa from 'papaparse';
import axios from 'axios';
import { getToken } from '../utils/auth';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

type Row = Record<string, string>;

export default function CsvMapper() {
	const [rows, setRows] = useState<Row[]>([]);
	const [headers, setHeaders] = useState<string[]>([]);
	const [kpiCol, setKpiCol] = useState('');
	const [periodCol, setPeriodCol] = useState('');
	const [valueCol, setValueCol] = useState('');
	const [unitCol, setUnitCol] = useState('');

	const client = useMemo(() => {
		const inst = axios.create({ baseURL: API_BASE });
		inst.interceptors.request.use((c) => {
			const t = getToken();
			if (t) c.headers.Authorization = `Bearer ${t}`;
			return c;
		});
		return inst;
	}, []);

	function onFile(file: File) {
		Papa.parse<Row>(file, { header: true, skipEmptyLines: true, complete: (res) => {
			const hdrs = res.meta.fields || [];
			setHeaders(hdrs);
			setRows(res.data.slice(0, 200));
		}});
	}

	async function submit() {
		const records = rows.map((r) => ({
			kpiName: r[kpiCol],
			period: r[periodCol],
			value: r[valueCol] ?? null,
			unit: r[unitCol] ?? null
		})).filter((r) => r.kpiName && r.period);
		await client.post('/metrics/upload', { records });
	}

	return (
		<div className="border p-3 rounded">
			<h3 className="font-medium mb-2">CSV Mapping Upload</h3>
			<input type="file" accept=".csv" onChange={(e)=> e.target.files && onFile(e.target.files[0])} />
			{headers.length > 0 && (
				<div className="grid grid-cols-2 gap-2 mt-2">
					<select className="border p-2" value={kpiCol} onChange={e=>setKpiCol(e.target.value)}>
						<option value="">Select KPI column</option>
						{headers.map(h => <option key={h} value={h}>{h}</option>)}
					</select>
					<select className="border p-2" value={periodCol} onChange={e=>setPeriodCol(e.target.value)}>
						<option value="">Select Period column</option>
						{headers.map(h => <option key={h} value={h}>{h}</option>)}
					</select>
					<select className="border p-2" value={valueCol} onChange={e=>setValueCol(e.target.value)}>
						<option value="">Select Value column</option>
						{headers.map(h => <option key={h} value={h}>{h}</option>)}
					</select>
					<select className="border p-2" value={unitCol} onChange={e=>setUnitCol(e.target.value)}>
						<option value="">Select Unit column (optional)</option>
						{headers.map(h => <option key={h} value={h}>{h}</option>)}
					</select>
					<div className="col-span-2">
						<button className="px-3 py-2 bg-indigo-600 text-white rounded" onClick={submit} disabled={!kpiCol || !periodCol}>Submit</button>
					</div>
				</div>
			)}
		</div>
	);
}