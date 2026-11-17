import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { downloadIcsFile, getGoogleCalendarUrl, getOutlookCalendarUrl } from '../../utils/calendar';
import {
  CheckCircle2,
  Video,
  Calendar,
  MapPin,
  ArrowRight,
  Download,
  ExternalLink,
  ShieldCheck,
  Activity
} from 'lucide-react';

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
    return (
      <div className="text-center py-24 text-slate-500 text-sm flex flex-col items-center justify-center">
        <Activity className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <span>Loading confirmed booking receipt...</span>
      </div>
    );
  }

  if (!appointment) {
    return <div className="text-center py-20 text-slate-700 font-bold">Appointment details not found.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-sm text-center text-slate-900">
        <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-teal-200 text-teal-600 shadow-xs">
          <CheckCircle2 className="w-10 h-10 text-teal-600 animate-bounce" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1.5">
          Appointment Confirmed!
        </h1>
        <p className="text-xs text-slate-500 mb-6">
          Your medical appointment is secured with zero double-booking risk. Confirmation receipt dispatched.
        </p>

        {/* Reference Code Card */}
        <div className="bg-slate-50 border border-dashed border-blue-300 rounded-2xl p-4 mb-6 inline-block w-full max-w-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Booking Reference Code
          </span>
          <span className="font-mono text-2xl font-black text-blue-600 tracking-wider">
            {appointment.bookingReference}
          </span>
        </div>

        {/* Details Card */}
        <div className="bg-slate-50/70 rounded-2xl p-5 text-left text-xs space-y-3 border border-slate-200/80 mb-6">
          <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
            <span className="text-slate-500">Treating Doctor</span>
            <span className="font-bold text-slate-900">
              {appointment.doctorName} ({appointment.specialization})
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
            <span className="text-slate-500">Consultation Date & Time</span>
            <span className="font-bold text-slate-900 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-blue-600" />
              {new Date(appointment.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
            <span className="text-slate-500">Consultation Mode</span>
            <span className="font-bold text-slate-900 capitalize flex items-center">
              {appointment.consultationType === 'VIDEO' ? (
                <>
                  <Video className="w-3.5 h-3.5 mr-1 text-teal-600" />
                  Remote Video Call
                </>
              ) : (
                <>
                  <MapPin className="w-3.5 h-3.5 mr-1 text-blue-600" />
                  In-Person Visit ({appointment.clinicName})
                </>
              )}
            </span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-slate-500">Fee & Payment Status</span>
            <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
              ₹{appointment.feeAmount} ({appointment.paymentStatus})
            </span>
          </div>
        </div>

        {/* Calendar Sync & Export Section */}
        <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 mb-6 text-left">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Sync with Your Personal Calendar</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Never miss your appointment — add to Google, Outlook, or Apple Calendar.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => downloadIcsFile(appointment)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition shadow-2xs"
                title="Download .ics file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .ics</span>
              </button>

              <a
                href={getGoogleCalendarUrl(appointment)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition shadow-xs"
              >
                <span>Google Cal</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <a
                href={getOutlookCalendarUrl(appointment)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition"
              >
                <span>Outlook Cal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {appointment.consultationType === 'VIDEO' && appointment.videoRoomUrl && (
            <Link
              to={appointment.videoRoomUrl}
              className="inline-flex items-center justify-center px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all hover:scale-[1.02]"
            >
              <Video className="w-4 h-4 mr-2" />
              Join Video Room Now
            </Link>
          )}

          <Link
            to="/patient/appointments"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            <span>My Appointments</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>

          <Link
            to="/patient/timeline"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-200 transition"
          >
            <span>View Health Timeline</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
