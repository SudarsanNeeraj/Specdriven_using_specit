import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { CheckCircle2, Video, Calendar, MapPin, ArrowRight, FileText, Download } from 'lucide-react';

export const BookingConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: appointment, isLoading } = useQuery({
    queryKey: ['appointment', id],
    queryFn: async () => {
      const res = await api.get(`/appointments/${id}`);
      return res.data;
    }
  });

  if (isLoading) {
    return <div className="text-center py-20 text-slate-500 text-sm">Loading confirmed booking...</div>;
  }

  if (!appointment) {
    return <div className="text-center py-20 text-slate-700 font-bold">Appointment details not found.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-200">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-bounce" />
        </div>

        <h1 className="text-2xl font-black text-slate-900 mb-1">Appointment Confirmed!</h1>
        <p className="text-xs text-slate-500 mb-6">
          Your medical appointment is secured with zero double-booking risk. Confirmation receipt dispatched.
        </p>

        {/* Reference Code Card */}
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-4 mb-6 inline-block w-full max-w-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Booking Reference Code
          </span>
          <span className="font-mono text-xl font-black text-brand-600 tracking-wider">
            {appointment.bookingReference}
          </span>
        </div>

        {/* Details Card */}
        <div className="bg-slate-50/60 rounded-2xl p-5 text-left text-xs space-y-3 border border-slate-100 mb-6">
          <div className="flex justify-between items-center py-1 border-b border-slate-100">
            <span className="text-slate-500">Treating Doctor</span>
            <span className="font-bold text-slate-900">{appointment.doctorName} ({appointment.specialization})</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-100">
            <span className="text-slate-500">Consultation Date & Time</span>
            <span className="font-bold text-slate-900 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
              {new Date(appointment.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-100">
            <span className="text-slate-500">Consultation Mode</span>
            <span className="font-bold text-slate-900 capitalize flex items-center">
              {appointment.consultationType === 'VIDEO' ? (
                <>
                  <Video className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Remote Video Call
                </>
              ) : (
                <>
                  <MapPin className="w-3.5 h-3.5 mr-1 text-brand-600" />
                  In-Person Visit ({appointment.clinicName})
                </>
              )}
            </span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-slate-500">Fee & Payment Status</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              ₹{appointment.feeAmount} ({appointment.paymentStatus})
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {appointment.consultationType === 'VIDEO' && appointment.videoRoomUrl && (
            <Link
              to={appointment.videoRoomUrl}
              className="inline-flex items-center justify-center px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <Video className="w-4 h-4 mr-2" />
              Join Video Room Now
            </Link>
          )}

          <Link
            to="/patient/appointments"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <span>My Appointments</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

