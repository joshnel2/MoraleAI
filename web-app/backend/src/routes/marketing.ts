import { Router } from 'express';
import { z } from 'zod';
import { Lead } from '../models/Lead';

const router = Router();

const leadSchema = z.object({ name: z.string().min(1), email: z.string().email(), company: z.string().optional(), message: z.string().optional() });

router.post('/leads', async (req, res) => {
	const p = leadSchema.safeParse(req.body);
	if (!p.success) return res.status(400).json({ error: p.error.flatten() });
	const lead = await Lead.create(p.data);
	return res.json({ ok: true, id: String(lead._id) });
});

export default router;