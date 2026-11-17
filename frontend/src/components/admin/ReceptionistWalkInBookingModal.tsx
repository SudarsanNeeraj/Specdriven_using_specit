import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { DoctorCard, AppointmentSlot } from '../../types';
import { UserPlus, X, CheckCircle2, Loader2, Building2 } from 'lucide-react';

interface ReceptionistWalkInBookingModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const ReceptionistWalkInBookingModal: React.FC<ReceptionistWalkInBookingModalProps> = ({
  onClose,
  onSuccess
}) => {
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'AT_CLINIC' | 'PAID'>('AT_CLINIC');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch doctors
  const { data: doctors = [] } = useQuery<DoctorCard[]>({
    queryKey: ['doctors'],
    queryFn: async () => {
      const res = await api.get('/doctors');
      return res.data;
    }
  });

  // Fetch open slots for chosen doctor
  const { data: slots = [] } = useQuery<AppointmentSlot[]>({
    queryKey: ['slots', selectedDoctorId],
    queryFn: async () => {
      if (!selectedDoctorId) return [];
      const res = await api.get(`/doctors/${selectedDoctorId}/slots`);
      return res.data.filter((s: AppointmentSlot) => s.status === 'AVAILABLE');
    },
    enabled: !!selectedDoctorId
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await api.post('/admin/walk-in', {
        patientName,
        patientPhone,
        doctorId: selectedDoctorId,
        slotId: selectedSlotId,
        paymentStatus
      });

      alert(`Walk-in appointment booked successfully for ${patientName}!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Walk-in booking failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200">
        <button onClick={onClose} className="absolute right-4 top-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Front Desk Walk-In Booking</h3>
            <p className="text-xs text-slate-500">Quickly schedule walk-in and telephone patients</p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Patient Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Vikas Gupta"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mobile Phone Number</label>
              <input
                type="tel"
                required
                placeholder="+919876543210"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Consulting Doctor</label>
            <select
              required
              value={selectedDoctorId}
              onChange={(e) => {
                setSelectedDoctorId(e.target.value);
                setSelectedSlotId('');
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 font-medium"
            >
              <option value="">Select Doctor...</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.specialization}) - ₹{d.inPersonFee}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Available Time Slot</label>
            <select
              required
              disabled={!selectedDoctorId}
              value={selectedSlotId}
              onChange={(e) => setSelectedSlotId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 font-medium"
            >
              <option value="">Choose Open Slot...</option>
              {slots.map((s) => (
                <option key={s.id} value={s.id}>
                  {new Date(s.startTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Payment Status</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentStatus('AT_CLINIC')}
                className={`py-2 px-3 rounded-lg border font-bold text-center transition ${
                  paymentStatus === 'AT_CLINIC'
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                Pay at Clinic Desk
              </button>
              <button
                type="button"
                onClick={() => setPaymentStatus('PAID')}
                className={`py-2 px-3 rounded-lg border font-bold text-center transition ${
                  paymentStatus === 'PAID'
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                Cash Collected (Paid)
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedSlotId}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm flex items-center justify-center"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Walk-In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

