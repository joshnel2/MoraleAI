import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { ChatSession } from '../models/ChatSession';
import { encryptString } from '../utils/crypto';
import crypto from 'crypto';
import { anonymizeIdentifier } from '../utils/anonymize';
const router = Router();
const aggregateSchema = z.object({
    consent: z.object({ granted: z.boolean(), grantedAt: z.string().datetime().optional(), expiresAt: z.string().datetime().optional(), scope: z.array(z.string()).optional() }),
    employeeAnonymizedId: z.string().optional(),
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
    return res.json({ ok: true, sessionId: String(session._id) });
});
export default router;
//# sourceMappingURL=data.js.map