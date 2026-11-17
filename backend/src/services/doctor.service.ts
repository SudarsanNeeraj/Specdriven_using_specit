import { getDb } from '../models/db';
import { DoctorCardDto } from '../models/doctor.model';
import { NotFoundError } from '../middlewares/error.middleware';

export interface DoctorSearchParams {
  query?: string;
  specialization?: string;
  city?: string;
  maxFee?: number;
  language?: string;
  date?: string;
}

export class DoctorService {
  public static searchDoctors(params: DoctorSearchParams): DoctorCardDto[] {
    const db = getDb();
    let querySql = `
      SELECT 
        d.id,
        u.name,
        u.email,
        d.specialization,
        d.qualifications,
        d.experience_years AS experienceYears,
        d.city,
        d.clinic_name AS clinicName,
        d.clinic_address AS clinicAddress,
        d.languages,
        d.in_person_fee AS inPersonFee,
        d.video_fee AS videoFee,
        d.rating_avg AS ratingAvg,
        d.rating_count AS ratingCount
      FROM doctor_profiles d
      JOIN users u ON d.user_id = u.id
      WHERE u.status = 'ACTIVE'
    `;
    const conditions: string[] = [];
    const values: any[] = [];

    if (params.query) {
      conditions.push(`(u.name LIKE ? OR d.clinic_name LIKE ? OR d.specialization LIKE ?)`);
      const term = `%${params.query}%`;
      values.push(term, term, term);
    }

    if (params.specialization) {
      conditions.push(`LOWER(d.specialization) = LOWER(?)`);
      values.push(params.specialization);
    }

    if (params.city) {
      conditions.push(`LOWER(d.city) = LOWER(?)`);
      values.push(params.city);
    }

    if (params.maxFee) {
      conditions.push(`d.in_person_fee <= ?`);
      values.push(params.maxFee);
    }

    if (params.language) {
      conditions.push(`d.languages LIKE ?`);
      values.push(`%${params.language}%`);
    }

    if (params.date) {
      conditions.push(`
        EXISTS (
          SELECT 1 FROM appointment_slots s
          WHERE s.doctor_id = d.id 
            AND s.status = 'AVAILABLE'
            AND s.start_time LIKE ?
        )
      `);
      values.push(`${params.date}%`);
    }

    if (conditions.length > 0) {
      querySql += ` AND ${conditions.join(' AND ')}`;
    }

    querySql += ` ORDER BY d.rating_avg DESC, d.experience_years DESC`;

    const rows = db.prepare(querySql).all(...values) as any[];

    // Fetch next available slot for each doctor
    const nextSlotStmt = db.prepare(`
      SELECT start_time FROM appointment_slots
      WHERE doctor_id = ? AND status = 'AVAILABLE' AND start_time >= datetime('now')
      ORDER BY start_time ASC
      LIMIT 1
    `);

    return rows.map(row => {
      const nextSlot = nextSlotStmt.get(row.id) as any;
      let parsedLanguages: string[] = [];
      try {
        parsedLanguages = JSON.parse(row.languages);
      } catch {
        parsedLanguages = [row.languages];
      }

      return {
        ...row,
        languages: parsedLanguages,
        nextAvailableSlot: nextSlot ? nextSlot.start_time : null
      };
    });
  }

  public static getDoctorById(id: string): any {
    const db = getDb();
    const doc = db.prepare(`
      SELECT 
        d.id,
        u.id AS userId,
        u.name,
        u.email,
        u.phone,
        d.specialization,
        d.qualifications,
        d.experience_years AS experienceYears,
        d.languages,
        d.bio,
        d.clinic_name AS clinicName,
        d.clinic_address AS clinicAddress,
        d.city,
        d.in_person_fee AS inPersonFee,
        d.video_fee AS videoFee,
        d.rating_avg AS ratingAvg,
        d.rating_count AS ratingCount
      FROM doctor_profiles d
      JOIN users u ON d.user_id = u.id
      WHERE d.id = ?
    `).get(id) as any;

    if (!doc) {
      throw new NotFoundError(`Doctor with ID '${id}' not found`);
    }

    try {
      doc.languages = JSON.parse(doc.languages);
    } catch {
      doc.languages = [doc.languages];
    }

    // Fetch recent reviews
    const reviews = db.prepare(`
      SELECT r.id, r.rating, r.comment, r.created_at AS createdAt, u.name AS patientName
      FROM reviews r
      JOIN users u ON r.patient_id = u.id
      WHERE r.doctor_id = ?
      ORDER BY r.created_at DESC
      LIMIT 10
    `).all(id);

    doc.reviews = reviews;
    return doc;
  }

  public static getDoctorSlots(id: string, startDate?: string, endDate?: string): any[] {
    const db = getDb();
    let sql = `
      SELECT id, doctor_id AS doctorId, start_time AS startTime, end_time AS endTime, status, hold_expires_at AS holdExpiresAt
      FROM appointment_slots
      WHERE doctor_id = ?
    `;
    const params: any[] = [id];

    if (startDate) {
      sql += ` AND start_time >= ?`;
      params.push(startDate.includes('T') ? startDate : `${startDate}T00:00:00Z`);
    } else {
      sql += ` AND start_time >= datetime('now')`;
    }

    if (endDate) {
      sql += ` AND end_time <= ?`;
      params.push(endDate.includes('T') ? endDate : `${endDate}T23:59:59Z`);
    }

    sql += ` ORDER BY start_time ASC`;
    return db.prepare(sql).all(...params);
  }
}

