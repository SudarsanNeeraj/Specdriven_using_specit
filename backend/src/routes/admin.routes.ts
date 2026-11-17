import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authMiddleware as any);
router.use(authorizeRoles('ADMIN', 'RECEPTIONIST') as any);

router.get('/reports/operational', AdminController.getReports as any);
router.post('/walk-in', AdminController.createWalkInAppointment as any);
router.put('/users/:id/status', AdminController.updateUserStatus as any);

export default router;

