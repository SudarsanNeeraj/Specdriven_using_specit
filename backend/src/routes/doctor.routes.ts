import { Router } from 'express';
import { DoctorController } from '../controllers/doctor.controller';

const router = Router();

router.get('/', DoctorController.search);
router.get('/:id', DoctorController.getById);
router.get('/:id/slots', DoctorController.getSlots);

export default router;

