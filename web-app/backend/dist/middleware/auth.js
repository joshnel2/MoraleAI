import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
export function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer '))
        return res.status(401).json({ error: 'Unauthorized' });
    const token = authHeader.slice('Bearer '.length);
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        return next();
    }
    catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
}
export function requireRole(...roles) {
    return function (req, res, next) {
        const user = req.user;
        if (!user || !roles.includes(user.role))
            return res.status(403).json({ error: 'Forbidden' });
        return next();
    };
}
//# sourceMappingURL=auth.js.map