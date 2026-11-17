import React, { useState } from 'react';
import api from '../../services/api';
import { BellRing, X, CheckCircle2, Loader2 } from 'lucide-react';

interface WaitlistModalProps {
  doctorId: string;
  doctorName: string;
  targetDate: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const WaitlistModal: React.FC<WaitlistModalProps> = ({
  doctorId,
  doctorName,
  targetDate,
  onClose,
  onSuccess
}) => {
  const [consultationType, setConsultationType] = useState<'IN_PERSON' | 'VIDEO'>('IN_PERSON');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await api.post('/waitlist', {
        doctorId,
        targetDate,
        consultationType
      });
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to join waitlist');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative border border-slate-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">Added to Priority Waitlist!</h3>
            <p className="text-xs text-slate-600">
              You will receive an instant priority SMS/Email notification if any slot opens on {targetDate}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
                <BellRing className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Join Priority Waitlist</h3>
                <p className="text-xs text-slate-500">For {doctorName} on {targetDate}</p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <p className="text-xs text-slate-600">
              When another patient reschedules or cancels, the system automatically frees the slot and notifies waitlisted patients in strict FIFO order with a 15-minute exclusive booking window.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Preferred Mode</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setConsultationType('IN_PERSON')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition ${
                    consultationType === 'IN_PERSON'
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  In-Clinic Visit
                </button>
                <button
                  type="button"
                  onClick={() => setConsultationType('VIDEO')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition ${
                    consultationType === 'VIDEO'
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Video Consultation
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center justify-center"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Waitlist'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

