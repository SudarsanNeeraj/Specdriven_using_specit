import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../models/db';
import { BadRequestError, NotFoundError, ConflictError } from '../middlewares/error.middleware';

export class ReviewService {
  public static createReview(appointmentId: string, patientId: string, rating: number, comment?: string): any {
    const db = getDb();

    // Verify appointment is COMPLETED and belongs to patient
    const apt = db.prepare(`
      SELECT id, patient_id, doctor_id, status FROM appointments WHERE id = ?
    `).get(appointmentId) as any;

    if (!apt) {
      throw new NotFoundError('Appointment not found');
    }

    if (apt.patient_id !== patientId) {
      throw new BadRequestError('You can only review appointments that you attended');
    }

    if (apt.status !== 'COMPLETED') {
      throw new BadRequestError('Reviews can only be submitted after consultation is marked Completed');
    }

    // Check if review already exists
    const existing = db.prepare('SELECT id FROM reviews WHERE appointment_id = ?').get(appointmentId);
    if (existing) {
      throw new ConflictError('A review has already been submitted for this appointment');
    }

    const reviewId = uuidv4();

    const tx = db.transaction(() => {
      // 1. Insert review
      db.prepare(`
        INSERT INTO reviews (id, appointment_id, doctor_id, patient_id, rating, comment, created_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(reviewId, appointmentId, apt.doctor_id, patientId, rating, comment || null);

      // 2. Recalculate doctor rating_avg and rating_count
      const stats = db.prepare(`
        SELECT COUNT(*) AS total, AVG(rating) AS avgRating
        FROM reviews
        WHERE doctor_id = ?
      `).get(apt.doctor_id) as any;

      const newAvg = stats.avgRating ? parseFloat(stats.avgRating.toFixed(2)) : 0.0;
      const newCount = stats.total || 0;

      db.prepare(`
        UPDATE doctor_profiles
        SET rating_avg = ?, rating_count = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(newAvg, newCount, apt.doctor_id);
    });

    tx();

    return {
      id: reviewId,
      appointmentId,
      doctorId: apt.doctor_id,
      rating,
      comment,
      message: 'Thank you! Your feedback has been verified and posted.'
    };
  }
}

