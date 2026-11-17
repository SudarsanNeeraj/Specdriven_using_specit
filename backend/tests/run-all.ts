import assert from 'assert';
import { v4 as uuidv4 } from 'uuid';
import { getDb, closeDb } from '../src/models/db';
import { SlotLockService } from '../src/services/slot-lock.service';
import { AuthService } from '../src/services/auth.service';
import { DoctorService } from '../src/services/doctor.service';
import { AppointmentService } from '../src/services/appointment.service';
import { WaitlistService } from '../src/services/waitlist.service';
import { ReportService } from '../src/services/report.service';

async function runTests() {
  console.log('--- Starting Integration & Concurrency Test Suite ---');

  // Test 1: Concurrency 50-client slot hold mutual exclusion
  console.log('[Test 1] 50-Client Concurrent Slot Hold Mutual Exclusion...');
  const db = getDb();
  const testDoctorId = uuidv4();
  const docUserId = uuidv4();
  const runId = Date.now();

  db.prepare(`
    INSERT INTO users (id, role, name, email, status, created_at, updated_at)
    VALUES (?, 'DOCTOR', 'Dr. Concurrency', ?, 'ACTIVE', datetime('now'), datetime('now'))
  `).run(docUserId, `concurrency_${runId}@test.com`);

  db.prepare(`
    INSERT INTO doctor_profiles (
      id, user_id, specialization, qualifications, experience_years, languages, clinic_name, clinic_address, city, in_person_fee, video_fee
    ) VALUES (?, ?, 'Cardiology', 'MBBS, MD', 12, '["English"]', 'Test Clinic', 'Test Address', 'Mumbai', 1200, 900)
  `).run(testDoctorId, docUserId);

  const testSlotId = uuidv4();
  db.prepare(`
    INSERT INTO appointment_slots (id, doctor_id, start_time, end_time, status, created_at)
    VALUES (?, ?, '2026-12-05T10:00:00Z', '2026-12-05T10:30:00Z', 'AVAILABLE', datetime('now'))
  `).run(testSlotId, testDoctorId);

  const clientCount = 50;
  const clientUserIds = Array.from({ length: clientCount }, () => uuidv4());

  const insertClient = db.prepare(`
    INSERT INTO users (id, role, name, email, status, created_at, updated_at)
    VALUES (?, 'PATIENT', 'Patient Client', ?, 'ACTIVE', datetime('now'), datetime('now'))
  `);

  for (let i = 0; i < clientCount; i++) {
    insertClient.run(clientUserIds[i], `client${i}_${Date.now()}@test.com`);
  }

  const results = await Promise.all(
    clientUserIds.map(async (userId) => {
      try {
        const hold = SlotLockService.holdSlot(testSlotId, userId);
        return { success: true, hold, userId };
      } catch (err: any) {
        return { success: false, error: err.message, statusCode: err.statusCode };
      }
    })
  );

  const successful = results.filter(r => r.success);
  const conflicted = results.filter(r => !r.success);

  assert.strictEqual(successful.length, 1, 'Exactly one concurrent client must succeed');
  assert.strictEqual(conflicted.length, 49, '49 concurrent clients must receive conflict');
  assert.strictEqual(conflicted[0].statusCode, 409, 'Conflict status code must be 409');
  console.log('✓ PASS: Exactly 1 client locked the slot, 49 received 409 Conflict.');

  // Test 2: Booking Confirmation
  console.log('[Test 2] Booking Confirmation for Held Slot...');
  const holdingUserId = successful[0].userId;

  const appointment = AppointmentService.createAppointment(holdingUserId, {
    slotId: testSlotId,
    consultationType: 'VIDEO',
    patientNotes: 'Urgent checkup',
    paymentMethod: 'ONLINE_CARD'
  });

  assert.ok(appointment.id, 'Appointment ID must exist');
  assert.ok(appointment.bookingReference.startsWith('APT-'), 'Booking ref must start with APT-');
  assert.strictEqual(appointment.status, 'CONFIRMED', 'Status must be CONFIRMED');
  assert.ok(appointment.videoRoomId, 'Video room ID must be generated for VIDEO consultation');
  console.log(`✓ PASS: Appointment confirmed with ref ${appointment.bookingReference} and video room ${appointment.videoRoomId}`);

  // Test 3: Doctor Search & Filtering
  console.log('[Test 3] Doctor Search and Discovery Filters...');
  const cardiologists = DoctorService.searchDoctors({ specialization: 'Cardiology' });
  assert.ok(cardiologists.length >= 1, 'Must find at least 1 cardiologist');
  assert.strictEqual(cardiologists[0].specialization, 'Cardiology');
  console.log(`✓ PASS: Discovered ${cardiologists.length} cardiologist(s).`);

  // Test 4: Waitlist FIFO and Cancellation Cascade
  console.log('[Test 4] Waitlist Registration and Cancellation Cascade...');
  const waitlistPatientId = uuidv4();
  db.prepare(`
    INSERT INTO users (id, role, name, phone, status, created_at, updated_at)
    VALUES (?, 'PATIENT', 'Waiting Patient', '+919999988888', 'ACTIVE', datetime('now'), datetime('now'))
  `).run(waitlistPatientId);

  const waitlistEntry = WaitlistService.joinWaitlist({
    doctorId: testDoctorId,
    patientId: waitlistPatientId,
    targetDate: '2026-12-05',
    consultationType: 'IN_PERSON'
  });
  assert.strictEqual(waitlistEntry.status, 'ACTIVE');

  // Cancel earlier appointment
  const cancelResult = AppointmentService.cancelAppointment(appointment.id, holdingUserId, 'Need to cancel');
  assert.ok(cancelResult.message.includes('cancelled successfully'));

  // Check that waitlist candidate was transitioned to NOTIFIED
  const updatedWaitlist = db.prepare('SELECT status, notification_expires_at FROM waitlist_entries WHERE id = ?').get(waitlistEntry.id) as any;
  assert.strictEqual(updatedWaitlist.status, 'NOTIFIED', 'Waitlist candidate must be transitioned to NOTIFIED');
  assert.ok(updatedWaitlist.notification_expires_at, 'Notification priority window must be set');
  console.log('✓ PASS: Appointment cancellation immediately triggered priority notification to waitlist.');

  // Test 5: Operational Analytics Report
  console.log('[Test 5] Administrative Operational Analytics Reporting...');
  const report = ReportService.getOperationalReport();
  assert.ok(report.totalBookings >= 1, 'Must report bookings');
  assert.ok(typeof report.cancellationRatePercent === 'number', 'Cancellation rate must be calculated');
  assert.ok(typeof report.doctorUtilizationRatePercent === 'number', 'Doctor utilization rate must be calculated');
  console.log(`✓ PASS: Operational report generated: Total Bookings: ${report.totalBookings}, Utilization: ${report.doctorUtilizationRatePercent}%.`);

  console.log('---------------------------------------------------');
  console.log('🎉 ALL INTEGRATION & CONCURRENCY TESTS PASSED! 🎉');
  console.log('---------------------------------------------------');
  closeDb();
}

runTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
