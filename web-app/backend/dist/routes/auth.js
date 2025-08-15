import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { Company } from '../models/Company';
import { User } from '../models/User';
import { requireAuth, requireRole } from '../middleware/auth';
const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const registerAdminSchema = z.object({
    companyName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8)
});
router.post('/register-admin', async (req, res) => {
    const parse = registerAdminSchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: parse.error.flatten() });
    const { companyName, email, password } = parse.data;
    const existing = await User.findOne({ email });
    if (existing)
        return res.status(409).json({ error: 'Email already in use' });
    const company = await Company.create({ name: companyName });
    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({ email, passwordHash, role: 'admin', companyId: company._id });
    return res.json({ ok: true, companyId: company._id });
});
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
router.post('/login', async (req, res) => {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: parse.error.flatten() });
    const { email, password } = parse.data;
    const user = await User.findOne({ email });
    if (!user)
        return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok)
        return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken(user);
    return res.json({ token });
});
const registerEmployeeSchema = z.object({ email: z.string().email(), password: z.string().min(8), role: z.enum(['employee', 'ceo']).default('employee') });
router.post('/register-employee', requireAuth, requireRole('admin', 'ceo'), async (req, res) => {
    const parse = registerEmployeeSchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: parse.error.flatten() });
    const { email, password, role } = parse.data;
    const exists = await User.findOne({ email });
    if (exists)
        return res.status(409).json({ error: 'Email already in use' });
    const passwordHash = await bcrypt.hash(password, 12);
    const companyId = req.user.companyId;
    const user = await User.create({ email, passwordHash, role, companyId });
    return res.json({ ok: true, userId: String(user._id) });
});
router.get('/me', requireAuth, async (req, res) => {
    const { userId, role, companyId } = req.user;
    return res.json({ userId, role, companyId });
});
function signToken(user) {
    return jwt.sign({ userId: String(user._id), role: user.role, companyId: String(user.companyId) }, JWT_SECRET, { expiresIn: '1h' });
}
export default router;
//# sourceMappingURL=auth.js.map