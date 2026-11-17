import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../models/db';
import { ConflictError, NotFoundError } from '../middlewares/error.middleware';

export class WaitlistService {
  public static joinWaitlist(data: {
    doctorId: string;
    patientId: string;
    targetDate: string;
    consultationType: 'IN_PERSON' | 'VIDEO';
  }): any {
    const db = getDb();

    // Check if already on waitlist for this doctor and date
    const existing = db.prepare(`
      SELECT id FROM waitlist_entries
      WHERE doctor_id = ? AND patient_id = ? AND target_date = ? AND status IN ('ACTIVE', 'NOTIFIED')
    `).get(data.doctorId, data.patientId, data.targetDate);

    if (existing) {
      throw new ConflictError('You are already on the priority waitlist for this doctor on this date.');
    }

    const id = uuidv4();
    db.prepare(`
      INSERT INTO waitlist_entries (
        id, doctor_id, patient_id, target_date, consultation_type, status, created_at
      ) VALUES (?, ?, ?, ?, ?, 'ACTIVE', datetime('now'))
    `).run(id, data.doctorId, data.patientId, data.targetDate, data.consultationType);

    return {
      id,
      message: 'Successfully added to waitlist. You will be alerted immediately if a slot opens up.',
      ...data,
      status: 'ACTIVE'
    };
  }

  public static getUserWaitlists(patientId: string): any[] {
    const db = getDb();
    return db.prepare(`
      SELECT w.id, w.target_date AS targetDate, w.consultation_type AS consultationType,
             w.status, w.notified_at AS notifiedAt, w.notification_expires_at AS notificationExpiresAt,
             d.specialization, d.clinic_name AS clinicName, u.name AS doctorName
      FROM waitlist_entries w
      JOIN doctor_profiles d ON w.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE w.patient_id = ?
      ORDER BY w.created_at DESC
    `).all(patientId);
  }

  /**
   * Called whenever a booking on a doctor/date is cancelled.
   * Finds the earliest waiting patient and notifies them.
   */
  public static onSlotFreed(doctorId: string, targetDate: string): void {
    const db = getDb();

    const candidate = db.prepare(`
      SELECT w.id, w.patient_id, u.name AS patient_name, u.phone, u.email
      FROM waitlist_entries w
      JOIN users u ON w.patient_id = u.id
      WHERE w.doctor_id = ? AND w.target_date = ? AND w.status = 'ACTIVE'
      ORDER BY w.created_at ASC
      LIMIT 1
    `).get(doctorId, targetDate) as any;

    if (!candidate) {
      console.log(`[Waitlist] No active waitlist candidates for doctor '${doctorId}' on date '${targetDate}'`);
      return;
    }

    // Update status to NOTIFIED with 15-minute reservation window
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    db.prepare(`
      UPDATE waitlist_entries
      SET status = 'NOTIFIED', notified_at = datetime('now'), notification_expires_at = ?
      WHERE id = ?
    `).run(expiresAt, candidate.id);

    console.log(`[Waitlist Alert] Priority notification dispatched to ${candidate.patient_name} (${candidate.phone || candidate.email}) for date ${targetDate}! Priority window open for 15 minutes.`);
  }
}

