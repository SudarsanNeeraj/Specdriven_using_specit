import { Router } from 'express';
import { ReviewController } from '../controllers/record.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware as any);

router.post('/appointments/:id/review', ReviewController.create as any);

export default router;

