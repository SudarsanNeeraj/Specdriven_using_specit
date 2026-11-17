import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { ScheduleBuilder } from '../../components/doctor/ScheduleBuilder';
import { EmergencyBlockModal } from '../../components/doctor/EmergencyBlockModal';
import { Appointment } from '../../types';
import {
  Calendar,
  Clock,
  Video,
  User,
  CheckCircle2,
  AlertOctagon,
  FileText,
  Loader2,
  Stethoscope
} from 'lucide-react';

export const DoctorDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'AGENDA' | 'SCHEDULE'>('AGENDA');
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [completingAptId, setCompletingAptId] = useState<string | null>(null);
  const [prescriptionNotes, setPrescriptionNotes] = useState('');

  // Fetch doctor's appointments
  const { data: appointments = [], isLoading, refetch } = useQuery<Appointment[]>({
    queryKey: ['doctor-appointments'],
    queryFn: async () => {
      const res = await api.get('/appointments');
      return res.data;
    }
  });

  const handleCompleteConsultation = async (id: string) => {
    try {
      await api.post(`/appointments/${id}/complete`, { prescriptionNotes });
      alert('Consultation marked completed. Prescription saved to patient records.');
      setCompletingAptId(null);
      setPrescriptionNotes('');
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to complete consultation');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center">
            <Stethoscope className="w-7 h-7 mr-2.5 text-brand-600" />
            Doctor Practice Portal
          </h1>
          <p className="text-xs text-slate-500">Manage patient consultations, shift schedules, and clinical records.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowBlockModal(true)}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center"
          >
            <AlertOctagon className="w-4 h-4 mr-1.5" />
            Declare Leave / Emergency Block
          </button>

          <div className="flex bg-slate-200/60 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('AGENDA')}
              className={`py-1.5 px-3 rounded-lg transition ${
                activeTab === 'AGENDA' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Consultation Agenda
            </button>
            <button
              onClick={() => setActiveTab('SCHEDULE')}
              className={`py-1.5 px-3 rounded-lg transition ${
                activeTab === 'SCHEDULE' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Weekly Shift Settings
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'SCHEDULE' ? (
        <ScheduleBuilder />
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Patient Queue & Appointments ({appointments.length})
            </h2>
            <div className="text-xs text-slate-500">Live operational roster</div>
          </div>

          {isLoading ? (
            <div className="p-16 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-brand-600 mx-auto mb-2" />
              <p className="text-xs">Loading consultation queue...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="p-16 text-center bg-white border border-slate-200 rounded-2xl">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-800">No scheduled appointments</h3>
              <p className="text-xs text-slate-500">Your consultation agenda is clear for the selected period.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => {
                const isConfirmed = apt.status === 'CONFIRMED';
                const isCompleted = apt.status === 'COMPLETED';

                return (
                  <div
                    key={apt.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div>
                      <div className="flex items-center space-x-2 mb-1.5">
                        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {apt.bookingReference}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          isConfirmed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {apt.status}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 flex items-center">
                        <User className="w-4 h-4 mr-1.5 text-slate-400" />
                        {apt.patientName}
                      </h3>

                      <div className="flex flex-wrap gap-4 text-xs text-slate-600 mt-1">
                        <span className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {new Date(apt.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                        <span className="flex items-center font-medium">
                          {apt.consultationType === 'VIDEO' ? (
                            <>
                              <Video className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Video Consultation
                            </>
                          ) : (
                            'In-Clinic Visit'
                          )}
                        </span>
                      </div>

                      {apt.patientNotes && (
                        <p className="text-xs bg-slate-50 p-2 rounded-lg text-slate-600 mt-2 border border-slate-100 italic">
                          "{apt.patientNotes}"
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                      {isConfirmed && apt.consultationType === 'VIDEO' && apt.videoRoomUrl && (
                        <Link
                          to={apt.videoRoomUrl}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center"
                        >
                          <Video className="w-3.5 h-3.5 mr-1.5" />
                          Start Video Call
                        </Link>
                      )}

                      {isConfirmed && (
                        <button
                          onClick={() => setCompletingAptId(apt.id)}
                          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                          Complete & Issue Rx
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Prescription / Completion Modal */}
      {completingAptId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-brand-600" />
              Complete Consultation & Clinical Prescription
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter clinical diagnosis, prescribed medication, and follow-up advice.
            </p>

            <textarea
              rows={4}
              value={prescriptionNotes}
              onChange={(e) => setPrescriptionNotes(e.target.value)}
              placeholder="e.g. Rx: Tab Paracetamol 650mg TDS x 3 days. Amoxicillin 500mg BD x 5 days. Blood test recommended if fever persists..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-brand-500 mb-4"
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setCompletingAptId(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCompleteConsultation(completingAptId)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm"
              >
                Sign & Finalize Consultation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Block Modal */}
      {showBlockModal && (
        <EmergencyBlockModal
          onClose={() => setShowBlockModal(false)}
          onSuccess={() => {
            setShowBlockModal(false);
            refetch();
          }}
        />
      )}
    </div>
  );
};

