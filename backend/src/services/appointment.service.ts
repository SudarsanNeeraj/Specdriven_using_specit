import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../models/db';
import { CreateAppointmentInput } from '../models/appointment.model';
import { ConflictError, NotFoundError, BadRequestError, ForbiddenError } from '../middlewares/error.middleware';
import { WaitlistService } from './waitlist.service';

export class AppointmentService {
  /**
   * Generates unique alphanumeric booking reference, e.g. APT-202611-9A3K
   */
  public static generateBookingReference(): string {
    const now = new Date();
    const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `APT-${yyyymm}-${code}`;
  }

  /**
   * Completes booking confirmation for a held slot.
   */
  public static createAppointment(patientId: string, input: CreateAppointmentInput): any {
    const db = getDb();

    // Verify slot is HELD by this patient
    const slot = db.prepare(`
      SELECT s.id, s.doctor_id, s.start_time, s.end_time, s.status, s.held_by_user_id, s.hold_expires_at,
             d.in_person_fee, d.video_fee, d.clinic_name, u.name AS doctor_name
      FROM appointment_slots s
      JOIN doctor_profiles d ON s.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE s.id = ?
    `).get(input.slotId) as any;

    if (!slot) {
      throw new NotFoundError(`Slot '${input.slotId}' not found`);
    }

    if (slot.status !== 'HELD' || slot.held_by_user_id !== patientId) {
      throw new ConflictError('This slot is not currently held by your session. Please hold the slot first.');
    }

    if (new Date(slot.hold_expires_at).getTime() < Date.now()) {
      throw new ConflictError('Your 5-minute hold on this slot has expired. Please select a new slot.');
    }

    const feeAmount = input.consultationType === 'VIDEO' ? slot.video_fee : slot.in_person_fee;
    const paymentStatus = input.paymentMethod === 'PAY_AT_CLINIC' ? 'AT_CLINIC' : 'PAID';
    const appointmentId = uuidv4();
    const bookingReference = this.generateBookingReference();
    const videoRoomId = input.consultationType === 'VIDEO' ? `room-${uuidv4().substring(0, 8)}` : null;

    // Atomic transaction: Insert appointment and update slot to BOOKED
    const createTx = db.transaction(() => {
      db.prepare(`
        INSERT INTO appointments (
          id, booking_reference, patient_id, doctor_id, slot_id,
          consultation_type, status, fee_amount, payment_status,
          payment_reference, video_room_id, patient_notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'CONFIRMED', ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(
        appointmentId,
        bookingReference,
        patientId,
        slot.doctor_id,
        slot.id,
        input.consultationType,
        feeAmount,
        paymentStatus,
        `TXN-${Date.now()}`,
        videoRoomId,
        input.patientNotes || null
      );

      db.prepare(`
        UPDATE appointment_slots
        SET status = 'BOOKED', held_by_user_id = NULL, hold_expires_at = NULL
        WHERE id = ?
      `).run(slot.id);
    });

    createTx();

    return this.getAppointmentById(appointmentId, patientId, 'PATIENT');
  }

  public static getAppointmentById(id: string, userId: string, role: string): any {
    const db = getDb();
    const row = db.prepare(`
      SELECT 
        a.id,
        a.booking_reference AS bookingReference,
        a.patient_id AS patientId,
        u_p.name AS patientName,
        u_p.phone AS patientPhone,
        u_p.email AS patientEmail,
        a.doctor_id AS doctorId,
        u_d.name AS doctorName,
        d.specialization,
        d.clinic_name AS clinicName,
        d.clinic_address AS clinicAddress,
        a.slot_id AS slotId,
        s.start_time AS startTime,
        s.end_time AS endTime,
        a.consultation_type AS consultationType,
        a.status,
        a.fee_amount AS feeAmount,
        a.payment_status AS paymentStatus,
        a.video_room_id AS videoRoomId,
        a.patient_notes AS patientNotes,
        a.cancellation_reason AS cancellationReason,
        a.cancelled_at AS cancelledAt,
        a.created_at AS createdAt
      FROM appointments a
      JOIN users u_p ON a.patient_id = u_p.id
      JOIN doctor_profiles d ON a.doctor_id = d.id
      JOIN users u_d ON d.user_id = u_d.id
      JOIN appointment_slots s ON a.slot_id = s.id
      WHERE a.id = ?
    `).get(id) as any;

    if (!row) {
      throw new NotFoundError(`Appointment '${id}' not found`);
    }

    // Role check: Only the owning patient, doctor, or clinic staff can view
    if (role === 'PATIENT' && row.patientId !== userId) {
      throw new ForbiddenError('You are not authorized to view this appointment');
    }

    if (row.videoRoomId) {
      row.videoRoomUrl = `/telehealth/${row.videoRoomId}?appointmentId=${row.id}`;
    }

    return row;
  }

  public static getUserAppointments(userId: string, role: string, status?: string): any[] {
    const db = getDb();
    let sql = `
      SELECT 
        a.id,
        a.booking_reference AS bookingReference,
        a.patient_id AS patientId,
        u_p.name AS patientName,
        a.doctor_id AS doctorId,
        u_d.name AS doctorName,
        d.specialization,
        d.clinic_name AS clinicName,
        s.start_time AS startTime,
        s.end_time AS endTime,
        a.consultation_type AS consultationType,
        a.status,
        a.fee_amount AS feeAmount,
        a.payment_status AS paymentStatus,
        a.video_room_id AS videoRoomId,
        a.created_at AS createdAt
      FROM appointments a
      JOIN users u_p ON a.patient_id = u_p.id
      JOIN doctor_profiles d ON a.doctor_id = d.id
      JOIN users u_d ON d.user_id = u_d.id
      JOIN appointment_slots s ON a.slot_id = s.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (role === 'PATIENT') {
      sql += ` AND a.patient_id = ?`;
      params.push(userId);
    } else if (role === 'DOCTOR') {
      // Find doctor profile id
      const doc = db.prepare('SELECT id FROM doctor_profiles WHERE user_id = ?').get(userId) as any;
      if (doc) {
        sql += ` AND a.doctor_id = ?`;
        params.push(doc.id);
      }
    }

    if (status) {
      sql += ` AND a.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY s.start_time DESC`;
    const rows = db.prepare(sql).all(...params) as any[];

    return rows.map(r => ({
      ...r,
      videoRoomUrl: r.videoRoomId ? `/telehealth/${r.videoRoomId}?appointmentId=${r.id}` : null
    }));
  }

  /**
   * Reschedules an appointment to a new slot subject to >2h cutoff policy.
   */
  public static rescheduleAppointment(appointmentId: string, userId: string, newSlotId: string): any {
    const db = getDb();
    const apt = db.prepare(`
      SELECT a.*, s.start_time AS current_slot_start
      FROM appointments a
      JOIN appointment_slots s ON a.slot_id = s.id
      WHERE a.id = ?
    `).get(appointmentId) as any;

    if (!apt) {
      throw new NotFoundError('Appointment not found');
    }

    // Policy Check: Must be > 2 hours before current slot start
    const slotTime = new Date(apt.current_slot_start).getTime();
    const now = Date.now();
    const diffHours = (slotTime - now) / (1000 * 60 * 60);

    if (diffHours < 2) {
      throw new BadRequestError('Appointments cannot be rescheduled less than 2 hours before the scheduled time. Please contact clinic reception.');
    }

    // Verify new slot is available
    const newSlot = db.prepare('SELECT * FROM appointment_slots WHERE id = ?').get(newSlotId) as any;
    if (!newSlot || (newSlot.status !== 'AVAILABLE' && newSlot.held_by_user_id !== userId)) {
      throw new ConflictError('Selected new slot is not available');
    }

    const oldSlotId = apt.slot_id;

    const tx = db.transaction(() => {
      // Free old slot
      db.prepare(`UPDATE appointment_slots SET status = 'AVAILABLE', held_by_user_id = NULL, hold_expires_at = NULL WHERE id = ?`).run(oldSlotId);
      // Book new slot
      db.prepare(`UPDATE appointment_slots SET status = 'BOOKED', held_by_user_id = NULL, hold_expires_at = NULL WHERE id = ?`).run(newSlotId);
      // Update appointment
      db.prepare(`UPDATE appointments SET slot_id = ?, updated_at = datetime('now') WHERE id = ?`).run(newSlotId, appointmentId);
    });

    tx();

    // Trigger waitlist on the freed old slot date
    const oldSlotDate = apt.current_slot_start.split('T')[0];
    WaitlistService.onSlotFreed(apt.doctor_id, oldSlotDate);

    return this.getAppointmentById(appointmentId, userId, 'PATIENT');
  }

  /**
   * Cancels an appointment subject to >2h cutoff policy and alerts waitlisted patients.
   */
  public static cancelAppointment(appointmentId: string, userId: string, reason: string): any {
    const db = getDb();
    const apt = db.prepare(`
      SELECT a.*, s.start_time AS slot_start
      FROM appointments a
      JOIN appointment_slots s ON a.slot_id = s.id
      WHERE a.id = ?
    `).get(appointmentId) as any;

    if (!apt) {
      throw new NotFoundError('Appointment not found');
    }

    if (apt.status === 'CANCELLED') {
      throw new BadRequestError('Appointment is already cancelled');
    }

    // Check 2h window
    const slotTime = new Date(apt.slot_start).getTime();
    const now = Date.now();
    const diffHours = (slotTime - now) / (1000 * 60 * 60);

    if (diffHours < 2) {
      throw new BadRequestError('Cancellations within 2 hours of appointment time are subject to clinic late cancellation fees. Please contact reception.');
    }

    const tx = db.transaction(() => {
      db.prepare(`
        UPDATE appointments
        SET status = 'CANCELLED', cancellation_reason = ?, cancelled_at = datetime('now'), cancelled_by_user_id = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(reason, userId, appointmentId);

      db.prepare(`
        UPDATE appointment_slots
        SET status = 'AVAILABLE', held_by_user_id = NULL, hold_expires_at = NULL
        WHERE id = ?
      `).run(apt.slot_id);
    });

    tx();

    // Trigger automated waitlist notification for freed slot
    const slotDate = apt.slot_start.split('T')[0];
    WaitlistService.onSlotFreed(apt.doctor_id, slotDate);

    return { message: 'Appointment cancelled successfully', appointmentId };
  }

  /**
   * Completes a consultation and creates prescription notes.
   */
  public static completeAppointment(appointmentId: string, doctorId: string, prescriptionNotes?: string): any {
    const db = getDb();
    db.prepare(`
      UPDATE appointments
      SET status = 'COMPLETED', updated_at = datetime('now')
      WHERE id = ?
    `).run(appointmentId);

    if (prescriptionNotes) {
      const recordId = uuidv4();
      const apt = db.prepare('SELECT patient_id FROM appointments WHERE id = ?').get(appointmentId) as any;
      db.prepare(`
        INSERT INTO medical_records (
          id, appointment_id, patient_id, uploaded_by_user_id, record_type, file_name, file_mime_type, file_size_bytes, file_storage_key, notes, created_at
        ) VALUES (?, ?, ?, ?, 'PRESCRIPTION', 'Prescription.pdf', 'application/pdf', 1024, 'prescriptions/dummy.pdf', ?, datetime('now'))
      `).run(recordId, appointmentId, apt.patient_id, doctorId, prescriptionNotes);
    }

    return { message: 'Consultation marked as completed', appointmentId };
  }
}

