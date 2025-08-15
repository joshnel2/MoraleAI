import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth';
import { audit } from '../middleware/audit';
import { KpiRecord } from '../models/KpiRecord';

const router = Router();

const kpiSchema = z.object({ kpiName: z.string(), period: z.string(), value: z.union([z.number(), z.string(), z.null()]).optional(), unit: z.string().nullable().optional() });
const uploadSchema = z.object({ records: z.array(kpiSchema) });

router.post('/upload', requireAuth, requireRole('admin', 'ceo'), audit('kpi_upload'), async (req, res) => {
	const parse = uploadSchema.safeParse(req.body);
	if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
	const companyId = (req as any).user.companyId;
	const docs = parse.data.records.map((r) => ({ companyId, kpiName: r.kpiName, period: r.period, value: r.value ?? null, unit: r.unit ?? null }));
	await KpiRecord.insertMany(docs);
	return res.json({ ok: true, inserted: docs.length });
});

router.get('/summary', requireAuth, requireRole('admin', 'ceo'), async (req, res) => {
	const companyId = (req as any).user.companyId;
	const summary = await KpiRecord.aggregate([
		{ $match: { companyId } },
		{ $group: { _id: { kpiName: '$kpiName', period: '$period' }, count: { $sum: 1 } } },
		{ $sort: { '_id.kpiName': 1, '_id.period': 1 } }
	]);
	return res.json({ summary });
});

export default router;