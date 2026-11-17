import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/audit.service';

export function auditMiddleware(action: string, resourceType: string, extractResourceId?: (req: Request) => string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const originalSend = res.send;

    res.send = function (body?: any): Response {
      res.send = originalSend;
      const response = res.send(body);

      // Only log on successful or non-server-error mutations
      if (res.statusCode >= 200 && res.statusCode < 400) {
        const actorUserId = (req as any).user?.id || null;
        const rawId = req.params.id;
        const resourceId = extractResourceId ? extractResourceId(req) : (Array.isArray(rawId) ? rawId[0] : (rawId || 'N/A'));
        const ipAddress = req.ip || req.socket.remoteAddress || null;

        AuditService.log({
          actorUserId,
          action,
          resourceType,
          resourceId,
          ipAddress,
          details: {
            method: req.method,
            path: req.originalUrl,
            status: res.statusCode
          }
        });
      }

      return response;
    };

    next();
  };
}
