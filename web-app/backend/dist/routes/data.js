import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { ChatSession } from '../models/ChatSession';
import { encryptString } from '../utils/crypto';
import crypto from 'crypto';
import { anonymizeIdentifier } from '../utils/anonymize';
import { AggregatedRecord } from '../models/AggregatedRecord';
const router = Router();
const aggregateSchema = z.object({
    consent: z.object({ granted: z.boolean(), grantedAt: z.string().datetime().optional(), expiresAt: z.string().datetime().optional(), scope: z.array(z.string()).optional() }),
    employeeAnonymizedId: z.string().optional(),
    emotionalState: z.object({ happiness: z.number().min(1).max(10).optional(), stress: z.number().min(1).max(10).optional(), energy: z.number().min(1).max(10).optional() }).optional(),
    opinions: z.object({ whatsRight: z.string().max(4000).optional(), whatsWrong: z.string().max(4000).optional() }).optional(),
    personalNotes: z.string().max(8000).optional(),
    period: z.string().optional(),
    messages: z.array(z.object({ role: z.enum(['user', 'assistant', 'system']), text: z.string() })).default([]),
    businessMetrics: z.any().optional()
});
router.post('/aggregate', requireAuth, async (req, res) => {
    const parse = aggregateSchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: parse.error.flatten() });
    const { consent, messages } = parse.data;
    if (!consent.granted)
        return res.status(400).json({ error: 'Consent not granted' });
    const encMessages = messages.map((m) => {
        const enc = encryptString(m.text);
        return { role: m.role, ciphertext: enc.ciphertext, iv: enc.iv, tag: enc.tag };
    });
    const expireAt = consent.expiresAt ? new Date(consent.expiresAt) : undefined;
    let employeeAnonymizedId = parse.data.employeeAnonymizedId;
    if (!employeeAnonymizedId)
        employeeAnonymizedId = crypto.randomUUID();
    if (!/^[0-9a-fA-F-]{36}$/.test(employeeAnonymizedId))
        employeeAnonymizedId = anonymizeIdentifier(employeeAnonymizedId);
    const session = await ChatSession.create({
        companyId: req.user.companyId,
        employeeAnonymizedId,
        consent: {
            granted: true,
            grantedAt: consent.grantedAt ? new Date(consent.grantedAt) : new Date(),
            expiresAt: expireAt,
            scope: consent.scope
        },
        expireAt,
        anonymizationPending: true,
        messagesEncrypted: encMessages
    });
    // Store aggregated view for training
    const periodVal = parse.data.period || new Date().toISOString().slice(0, 7);
    await AggregatedRecord.create({
        companyId: req.user.companyId,
        employeeAnonymizedId,
        period: periodVal,
        emotionalState: parse.data.emotionalState,
        opinions: parse.data.opinions,
        metrics: parse.data.businessMetrics
    });
    return res.json({ ok: true, sessionId: String(session._id) });
});
export default router;
//# sourceMappingURL=data.js.map