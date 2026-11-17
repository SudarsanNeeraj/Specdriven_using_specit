-- Core Relational Schema for Doctor Appointment Booking System

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    role VARCHAR(20) NOT NULL CHECK (role IN ('PATIENT', 'DOCTOR', 'ADMIN', 'RECEPTIONIST')),
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255),
    otp_secret VARCHAR(64),
    otp_expires_at TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'INACTIVE')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Patient Profiles Table
CREATE TABLE IF NOT EXISTS patient_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE NOT NULL,
    dob DATE,
    gender VARCHAR(20),
    blood_group VARCHAR(10),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    allergies TEXT,
    medical_history_summary TEXT,
    no_show_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Doctor Profiles Table
CREATE TABLE IF NOT EXISTS doctor_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    qualifications VARCHAR(200) NOT NULL,
    experience_years INTEGER NOT NULL DEFAULT 0,
    languages TEXT NOT NULL, -- JSON string array
    bio TEXT,
    clinic_name VARCHAR(160) NOT NULL,
    clinic_address TEXT NOT NULL,
    city VARCHAR(80) NOT NULL,
    in_person_fee DECIMAL(10,2) NOT NULL,
    video_fee DECIMAL(10,2) NOT NULL,
    rating_avg DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    rating_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Doctor Schedules Table
CREATE TABLE IF NOT EXISTS doctor_schedules (
    id VARCHAR(36) PRIMARY KEY,
    doctor_id VARCHAR(36) NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    shift_start_time TIME NOT NULL,
    shift_end_time TIME NOT NULL,
    break_start_time TIME,
    break_end_time TIME,
    slot_duration_minutes INTEGER NOT NULL DEFAULT 30 CHECK (slot_duration_minutes IN (15, 30, 45, 60)),
    is_active BOOLEAN NOT NULL DEFAULT 1,
    FOREIGN KEY (doctor_id) REFERENCES doctor_profiles(id) ON DELETE CASCADE
);

-- 5. Schedule Blocks Table (Leaves & Emergencies)
CREATE TABLE IF NOT EXISTS schedule_blocks (
    id VARCHAR(36) PRIMARY KEY,
    doctor_id VARCHAR(36) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    reason VARCHAR(255) NOT NULL,
    is_emergency BOOLEAN NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctor_profiles(id) ON DELETE CASCADE
);

-- 6. Appointment Slots Table
CREATE TABLE IF NOT EXISTS appointment_slots (
    id VARCHAR(36) PRIMARY KEY,
    doctor_id VARCHAR(36) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'HELD', 'BOOKED', 'BLOCKED')),
    held_by_user_id VARCHAR(36),
    hold_expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(doctor_id, start_time),
    FOREIGN KEY (doctor_id) REFERENCES doctor_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (held_by_user_id) REFERENCES users(id)
);

-- 7. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(36) PRIMARY KEY,
    booking_reference VARCHAR(16) NOT NULL UNIQUE,
    patient_id VARCHAR(36) NOT NULL,
    doctor_id VARCHAR(36) NOT NULL,
    slot_id VARCHAR(36) NOT NULL UNIQUE,
    consultation_type VARCHAR(20) NOT NULL CHECK (consultation_type IN ('IN_PERSON', 'VIDEO')),
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
    fee_amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) NOT NULL CHECK (payment_status IN ('PAID', 'PENDING', 'AT_CLINIC', 'REFUNDED')),
    payment_reference VARCHAR(100),
    video_room_id VARCHAR(64),
    patient_notes TEXT,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP,
    cancelled_by_user_id VARCHAR(36),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id),
    FOREIGN KEY (doctor_id) REFERENCES doctor_profiles(id),
    FOREIGN KEY (slot_id) REFERENCES appointment_slots(id),
    FOREIGN KEY (cancelled_by_user_id) REFERENCES users(id)
);

-- 8. Waitlist Entries Table
CREATE TABLE IF NOT EXISTS waitlist_entries (
    id VARCHAR(36) PRIMARY KEY,
    doctor_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    target_date DATE NOT NULL,
    consultation_type VARCHAR(20) NOT NULL CHECK (consultation_type IN ('IN_PERSON', 'VIDEO')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'NOTIFIED', 'CLAIMED', 'EXPIRED')),
    notified_at TIMESTAMP,
    notification_expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctor_profiles(id),
    FOREIGN KEY (patient_id) REFERENCES users(id)
);

-- 9. Medical Records Table
CREATE TABLE IF NOT EXISTS medical_records (
    id VARCHAR(36) PRIMARY KEY,
    appointment_id VARCHAR(36),
    patient_id VARCHAR(36) NOT NULL,
    uploaded_by_user_id VARCHAR(36) NOT NULL,
    record_type VARCHAR(30) NOT NULL CHECK (record_type IN ('PRESCRIPTION', 'LAB_REPORT', 'DIAGNOSTIC_IMAGE', 'VISIT_SUMMARY', 'OTHER')),
    file_name VARCHAR(255) NOT NULL,
    file_mime_type VARCHAR(80) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    file_storage_key VARCHAR(255) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    FOREIGN KEY (patient_id) REFERENCES users(id),
    FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id)
);

-- 10. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(36) PRIMARY KEY,
    appointment_id VARCHAR(36) NOT NULL UNIQUE,
    doctor_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    FOREIGN KEY (doctor_id) REFERENCES doctor_profiles(id),
    FOREIGN KEY (patient_id) REFERENCES users(id)
);

-- 11. Audit Logs Table (Compliance & DPDP trail)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    actor_user_id VARCHAR(36),
    action VARCHAR(60) NOT NULL,
    resource_type VARCHAR(40) NOT NULL,
    resource_id VARCHAR(36) NOT NULL,
    ip_address VARCHAR(45),
    details TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actor_user_id) REFERENCES users(id)
);

-- Indexes for performance & query speed
CREATE INDEX IF NOT EXISTS idx_slots_doctor_date ON appointment_slots(doctor_id, start_time, status);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id, status);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id, status);
CREATE INDEX IF NOT EXISTS idx_waitlist_doctor_date ON waitlist_entries(doctor_id, target_date, status);

