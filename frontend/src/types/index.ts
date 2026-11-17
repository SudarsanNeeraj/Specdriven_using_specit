export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN' | 'RECEPTIONIST';

export interface User {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
}

export interface DoctorCard {
  id: string;
  name: string;
  email: string;
  specialization: string;
  qualifications: string;
  experienceYears: number;
  city: string;
  clinicName: string;
  clinicAddress: string;
  languages: string[];
  inPersonFee: number;
  videoFee: number;
  ratingAvg: number;
  ratingCount: number;
  nextAvailableSlot?: string | null;
}

export interface AppointmentSlot {
  id: string;
  doctorId: string;
  startTime: string;
  endTime: string;
  status: 'AVAILABLE' | 'HELD' | 'BOOKED' | 'BLOCKED';
  holdExpiresAt?: string | null;
}

export interface Appointment {
  id: string;
  bookingReference: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  patientEmail?: string;
  doctorId: string;
  doctorName: string;
  specialization: string;
  clinicName: string;
  clinicAddress?: string;
  slotId: string;
  startTime: string;
  endTime: string;
  consultationType: 'IN_PERSON' | 'VIDEO';
  status: 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  feeAmount: number;
  paymentStatus: 'PAID' | 'PENDING' | 'AT_CLINIC' | 'REFUNDED';
  videoRoomUrl?: string | null;
  patientNotes?: string;
  createdAt: string;
}

export interface MedicalRecord {
  id: string;
  appointmentId?: string;
  patientId: string;
  recordType: 'PRESCRIPTION' | 'LAB_REPORT' | 'DIAGNOSTIC_IMAGE' | 'VISIT_SUMMARY' | 'OTHER';
  fileName: string;
  fileMimeType: string;
  fileSizeBytes: number;
  fileUrl: string;
  notes?: string;
  createdAt: string;
}

export interface OperationalReport {
  dateRange: string;
  totalBookings: number;
  completedVisits: number;
  cancellationRatePercent: number;
  noShowRatePercent: number;
  totalRevenue: number;
  doctorUtilizationRatePercent: number;
  specializationBreakdown: Array<{ specialization: string; count: number; revenue: number }>;
  doctorUtilization: Array<{ id: string; name: string; specialization: string; clinicName: string; totalAppointments: number; completedCount: number }>;
}

export interface PrescriptionMedicine {
  id: string;
  name: string;
  dosage: string;
  frequency: {
    morning: boolean;
    noon: boolean;
    night: boolean;
  };
  timing: 'Before Food' | 'After Food' | 'With Food';
  duration: string;
  specialInstruction?: string;
}

export interface DigitalPrescription {
  id: string;
  appointmentId: string;
  bookingReference: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorQualifications: string;
  doctorRegNo: string;
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  patientBloodGroup?: string;
  date: string;
  diagnosis: string;
  symptoms: string[];
  vitals?: {
    bloodPressure?: string;
    heartRateBpm?: number;
    temperatureF?: number;
    weightKg?: number;
  };
  medicines: PrescriptionMedicine[];
  doctorAdvice?: string;
  followUpDate?: string;
  qrVerificationCode: string;
}

export interface QueueToken {
  id: string;
  tokenNumber: string; // e.g. "A-101"
  appointmentId: string;
  patientName: string; // May be masked e.g. "Ramesh K***"
  doctorName: string;
  specialization: string;
  roomCabin: string; // e.g. "OPD Cabin 3"
  scheduledTime: string;
  status: 'IN_CABIN' | 'UP_NEXT' | 'WAITING' | 'COMPLETED';
  estimatedWaitMinutes: number;
}

export interface PatientVitalsSummary {
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  recentBp?: string;
  heartRate?: number;
  weightKg?: number;
}

