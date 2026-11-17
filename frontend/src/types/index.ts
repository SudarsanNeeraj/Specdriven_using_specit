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

