import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../models/db';
import { NotFoundError, ForbiddenError } from '../middlewares/error.middleware';

export class RecordService {
  public static createRecord(data: {
    appointmentId?: string | null;
    patientId: string;
    uploadedByUserId: string;
    recordType: string;
    fileName: string;
    fileMimeType: string;
    fileSizeBytes: number;
    fileStorageKey: string;
    notes?: string | null;
  }): any {
    const db = getDb();
    const id = uuidv4();

    db.prepare(`
      INSERT INTO medical_records (
        id, appointment_id, patient_id, uploaded_by_user_id, record_type,
        file_name, file_mime_type, file_size_bytes, file_storage_key, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      id,
      data.appointmentId || null,
      data.patientId,
      data.uploadedByUserId,
      data.recordType,
      data.fileName,
      data.fileMimeType,
      data.fileSizeBytes,
      data.fileStorageKey,
      data.notes || null
    );

    return { id, ...data, fileUrl: `/api/records/${id}/download` };
  }

  public static getRecordsForAppointment(appointmentId: string, userId: string, role: string): any[] {
    const db = getDb();
    const apt = db.prepare('SELECT patient_id, doctor_id FROM appointments WHERE id = ?').get(appointmentId) as any;
    if (!apt) {
      throw new NotFoundError('Appointment not found');
    }

    if (role === 'PATIENT' && apt.patient_id !== userId) {
      throw new ForbiddenError('Unauthorized to access records for this appointment');
    }

    const rows = db.prepare(`
      SELECT id, appointment_id AS appointmentId, patient_id AS patientId,
             record_type AS recordType, file_name AS fileName, file_mime_type AS fileMimeType,
             file_size_bytes AS fileSizeBytes, notes, created_at AS createdAt
      FROM medical_records
      WHERE appointment_id = ?
      ORDER BY created_at DESC
    `).all(appointmentId) as any[];

    return rows.map(r => ({ ...r, fileUrl: `/api/records/${r.id}/download` }));
  }

  public static getPatientRecords(patientId: string): any[] {
    const db = getDb();
    const rows = db.prepare(`
      SELECT id, appointment_id AS appointmentId, patient_id AS patientId,
             record_type AS recordType, file_name AS fileName, file_mime_type AS fileMimeType,
             file_size_bytes AS fileSizeBytes, notes, created_at AS createdAt
      FROM medical_records
      WHERE patient_id = ?
      ORDER BY created_at DESC
    `).all(patientId) as any[];

    return rows.map(r => ({ ...r, fileUrl: `/api/records/${r.id}/download` }));
  }
}

