import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { DoctorCard as DoctorCardType } from '../../types';
import { DoctorCard } from '../../components/search/DoctorCard';
import { FilterSidebar } from '../../components/search/FilterSidebar';
import { Search, Loader2, Sparkles } from 'lucide-react';

export const DoctorSearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [city, setCity] = useState('');
  const [maxFee, setMaxFee] = useState('');
  const [language, setLanguage] = useState('');
  const [date, setDate] = useState('');

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

  return (
    <div className="space-y-6">
      {/* Hero Search Header */}
      <div className="bg-gradient-to-r from-brand-600 to-sky-700 rounded-2xl p-8 text-white shadow-md relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-brand-100 text-xs font-semibold mb-4 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant & Concurrency-Safe Appointments</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            Find & Book Verified Doctors
          </h1>
          <p className="text-brand-100 text-sm mb-6">
            Search top specialists, inspect open slots in real-time, hold your preferred time slot for 5 minutes with zero double-booking, and attend in-person or via secure HD video.
          </p>

          {/* Quick Search Input */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by doctor name, clinic, or medical specialization (e.g. Dr. Sharma, Cardiology)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white text-slate-900 rounded-xl text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
        </div>
      </div>

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
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Available Healthcare Specialists ({doctors.length})
            </h2>
            <div className="text-xs text-slate-500">
              Showing verified practitioners
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-16 bg-white border border-slate-200 rounded-xl text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-2" />
              <p className="text-sm">Fetching verified medical specialists...</p>
            </div>
          ) : error ? (
            <div className="p-8 bg-red-50 border border-red-200 rounded-xl text-center text-red-700">
              Failed to load doctor profiles. Please check server status.
            </div>
          ) : doctors.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
              <h3 className="text-base font-bold text-slate-800 mb-1">No matching doctors found</h3>
              <p className="text-sm text-slate-500 mb-4">Try adjusting your filters, location, or search keywords.</p>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-brand-50 text-brand-600 hover:bg-brand-100 rounded-lg text-xs font-semibold transition"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {doctors.map((doc) => (
                <DoctorCard key={doc.id} doctor={doc} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

