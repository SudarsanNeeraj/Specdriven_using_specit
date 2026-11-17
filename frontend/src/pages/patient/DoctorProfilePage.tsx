import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { BookingStepper } from '../../components/booking/BookingStepper';
import { WaitlistModal } from '../../components/booking/WaitlistModal';
import { AppointmentSlot } from '../../types';
import {
  Star,
  MapPin,
  Award,
  Video,
  Building2,
  Calendar,
  Clock,
  BellRing,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sun,
  Sunset,
  Moon
} from 'lucide-react';

export const DoctorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [activeSlotToHold, setActiveSlotToHold] = useState<AppointmentSlot | null>(null);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [holdingSlotId, setHoldingSlotId] = useState<string | null>(null);
  const [holdError, setHoldError] = useState<string | null>(null);

  // 1. Fetch Doctor Details
  const { data: doctor, isLoading: docLoading } = useQuery({
    queryKey: ['doctor', id],
    queryFn: async () => {
      const res = await api.get(`/doctors/${id}`);
      return res.data;
    }
  });

  // 2. Fetch Slots for selected doctor
  const { data: slots = [], isLoading: slotsLoading, refetch: refetchSlots } = useQuery<AppointmentSlot[]>({
    queryKey: ['slots', id, selectedDate],
    queryFn: async () => {
      const res = await api.get(`/doctors/${id}/slots?startDate=${selectedDate}&endDate=${selectedDate}`);
      return res.data;
    },
    refetchInterval: 15000 // Poll every 15s for live slot status updates
  });

  // Generate 7-day date selector tabs
  const dateTabs = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString([], { weekday: 'short' });
    const formatted = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return { dateStr, dayName, formatted };
  });

  const handleSlotSelect = async (slot: AppointmentSlot) => {
    if (!user) {
      alert('Please sign in or select a demo role to book an appointment.');
      navigate('/login');
      return;
    }

    setHoldingSlotId(slot.id);
    setHoldError(null);

    try {
      // Step 1: Acquire atomic 5-minute hold lock
      await api.post(`/slots/${slot.id}/hold`);
      setActiveSlotToHold(slot);
      refetchSlots();
    } catch (err: any) {
      setHoldError(err.response?.data?.message || 'Slot could not be held. It may already be reserved.');
      refetchSlots();
    } finally {
      setHoldingSlotId(null);
    }
  };

  if (docLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800">Doctor not found</h2>
      </div>
    );
  }

  const availableSlots = slots.filter((s) => s.status === 'AVAILABLE');

  return (
    <div className="space-y-6">
      {/* Top Profile Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <h1 className="text-2xl font-black text-slate-900">{doctor.name}</h1>
              <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verified
              </span>
            </div>
            <p className="text-base font-bold text-brand-600 mb-1">{doctor.specialization}</p>
            <p className="text-xs text-slate-500 font-medium mb-3">{doctor.qualifications}</p>

            <div className="flex flex-wrap gap-4 text-xs text-slate-600">
              <span className="flex items-center font-medium">
                <Award className="w-4 h-4 mr-1.5 text-brand-500" />
                {doctor.experienceYears} Years Clinical Experience
              </span>
              <span className="flex items-center">
                <Building2 className="w-4 h-4 mr-1.5 text-slate-400" />
                {doctor.clinicName}
              </span>
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1.5 text-slate-400" />
                {doctor.city} ({doctor.clinicAddress})
              </span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-right shrink-0">
            <div className="flex items-center justify-end space-x-1 text-amber-500 mb-1">
              <Star className="w-5 h-5 fill-amber-400" />
              <span className="font-extrabold text-lg text-slate-900">{doctor.ratingAvg.toFixed(1)}</span>
            </div>
            <p className="text-[11px] text-slate-500">{doctor.ratingCount} Verified Patient Reviews</p>
            <div className="mt-3 pt-3 border-t border-slate-200 text-xs space-y-1">
              <div>In-Clinic: <strong className="text-slate-900">₹{doctor.inPersonFee}</strong></div>
              <div>Video Call: <strong className="text-slate-900">₹{doctor.videoFee}</strong></div>
            </div>
          </div>
        </div>

        {/* Doctor Bio */}
        {doctor.bio && (
          <div className="mt-6 pt-6 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
            <h3 className="font-bold text-slate-800 mb-1">About Doctor</h3>
            <p>{doctor.bio}</p>
          </div>
        )}
      </div>

      {/* Booking Calendar & Slot Matrix */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-brand-600" />
              Select Consultation Time Slot
            </h2>
            <p className="text-xs text-slate-500">
              Selecting a slot locks it for 5 minutes during checkout to prevent duplicate bookings.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center"><span className="w-3 h-3 bg-white border-2 border-brand-500 rounded-md mr-1.5"></span> Available</span>
            <span className="flex items-center"><span className="w-3 h-3 bg-amber-100 border border-amber-300 rounded-md mr-1.5"></span> On Hold</span>
            <span className="flex items-center"><span className="w-3 h-3 bg-slate-100 border border-slate-200 rounded-md mr-1.5"></span> Booked</span>
          </div>
        </div>

        {holdError && (
          <div className="my-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 text-rose-600 shrink-0" />
            <span>{holdError}</span>
          </div>
        )}

        {/* 7-Day Date Tab Selector */}
        <div className="flex space-x-2 overflow-x-auto py-4 scrollbar-none">
          {dateTabs.map((tab) => (
            <button
              key={tab.dateStr}
              onClick={() => setSelectedDate(tab.dateStr)}
              className={`flex-1 min-w-[90px] py-2.5 px-3 rounded-xl border text-center transition ${
                selectedDate === tab.dateStr
                  ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold shadow-xs'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div className="text-[11px] font-semibold">{tab.dayName}</div>
              <div className="text-xs font-bold">{tab.formatted}</div>
            </button>
          ))}
        </div>

        {/* Time Slots Grid */}
        <div className="mt-4">
          {slotsLoading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-brand-600 mr-2" />
              <span className="text-xs">Loading calendar slots...</span>
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-sm font-semibold text-slate-700 mb-1">No slots scheduled for this date</p>
              <p className="text-xs text-slate-500 mb-4">Doctor is off or all slots have been taken.</p>
              <button
                onClick={() => setShowWaitlistModal(true)}
                className="inline-flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-sm transition"
              >
                <BellRing className="w-3.5 h-3.5 mr-1.5" />
                Join Waitlist for {selectedDate}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Slot Segment Groups (Morning, Afternoon, Evening) */}
              {[
                {
                  title: 'Morning Slots',
                  desc: 'Before 12:00 PM',
                  icon: <Sun className="w-4 h-4 text-amber-500" />,
                  slotsList: slots.filter(s => new Date(s.startTime).getHours() < 12),
                  badgeColor: 'bg-amber-50 border-amber-200 text-amber-800'
                },
                {
                  title: 'Afternoon Slots',
                  desc: '12:00 PM - 04:00 PM',
                  icon: <Sunset className="w-4 h-4 text-orange-500" />,
                  slotsList: slots.filter(s => {
                    const h = new Date(s.startTime).getHours();
                    return h >= 12 && h < 16;
                  }),
                  badgeColor: 'bg-orange-50 border-orange-200 text-orange-800'
                },
                {
                  title: 'Evening Slots',
                  desc: 'After 04:00 PM',
                  icon: <Moon className="w-4 h-4 text-indigo-500" />,
                  slotsList: slots.filter(s => new Date(s.startTime).getHours() >= 16),
                  badgeColor: 'bg-indigo-50 border-indigo-200 text-indigo-800'
                }
              ].map((segment) => {
                if (segment.slotsList.length === 0) return null;
                const openCount = segment.slotsList.filter(s => s.status === 'AVAILABLE').length;

                return (
                  <div key={segment.title} className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                          {segment.icon}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">{segment.title}</h4>
                          <span className="text-[10px] text-slate-500">{segment.desc}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${segment.badgeColor}`}>
                        {openCount} Open Slot{openCount !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                      {segment.slotsList.map((slot) => {
                        const timeLabel = new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const isAvailable = slot.status === 'AVAILABLE';
                        const isHeld = slot.status === 'HELD';

                        return (
                          <button
                            key={slot.id}
                            disabled={!isAvailable || holdingSlotId === slot.id}
                            onClick={() => handleSlotSelect(slot)}
                            className={`py-2.5 px-2 rounded-xl text-center border transition flex flex-col items-center justify-center ${
                              isAvailable
                                ? 'bg-white border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 text-slate-800 font-bold shadow-xs cursor-pointer'
                                : isHeld
                                ? 'border-amber-300 bg-amber-50/80 text-amber-800 cursor-not-allowed opacity-80'
                                : 'border-slate-200/60 bg-slate-100 text-slate-400 cursor-not-allowed line-through'
                            }`}
                          >
                            <Clock className="w-3 h-3 mb-1 text-slate-400" />
                            <span className="text-xs font-bold">{timeLabel}</span>
                            <span className="text-[9px] mt-0.5 uppercase tracking-wider font-semibold">
                              {holdingSlotId === slot.id ? 'Holding...' : isAvailable ? 'Open' : isHeld ? 'On Hold' : 'Taken'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {availableSlots.length === 0 && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                  <div className="text-xs text-amber-800">
                    <strong>All slots on this date are currently booked or on hold.</strong> You can join the priority waitlist to get alerted if a cancellation happens.
                  </div>
                  <button
                    onClick={() => setShowWaitlistModal(true)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shrink-0 ml-4 shadow-sm"
                  >
                    Join Waitlist
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Patient Reviews Section */}
      {doctor.reviews && doctor.reviews.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4">Patient Reviews & Experiences</h2>
          <div className="divide-y divide-slate-100">
            {doctor.reviews.map((rev: any) => (
              <div key={rev.id} className="py-3.5 first:pt-0 last:pb-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-xs text-slate-800">{rev.patientName || 'Verified Patient'}</span>
                  <div className="flex items-center text-amber-500 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 mr-1 fill-amber-400" />
                    <span>{rev.rating} / 5</span>
                  </div>
                </div>
                {rev.comment && <p className="text-xs text-slate-600">{rev.comment}</p>}
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {new Date(rev.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Stepper Modal */}
      {activeSlotToHold && (
        <BookingStepper
          doctor={doctor}
          slot={activeSlotToHold}
          onClose={() => {
            setActiveSlotToHold(null);
            refetchSlots();
          }}
        />
      )}

      {/* Waitlist Modal */}
      {showWaitlistModal && (
        <WaitlistModal
          doctorId={doctor.id}
          doctorName={doctor.name}
          targetDate={selectedDate}
          onClose={() => setShowWaitlistModal(false)}
          onSuccess={() => {
            alert('Added to waitlist! You will be alerted when a slot opens.');
          }}
        />
      )}
    </div>
  );
};

