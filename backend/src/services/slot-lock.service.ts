import { getDb } from '../models/db';
import { ConflictError, NotFoundError } from '../middlewares/error.middleware';

export interface HoldResult {
  slotId: string;
  status: 'HELD';
  holdExpiresAt: string;
  remainingSeconds: number;
}

export class SlotLockService {
  /**
   * Atomically acquires a 5-minute temporary hold lock on a slot.
   * Throws 409 Conflict if already held or booked.
   */
  public static holdSlot(slotId: string, userId: string): HoldResult {
    const db = getDb();

    // Verify slot exists
    const slot = db.prepare('SELECT id, status, hold_expires_at, held_by_user_id FROM appointment_slots WHERE id = ?').get(slotId) as any;
    if (!slot) {
      throw new NotFoundError(`Slot '${slotId}' not found`);
    }

    // Atomic conditional update: slot must be AVAILABLE or an EXPIRED hold
    const stmt = db.prepare(`
      UPDATE appointment_slots
      SET status = 'HELD',
          hold_expires_at = datetime('now', '+5 minutes'),
          held_by_user_id = ?
      WHERE id = ?
        AND (
          status = 'AVAILABLE'
          OR (status = 'HELD' AND (hold_expires_at < datetime('now') OR held_by_user_id = ?))
        )
    `);

    const result = stmt.run(userId, slotId, userId);

    if (result.changes === 0) {
      throw new ConflictError('This time slot is currently reserved or held by another user. Please choose another slot.');
    }

    const updated = db.prepare('SELECT hold_expires_at FROM appointment_slots WHERE id = ?').get(slotId) as any;

    return {
      slotId,
      status: 'HELD',
      holdExpiresAt: updated.hold_expires_at,
      remainingSeconds: 300
    };
  }

  /**
   * Explicitly releases a held slot.
   */
  public static releaseSlot(slotId: string, userId: string): boolean {
    const db = getDb();
    const result = db.prepare(`
      UPDATE appointment_slots
      SET status = 'AVAILABLE',
          hold_expires_at = NULL,
          held_by_user_id = NULL
      WHERE id = ? AND status = 'HELD' AND held_by_user_id = ?
    `).run(slotId, userId);

    return result.changes > 0;
  }

  /**
   * Sweeper executed periodically to return expired holds to public inventory.
   */
  public static sweepExpiredHolds(): number {
    const db = getDb();
    const result = db.prepare(`
      UPDATE appointment_slots
      SET status = 'AVAILABLE',
          hold_expires_at = NULL,
          held_by_user_id = NULL
      WHERE status = 'HELD' AND hold_expires_at < datetime('now')
    `).run();

    if (result.changes > 0) {
      console.log(`[Hold Sweeper] Released ${result.changes} expired slot hold(s) back to available inventory.`);
    }
    return result.changes;
  }
}

