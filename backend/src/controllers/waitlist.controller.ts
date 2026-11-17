import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { WaitlistService } from '../services/waitlist.service';

export class WaitlistController {
  public static async join(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { doctorId, targetDate, consultationType } = req.body;
      const result = WaitlistService.joinWaitlist({
        doctorId,
        patientId: req.user!.id,
        targetDate,
        consultationType: consultationType || 'IN_PERSON'
      });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  public static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const waitlists = WaitlistService.getUserWaitlists(req.user!.id);
      res.status(200).json(waitlists);
    } catch (err) {
      next(err);
    }
  }
}

