import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { audit } from '../middleware/audit';
import crypto from 'crypto';
import { ApiKey } from '../models/ApiKey';

const router = Router();

router.post('/chatbot/deploy', requireAuth, requireRole('admin', 'ceo'), audit('chatbot_deploy'), async (req, res) => {
	return res.status(202).json({ status: 'deployed', configId: 'demo-config' });
});

router.post('/training/aws/start', requireAuth, requireRole('admin', 'ceo'), audit('aws_training_start'), async (req, res) => {
	return res.status(202).json({ status: 'started', jobId: 'demo-job' });
});

router.get('/config', requireAuth, async (req, res) => {
	// Company-specific chatbot config (stub)
	return res.json({
		companyId: (req as any).user.companyId,
		prompt: 'Please share how you are feeling today and what is going well or wrong.',
		collectionScope: ['emotions','opinions','personalNotes']
	});
});

router.post('/api-keys/create', requireAuth, requireRole('admin', 'ceo'), audit('api_key_create'), async (req, res) => {
	const companyId = (req as any).user.companyId;
	const raw = crypto.randomBytes(24).toString('hex');
	const hash = crypto.createHash('sha256').update(raw).digest('hex');
	await ApiKey.create({ companyId, hash });
	return res.json({ apiKey: raw });
});

router.get('/api-keys', requireAuth, requireRole('admin', 'ceo'), async (req, res) => {
	const companyId = (req as any).user.companyId;
	const keys = await ApiKey.find({ companyId }).select({ hash: 1, createdAt: 1 });
	return res.json({ keys });
});

export default router;