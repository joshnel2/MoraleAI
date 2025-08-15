import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { audit } from '../middleware/audit';

const router = Router();

router.post('/chatbot/deploy', requireAuth, requireRole('admin', 'ceo'), audit('chatbot_deploy'), async (req, res) => {
	// Accept minimal config; return 202 Accepted
	return res.status(202).json({ status: 'deployed', configId: 'demo-config' });
});

router.post('/training/aws/start', requireAuth, requireRole('admin', 'ceo'), audit('aws_training_start'), async (req, res) => {
	// Stub: kick off training; return job id
	return res.status(202).json({ status: 'started', jobId: 'demo-job' });
});

export default router;