import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { RecordService } from '../services/record.service';
import { ReviewService } from '../services/review.service';
import { CreateReviewSchema } from '../models/review.model';

export class RecordController {
  public static async upload(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const appointmentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { recordType, notes, fileName } = req.body;

      const record = RecordService.createRecord({
        appointmentId,
        patientId: req.user!.id,
        uploadedByUserId: req.user!.id,
        recordType: recordType || 'LAB_REPORT',
        fileName: fileName || (req.file ? req.file.originalname : 'Document.pdf'),
        fileMimeType: req.file ? req.file.mimetype : 'application/pdf',
        fileSizeBytes: req.file ? req.file.size : 1024,
        fileStorageKey: req.file ? req.file.path : `uploads/${Date.now()}.pdf`,
        notes
      });

      res.status(201).json(record);
    } catch (err) {
      next(err);
    }
  }

  public static async listForAppointment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const appointmentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const records = RecordService.getRecordsForAppointment(appointmentId, req.user!.id, req.user!.role);
      res.status(200).json(records);
    } catch (err) {
      next(err);
    }
  }

  public static async listForPatient(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const records = RecordService.getPatientRecords(req.user!.id);
      res.status(200).json(records);
    } catch (err) {
      next(err);
    }
  }
}

export class ReviewController {
  public static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const appointmentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const input = CreateReviewSchema.parse(req.body);
      const result = ReviewService.createReview(appointmentId, req.user!.id, input.rating, input.comment);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
}
