import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export interface JwtClaims {
	userId: string;
	role: 'admin' | 'ceo' | 'employee';
	companyId: string;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
	const authHeader = req.headers.authorization;
	if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
	const token = authHeader.slice('Bearer '.length);
	try {
		const decoded = jwt.verify(token, JWT_SECRET) as JwtClaims;
		(req as any).user = decoded;
		return next();
	} catch {
		return res.status(401).json({ error: 'Invalid token' });
	}
}

export function requireRole(...roles: Array<JwtClaims['role']>) {
	return function (req: Request, res: Response, next: NextFunction) {
		const user = (req as any).user as JwtClaims | undefined;
		if (!user || !roles.includes(user.role)) return res.status(403).json({ error: 'Forbidden' });
		return next();
	};
}