import React from 'react';
import { Link } from 'react-router-dom';
import { DoctorCard as DoctorCardType } from '../../types';
import {
  Star,
  MapPin,
  Award,
  Video,
  Building2,
  Clock,
  Calendar,
  Scale,
  Sun,
  Sunset,
  Moon,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

interface DoctorCardProps {
  doctor: DoctorCardType;
  isComparing?: boolean;
  onToggleCompare?: (doctor: DoctorCardType) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  isComparing = false,
  onToggleCompare
}) => {
  // Determine time-of-day segment for next available slot
  const getSlotSegment = (dateString?: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const hour = date.getHours();
    if (hour < 12) {
      return { label: 'Morning Slot', icon: <Sun className="w-3 h-3 text-amber-600" />, badge: 'bg-amber-50 text-amber-800 border-amber-200/80' };
    } else if (hour < 16) {
      return { label: 'Afternoon Slot', icon: <Sunset className="w-3 h-3 text-orange-600" />, badge: 'bg-orange-50 text-orange-800 border-orange-200/80' };
    } else {
      return { label: 'Evening Slot', icon: <Moon className="w-3 h-3 text-indigo-600" />, badge: 'bg-indigo-50 text-indigo-800 border-indigo-200/80' };
    }
  };

  const slotSegment = getSlotSegment(doctor.nextAvailableSlot);

  return (
    <div
      className={`group relative bg-white border rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
        isComparing ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200/90 hover:border-blue-400/80'
      }`}
    >
      <div>
        {/* Top bar: Compare selector & Rating */}
        <div className="flex items-center justify-between mb-3.5">
          {onToggleCompare ? (
            <button
              onClick={() => onToggleCompare(doctor)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                isComparing
                  ? 'bg-blue-50 text-blue-700 border border-blue-300'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{isComparing ? 'In Comparison' : 'Compare'}</span>
              {isComparing && <CheckCircle2 className="w-3 h-3 text-blue-600" />}
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg text-xs font-bold border border-amber-200/80">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{doctor.ratingAvg.toFixed(1)}</span>
            <span className="text-slate-500 font-normal">({doctor.ratingCount})</span>
          </div>
        </div>

        {/* Doctor Header: Avatar, Name & Specialization */}
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-sm font-black text-white shadow-xs shrink-0">
            {doctor.name.replace('Dr. ', '').substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                <Link to={`/doctor/${doctor.id}`}>{doctor.name}</Link>
              </h3>
              <span title="Verified Medical Practitioner" className="inline-flex items-center">
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
              </span>
            </div>
            <p className="text-xs font-bold text-blue-600">{doctor.specialization}</p>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">{doctor.qualifications}</p>
          </div>
        </div>

        {/* Experience & Languages */}
        <div className="flex flex-wrap items-center gap-2 mt-3.5 text-xs text-slate-700">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700">
            <Award className="w-3 h-3 text-blue-600" />
            <span>{doctor.experienceYears} Years Exp</span>
          </div>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px] text-slate-600">
            <span>{doctor.languages.slice(0, 2).join(', ')}</span>
            {doctor.languages.length > 2 && <span>+{doctor.languages.length - 2}</span>}
          </div>
        </div>

        {/* Clinic & Location Details */}
        <div className="space-y-1.5 text-xs text-slate-600 my-3.5 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="font-semibold text-slate-800 truncate">{doctor.clinicName}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate text-slate-600">
              {doctor.city} • <span className="text-slate-500">{doctor.clinicAddress}</span>
            </span>
          </div>
        </div>

        {/* Consultation Modes & Fees */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs mb-3">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-500 font-medium">In-Clinic Visit</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5">₹{doctor.inPersonFee}</span>
          </div>
          <div className="flex flex-col border-l border-slate-200 pl-3">
            <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <Video className="w-3 h-3 text-teal-600" /> Video Call
            </span>
            <span className="font-bold text-teal-700 text-sm mt-0.5">₹{doctor.videoFee}</span>
          </div>
        </div>

        {/* Time-of-day Slot Segment Badge */}
        {slotSegment && (
          <div className="flex items-center justify-between mb-3 px-2 py-1 rounded-lg bg-slate-50 text-[11px] border border-slate-100">
            <span className="text-slate-500 flex items-center gap-1 font-medium">
              <Clock className="w-3 h-3 text-slate-400" />
              Next Slot:
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${slotSegment.badge}`}>
              {slotSegment.icon}
              {slotSegment.label}
            </span>
          </div>
        )}
      </div>

      {/* Footer & Booking Action */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        {doctor.nextAvailableSlot ? (
          <div className="text-[11px] text-teal-700 font-semibold flex items-center gap-1 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            <span className="truncate">
              {new Date(doctor.nextAvailableSlot).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 font-medium">No open slots today</div>
        )}

        <Link
          to={`/doctor/${doctor.id}`}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all hover:scale-[1.02] shrink-0"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Book Slot</span>
        </Link>
      </div>
    </div>
  );
};
