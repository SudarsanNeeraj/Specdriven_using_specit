import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { ReportService } from '../services/report.service';
import { AppointmentService } from '../services/appointment.service';
import { getDb } from '../models/db';
import { NotFoundError } from '../middlewares/error.middleware';

export class AdminController {
  public static async getReports(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      const report = ReportService.getOperationalReport(
        startDate ? String(startDate) : undefined,
        endDate ? String(endDate) : undefined
      );
      res.status(200).json(report);
    } catch (err) {
      next(err);
    }
  }

  public static async createWalkInAppointment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { patientName, patientPhone, doctorId, slotId, paymentStatus } = req.body;
      const db = getDb();

      // Find or create patient
      let patient = db.prepare('SELECT id FROM users WHERE phone = ?').get(patientPhone) as any;
      let patientId: string;

      if (!patient) {
        patientId = uuidv4();
        db.prepare(`
          INSERT INTO users (id, role, name, phone, status, created_at, updated_at)
          VALUES (?, 'PATIENT', ?, ?, 'ACTIVE', datetime('now'), datetime('now'))
        `).run(patientId, patientName, patientPhone);

        db.prepare(`
          INSERT INTO patient_profiles (id, user_id, no_show_count, created_at, updated_at)
          VALUES (?, ?, 0, datetime('now'), datetime('now'))
        `).run(uuidv4(), patientId);
      } else {
        patientId = patient.id;
      }

      // Hold and book slot immediately
      const slot = db.prepare('SELECT in_person_fee FROM doctor_profiles WHERE id = ?').get(doctorId) as any;
      const fee = slot ? slot.in_person_fee : 500;
      const aptId = uuidv4();
      const ref = AppointmentService.generateBookingReference();

      const tx = db.transaction(() => {
        db.prepare(`
          UPDATE appointment_slots
          SET status = 'BOOKED', held_by_user_id = NULL, hold_expires_at = NULL
          WHERE id = ?
        `).run(slotId);

        db.prepare(`
          INSERT INTO appointments (
            id, booking_reference, patient_id, doctor_id, slot_id, consultation_type,
            status, fee_amount, payment_status, patient_notes, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, 'IN_PERSON', 'CONFIRMED', ?, ?, 'Walk-in registration by reception', datetime('now'), datetime('now'))
        `).run(aptId, ref, patientId, doctorId, slotId, fee, paymentStatus || 'AT_CLINIC');
      });

      tx();

      res.status(201).json({
        message: 'Walk-in appointment booked successfully',
        appointmentId: aptId,
        bookingReference: ref,
        patientName,
        paymentStatus: paymentStatus || 'AT_CLINIC'
      });
    } catch (err) {
      next(err);
    }
  }

  public static async updateUserStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.body;
      const db = getDb();
      const result = db.prepare('UPDATE users SET status = ?, updated_at = datetime(\'now\') WHERE id = ?').run(status, req.params.id);
      if (result.changes === 0) {
        throw new NotFoundError('User not found');
      }
      res.status(200).json({ message: `User status updated to ${status}` });
    } catch (err) {
      next(err);
    }
  }
}

