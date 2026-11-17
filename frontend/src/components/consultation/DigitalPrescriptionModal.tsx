import React from 'react';
import { DigitalPrescription } from '../../types';
import {
  Printer,
  X,
  Building2,
  FileText,
  Calendar,
  CheckCircle,
  QrCode,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';

interface DigitalPrescriptionModalProps {
  prescription: DigitalPrescription;
  onClose: () => void;
}

export const DigitalPrescriptionModal: React.FC<DigitalPrescriptionModalProps> = ({
  prescription,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-6 border border-slate-200 print:border-none print:shadow-none print:rounded-none print:m-0 print:w-full print:max-w-none">
        {/* Action Header (Hidden in Print) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold">Official Digital Clinical Prescription</h3>
            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-mono">
              {prescription.bookingReference}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow transition-all hover:scale-[1.02]"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Prescription Paper Body */}
        <div className="p-8 sm:p-12 bg-white relative font-sans text-slate-800 print:p-6">
          {/* Subtle Rx Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03] z-0">
            <span className="text-[320px] font-serif font-extrabold italic text-slate-900">Rx</span>
          </div>

          {/* Letterhead Header */}
          <div className="relative z-10 border-b-2 border-slate-900 pb-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-2 bg-blue-600 text-white rounded-lg print:border print:border-slate-800">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {prescription.clinicName}
                    </h1>
                    <p className="text-xs text-slate-500">Multi-Specialty Healthcare & Diagnostics Center</p>
                  </div>
                </div>
                <div className="text-xs text-slate-600 space-y-0.5 mt-2">
                  <p>{prescription.clinicAddress}</p>
                  <p>Helpline / Appointments: {prescription.clinicPhone}</p>
                </div>
              </div>

              {/* Doctor Details */}
              <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                <h2 className="text-lg font-bold text-slate-900">{prescription.doctorName}</h2>
                <p className="text-xs font-semibold text-blue-700">{prescription.doctorSpecialization}</p>
                <p className="text-xs text-slate-600">{prescription.doctorQualifications}</p>
                <p className="text-[11px] font-mono text-slate-500 mt-1">
                  Reg No: <strong className="text-slate-800">{prescription.doctorRegNo}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Patient Details & Vitals Strip */}
          <div className="relative z-10 bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Patient Name</span>
                <span className="font-bold text-slate-900 text-sm">{prescription.patientName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Age / Gender / Blood</span>
                <span className="font-semibold text-slate-800">
                  {prescription.patientAge ? `${prescription.patientAge} Yrs` : 'Adult'} • {prescription.patientGender || 'Not Specified'} • {prescription.patientBloodGroup || 'O+'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Prescription Date</span>
                <span className="font-semibold text-slate-800">
                  {new Date(prescription.date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Booking ID</span>
                <span className="font-mono font-bold text-emerald-700">{prescription.bookingReference}</span>
              </div>
            </div>

            {/* Vitals Strip */}
            {prescription.vitals && (
              <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-wrap items-center gap-4 text-[11px]">
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Vitals Recorded:</span>
                {prescription.vitals.bloodPressure && (
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                    BP: <strong>{prescription.vitals.bloodPressure}</strong>
                  </span>
                )}
                {prescription.vitals.heartRateBpm && (
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                    Pulse: <strong>{prescription.vitals.heartRateBpm} bpm</strong>
                  </span>
                )}
                {prescription.vitals.temperatureF && (
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                    Temp: <strong>{prescription.vitals.temperatureF}°F</strong>
                  </span>
                )}
                {prescription.vitals.weightKg && (
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                    Weight: <strong>{prescription.vitals.weightKg} kg</strong>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Clinical Findings & Diagnosis */}
          <div className="relative z-10 mb-6 text-xs">
            <div className="flex items-start gap-4">
              <div className="w-1/3">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Chief Complaints</h4>
                <div className="flex flex-wrap gap-1">
                  {prescription.symptoms.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="w-2/3 border-l border-slate-200 pl-4">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Clinical Diagnosis</h4>
                <p className="font-semibold text-slate-900 text-sm">{prescription.diagnosis}</p>
              </div>
            </div>
          </div>

          {/* Rx Symbol Header */}
          <div className="relative z-10 flex items-center gap-2 mb-3">
            <span className="text-2xl font-serif font-black italic text-emerald-800">Rx</span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Prescribed Medications</span>
          </div>

          {/* Medication Dosage Schedule Table */}
          <div className="relative z-10 border border-slate-200 rounded-xl overflow-hidden mb-6 text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 text-[11px] uppercase font-bold">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Medicine & Strength</th>
                  <th className="py-2.5 px-3">Dosage Schedule</th>
                  <th className="py-2.5 px-3">Timing</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {prescription.medicines.map((med, index) => (
                  <tr key={med.id || index} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 text-slate-400 font-medium">{index + 1}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{med.name}</span>
                      <span className="text-[10px] text-slate-500">{med.dosage}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-xs">
                        <span className={`px-1.5 py-0.5 rounded ${med.frequency.morning ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}>
                          {med.frequency.morning ? '1' : '0'}
                        </span>
                        <span className="text-slate-300">-</span>
                        <span className={`px-1.5 py-0.5 rounded ${med.frequency.noon ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}>
                          {med.frequency.noon ? '1' : '0'}
                        </span>
                        <span className="text-slate-300">-</span>
                        <span className={`px-1.5 py-0.5 rounded ${med.frequency.night ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}>
                          {med.frequency.night ? '1' : '0'}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-400 block mt-0.5">Morn - Noon - Night</span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px]">
                        {med.timing}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{med.duration}</td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">{med.specialInstruction || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* General Advice & Lifestyle Guidance */}
          {prescription.doctorAdvice && (
            <div className="relative z-10 bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 mb-6 text-xs text-amber-900">
              <h4 className="font-bold uppercase tracking-wider text-[10px] text-amber-800 mb-1">
                Doctor's General Advice & Precautions
              </h4>
              <p className="leading-relaxed">{prescription.doctorAdvice}</p>
            </div>
          )}

          {/* Prescription Footer: Follow-up & Verification QR */}
          <div className="relative z-10 pt-6 border-t-2 border-slate-900 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 text-xs">
            {/* QR Code & Security Stamp */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 p-1.5 border border-slate-300 rounded-lg bg-slate-50 flex items-center justify-center">
                <QrCode className="w-12 h-12 text-slate-800" />
              </div>
              <div className="text-[10px] text-slate-500">
                <div className="flex items-center gap-1 font-semibold text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Digitally Signed & Verified</span>
                </div>
                <p className="mt-0.5">Scan to verify authentic medical record</p>
                <p className="font-mono text-slate-400">{prescription.qrVerificationCode}</p>
              </div>
            </div>

            {/* Doctor Signature Block */}
            <div className="text-center sm:text-right">
              <div className="font-serif italic text-emerald-800 font-bold text-base mb-1 tracking-wider">
                {prescription.doctorName}
              </div>
              <div className="w-48 h-0.5 bg-slate-400 mx-auto sm:ml-auto mb-1" />
              <p className="font-bold text-slate-900">{prescription.doctorName}</p>
              <p className="text-[10px] text-slate-500">Authorized Medical Practitioner Stamp</p>
              {prescription.followUpDate && (
                <p className="text-[10px] font-semibold text-emerald-700 mt-1">
                  Next Follow-up: {prescription.followUpDate}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

