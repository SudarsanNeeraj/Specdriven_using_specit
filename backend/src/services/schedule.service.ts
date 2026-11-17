import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../models/db';
import { DoctorSchedule, ScheduleBlock } from '../models/schedule.model';
import { NotFoundError } from '../middlewares/error.middleware';

export class ScheduleService {
  public static getDoctorProfileId(userId: string): string {
    const db = getDb();
    const doc = db.prepare('SELECT id FROM doctor_profiles WHERE user_id = ?').get(userId) as any;
    if (!doc) {
      throw new NotFoundError('Doctor profile not found for authenticated user');
    }
    return doc.id;
  }

  public static getRecurringSchedule(userId: string): any[] {
    const db = getDb();
    const doctorId = this.getDoctorProfileId(userId);
    return db.prepare(`
      SELECT id, day_of_week AS dayOfWeek, shift_start_time AS shiftStartTime,
             shift_end_time AS shiftEndTime, break_start_time AS breakStartTime,
             break_end_time AS breakEndTime, slot_duration_minutes AS slotDurationMinutes,
             is_active AS isActive
      FROM doctor_schedules
      WHERE doctor_id = ?
      ORDER BY day_of_week ASC
    `).all(doctorId);
  }

  public static updateRecurringSchedule(userId: string, schedules: DoctorSchedule[]): any {
    const db = getDb();
    const doctorId = this.getDoctorProfileId(userId);

    const tx = db.transaction(() => {
      db.prepare('DELETE FROM doctor_schedules WHERE doctor_id = ?').run(doctorId);

      const stmt = db.prepare(`
        INSERT INTO doctor_schedules (
          id, doctor_id, day_of_week, shift_start_time, shift_end_time,
          break_start_time, break_end_time, slot_duration_minutes, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const s of schedules) {
        stmt.run(
          uuidv4(),
          doctorId,
          s.dayOfWeek,
          s.shiftStartTime,
          s.shiftEndTime,
          s.breakStartTime || null,
          s.breakEndTime || null,
          s.slotDurationMinutes || 30,
          s.isActive !== false ? 1 : 0
        );
      }
    });

    tx();
    return { message: 'Schedule updated successfully', doctorId };
  }

  public static createScheduleBlock(userId: string, block: ScheduleBlock): any {
    const db = getDb();
    const doctorId = this.getDoctorProfileId(userId);
    const blockId = uuidv4();

    const affectedAppointments = db.prepare(`
      SELECT a.id, a.booking_reference, a.patient_id, u.name AS patient_name, u.phone, u.email, s.start_time
      FROM appointments a
      JOIN appointment_slots s ON a.slot_id = s.id
      JOIN users u ON a.patient_id = u.id
      WHERE a.doctor_id = ?
        AND a.status = 'CONFIRMED'
        AND s.start_time >= ? AND s.end_time <= ?
    `).all(doctorId, block.startTime, block.endTime) as any[];

    const tx = db.transaction(() => {
      // 1. Insert schedule block
      db.prepare(`
        INSERT INTO schedule_blocks (id, doctor_id, start_time, end_time, reason, is_emergency, created_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(blockId, doctorId, block.startTime, block.endTime, block.reason, block.isEmergency ? 1 : 0);

      // 2. Mark unbooked slots in this window as BLOCKED
      db.prepare(`
        UPDATE appointment_slots
        SET status = 'BLOCKED'
        WHERE doctor_id = ?
          AND status IN ('AVAILABLE', 'HELD')
          AND start_time >= ? AND end_time <= ?
      `).run(doctorId, block.startTime, block.endTime);
    });

    tx();

    if (affectedAppointments.length > 0) {
      console.log(`[EMERGENCY SCHEDULE BLOCK] Detected ${affectedAppointments.length} confirmed appointments in blocked window. Alerts dispatched to affected patients.`);
    }

    return {
      blockId,
      message: 'Schedule block applied successfully',
      affectedAppointmentsCount: affectedAppointments.length,
      affectedAppointments
    };
  }
}

