import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/index';
import { AuthService } from '../../src/services/auth.service';

describe('RBAC & Route Protection Integration Tests', () => {
  const patientToken = AuthService.generateToken({
    id: 'test-patient-id',
    name: 'Test Patient',
    email: 'testpatient@example.com',
    phone: '+919000000001',
    role: 'PATIENT',
    status: 'ACTIVE'
  });

  const doctorToken = AuthService.generateToken({
    id: 'test-doctor-id',
    name: 'Test Doctor',
    email: 'testdoctor@example.com',
    phone: '+919000000002',
    role: 'DOCTOR',
    status: 'ACTIVE'
  });

  const adminToken = AuthService.generateToken({
    id: 'test-admin-id',
    name: 'Test Admin',
    email: 'testadmin@example.com',
    phone: '+919000000003',
    role: 'ADMIN',
    status: 'ACTIVE'
  });

  it('allows public search without authentication', async () => {
    const res = await request(app).get('/api/doctors');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('rejects unauthenticated requests to protected booking endpoints with 401', async () => {
    const res = await request(app).get('/api/appointments');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHORIZED');
  });

  it('rejects PATIENT accessing ADMIN reporting dashboard with 403', async () => {
    const res = await request(app)
      .get('/api/admin/reports/operational')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  it('allows ADMIN to access reporting dashboard', async () => {
    const res = await request(app)
      .get('/api/admin/reports/operational')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalBookings');
    expect(res.body).toHaveProperty('doctorUtilizationRatePercent');
  });
});

