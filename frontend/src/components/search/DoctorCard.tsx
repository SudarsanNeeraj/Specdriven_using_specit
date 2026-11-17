import React from 'react';
import { Link } from 'react-router-dom';
import { DoctorCard as DoctorCardType } from '../../types';
import { Star, MapPin, Award, Video, Building2, Clock, Calendar } from 'lucide-react';

interface DoctorCardProps {
  doctor: DoctorCardType;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
      <div>
        {/* Header: Name, Specialization, Rating */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 hover:text-brand-600 transition">
              <Link to={`/doctor/${doctor.id}`}>{doctor.name}</Link>
            </h3>
            <p className="text-sm font-semibold text-brand-600">{doctor.specialization}</p>
            <p className="text-xs text-slate-500 mt-0.5">{doctor.qualifications}</p>
          </div>
          <div className="flex items-center bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md text-xs font-bold border border-amber-200/60">
            <Star className="w-3.5 h-3.5 mr-1 fill-amber-400 text-amber-400" />
            <span>{doctor.ratingAvg.toFixed(1)}</span>
            <span className="text-slate-400 ml-1 font-normal">({doctor.ratingCount})</span>
          </div>
        </div>

        {/* Clinic & Location Details */}
        <div className="space-y-1.5 text-xs text-slate-600 my-4 border-t border-slate-100 pt-3">
          <div className="flex items-center">
            <Building2 className="w-3.5 h-3.5 mr-2 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-700 truncate">{doctor.clinicName}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-2 text-slate-400 shrink-0" />
            <span>{doctor.city} • <span className="text-slate-400">{doctor.clinicAddress}</span></span>
          </div>
          <div className="flex items-center">
            <Award className="w-3.5 h-3.5 mr-2 text-slate-400 shrink-0" />
            <span>{doctor.experienceYears} Years of Clinical Experience</span>
          </div>
        </div>

        {/* Consultation Modes & Fees */}
        <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-lg text-xs mb-4">
          <div className="flex flex-col">
            <span className="text-slate-500 font-medium">In-Clinic Visit</span>
            <span className="font-bold text-slate-900 text-sm">₹{doctor.inPersonFee}</span>
          </div>
          <div className="flex flex-col border-l border-slate-200 pl-3">
            <span className="text-slate-500 font-medium flex items-center">
              <Video className="w-3 h-3 mr-1 text-emerald-600" /> Video Call
            </span>
            <span className="font-bold text-slate-900 text-sm">₹{doctor.videoFee}</span>
          </div>
        </div>
      </div>

      {/* Footer & Booking Action */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        {doctor.nextAvailableSlot ? (
          <div className="text-xs text-emerald-700 font-medium flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1" />
            <span>Next: {new Date(doctor.nextAvailableSlot).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        ) : (
          <div className="text-xs text-slate-400 font-medium">No open slots today</div>
        )}

        <Link
          to={`/doctor/${doctor.id}`}
          className="inline-flex items-center justify-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
        >
          <Calendar className="w-3.5 h-3.5 mr-1.5" />
          View & Book Slot
        </Link>
      </div>
    </div>
  );
};

