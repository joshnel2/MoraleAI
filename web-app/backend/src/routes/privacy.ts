import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { audit } from '../middleware/audit';

const router = Router();

router.post('/data/delete-request', requireAuth, audit('delete_request'), async (req, res) => {
	// Record delete request; in production, queue a job to purge after verification
	return res.json({ ok: true });
});

export default router;