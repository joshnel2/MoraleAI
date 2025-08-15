import { Router } from 'express';

const router = Router();

const PRICING = {
	base: { starter: 49, growth: 39, scale: 29 },
	extension: { starter: 19, growth: 15, scale: 12 },
	agent: { starter: 29, growth: 25, scale: 19 },
	minSeats: 10,
	annualDiscount: 0.15
} as const;

router.get('/tiers', (_req, res) => {
	return res.json({ pricing: PRICING });
});

router.post('/quote', (req, res) => {
	const { plan = 'starter', seats = 10, extension = false, agent = false, annual = false } = req.body || {};
	const s = Math.max(seats, PRICING.minSeats);
	const base = PRICING.base[plan as 'starter'|'growth'|'scale'] * s;
	const ext = extension ? PRICING.extension[plan as 'starter'|'growth'|'scale'] * s : 0;
	const ag = agent ? PRICING.agent[plan as 'starter'|'growth'|'scale'] * s : 0;
	let total = base + ext + ag;
	const monthly = total;
	if (annual) total = Math.round(total * (1 - PRICING.annualDiscount));
	return res.json({ plan, seats: s, extension, agent, annual, monthly, monthlyEffective: total });
});

export default router;