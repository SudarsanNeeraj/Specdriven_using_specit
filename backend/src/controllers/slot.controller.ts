import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { SlotLockService } from '../services/slot-lock.service';

export class SlotController {
  public static async hold(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const slotId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const userId = req.user!.id;
      const result = SlotLockService.holdSlot(slotId, userId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  public static async release(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const slotId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const userId = req.user!.id;
      SlotLockService.releaseSlot(slotId, userId);
      res.status(200).json({ message: 'Slot released successfully', slotId });
    } catch (err) {
      next(err);
    }
  }
}
