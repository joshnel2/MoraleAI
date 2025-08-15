import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { audit } from '../middleware/audit';
import crypto from 'crypto';
import { ApiKey } from '../models/ApiKey';
import { uploadTextToS3 } from '../services/s3';
import { startTrainingJob } from '../services/sagemaker';

const router = Router();

router.post('/chatbot/deploy', requireAuth, requireRole('admin', 'ceo'), audit('chatbot_deploy'), async (req, res) => {
	return res.status(202).json({ status: 'deployed', configId: 'demo-config' });
});

router.post('/training/aws/start', requireAuth, requireRole('admin', 'ceo'), audit('aws_training_start'), async (req, res) => {
	const s3Bucket = process.env.TRAIN_BUCKET || process.env.S3_DATA_BUCKET;
	const roleArn = process.env.SAGEMAKER_ROLE_ARN || '';
	if (!s3Bucket || !roleArn) return res.status(500).json({ error: 'Missing TRAIN_BUCKET/S3_DATA_BUCKET or SAGEMAKER_ROLE_ARN' });
	const companyId = (req as any).user.companyId;
	// Upload minimal dataset stub (in practice aggregate/anonymize first)
	const key = `datasets/${companyId}/train.jsonl`;
	await uploadTextToS3(s3Bucket, key, '{}\n');
	const jobName = `ai-pbt-${companyId}-${Date.now()}`;
	await startTrainingJob(jobName, roleArn, `s3://${s3Bucket}/datasets/${companyId}`, `s3://${s3Bucket}/models/${companyId}`);
	return res.status(202).json({ status: 'started', jobId: jobName });
});

router.get('/config', requireAuth, async (req, res) => {
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