import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { audit } from '../middleware/audit';
import crypto from 'crypto';
import { ApiKey } from '../models/ApiKey';
import { uploadTextToS3, downloadTextFromS3 } from '../services/s3';
import { startTrainingJob } from '../services/sagemaker';
import { AggregatedRecord } from '../models/AggregatedRecord';
import { Company } from '../models/Company';
import jwt from 'jsonwebtoken';
import { buildTrainingArtifact } from '../services/trainingArtifact';
import os from 'os';
import path from 'path';

const router = Router();

router.post('/chatbot/deploy', requireAuth, requireRole('admin', 'ceo'), audit('chatbot_deploy'), async (req, res) => {
	return res.status(202).json({ status: 'deployed', configId: 'demo-config' });
});

router.post('/training/aws/start', requireAuth, requireRole('admin', 'ceo'), audit('aws_training_start'), async (req, res) => {
	const s3Bucket = process.env.TRAIN_BUCKET || process.env.S3_DATA_BUCKET;
	const roleArn = process.env.SAGEMAKER_ROLE_ARN || '';
	if (!s3Bucket || !roleArn) return res.status(500).json({ error: 'Missing TRAIN_BUCKET/S3_DATA_BUCKET or SAGEMAKER_ROLE_ARN' });
	const companyId = (req as any).user.companyId;
	const key = `datasets/${companyId}/train.jsonl`;
	await uploadTextToS3(s3Bucket, key, '{}\n');
	const jobName = `ai-pbt-${companyId}-${Date.now()}`;
	await startTrainingJob(jobName, roleArn, `s3://${s3Bucket}/datasets/${companyId}`, `s3://${s3Bucket}/models/${companyId}`);
	return res.status(202).json({ status: 'started', jobId: jobName });
});

router.post('/training/build-artifact', requireAuth, requireRole('admin', 'ceo'), audit('training_build_artifact'), async (req, res) => {
	const tmp = path.join(os.tmpdir(), `ai-pbt-train-${Date.now()}.zip`);
	await buildTrainingArtifact(tmp);
	return res.json({ artifact: tmp });
});

router.post('/datasets/upload', requireAuth, requireRole('admin', 'ceo'), audit('dataset_upload'), async (req, res) => {
	const s3Bucket = process.env.TRAIN_BUCKET || process.env.S3_DATA_BUCKET;
	if (!s3Bucket) return res.status(500).json({ error: 'Missing TRAIN_BUCKET/S3_DATA_BUCKET' });
	const companyId = (req as any).user.companyId;
	const body = JSON.stringify(req.body ?? {});
	const key = `datasets/${companyId}/train.jsonl`;
	await uploadTextToS3(s3Bucket, key, `${body}\n`);
	return res.json({ ok: true, key });
});

router.get('/insights', requireAuth, requireRole('admin', 'ceo'), async (req, res) => {
	const s3Bucket = process.env.TRAIN_BUCKET || process.env.S3_DATA_BUCKET;
	if (!s3Bucket) return res.status(500).json({ error: 'Missing TRAIN_BUCKET/S3_DATA_BUCKET' });
	const companyId = (req as any).user.companyId;
	const key = `models/${companyId}/insights.json`;
	const txt = await downloadTextFromS3(s3Bucket, key);
	return res.json({ insights: txt ? JSON.parse(txt) : [] });
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

router.post('/datasets/aggregate-upload', requireAuth, requireRole('admin', 'ceo'), audit('dataset_aggregate_upload'), async (req, res) => {
	const s3Bucket = process.env.TRAIN_BUCKET || process.env.S3_DATA_BUCKET;
	if (!s3Bucket) return res.status(500).json({ error: 'Missing TRAIN_BUCKET/S3_DATA_BUCKET' });
	const companyId = (req as any).user.companyId;
	const records = await AggregatedRecord.find({ companyId }).limit(1000);
	const lines = records.map(r => JSON.stringify({
		employeeAnonymizedId: r.employeeAnonymizedId,
		period: r.period,
		emotionalState: r.emotionalState,
		opinions: r.opinions,
		metrics: r.metrics
	})).join('\n') + '\n';
	const key = `datasets/${companyId}/train.jsonl`;
	await uploadTextToS3(s3Bucket, key, lines);
	return res.json({ ok: true, key, count: records.length });
});

router.post('/insights/mock-write', requireAuth, requireRole('admin', 'ceo'), audit('insights_mock_write'), async (req, res) => {
	const s3Bucket = process.env.TRAIN_BUCKET || process.env.S3_DATA_BUCKET;
	if (!s3Bucket) return res.status(500).json({ error: 'Missing TRAIN_BUCKET/S3_DATA_BUCKET' });
	const companyId = (req as any).user.companyId;
	const key = `models/${companyId}/insights.json`;
	const insights = req.body?.insights ?? [
		{ title: 'Improve onboarding fairness', detail: 'Standardize mentorship access across teams' }
	];
	await uploadTextToS3(s3Bucket, key, JSON.stringify(insights));
	return res.json({ ok: true });
});

router.post('/extension/activate', requireAuth, requireRole('admin', 'ceo'), audit('extension_activate'), async (req, res) => {
	const companyId = (req as any).user.companyId;
	const { seats = 0 } = req.body || {};
	await Company.findByIdAndUpdate(companyId, { extensionAddonActive: true, extensionSeats: seats });
	return res.json({ ok: true });
});

router.post('/extension/deactivate', requireAuth, requireRole('admin', 'ceo'), audit('extension_deactivate'), async (req, res) => {
	const companyId = (req as any).user.companyId;
	await Company.findByIdAndUpdate(companyId, { extensionAddonActive: false });
	return res.json({ ok: true });
});

router.post('/extension/seats', requireAuth, requireRole('admin', 'ceo'), audit('extension_set_seats'), async (req, res) => {
	const companyId = (req as any).user.companyId;
	const { seats } = req.body || {};
	await Company.findByIdAndUpdate(companyId, { extensionSeats: Math.max(0, Number(seats || 0)) });
	return res.json({ ok: true });
});

router.post('/extension/employee-token', requireAuth, requireRole('admin', 'ceo', 'employee'), async (req, res) => {
	const companyId = (req as any).user.companyId;
	const company = await Company.findById(companyId);
	if (!company?.extensionAddonActive || (company.extensionSeats || 0) <= 0) {
		return res.status(402).json({ error: 'Extension add-on inactive or no seats' });
	}
	const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
	const token = jwt.sign({ userId: (req as any).user.userId, role: 'employee', companyId: String(companyId) }, JWT_SECRET, { expiresIn: '8h' });
	return res.json({ token });
});

router.post('/agent/activate', requireAuth, requireRole('admin', 'ceo'), audit('agent_activate'), async (req, res) => {
	const companyId = (req as any).user.companyId;
	const { seats = 0 } = req.body || {};
	await Company.findByIdAndUpdate(companyId, { agentAddonActive: true, agentSeats: seats });
	return res.json({ ok: true });
});

router.post('/agent/deactivate', requireAuth, requireRole('admin', 'ceo'), audit('agent_deactivate'), async (req, res) => {
	const companyId = (req as any).user.companyId;
	await Company.findByIdAndUpdate(companyId, { agentAddonActive: false });
	return res.json({ ok: true });
});

router.post('/agent/seats', requireAuth, requireRole('admin', 'ceo'), audit('agent_set_seats'), async (req, res) => {
	const companyId = (req as any).user.companyId;
	const { seats } = req.body || {};
	await Company.findByIdAndUpdate(companyId, { agentSeats: Math.max(0, Number(seats || 0)) });
	return res.json({ ok: true });
});

router.post('/agent/ingest', requireAuth, requireRole('employee', 'admin', 'ceo'), audit('agent_ingest'), async (req, res) => {
	// Event schema: { events: [{ ts, app, windowTitle, durationSec, url? }] }
	// Store minimal sample in AggregatedRecord.metrics; in production, use dedicated collection
	const companyId = (req as any).user.companyId;
	const { events = [], period } = req.body || {};
	const employeeAnonymizedId = (req as any).user.userId;
	await AggregatedRecord.create({ companyId, employeeAnonymizedId, period, metrics: { agentEvents: events } });
	return res.json({ ok: true, accepted: events.length });
});

export default router;