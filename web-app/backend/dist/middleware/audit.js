import { AuditLog } from '../models/AuditLog';
export function audit(action) {
    return async function (req, _res, next) {
        try {
            const user = req.user;
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
        }
        catch { }
        return next();
    };
}
//# sourceMappingURL=audit.js.map