import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const registerSchema = z.object({
  role: z.enum(['PATIENT', 'DOCTOR', 'ADMIN', 'RECEPTIONIST']),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const sendOtpSchema = z.object({
  phone: z.string().min(8)
});

const verifyOtpSchema = z.object({
  phone: z.string().min(8),
  code: z.string().length(6)
});

export class AuthController {
  public static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = registerSchema.parse(req.body);
      const result = await AuthService.register(data);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = loginSchema.parse(req.body);
      const result = await AuthService.login(data.email, data.password);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  public static async sendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = sendOtpSchema.parse(req.body);
      const result = await AuthService.sendOtp(data.phone);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  public static async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = verifyOtpSchema.parse(req.body);
      const result = await AuthService.verifyOtp(data.phone, data.code);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  public static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = AuthService.getUserById(req.user!.id);
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  }
}

