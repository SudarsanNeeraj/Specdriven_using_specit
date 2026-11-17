import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { UnauthorizedError } from './error.middleware';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: 'PATIENT' | 'DOCTOR' | 'ADMIN' | 'RECEPTIONIST';
    name: string;
    email: string | null;
  };
}

export function authMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or malformed authorization header');
  }

  const token = authHeader.split(' ')[1];
  const decoded = AuthService.verifyToken(token);
  req.user = decoded;
  next();
}

