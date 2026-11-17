import { Router } from 'express';
import { WaitlistController } from '../controllers/waitlist.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware as any);

router.post('/', WaitlistController.join as any);
router.get('/', WaitlistController.list as any);

export default router;

