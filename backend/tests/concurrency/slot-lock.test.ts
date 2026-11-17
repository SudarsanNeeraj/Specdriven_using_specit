import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import { getDb, closeDb } from '../../src/models/db';
import { SlotLockService } from '../../src/services/slot-lock.service';

describe('Concurrency Slot Lock Engine', () => {
  let testDoctorId: string;
  let testSlotId: string;

  beforeAll(() => {
    const db = getDb();
    testDoctorId = uuidv4();
    const userId = uuidv4();

    db.prepare(`
      INSERT INTO users (id, role, name, email, status, created_at, updated_at)
      VALUES (?, 'DOCTOR', 'Concurrency Doctor', 'concurrency@test.com', 'ACTIVE', datetime('now'), datetime('now'))
    `).run(userId);

    db.prepare(`
      INSERT INTO doctor_profiles (
        id, user_id, specialization, qualifications, experience_years, languages, clinic_name, clinic_address, city, in_person_fee, video_fee
      ) VALUES (?, ?, 'Cardiology', 'MBBS, MD', 10, '["English"]', 'Test Clinic', 'Test Address', 'Mumbai', 1000, 800)
    `).run(testDoctorId, userId);

    testSlotId = uuidv4();
    db.prepare(`
      INSERT INTO appointment_slots (id, doctor_id, start_time, end_time, status, created_at)
      VALUES (?, ?, '2026-12-01T10:00:00Z', '2026-12-01T10:30:00Z', 'AVAILABLE', datetime('now'))
    `).run(testSlotId, testDoctorId);
  });

  afterAll(() => {
    closeDb();
  });

  it('guarantees 100% mutual exclusion under 50 simultaneous concurrent hold attempts', async () => {
    const clientCount = 50;
    const clientUserIds = Array.from({ length: clientCount }, () => uuidv4());

    // Fire 50 simultaneous hold attempts
    const promises = clientUserIds.map(async (userId) => {
      try {
        const result = SlotLockService.holdSlot(testSlotId, userId);
        return { success: true, result, userId };
      } catch (err: any) {
        return { success: false, error: err.message, statusCode: err.statusCode };
      }
    });

    const results = await Promise.all(promises);

    const successfulAttempts = results.filter(r => r.success);
    const conflictedAttempts = results.filter(r => !r.success);

    // Exactly 1 client must have acquired the hold lock
    expect(successfulAttempts.length).toBe(1);
    expect(conflictedAttempts.length).toBe(49);
    expect(successfulAttempts[0].result.status).toBe('HELD');
    expect(successfulAttempts[0].result.remainingSeconds).toBe(300);

    for (const conflict of conflictedAttempts) {
      expect(conflict.statusCode).toBe(409);
    }
  });

  it('allows the same client to refresh their hold, while other clients remain blocked', () => {
    const db = getDb();
    const slot = db.prepare('SELECT held_by_user_id FROM appointment_slots WHERE id = ?').get(testSlotId) as any;
    const holdingUserId = slot.held_by_user_id;

    // Holding client calls holdSlot again
    const refreshed = SlotLockService.holdSlot(testSlotId, holdingUserId);
    expect(refreshed.status).toBe('HELD');

    // Different client tries to steal hold
    const intruderId = uuidv4();
    expect(() => SlotLockService.holdSlot(testSlotId, intruderId)).toThrow();
  });
});

