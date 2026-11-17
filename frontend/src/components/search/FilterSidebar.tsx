import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

interface FilterSidebarProps {
  specialization: string;
  setSpecialization: (val: string) => void;
  city: string;
  setCity: (val: string) => void;
  maxFee: string;
  setMaxFee: (val: string) => void;
  language: string;
  setLanguage: (val: string) => void;
  date: string;
  setDate: (val: string) => void;
  onReset: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  specialization,
  setSpecialization,
  city,
  setCity,
  maxFee,
  setMaxFee,
  language,
  setLanguage,
  date,
  setDate,
  onReset
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-6">
      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900 flex items-center">
          <Filter className="w-4 h-4 mr-2 text-brand-600" />
          Filter Providers
        </h3>
        <button
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-brand-600 flex items-center transition"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Reset
        </button>
      </div>

      {/* Specialization Filter */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Specialization</label>
        <select
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Specializations</option>
          <option value="Cardiology">Cardiology (Heart)</option>
          <option value="Pediatrics">Pediatrics (Children)</option>
          <option value="Dermatology">Dermatology (Skin)</option>
          <option value="Orthopedics">Orthopedics (Bones)</option>
        </select>
      </div>

      {/* City Filter */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">City / Location</label>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Cities</option>
          <option value="Mumbai">Mumbai</option>
          <option value="Bangalore">Bangalore</option>
          <option value="Delhi">Delhi</option>
          <option value="Hyderabad">Hyderabad</option>
        </select>
      </div>

      {/* Maximum Fee Slider */}
      <div>
        <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
          <span>Max Fee</span>
          <span className="text-brand-600 font-bold">{maxFee ? `₹${maxFee}` : 'Any Fee'}</span>
        </div>
        <input
          type="range"
          min="500"
          max="2000"
          step="100"
          value={maxFee || '2000'}
          onChange={(e) => setMaxFee(e.target.value)}
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
        />
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>₹500</span>
          <span>₹2000</span>
        </div>
      </div>

      {/* Language Filter */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Language</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Languages</option>
          <option value="English">English</option>
          <option value="Hindi">Hindi</option>
          <option value="Marathi">Marathi</option>
          <option value="Kannada">Kannada</option>
          <option value="Telugu">Telugu</option>
        </select>
      </div>

      {/* Slot Availability Date */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Available On Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-brand-500"
        />
      </div>
    </div>
  );
};

