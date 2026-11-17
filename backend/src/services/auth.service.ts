import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../models/db';
import { BadRequestError, UnauthorizedError, ConflictError, NotFoundError } from '../middlewares/error.middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'doctor-booking-dev-secret-key-2026';
const JWT_EXPIRES_IN = '7d';

export interface UserPayload {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN' | 'RECEPTIONIST';
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
}

export class AuthService {
  public static async register(data: {
    role: 'PATIENT' | 'DOCTOR' | 'ADMIN' | 'RECEPTIONIST';
    name: string;
    email: string;
    phone?: string;
    password?: string;
  }): Promise<{ token: string; user: UserPayload }> {
    const db = getDb();

    // Check if email already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(data.email);
    if (existing) {
      throw new ConflictError('A user with this email address already exists');
    }

    const userId = uuidv4();
    const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : null;

    const stmt = db.prepare(`
      INSERT INTO users (id, role, name, email, phone, password_hash, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', datetime('now'), datetime('now'))
    `);

    stmt.run(userId, data.role, data.name, data.email, data.phone || null, passwordHash);

    // If registered as PATIENT, initialize empty patient profile
    if (data.role === 'PATIENT') {
      const profileId = uuidv4();
      db.prepare(`
        INSERT INTO patient_profiles (id, user_id, no_show_count, created_at, updated_at)
        VALUES (?, ?, 0, datetime('now'), datetime('now'))
      `).run(profileId, userId);
    }

    const user: UserPayload = {
      id: userId,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      role: data.role,
      status: 'ACTIVE'
    };

    const token = this.generateToken(user);
    return { token, user };
  }

  public static async login(email: string, password: string): Promise<{ token: string; user: UserPayload }> {
    const db = getDb();
    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (!row) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (row.status !== 'ACTIVE') {
      throw new UnauthorizedError(`Account is ${row.status.toLowerCase()}. Please contact clinic administration.`);
    }

    if (!row.password_hash) {
      throw new UnauthorizedError('Account requires OTP login');
    }

    const isMatch = await bcrypt.compare(password, row.password_hash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const user: UserPayload = {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      role: row.role,
      status: row.status
    };

    const token = this.generateToken(user);
    return { token, user };
  }

  public static async sendOtp(phone: string): Promise<{ message: string; expiresInSeconds: number; debugOtp?: string }> {
    const db = getDb();
    // Deterministic 6-digit OTP (e.g. 123456 in dev/test)
    const code = '123456';
    const otpHash = await bcrypt.hash(code, 8);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    let user = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone) as any;
    if (!user) {
      // Auto-create patient placeholder if not exists
      const userId = uuidv4();
      db.prepare(`
        INSERT INTO users (id, role, name, phone, otp_secret, otp_expires_at, status, created_at, updated_at)
        VALUES (?, 'PATIENT', 'Mobile Patient', ?, ?, ?, 'ACTIVE', datetime('now'), datetime('now'))
      `).run(userId, phone, otpHash, expiresAt);

      db.prepare(`
        INSERT INTO patient_profiles (id, user_id, no_show_count, created_at, updated_at)
        VALUES (?, ?, 0, datetime('now'), datetime('now'))
      `).run(uuidv4(), userId);
    } else {
      db.prepare(`
        UPDATE users SET otp_secret = ?, otp_expires_at = ?, updated_at = datetime('now')
        WHERE phone = ?
      `).run(otpHash, expiresAt, phone);
    }

    console.log(`[SMS Gateway] Dispatched OTP to ${phone}: ${code}`);
    return { message: 'OTP sent successfully', expiresInSeconds: 300, debugOtp: code };
  }

  public static async verifyOtp(phone: string, code: string): Promise<{ token: string; user: UserPayload }> {
    const db = getDb();
    const row = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone) as any;

    if (!row || !row.otp_secret || !row.otp_expires_at) {
      throw new UnauthorizedError('No active OTP request found for this phone');
    }

    if (new Date(row.otp_expires_at).getTime() < Date.now()) {
      throw new UnauthorizedError('OTP has expired. Please request a new one.');
    }

    const isValid = await bcrypt.compare(code, row.otp_secret);
    if (!isValid) {
      throw new UnauthorizedError('Invalid verification code');
    }

    // Clear secret after verification
    db.prepare('UPDATE users SET otp_secret = NULL, otp_expires_at = NULL WHERE id = ?').run(row.id);

    const user: UserPayload = {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      role: row.role,
      status: row.status
    };

    const token = this.generateToken(user);
    return { token, user };
  }

  public static getUserById(userId: string): UserPayload {
    const db = getDb();
    const row = db.prepare('SELECT id, name, email, phone, role, status FROM users WHERE id = ?').get(userId) as any;
    if (!row) {
      throw new NotFoundError('User not found');
    }
    return row;
  }

  public static generateToken(user: UserPayload): string {
    return jwt.sign(
      { id: user.id, role: user.role, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  public static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch {
      throw new UnauthorizedError('Invalid or expired authentication token');
    }
  }
}

