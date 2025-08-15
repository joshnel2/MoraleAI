import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { AuditLog } from '../models/AuditLog';

const router = Router();

router.get('/logs', requireAuth, requireRole('admin', 'ceo'), async (req, res) => {
	const companyId = (req as any).user.companyId;
	const limit = Math.min(Number(req.query.limit) || 50, 200);
	const cursor = (req.query.cursor as string) || undefined;
	const query: any = { companyId };
	if (cursor) query._id = { $lt: cursor };
	const logs = await AuditLog.find(query).sort({ _id: -1 }).limit(limit + 1);
	const nextCursor = logs.length > limit ? String(logs[limit - 1]._id) : null;
	return res.json({ logs: logs.slice(0, limit), nextCursor });
});

export default router;