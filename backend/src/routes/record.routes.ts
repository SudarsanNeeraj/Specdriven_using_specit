import { Router } from 'express';
import multer from 'multer';
import { RecordController } from '../controllers/record.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const upload = multer({ dest: 'uploads/' });
const router = Router();

router.use(authMiddleware as any);

router.post('/appointments/:id/records', upload.single('file'), RecordController.upload as any);
router.get('/appointments/:id/records', RecordController.listForAppointment as any);
router.get('/my-records', RecordController.listForPatient as any);

export default router;

