import { Router } from 'express';
import { AppointmentController } from '../controllers/appointment.controller';
import { SlotController } from '../controllers/slot.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware as any);

router.post('/', AppointmentController.create as any);
router.get('/', AppointmentController.list as any);
router.get('/:id', AppointmentController.getById as any);
router.post('/:id/reschedule', AppointmentController.reschedule as any);
router.post('/:id/cancel', AppointmentController.cancel as any);
router.post('/:id/complete', AppointmentController.complete as any);

export default router;

