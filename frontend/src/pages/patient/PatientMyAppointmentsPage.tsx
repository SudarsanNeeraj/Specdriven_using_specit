import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Appointment } from '../../types';
import { ReviewFormModal } from '../../components/consultation/ReviewFormModal';
import { downloadIcsFile } from '../../utils/calendar';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  AlertTriangle,
  Star,
  CheckCircle2,
  XCircle,
  BellRing,
  Loader2,
  Download,
  Activity,
  FileText
} from 'lucide-react';

export const PatientMyAppointmentsPage: React.FC = () => {
  const [filterTab, setFilterTab] = useState<'ALL' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'>('CONFIRMED');
  const [reviewAppointment, setReviewAppointment] = useState<Appointment | null>(null);

  // 1. Fetch user appointments
  const { data: appointments = [], isLoading, refetch } = useQuery<Appointment[]>({
    queryKey: ['my-appointments', filterTab],
    queryFn: async () => {
      const url = filterTab === 'ALL' ? '/appointments' : `/appointments?status=${filterTab}`;
      const res = await api.get(url);
      return res.data;
    }
  });

  // 2. Fetch active waitlist entries
  const { data: waitlists = [], refetch: refetchWaitlists } = useQuery<any[]>({
    queryKey: ['my-waitlists'],
    queryFn: async () => {
      const res = await api.get('/waitlist');
      return res.data;
    }
  });

  const handleCancelAppointment = async (id: string) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;

    try {
      await api.post(`/appointments/${id}/cancel`, { reason });
      alert('Appointment cancelled. If eligible, your slot has been refunded and waitlist notified.');
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cancellation failed. Policy cut-off may apply.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">My Medical Consultations</h1>
          <p className="text-xs text-slate-500">Track upcoming visits, attend video calls, and access records.</p>
        </div>

        {/* Tab Filters */}
        <div className="flex space-x-1.5 bg-slate-200/60 p-1 rounded-xl text-xs font-semibold">
          {(['CONFIRMED', 'COMPLETED', 'CANCELLED', 'ALL'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`py-1.5 px-3 rounded-lg transition capitalize ${
                filterTab === tab
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Active Priority Waitlists Alert */}
      {waitlists.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-800">
            <BellRing className="w-4 h-4 text-amber-600" />
            <span>Active Priority Waitlists ({waitlists.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {waitlists.map((w) => (
              <div key={w.id} className="p-3 bg-white rounded-xl border border-amber-200/60 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-900">{w.doctorName}</div>
                  <div className="text-[11px] text-slate-500">Date: {w.targetDate} ({w.consultationType})</div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  w.status === 'NOTIFIED' ? 'bg-emerald-100 text-emerald-800 animate-pulse' : 'bg-slate-100 text-slate-600'
                }`}>
                  {w.status === 'NOTIFIED' ? 'Slot Open - Claim Now!' : 'Waiting In Queue'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Appointments List */}
      {isLoading ? (
        <div className="flex items-center justify-center p-16 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-brand-600 mr-2" />
          <span className="text-xs">Loading consultations...</span>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">No appointments found</h3>
          <p className="text-xs text-slate-500 mb-4">You have no consultations under this status.</p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
          >
            Find a Doctor
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => {
            const isConfirmed = apt.status === 'CONFIRMED';
            const isCompleted = apt.status === 'COMPLETED';
            const isCancelled = apt.status === 'CANCELLED';

            return (
              <div
                key={apt.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div>
                  <div className="flex items-center space-x-2.5 mb-1.5">
                    <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200/60">
                      {apt.bookingReference}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isConfirmed
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isCompleted
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{apt.doctorName}</h3>
                  <p className="text-xs font-semibold text-brand-600 mb-2">{apt.specialization}</p>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                    <span className="flex items-center font-medium">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      {new Date(apt.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>

                    <span className="flex items-center font-medium">
                      {apt.consultationType === 'VIDEO' ? (
                        <>
                          <Video className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                          Remote Video Call
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3.5 h-3.5 mr-1.5 text-brand-600" />
                          {apt.clinicName}
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Right Side Actions */}
                <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                  {isConfirmed && apt.consultationType === 'VIDEO' && apt.videoRoomUrl && (
                    <Link
                      to={apt.videoRoomUrl}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center"
                    >
                      <Video className="w-3.5 h-3.5 mr-1.5" />
                      Join Video Call
                    </Link>
                  )}

                  {isConfirmed && (
                    <button
                      onClick={() => downloadIcsFile(apt)}
                      className="px-3 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                      title="Export .ics to your calendar"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>.ics Cal</span>
                    </button>
                  )}

                  {isConfirmed && (
                    <button
                      onClick={() => handleCancelAppointment(apt.id)}
                      className="px-3.5 py-2 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold transition"
                    >
                      Cancel Visit
                    </button>
                  )}

                  {isCompleted && (
                    <Link
                      to="/patient/timeline"
                      className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-lg text-xs font-bold transition flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Prescription & History</span>
                    </Link>
                  )}

                  {isCompleted && (
                    <button
                      onClick={() => setReviewAppointment(apt)}
                      className="px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-lg text-xs font-bold transition flex items-center"
                    >
                      <Star className="w-3.5 h-3.5 mr-1.5 fill-amber-400 text-amber-400" />
                      Rate & Review
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewAppointment && (
        <ReviewFormModal
          appointmentId={reviewAppointment.id}
          doctorName={reviewAppointment.doctorName}
          onClose={() => setReviewAppointment(null)}
          onSuccess={() => {
            refetch();
          }}
        />
      )}
    </div>
  );
};

