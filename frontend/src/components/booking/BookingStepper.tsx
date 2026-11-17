import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { HoldCountdownTimer } from './HoldCountdownTimer';
import { AppointmentSlot, DoctorCard } from '../../types';
import { X, Video, Building2, CreditCard, Wallet, ShieldCheck, Loader2, Check, Clock } from 'lucide-react';

interface BookingStepperProps {
  doctor: DoctorCard;
  slot: AppointmentSlot;
  onClose: () => void;
}

export const BookingStepper: React.FC<BookingStepperProps> = ({ doctor, slot, onClose }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [consultationType, setConsultationType] = useState<'IN_PERSON' | 'VIDEO'>('VIDEO');
  const [patientNotes, setPatientNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE_CARD' | 'ONLINE_UPI' | 'PAY_AT_CLINIC'>('ONLINE_CARD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fee = consultationType === 'VIDEO' ? doctor.videoFee : doctor.inPersonFee;

  const handleExpired = () => {
    alert('Your 5-minute hold lock on this slot has expired. The slot has been returned to available inventory.');
    onClose();
  };

  const handleCancel = async () => {
    try {
      await api.post(`/slots/${slot.id}/release`);
    } catch {
      // Ignore
    }
    onClose();
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.post('/appointments', {
        slotId: slot.id,
        consultationType,
        patientNotes,
        paymentMethod
      });

      navigate(`/patient/booking-success/${res.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete appointment booking');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200/90 text-slate-900 my-8">
        {/* Top Header & Close */}
        <div className="flex justify-between items-start pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Book Medical Appointment</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {doctor.name} • <span className="text-blue-600 font-semibold">{doctor.specialization}</span>
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
            title="Cancel and release hold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Step Progress Indicator */}
        <div className="my-5">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className={step >= 1 ? 'text-blue-600 font-bold' : 'text-slate-400'}>
              1. Mode & Details
            </span>
            <span className={step >= 2 ? 'text-blue-600 font-bold' : 'text-slate-400'}>
              2. Review & Payment
            </span>
            <span className="text-slate-400">
              3. Confirmation
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div className={`h-full transition-all duration-300 ${step === 1 ? 'w-1/2 bg-blue-600' : 'w-full bg-blue-600'}`} />
          </div>
        </div>

        {/* Live Hold Timer Banner */}
        <div className="mb-5 flex items-center justify-between p-3 bg-amber-50 rounded-2xl border border-amber-200/80">
          <HoldCountdownTimer initialSeconds={300} onExpired={handleExpired} />
          <div className="text-[11px] text-amber-800 font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Slot reserved exclusively</span>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleConfirmBooking} className="space-y-5">
          {step === 1 ? (
            <div className="space-y-4">
              {/* Consultation Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Consultation Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setConsultationType('IN_PERSON')}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      consultationType === 'IN_PERSON'
                        ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-900">In-Clinic Visit</span>
                    </div>
                    <span className="text-[11px] text-slate-500 mb-2">Attend at hospital/clinic</span>
                    <span className="text-base font-black text-slate-900">₹{doctor.inPersonFee}</span>
                  </div>

                  <div
                    onClick={() => setConsultationType('VIDEO')}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      consultationType === 'VIDEO'
                        ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <Video className="w-4 h-4 text-teal-600" />
                      <span className="text-xs font-bold text-slate-900">Video Consultation</span>
                    </div>
                    <span className="text-[11px] text-slate-500 mb-2">Encrypted HD video room</span>
                    <span className="text-base font-black text-teal-700">₹{doctor.videoFee}</span>
                  </div>
                </div>
              </div>

              {/* Slot Summary */}
              <div className="bg-slate-50 p-4 rounded-2xl text-xs space-y-2 border border-slate-200/80">
                <div className="flex justify-between">
                  <span className="text-slate-500">Scheduled Time:</span>
                  <span className="font-bold text-slate-900">
                    {new Date(slot.startTime).toLocaleDateString([], {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })} at {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Facility / Clinic:</span>
                  <span className="font-semibold text-slate-800">{doctor.clinicName}, {doctor.city}</span>
                </div>
              </div>

              {/* Patient Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Reason for Visit / Symptoms (Optional)
                </label>
                <textarea
                  rows={2}
                  value={patientNotes}
                  onChange={(e) => setPatientNotes(e.target.value)}
                  placeholder="Describe your health concern, symptoms, or reason for appointment..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                >
                  Continue to Payment (₹{fee})
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Choose Payment Method</label>
                <div className="space-y-2">
                  <label className="flex items-center p-3 border rounded-xl cursor-pointer hover:bg-slate-50 text-xs transition border-slate-200">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'ONLINE_CARD'}
                      onChange={() => setPaymentMethod('ONLINE_CARD')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <CreditCard className="w-4 h-4 ml-3 mr-2 text-slate-500" />
                    <span className="font-semibold text-slate-800">Credit / Debit Card (Visa, Mastercard, RuPay)</span>
                  </label>

                  <label className="flex items-center p-3 border rounded-xl cursor-pointer hover:bg-slate-50 text-xs transition border-slate-200">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'ONLINE_UPI'}
                      onChange={() => setPaymentMethod('ONLINE_UPI')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <Wallet className="w-4 h-4 ml-3 mr-2 text-teal-600" />
                    <span className="font-semibold text-slate-800">UPI Instant Payment (GPay, PhonePe, Paytm)</span>
                  </label>

                  {consultationType === 'IN_PERSON' && (
                    <label className="flex items-center p-3 border rounded-xl cursor-pointer hover:bg-slate-50 text-xs transition border-slate-200">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'PAY_AT_CLINIC'}
                        onChange={() => setPaymentMethod('PAY_AT_CLINIC')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <Building2 className="w-4 h-4 ml-3 mr-2 text-slate-500" />
                      <span className="font-semibold text-slate-800">Pay at Clinic Reception Desk</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Total Summary */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Consultation Fee</span>
                  <span className="font-semibold text-slate-900">₹{fee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Platform Booking Fee</span>
                  <span className="font-bold text-teal-700">Free</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold">
                  <span className="text-slate-900">Total Payable</span>
                  <span className="text-blue-600">₹{fee}</span>
                </div>
              </div>

              <div className="flex items-center text-[11px] text-slate-500 space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Encrypted 256-bit checkout • Free cancellation up to 2 hours before appointment</span>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Locking & Confirming...
                    </>
                  ) : (
                    `Confirm & Pay ₹${fee}`
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
