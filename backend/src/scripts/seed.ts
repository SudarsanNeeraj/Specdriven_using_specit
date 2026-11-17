import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../models/db';

export async function seedDatabase() {
  const db = getDb();
  console.log('Seeding initial data...');

  const defaultPassword = await bcrypt.hash('password123', 10);

  // 1. Admin & Receptionist Users
  const adminId = uuidv4();
  const receptionistId = uuidv4();

  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (id, role, name, email, phone, password_hash, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', datetime('now'), datetime('now'))
  `);

  insertUser.run(adminId, 'ADMIN', 'Dr. Arvind Mehta (Chief Admin)', 'admin@medbooking.com', '+919999900001', defaultPassword);
  insertUser.run(receptionistId, 'RECEPTIONIST', 'Pooja Deshmukh (Reception Desk)', 'receptionist@medbooking.com', '+919999900002', defaultPassword);

  // 2. Sample Patients
  const patient1Id = uuidv4();
  const patient2Id = uuidv4();
  insertUser.run(patient1Id, 'PATIENT', 'Rahul Verma', 'rahul@gmail.com', '+919876543210', defaultPassword);
  insertUser.run(patient2Id, 'PATIENT', 'Sneha Kapoor', 'sneha@gmail.com', '+919876543211', defaultPassword);

  const insertPatientProfile = db.prepare(`
    INSERT OR IGNORE INTO patient_profiles (id, user_id, dob, gender, blood_group, emergency_contact_name, emergency_contact_phone, medical_history_summary, no_show_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
  `);
  insertPatientProfile.run(uuidv4(), patient1Id, '1990-05-14', 'MALE', 'O+', 'Sunita Verma', '+919876543299', 'Mild asthma under control');
  insertPatientProfile.run(uuidv4(), patient2Id, '1995-11-20', 'FEMALE', 'B+', 'Karan Kapoor', '+919876543298', 'No chronic illnesses');

  // 3. Doctors & Profiles
  const doctors = [
    {
      name: 'Dr. Rajesh Sharma',
      email: 'rajesh.sharma@medbooking.com',
      phone: '+919800100001',
      specialization: 'Cardiology',
      qualifications: 'MBBS, MD (Cardiology), FACC',
      experienceYears: 16,
      languages: ['English', 'Hindi', 'Marathi'],
      bio: 'Senior Consultant Interventional Cardiologist specializing in preventive cardiac care and heart disease management.',
      clinicName: 'Apex Heart & Wellness Center',
      clinicAddress: '402, Bandra West Medical Hub, Mumbai, Maharashtra 400050',
      city: 'Mumbai',
      inPersonFee: 1200,
      videoFee: 900,
      ratingAvg: 4.9,
      ratingCount: 142
    },
    {
      name: 'Dr. Priya Nair',
      email: 'priya.nair@medbooking.com',
      phone: '+919800100002',
      specialization: 'Pediatrics',
      qualifications: 'MBBS, DCH, DNB (Pediatrics)',
      experienceYears: 11,
      languages: ['English', 'Hindi', 'Kannada', 'Malayalam'],
      bio: 'Compassionate pediatrician focusing on neonatology, childhood vaccination schedules, and adolescent health.',
      clinicName: 'Rainbow Children Health Clinic',
      clinicAddress: '15, Indiranagar 100ft Road, Bangalore, Karnataka 560038',
      city: 'Bangalore',
      inPersonFee: 800,
      videoFee: 650,
      ratingAvg: 4.8,
      ratingCount: 98
    },
    {
      name: 'Dr. Amit Patel',
      email: 'amit.patel@medbooking.com',
      phone: '+919800100003',
      specialization: 'Dermatology',
      qualifications: 'MBBS, MD (Dermatology, Venereology & Leprosy)',
      experienceYears: 9,
      languages: ['English', 'Hindi', 'Gujarati'],
      bio: 'Expert clinical and cosmetic dermatologist treating chronic eczema, acne, psoriasis, and laser skin rejuvenation.',
      clinicName: 'Aura Skin & Hair Institute',
      clinicAddress: 'B-12, South Extension Part II, New Delhi, Delhi 110049',
      city: 'Delhi',
      inPersonFee: 1000,
      videoFee: 800,
      ratingAvg: 4.7,
      ratingCount: 84
    },
    {
      name: 'Dr. Sunita Rao',
      email: 'sunita.rao@medbooking.com',
      phone: '+919800100004',
      specialization: 'Orthopedics',
      qualifications: 'MBBS, MS (Orthopedics), MCh',
      experienceYears: 14,
      languages: ['English', 'Hindi', 'Telugu'],
      bio: 'Specialist in joint replacement, sports injury rehabilitation, and arthroscopic orthopedic surgery.',
      clinicName: 'City Care Orthopedic & Joint Center',
      clinicAddress: 'Plot 88, Jubilee Hills Road No. 36, Hyderabad, Telangana 500033',
      city: 'Hyderabad',
      inPersonFee: 1100,
      videoFee: 850,
      ratingAvg: 4.9,
      ratingCount: 116
    }
  ];

  const insertDoctorProfile = db.prepare(`
    INSERT OR IGNORE INTO doctor_profiles (
      id, user_id, specialization, qualifications, experience_years, languages, bio,
      clinic_name, clinic_address, city, in_person_fee, video_fee, rating_avg, rating_count,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  const insertSchedule = db.prepare(`
    INSERT OR IGNORE INTO doctor_schedules (
      id, doctor_id, day_of_week, shift_start_time, shift_end_time, break_start_time, break_end_time, slot_duration_minutes, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  const insertSlot = db.prepare(`
    INSERT OR IGNORE INTO appointment_slots (
      id, doctor_id, start_time, end_time, status, created_at
    ) VALUES (?, ?, ?, ?, 'AVAILABLE', datetime('now'))
  `);

  for (const doc of doctors) {
    const docUserId = uuidv4();
    const docProfileId = uuidv4();
    insertUser.run(docUserId, 'DOCTOR', doc.name, doc.email, doc.phone, defaultPassword);

    insertDoctorProfile.run(
      docProfileId,
      docUserId,
      doc.specialization,
      doc.qualifications,
      doc.experienceYears,
      JSON.stringify(doc.languages),
      doc.bio,
      doc.clinicName,
      doc.clinicAddress,
      doc.city,
      doc.inPersonFee,
      doc.videoFee,
      doc.ratingAvg,
      doc.ratingCount
    );

    // Add Monday - Friday schedule (days 1 to 5)
    for (let day = 1; day <= 5; day++) {
      insertSchedule.run(
        uuidv4(),
        docProfileId,
        day,
        '09:00',
        '17:00',
        '13:00',
        '14:00',
        30
      );
    }

    // Generate slots for the next 7 days
    const now = new Date();
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const slotDate = new Date(now);
      slotDate.setDate(slotDate.getDate() + dayOffset);
      const yyyy = slotDate.getFullYear();
      const mm = String(slotDate.getMonth() + 1).padStart(2, '0');
      const dd = String(slotDate.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      // Morning slots: 09:30, 10:00, 10:30, 11:00, 11:30
      const slotTimes = ['09:30', '10:00', '10:30', '11:00', '11:30', '14:30', '15:00', '15:30', '16:00'];
      for (const t of slotTimes) {
        const [hh, m] = t.split(':');
        const startIso = `${dateStr}T${hh}:${m}:00Z`;
        const endMinutes = parseInt(m, 10) + 30;
        const endHour = endMinutes >= 60 ? parseInt(hh, 10) + 1 : parseInt(hh, 10);
        const endMinRem = endMinutes % 60;
        const endIso = `${dateStr}T${String(endHour).padStart(2, '0')}:${String(endMinRem).padStart(2, '0')}:00Z`;

        insertSlot.run(uuidv4(), docProfileId, startIso, endIso);
      }
    }
  }

  console.log('Database seeding successfully finished!');
}

if (require.main === module || process.argv[1]?.endsWith('seed.ts')) {
  seedDatabase().catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}

