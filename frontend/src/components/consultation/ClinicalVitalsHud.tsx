import React, { useState } from 'react';
import { PatientVitalsSummary } from '../../types';
import {
  Heart,
  AlertTriangle,
  Activity,
  Phone,
  FileEdit,
  Save,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ClinicalVitalsHudProps {
  patientName: string;
  vitals?: PatientVitalsSummary;
  onSaveNotes?: (notes: string) => void;
}

export const ClinicalVitalsHud: React.FC<ClinicalVitalsHudProps> = ({
  patientName,
  vitals = {
    bloodGroup: 'O+',
    allergies: ['Penicillin', 'Sulfa Antibiotics'],
    chronicConditions: ['Hypertension (Stage 1)', 'Mild Asthma'],
    emergencyContact: {
      name: 'Michael Doe',
      relationship: 'Spouse',
      phone: '+91 98765 12345'
    },
    recentBp: '124/82 mmHg',
    heartRate: 74,
    weightKg: 68
  },
  onSaveNotes
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [scratchpadNotes, setScratchpadNotes] = useState(
    'Patient reports mild throat irritation since 3 days. No high fever reported. Advised saline gargle and vitals review.'
  );
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    if (onSaveNotes) onSaveNotes(scratchpadNotes);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs text-slate-900">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl text-blue-600">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Clinical Vitals & Health HUD</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                PATIENT: {patientName}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Live clinical decision support during video visit</p>
          </div>
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
        >
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="mt-4 space-y-4">
          {/* Vitals & Demographics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Blood Group</span>
              <span className="text-base font-black text-rose-600 mt-0.5 block">{vitals.bloodGroup}</span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Recent BP</span>
              <span className="text-sm font-bold text-slate-800 mt-0.5 block">{vitals.recentBp || '120/80'}</span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Heart Rate</span>
              <span className="text-sm font-bold text-slate-800 mt-0.5 block">{vitals.heartRate || 72} bpm</span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Weight</span>
              <span className="text-sm font-bold text-slate-800 mt-0.5 block">{vitals.weightKg || 65} kg</span>
            </div>
          </div>

          {/* Critical Allergy Warning - High Visibility Crimson Alert */}
          {vitals.allergies && vitals.allergies.length > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-2xl flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-rose-900 uppercase tracking-wider text-[10px] block">
                  Documented Drug / Food Allergies:
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {vitals.allergies.map((allergy, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-300 text-[11px] font-bold"
                    >
                      ⚠️ {allergy}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Chronic Conditions */}
          {vitals.chronicConditions && vitals.chronicConditions.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs">
              <span className="font-bold text-amber-900 uppercase tracking-wider text-[10px] block mb-1">
                Active Chronic Conditions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {vitals.chronicConditions.map((cond, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-medium"
                  >
                    • {cond}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Emergency Contact */}
          {vitals.emergencyContact && (
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-200/60">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  Emergency: <strong className="text-slate-900">{vitals.emergencyContact.name}</strong> ({vitals.emergencyContact.relationship})
                </span>
              </div>
              <span className="font-mono text-blue-600 font-bold">{vitals.emergencyContact.phone}</span>
            </div>
          )}

          {/* Live Clinical Note-Taking Scratchpad */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileEdit className="w-3.5 h-3.5 text-blue-600" />
                <span>Doctor Consultation Scratchpad</span>
              </span>

              {isSaved ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-teal-700 font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Saved to visit record</span>
                </span>
              ) : (
                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition"
                >
                  <Save className="w-3 h-3" />
                  <span>Save Notes</span>
                </button>
              )}
            </div>

            <textarea
              rows={3}
              value={scratchpadNotes}
              onChange={(e) => setScratchpadNotes(e.target.value)}
              placeholder="Record chief complaints, diagnosis notes, clinical observations, or prescription reminders..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
      )}
    </div>
  );
};
