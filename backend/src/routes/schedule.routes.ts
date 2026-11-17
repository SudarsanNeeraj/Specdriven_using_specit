import { Router } from 'express';
import { ScheduleController } from '../controllers/schedule.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authMiddleware as any);
router.use(authorizeRoles('DOCTOR', 'ADMIN') as any);

router.get('/recurring', ScheduleController.getRecurring as any);
router.put('/recurring', ScheduleController.updateRecurring as any);
router.post('/blocks', ScheduleController.createBlock as any);

export default router;

