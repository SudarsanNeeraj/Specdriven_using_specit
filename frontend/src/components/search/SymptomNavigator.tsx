import React from 'react';
import {
  HeartPulse,
  Sparkles,
  Baby,
  Bone,
  Brain,
  Flame,
  ThermometerSnowflake,
  Eye,
  Smile,
  Zap,
  Activity,
  X,
  ChevronRight
} from 'lucide-react';

export interface SymptomItem {
  id: string;
  name: string;
  specialization: string;
  category: string;
  description: string;
  iconName: string;
}

export const SYMPTOM_DATA: SymptomItem[] = [
  {
    id: 'chest-pain',
    name: 'Chest Pain / Palpitations',
    specialization: 'Cardiology',
    category: 'Heart & Circulation',
    description: 'Pressure, shortness of breath, irregular heartbeat',
    iconName: 'HeartPulse'
  },
  {
    id: 'fever-cold',
    name: 'Fever, Cold & Cough',
    specialization: 'General Physician',
    category: 'General Health',
    description: 'High temperature, chills, sore throat, viral infection',
    iconName: 'ThermometerSnowflake'
  },
  {
    id: 'skin-rash',
    name: 'Skin Rash & Acne',
    specialization: 'Dermatology',
    category: 'Skin & Hair',
    description: 'Itching, breakouts, eczema, psoriasis, hives',
    iconName: 'Sparkles'
  },
  {
    id: 'child-fever',
    name: 'Infant / Child Health',
    specialization: 'Pediatrics',
    category: 'Child Care',
    description: 'Pediatric immunizations, feeding issues, toddler cough',
    iconName: 'Baby'
  },
  {
    id: 'joint-pain',
    name: 'Joint & Back Pain',
    specialization: 'Orthopedics',
    category: 'Bones & Joints',
    description: 'Arthritis, sports sprains, spine stiffness, fracture',
    iconName: 'Bone'
  },
  {
    id: 'migraine',
    name: 'Migraine & Headaches',
    specialization: 'Neurology',
    category: 'Brain & Nerves',
    description: 'Throbbing headache, vertigo, numbness, nerve pain',
    iconName: 'Brain'
  },
  {
    id: 'acid-reflux',
    name: 'Acid Reflux & Digestion',
    specialization: 'Gastroenterology',
    category: 'Digestive Health',
    description: 'Heartburn, nausea, bloating, bowel irregularities',
    iconName: 'Flame'
  },
  {
    id: 'eye-vision',
    name: 'Eye Strain & Vision',
    specialization: 'Ophthalmology',
    category: 'Vision Care',
    description: 'Redness, watery eyes, prescription check, vision blur',
    iconName: 'Eye'
  },
  {
    id: 'toothache',
    name: 'Tooth & Gum Pain',
    specialization: 'Dentistry',
    category: 'Dental Care',
    description: 'Cavities, sensitivity, wisdom tooth swelling',
    iconName: 'Smile'
  },
  {
    id: 'stress-sleep',
    name: 'Anxiety & Sleep Issues',
    specialization: 'Psychiatry',
    category: 'Mental Wellness',
    description: 'Insomnia, chronic anxiety, depression, burnout',
    iconName: 'Zap'
  }
];

interface SymptomNavigatorProps {
  selectedSpecialization: string;
  onSelectSpecialization: (spec: string) => void;
}

export const SymptomNavigator: React.FC<SymptomNavigatorProps> = ({
  selectedSpecialization,
  onSelectSpecialization
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'HeartPulse': return <HeartPulse className="w-4 h-4 text-rose-500" />;
      case 'ThermometerSnowflake': return <ThermometerSnowflake className="w-4 h-4 text-blue-500" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'Baby': return <Baby className="w-4 h-4 text-teal-500" />;
      case 'Bone': return <Bone className="w-4 h-4 text-indigo-500" />;
      case 'Brain': return <Brain className="w-4 h-4 text-purple-500" />;
      case 'Flame': return <Flame className="w-4 h-4 text-orange-500" />;
      case 'Eye': return <Eye className="w-4 h-4 text-cyan-600" />;
      case 'Smile': return <Smile className="w-4 h-4 text-teal-600" />;
      case 'Zap': return <Zap className="w-4 h-4 text-violet-500" />;
      default: return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

  const activeSymptom = SYMPTOM_DATA.find(s => s.specialization.toLowerCase() === selectedSpecialization.toLowerCase());

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs transition-all mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3.5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold uppercase tracking-wider mb-1">
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span>Symptom-Guided Discovery</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            Find the right specialist for your symptoms
          </h3>
          <p className="text-xs text-slate-500">
            Tap a symptom badge below to instantly highlight verified medical departments.
          </p>
        </div>

        {selectedSpecialization && (
          <button
            onClick={() => onSelectSpecialization('')}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Filter ({selectedSpecialization})</span>
          </button>
        )}
      </div>

      {/* Symptom chips */}
      <div className="flex flex-wrap gap-2 pt-1">
        {SYMPTOM_DATA.map((symptom) => {
          const isSelected = selectedSpecialization.toLowerCase() === symptom.specialization.toLowerCase();

          return (
            <button
              key={symptom.id}
              onClick={() => onSelectSpecialization(isSelected ? '' : symptom.specialization)}
              className={`group inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20'
                  : 'bg-slate-50/80 hover:bg-white text-slate-700 hover:text-slate-950 border-slate-200/80 hover:border-blue-400 hover:shadow-xs'
              }`}
            >
              <span className={`p-1 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-white border border-slate-200/60 shadow-2xs'}`}>
                {getIcon(symptom.iconName)}
              </span>
              <span className="font-semibold">{symptom.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}>
                {symptom.specialization}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active guidance note */}
      {activeSymptom && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-700 bg-blue-50/60 p-2.5 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>
              Showing providers for <strong className="font-bold text-blue-900">{activeSymptom.specialization}</strong> ({activeSymptom.description})
            </span>
          </div>
          <span className="text-[11px] font-semibold text-blue-600/80 hidden sm:block">
            {activeSymptom.category}
          </span>
        </div>
      )}
    </div>
  );
};
