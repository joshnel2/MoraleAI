import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth';
import { audit } from '../middleware/audit';
import { KpiRecord } from '../models/KpiRecord';
import multer from 'multer';
import { parse } from 'csv-parse/sync';

const router = Router();

const kpiSchema = z.object({ kpiName: z.string(), period: z.string(), value: z.union([z.number(), z.string(), z.null()]).optional(), unit: z.string().nullable().optional() });
const uploadSchema = z.object({ records: z.array(kpiSchema) });

router.post('/upload', requireAuth, requireRole('admin', 'ceo'), audit('kpi_upload'), async (req, res) => {
	const parseRes = uploadSchema.safeParse(req.body);
	if (!parseRes.success) return res.status(400).json({ error: parseRes.error.flatten() });
	const companyId = (req as any).user.companyId;
	const docs = parseRes.data.records.map((r) => ({ companyId, kpiName: r.kpiName, period: r.period, value: r.value ?? null, unit: r.unit ?? null }));
	await KpiRecord.insertMany(docs);
	return res.json({ ok: true, inserted: docs.length });
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/upload-csv', requireAuth, requireRole('admin', 'ceo'), audit('kpi_upload_csv'), upload.single('file'), async (req, res) => {
	if (!req.file) return res.status(400).json({ error: 'Missing file' });
	const csv = req.file.buffer.toString('utf8');
	let records: Array<{ kpiName: string; period: string; value?: number | string | null; unit?: string | null }> = [];
	try {
		const parsed = parse(csv, { columns: true, skip_empty_lines: true, trim: true });
		records = (parsed as any[]).map((row) => ({
			kpiName: String(row.kpiName || row.KPI || row.kpi || '').trim(),
			period: String(row.period || row.Period || '').trim(),
			value: row.value ?? row.Value ?? null,
			unit: (row.unit ?? row.Unit ?? null) as string | null
		})).filter(r => r.kpiName && r.period);
	} catch (e) {
		return res.status(400).json({ error: 'Failed to parse CSV' });
	}
	const companyId = (req as any).user.companyId;
	const docs = records.map((r) => ({ companyId, kpiName: r.kpiName, period: r.period, value: r.value ?? null, unit: r.unit ?? null }));
	if (docs.length === 0) return res.status(400).json({ error: 'No valid rows' });
	await KpiRecord.insertMany(docs);
	return res.json({ ok: true, inserted: docs.length });
});

router.get('/summary', requireAuth, requireRole('admin', 'ceo'), async (req, res) => {
	const companyId = (req as any).user.companyId;
	const kpis = typeof req.query.kpis === 'string' ? (req.query.kpis as string).split(',').map(s=>s.trim()).filter(Boolean) : undefined;
	const periodFrom = typeof req.query.periodFrom === 'string' ? (req.query.periodFrom as string) : undefined;
	const periodTo = typeof req.query.periodTo === 'string' ? (req.query.periodTo as string) : undefined;
	const match: any = { companyId };
	if (kpis && kpis.length) match.kpiName = { $in: kpis };
	if (periodFrom || periodTo) {
		match.period = {};
		if (periodFrom) match.period.$gte = periodFrom;
		if (periodTo) match.period.$lte = periodTo;
	}
	const summary = await KpiRecord.aggregate([
		{ $match: match },
		{ $group: { _id: { kpiName: '$kpiName', period: '$period' }, count: { $sum: 1 } } },
		{ $sort: { '_id.kpiName': 1, '_id.period': 1 } }
	]);
	return res.json({ summary });
});

router.get('/kpis', requireAuth, requireRole('admin', 'ceo'), async (req, res) => {
	const companyId = (req as any).user.companyId;
	const names = await KpiRecord.distinct('kpiName', { companyId });
	return res.json({ kpis: names });
});

export default router;