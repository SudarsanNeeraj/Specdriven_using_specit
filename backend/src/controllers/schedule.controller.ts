import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { ScheduleService } from '../services/schedule.service';
import { ScheduleBlockSchema, DoctorScheduleSchema } from '../models/schedule.model';
import { z } from 'zod';

export class ScheduleController {
  public static async getRecurring(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const schedule = ScheduleService.getRecurringSchedule(req.user!.id);
      res.status(200).json(schedule);
    } catch (err) {
      next(err);
    }
  }

  public static async updateRecurring(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const schedules = z.array(DoctorScheduleSchema).parse(req.body);
      const result = ScheduleService.updateRecurringSchedule(req.user!.id, schedules);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  public static async createBlock(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const block = ScheduleBlockSchema.parse(req.body);
      const result = ScheduleService.createScheduleBlock(req.user!.id, block);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
}

