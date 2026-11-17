import React, { useState } from 'react';
import { DoctorCard } from '../../types';
import {
  Scale,
  X,
  Star,
  Video,
  Building2,
  Calendar,
  Languages,
  Award,
  ChevronRight,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DoctorComparisonDrawerProps {
  selectedDoctors: DoctorCard[];
  onRemoveDoctor: (doctorId: string) => void;
  onClearAll: () => void;
  onSelectSlot?: (doctor: DoctorCard) => void;
}

export const DoctorComparisonDrawer: React.FC<DoctorComparisonDrawerProps> = ({
  selectedDoctors,
  onRemoveDoctor,
  onClearAll,
  onSelectSlot
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  if (selectedDoctors.length === 0) return null;

  return (
    <>
      {/* Sticky Bottom Floating Bar - Clean Clinical Style */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-4xl bg-white/95 border border-slate-200/90 rounded-2xl shadow-xl backdrop-blur-md p-3 px-5 transition-all duration-200 animate-in fade-in slide-in-from-bottom-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">Compare Doctors</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                  {selectedDoctors.length}/3 Selected
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Evaluate fees, qualifications, ratings, and open schedules side by side
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <div className="flex items-center -space-x-2 mr-2">
              {selectedDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="relative group w-10 h-10 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-xs"
                  title={doc.name}
                >
                  {doc.name.replace('Dr. ', '').substring(0, 2).toUpperCase()}
                  <button
                    onClick={() => onRemoveDoctor(doc.id)}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 hover:bg-rose-700 rounded-full text-white flex items-center justify-center text-[10px] shadow"
                    title="Remove from comparison"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={onClearAll}
              className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1.5 transition-colors font-semibold"
            >
              Clear
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all hover:scale-[1.02]"
            >
              <span>View Side-by-Side</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Full Comparison Modal - Clean Clinical Aesthetic */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-900 my-8 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-600">
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Doctor Side-by-Side Comparison</h2>
                  <p className="text-xs text-slate-500">
                    Comparing {selectedDoctors.length} specialist{selectedDoctors.length > 1 ? 's' : ''} to help you make an informed decision
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comparison Grid Table */}
            <div className="mt-6 overflow-x-auto">
              <div
                className="grid gap-4 min-w-[640px]"
                style={{
                  gridTemplateColumns: `200px repeat(${selectedDoctors.length}, minmax(220px, 1fr))`
                }}
              >
                {/* Headers / Doctor basic info */}
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-end pb-3">
                  Clinical Criteria
                </div>
                {selectedDoctors.map((doc) => (
                  <div key={doc.id} className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 relative flex flex-col justify-between">
                    <button
                      onClick={() => {
                        onRemoveDoctor(doc.id);
                        if (selectedDoctors.length <= 1) setIsModalOpen(false);
                      }}
                      className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-white"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-sm font-black text-white shadow-xs mb-2">
                        {doc.name.replace('Dr. ', '').substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex items-center gap-1">
                        <h4 className="font-bold text-sm text-slate-900">{doc.name}</h4>
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      </div>
                      <p className="text-xs text-blue-600 font-bold">{doc.specialization}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{doc.qualifications}</p>
                    </div>

                    <button
                      onClick={() => {
                        setIsModalOpen(false);
                        if (onSelectSlot) {
                          onSelectSlot(doc);
                        } else {
                          navigate(`/doctor/${doc.id}`);
                        }
                      }}
                      className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                    >
                      Book With {doc.name.split(' ')[1] || doc.name}
                    </button>
                  </div>
                ))}

                {/* Row 1: Patient Rating */}
                <div className="text-xs font-semibold text-slate-700 py-3 border-t border-slate-100 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span>Rating & Feedback</span>
                </div>
                {selectedDoctors.map((doc) => (
                  <div key={doc.id} className="py-3 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-amber-700">{doc.ratingAvg.toFixed(1)}</span>
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < Math.round(doc.ratingAvg) ? 'fill-current' : 'text-slate-200'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500">({doc.ratingCount} verified visits)</span>
                  </div>
                ))}

                {/* Row 2: Experience */}
                <div className="text-xs font-semibold text-slate-700 py-3 border-t border-slate-100 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span>Clinical Experience</span>
                </div>
                {selectedDoctors.map((doc) => (
                  <div key={doc.id} className="py-3 border-t border-slate-100 text-xs font-bold text-slate-800">
                    {doc.experienceYears} Years in Practice
                  </div>
                ))}

                {/* Row 3: Consultation Fees */}
                <div className="text-xs font-semibold text-slate-700 py-3 border-t border-slate-100 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  <span>In-Person Fee</span>
                </div>
                {selectedDoctors.map((doc) => (
                  <div key={doc.id} className="py-3 border-t border-slate-100 text-xs">
                    <span className="text-base font-bold text-slate-900">₹{doc.inPersonFee}</span>
                    <span className="text-[10px] text-slate-400 block">per clinic session</span>
                  </div>
                ))}

                {/* Row 4: Video Fee */}
                <div className="text-xs font-semibold text-slate-700 py-3 border-t border-slate-100 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-blue-600" />
                  <span>Video Consultation</span>
                </div>
                {selectedDoctors.map((doc) => (
                  <div key={doc.id} className="py-3 border-t border-slate-100 text-xs">
                    <span className="text-base font-bold text-teal-700">₹{doc.videoFee}</span>
                    <span className="text-[10px] text-slate-400 block">secure encrypted call</span>
                  </div>
                ))}

                {/* Row 5: Clinic Location */}
                <div className="text-xs font-semibold text-slate-700 py-3 border-t border-slate-100 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <span>Clinic & City</span>
                </div>
                {selectedDoctors.map((doc) => (
                  <div key={doc.id} className="py-3 border-t border-slate-100 text-xs text-slate-700">
                    <p className="font-bold text-slate-900">{doc.clinicName}</p>
                    <p className="text-[11px] text-slate-500">{doc.clinicAddress}, {doc.city}</p>
                  </div>
                ))}

                {/* Row 6: Spoken Languages */}
                <div className="text-xs font-semibold text-slate-700 py-3 border-t border-slate-100 flex items-center gap-1.5">
                  <Languages className="w-4 h-4 text-slate-500" />
                  <span>Languages Spoken</span>
                </div>
                {selectedDoctors.map((doc) => (
                  <div key={doc.id} className="py-3 border-t border-slate-100 text-xs text-slate-700">
                    <div className="flex flex-wrap gap-1">
                      {doc.languages.map((lang) => (
                        <span key={lang} className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] text-slate-700 border border-slate-200">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Row 7: Next Availability */}
                <div className="text-xs font-semibold text-slate-700 py-3 border-t border-slate-100 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-rose-500" />
                  <span>Next Available Slot</span>
                </div>
                {selectedDoctors.map((doc) => (
                  <div key={doc.id} className="py-3 border-t border-slate-100 text-xs text-slate-700">
                    {doc.nextAvailableSlot ? (
                      <span className="inline-flex items-center gap-1 text-teal-700 font-bold">
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                        {new Date(doc.nextAvailableSlot).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    ) : (
                      <span className="text-slate-400">Check Calendar</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <span>All consultation fees include digital prescription and follow-up messaging.</span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
