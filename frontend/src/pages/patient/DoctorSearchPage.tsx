import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { DoctorCard as DoctorCardType } from '../../types';
import { DoctorCard } from '../../components/search/DoctorCard';
import { FilterSidebar } from '../../components/search/FilterSidebar';
import { SymptomNavigator } from '../../components/search/SymptomNavigator';
import { DoctorComparisonDrawer } from '../../components/search/DoctorComparisonDrawer';
import { Search, Loader2, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';

export const DoctorSearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [city, setCity] = useState('');
  const [maxFee, setMaxFee] = useState('');
  const [language, setLanguage] = useState('');
  const [date, setDate] = useState('');

  // Comparison State (max 3)
  const [comparingDoctors, setComparingDoctors] = useState<DoctorCardType[]>([]);
  const [compareAlert, setCompareAlert] = useState<string | null>(null);

  const { data: doctors = [], isLoading, error } = useQuery<DoctorCardType[]>({
    queryKey: ['doctors', searchQuery, specialization, city, maxFee, language, date],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (specialization) params.append('specialization', specialization);
      if (city) params.append('city', city);
      if (maxFee) params.append('maxFee', maxFee);
      if (language) params.append('language', language);
      if (date) params.append('date', date);

      const res = await api.get(`/doctors?${params.toString()}`);
      return res.data;
    }
  });

  const handleReset = () => {
    setSearchQuery('');
    setSpecialization('');
    setCity('');
    setMaxFee('');
    setLanguage('');
    setDate('');
  };

  const handleToggleCompare = (doctor: DoctorCardType) => {
    setCompareAlert(null);
    const exists = comparingDoctors.some(d => d.id === doctor.id);
    if (exists) {
      setComparingDoctors(comparingDoctors.filter(d => d.id !== doctor.id));
    } else {
      if (comparingDoctors.length >= 3) {
        setCompareAlert('You can compare up to 3 doctors side-by-side. Please remove one doctor first.');
        setTimeout(() => setCompareAlert(null), 5000);
        return;
      }
      setComparingDoctors([...comparingDoctors, doctor]);
    }
  };

  const handleRemoveCompare = (doctorId: string) => {
    setComparingDoctors(comparingDoctors.filter(d => d.id !== doctorId));
  };

  const handleClearCompare = () => {
    setComparingDoctors([]);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Alert for Comparison Limit */}
      {compareAlert && (
        <div className="fixed top-20 right-6 z-50 bg-amber-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{compareAlert}</span>
        </div>
      )}

      {/* Hero Search Header - Calming Medical Palette */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-teal-700 rounded-3xl p-8 sm:p-10 text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-semibold mb-4 backdrop-blur-xs border border-white/20">
            <ShieldCheck className="w-4 h-4 text-teal-200" />
            <span>Verified Practitioners • DPDP Compliant • Instant Slot Reservation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2.5">
            Find & Book Healthcare Specialists
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm mb-6 leading-relaxed">
            Search top medical practitioners, inspect real-time slot availability, hold your preferred time slot for 5 minutes with zero double-booking, and attend in-person or via secure HD video.
          </p>

          {/* Quick Search Input */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search by doctor name, clinic, or medical specialization (e.g. Dr. Sharma, Cardiology)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white text-slate-900 placeholder-slate-400 rounded-2xl text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Smart Symptom Navigator */}
      <SymptomNavigator
        selectedSpecialization={specialization}
        onSelectSpecialization={(spec) => setSpecialization(spec)}
      />

      {/* Main Grid: Filters & Doctor Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Filter Column */}
        <div className="lg:col-span-1">
          <FilterSidebar
            specialization={specialization}
            setSpecialization={setSpecialization}
            city={city}
            setCity={setCity}
            maxFee={maxFee}
            setMaxFee={setMaxFee}
            language={language}
            setLanguage={setLanguage}
            date={date}
            setDate={setDate}
            onReset={handleReset}
          />
        </div>

        {/* Right Search Results Column */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <span>Verified Medical Specialists</span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                {doctors.length} Doctors Available
              </span>
            </h2>
            <div className="text-xs text-slate-500">
              {comparingDoctors.length > 0 && (
                <span className="text-blue-600 font-semibold">
                  {comparingDoctors.length} doctor{comparingDoctors.length > 1 ? 's' : ''} in comparison
                </span>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-16 bg-white border border-slate-200/90 rounded-2xl text-slate-500 shadow-xs">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
              <p className="text-sm font-medium">Fetching verified medical specialists...</p>
            </div>
          ) : error ? (
            <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center text-rose-700 text-sm">
              Failed to load doctor profiles. Please check server status.
            </div>
          ) : doctors.length === 0 ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center text-slate-600 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-1">No matching doctors found</h3>
              <p className="text-xs text-slate-500 mb-4">Try adjusting your filters, location, or search keywords.</p>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-xl text-xs font-semibold transition"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {doctors.map((doc) => (
                <DoctorCard
                  key={doc.id}
                  doctor={doc}
                  isComparing={comparingDoctors.some(d => d.id === doc.id)}
                  onToggleCompare={handleToggleCompare}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Comparison Drawer */}
      <DoctorComparisonDrawer
        selectedDoctors={comparingDoctors}
        onRemoveDoctor={handleRemoveCompare}
        onClearAll={handleClearCompare}
      />
    </div>
  );
};
