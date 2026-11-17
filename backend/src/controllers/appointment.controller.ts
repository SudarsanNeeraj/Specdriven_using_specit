import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AppointmentService } from '../services/appointment.service';
import { CreateAppointmentSchema } from '../models/appointment.model';

export class AppointmentController {
  public static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = CreateAppointmentSchema.parse(req.body);
      const appointment = AppointmentService.createAppointment(req.user!.id, input);
      res.status(201).json(appointment);
    } catch (err) {
      next(err);
    }
  }

  public static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const appointment = AppointmentService.getAppointmentById(id, req.user!.id, req.user!.role);
      res.status(200).json(appointment);
    } catch (err) {
      next(err);
    }
  }

  public static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.query;
      const appointments = AppointmentService.getUserAppointments(
        req.user!.id,
        req.user!.role,
        status ? String(status) : undefined
      );
      res.status(200).json(appointments);
    } catch (err) {
      next(err);
    }
  }

  public static async reschedule(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { newSlotId } = req.body;
      const updated = AppointmentService.rescheduleAppointment(id, req.user!.id, newSlotId);
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  }

  public static async cancel(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { reason } = req.body;
      const result = AppointmentService.cancelAppointment(id, req.user!.id, reason || 'Patient cancelled');
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  public static async complete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { prescriptionNotes } = req.body;
      const result = AppointmentService.completeAppointment(id, req.user!.id, prescriptionNotes);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
