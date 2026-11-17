import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../models/db';

export interface AuditLogEntry {
  actorUserId?: string | null;
  action: string;
  resourceType: string;
  resourceId: string;
  ipAddress?: string | null;
  details?: Record<string, any> | string | null;
}

export class AuditService {
  public static log(entry: AuditLogEntry): void {
    try {
      const db = getDb();
      const id = uuidv4();
      const detailsStr = entry.details 
        ? (typeof entry.details === 'string' ? entry.details : JSON.stringify(entry.details)) 
        : null;

      const stmt = db.prepare(`
        INSERT INTO audit_logs (id, actor_user_id, action, resource_type, resource_id, ip_address, details, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `);

      stmt.run(
        id,
        entry.actorUserId || null,
        entry.action,
        entry.resourceType,
        entry.resourceId,
        entry.ipAddress || null,
        detailsStr
      );
    } catch (err) {
      console.error('Failed to persist audit log:', err);
    }
  }
}

