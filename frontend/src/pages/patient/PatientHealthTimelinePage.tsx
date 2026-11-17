import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { DigitalPrescriptionModal } from '../../components/consultation/DigitalPrescriptionModal';
import { DigitalPrescription, Appointment } from '../../types';
import {
  Activity,
  Calendar,
  FileText,
  Clock,
  Download,
  Stethoscope,
  Pill,
  CheckCircle2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

export interface TimelineEvent {
  id: string;
  type: 'VISIT' | 'PRESCRIPTION' | 'LAB_REPORT' | 'UPCOMING';
  date: string;
  title: string;
  subtitle: string;
  doctorName: string;
  specialization: string;
  clinicName: string;
  badge: string;
  details?: string;
  prescriptionData?: DigitalPrescription;
  fileUrl?: string;
  appointmentId?: string;
}

export const PatientHealthTimelinePage: React.FC = () => {
  const { user } = useAuth();
  const [filterType, setFilterType] = useState<string>('ALL');
  const [activePrescription, setActivePrescription] = useState<DigitalPrescription | null>(null);

  // Fetch patient appointments
  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ['my-appointments'],
    queryFn: async () => {
      const res = await api.get('/appointments/my');
      return res.data;
    }
  });

  const createMockPrescription = (apt: Appointment): DigitalPrescription => ({
    id: `rx-${apt.id}`,
    appointmentId: apt.id,
    bookingReference: apt.bookingReference,
    doctorName: apt.doctorName,
    doctorSpecialization: apt.specialization,
    doctorQualifications: 'MBBS, MD, Fellowship in Internal Medicine',
    doctorRegNo: 'MCI-2019-94812',
    clinicName: apt.clinicName,
    clinicAddress: apt.clinicAddress || '12-B Hospital Road, Health City',
    clinicPhone: '+91 98765 43210',
    patientName: apt.patientName || user?.name || 'Jane Doe',
    patientAge: 34,
    patientGender: 'Female',
    patientBloodGroup: 'O+',
    date: apt.startTime,
    diagnosis: `${apt.specialization} Routine Clinical Evaluation & Management`,
    symptoms: ['Mild Fatigue', 'Occasional Headache', 'Follow-up Check'],
    vitals: {
      bloodPressure: '120/80 mmHg',
      heartRateBpm: 72,
      temperatureF: 98.4,
      weightKg: 64.5
    },
    medicines: [
      {
        id: 'm1',
        name: 'Tab. Paracetamol 650mg',
        dosage: '650 mg',
        frequency: { morning: true, noon: false, night: true },
        timing: 'After Food',
        duration: '3 Days',
        specialInstruction: 'Take only if fever or headache persists'
      },
      {
        id: 'm2',
        name: 'Cap. Multivitamin & Zinc',
        dosage: 'Daily Tablet',
        frequency: { morning: true, noon: false, night: false },
        timing: 'After Food',
        duration: '15 Days',
        specialInstruction: 'Take with morning breakfast'
      }
    ],
    doctorAdvice: 'Maintain healthy hydration (2.5L daily). Avoid excessive screen time before bed. Light walking 30 mins/day.',
    followUpDate: 'In 2 Weeks if symptoms recur',
    qrVerificationCode: `VERIFY-RX-${apt.bookingReference}-DPDP`
  });

  // Build unified chronological timeline items
  const timelineEvents: TimelineEvent[] = [
    // Upcoming visits from appointments
    ...appointments
      .filter(a => a.status === 'CONFIRMED')
      .map(a => ({
        id: `apt-${a.id}`,
        type: 'UPCOMING' as const,
        date: a.startTime,
        title: `Upcoming Consultation with ${a.doctorName}`,
        subtitle: `${a.consultationType === 'VIDEO' ? 'Secure HD Video Call' : 'In-Person Clinic Visit'} at ${a.clinicName}`,
        doctorName: a.doctorName,
        specialization: a.specialization,
        clinicName: a.clinicName,
        badge: 'Upcoming',
        details: `Booking Ref: ${a.bookingReference} • Fee: ₹${a.feeAmount}`,
        appointmentId: a.id
      })),
    // Completed visits & prescriptions
    ...appointments
      .filter(a => a.status === 'COMPLETED')
      .flatMap(a => [
        {
          id: `visit-${a.id}`,
          type: 'VISIT' as const,
          date: a.startTime,
          title: `Completed Clinical Visit with ${a.doctorName}`,
          subtitle: `${a.specialization} • ${a.clinicName}`,
          doctorName: a.doctorName,
          specialization: a.specialization,
          clinicName: a.clinicName,
          badge: 'Visit Completed',
          details: `Reference: ${a.bookingReference}`,
          appointmentId: a.id
        },
        {
          id: `rx-${a.id}`,
          type: 'PRESCRIPTION' as const,
          date: a.startTime,
          title: `Digital Prescription Issued by ${a.doctorName}`,
          subtitle: `2 Prescribed Medications • Includes Dosage & Diet Schedule`,
          doctorName: a.doctorName,
          specialization: a.specialization,
          clinicName: a.clinicName,
          badge: 'Prescription Available',
          prescriptionData: createMockPrescription(a),
          appointmentId: a.id
        }
      ]),
    // Sample Diagnostic Report Entry
    {
      id: 'lab-1',
      type: 'LAB_REPORT' as const,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      title: 'Complete Blood Count (CBC) & Lipid Profile',
      subtitle: 'Apollo Diagnostics Laboratory • Verified by Pathologist',
      doctorName: 'Dr. Ramesh Sharma',
      specialization: 'Internal Medicine',
      clinicName: 'Apollo Diagnostics',
      badge: 'Diagnostic Report',
      details: 'All parameters within normal clinical range. Cholesterol: 185 mg/dL, Hb: 13.8 g/dL.',
      fileUrl: '#'
    }
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredEvents = timelineEvents.filter(e => {
    if (filterType === 'ALL') return true;
    return e.type === filterType;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner - Calming Healthcare Aesthetic */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-teal-700 rounded-3xl p-8 sm:p-10 text-white shadow-md relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-semibold mb-3 border border-white/20">
            <ShieldCheck className="w-4 h-4 text-teal-200" />
            <span>DPDP-Compliant Health Record Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
            Patient Health Journey & Timeline
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
            A continuous chronological log of your consultations, doctor recommendations, printable digital prescriptions, and diagnostic lab reports.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards - Porcelain Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-semibold">Total Visits</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {appointments.filter(a => a.status === 'COMPLETED').length + 1}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Verified consultations</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-semibold">Active Prescriptions</span>
            <Pill className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {appointments.filter(a => a.status === 'COMPLETED').length > 0 ? '2' : '1'}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Current medication plans</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-semibold">Diagnostic Records</span>
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">1</div>
          <span className="text-[11px] text-slate-400 font-medium">Lab & scan attachments</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-semibold">Next Appointment</span>
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xs font-bold text-amber-700 mt-2 truncate">
            {appointments.find(a => a.status === 'CONFIRMED')
              ? new Date(appointments.find(a => a.status === 'CONFIRMED')!.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })
              : 'None Scheduled'}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Upcoming slot</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-100 p-1 rounded-xl">
          {[
            { id: 'ALL', label: 'All Timeline Events' },
            { id: 'VISIT', label: 'Consultations' },
            { id: 'PRESCRIPTION', label: 'Digital Prescriptions' },
            { id: 'LAB_REPORT', label: 'Lab Reports' },
            { id: 'UPCOMING', label: 'Upcoming' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                filterType === tab.id
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500 hidden sm:block font-medium">
          {filteredEvents.length} record{filteredEvents.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Vertical Interactive Timeline */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-blue-200 space-y-6 my-8 ml-3">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/90 text-slate-500 text-xs">
            No health events found matching this filter.
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const dateObj = new Date(evt.date);
            const dateStr = dateObj.toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });
            const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const isUpcoming = evt.type === 'UPCOMING';
            const isRx = evt.type === 'PRESCRIPTION';
            const isLab = evt.type === 'LAB_REPORT';

            return (
              <div key={evt.id} className="relative group">
                {/* Timeline node icon */}
                <div
                  className={`absolute -left-[35px] sm:-left-[43px] top-1.5 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-110 ${
                    isUpcoming
                      ? 'bg-amber-500 ring-4 ring-amber-100'
                      : isRx
                      ? 'bg-blue-600 ring-4 ring-blue-100'
                      : isLab
                      ? 'bg-indigo-600 ring-4 ring-indigo-100'
                      : 'bg-teal-600 ring-4 ring-teal-100'
                  }`}
                >
                  {isUpcoming ? (
                    <Calendar className="w-4 h-4" />
                  ) : isRx ? (
                    <Pill className="w-4 h-4" />
                  ) : isLab ? (
                    <FileText className="w-4 h-4" />
                  ) : (
                    <Stethoscope className="w-4 h-4" />
                  )}
                </div>

                {/* Card Container - White Porcelain */}
                <div className="bg-white border border-slate-200/90 group-hover:border-blue-400/80 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-all text-slate-900">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                          isUpcoming
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : isRx
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : isLab
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-teal-50 text-teal-700 border-teal-200'
                        }`}
                      >
                        {evt.badge}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {dateStr} at {timeStr}
                      </span>
                    </div>

                    {isUpcoming && evt.appointmentId && (
                      <Link
                        to={`/telehealth/${evt.appointmentId}`}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs shadow-xs transition-all"
                      >
                        <span>Join Session</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{evt.subtitle}</p>

                  {evt.details && (
                    <p className="text-xs text-slate-700 mt-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                      {evt.details}
                    </p>
                  )}

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                    <span className="text-[11px] text-slate-500">
                      Doctor: <strong className="text-slate-800 font-semibold">{evt.doctorName}</strong> ({evt.specialization})
                    </span>

                    {evt.prescriptionData && (
                      <button
                        onClick={() => setActivePrescription(evt.prescriptionData!)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Print Letterhead</span>
                      </button>
                    )}

                    {evt.type === 'LAB_REPORT' && (
                      <button
                        onClick={() => alert('Downloading official lab test report PDF...')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Lab PDF</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Digital Prescription Letterhead Modal */}
      {activePrescription && (
        <DigitalPrescriptionModal
          prescription={activePrescription}
          onClose={() => setActivePrescription(null)}
        />
      )}
    </div>
  );
};
