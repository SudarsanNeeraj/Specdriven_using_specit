import { Router } from 'express';
import { SlotController } from '../controllers/slot.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware as any);

router.post('/:id/hold', SlotController.hold as any);
router.post('/:id/release', SlotController.release as any);

export default router;

