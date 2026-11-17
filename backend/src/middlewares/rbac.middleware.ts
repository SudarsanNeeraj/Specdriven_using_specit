import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { ForbiddenError, UnauthorizedError } from './error.middleware';

export function authorizeRoles(...allowedRoles: Array<'PATIENT' | 'DOCTOR' | 'ADMIN' | 'RECEPTIONIST'>) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError(`Access forbidden: Role '${req.user.role}' lacks necessary permissions`);
    }

    next();
  };
}

