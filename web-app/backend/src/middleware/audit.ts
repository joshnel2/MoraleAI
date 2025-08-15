import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../models/AuditLog';

export function audit(action: string) {
	return async function (req: Request, _res: Response, next: NextFunction) {
		try {
			const user = (req as any).user;
			if (user) {
				await AuditLog.create({
					companyId: user.companyId,
					userId: user.userId,
					action,
					meta: {
						path: req.path,
						method: req.method,
						ip: req.ip
					}
				});
			}
		} catch {}
		return next();
	};
}