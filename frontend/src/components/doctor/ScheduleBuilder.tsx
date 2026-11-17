import React, { useState } from 'react';
import api from '../../services/api';
import { Clock, Plus, Trash2, CheckCircle2, Loader2 } from 'lucide-react';

interface ShiftConfig {
  dayOfWeek: number;
  shiftStartTime: string;
  shiftEndTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
  slotDurationMinutes: number;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const ScheduleBuilder: React.FC = () => {
  const [slotDuration, setSlotDuration] = useState<number>(30);
  const [shifts, setShifts] = useState<ShiftConfig[]>([
    { dayOfWeek: 1, shiftStartTime: '09:00', shiftEndTime: '17:00', breakStartTime: '13:00', breakEndTime: '14:00', slotDurationMinutes: 30 },
    { dayOfWeek: 2, shiftStartTime: '09:00', shiftEndTime: '17:00', breakStartTime: '13:00', breakEndTime: '14:00', slotDurationMinutes: 30 },
    { dayOfWeek: 3, shiftStartTime: '09:00', shiftEndTime: '17:00', breakStartTime: '13:00', breakEndTime: '14:00', slotDurationMinutes: 30 },
    { dayOfWeek: 4, shiftStartTime: '09:00', shiftEndTime: '17:00', breakStartTime: '13:00', breakEndTime: '14:00', slotDurationMinutes: 30 },
    { dayOfWeek: 5, shiftStartTime: '09:00', shiftEndTime: '17:00', breakStartTime: '13:00', breakEndTime: '14:00', slotDurationMinutes: 30 }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleUpdateShift = (index: number, field: keyof ShiftConfig, value: any) => {
    setShifts((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      await api.put('/schedules/recurring', shifts.map(s => ({ ...s, slotDurationMinutes: slotDuration })));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update schedule');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-brand-600" />
            Recurring Weekly Working Shifts
          </h2>
          <p className="text-xs text-slate-500">Configure your shift hours, break times, and slot duration intervals.</p>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-600">Slot Duration:</label>
          <select
            value={slotDuration}
            onChange={(e) => setSlotDuration(Number(e.target.value))}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-bold text-brand-700"
          >
            <option value={15}>15 Minutes</option>
            <option value={30}>30 Minutes</option>
            <option value={45}>45 Minutes</option>
            <option value={60}>60 Minutes</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {shifts.map((shift, idx) => (
          <div key={idx} className="flex flex-wrap items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
            <span className="w-24 font-bold text-slate-800">{DAYS[shift.dayOfWeek]}</span>

            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400">Hours:</span>
              <input
                type="time"
                value={shift.shiftStartTime}
                onChange={(e) => handleUpdateShift(idx, 'shiftStartTime', e.target.value)}
                className="bg-white border border-slate-200 rounded-md px-2 py-1 text-slate-800"
              />
              <span>to</span>
              <input
                type="time"
                value={shift.shiftEndTime}
                onChange={(e) => handleUpdateShift(idx, 'shiftEndTime', e.target.value)}
                className="bg-white border border-slate-200 rounded-md px-2 py-1 text-slate-800"
              />
            </div>

            <div className="flex items-center space-x-1.5 border-l border-slate-200 pl-3">
              <span className="text-slate-400">Lunch Break:</span>
              <input
                type="time"
                value={shift.breakStartTime || ''}
                onChange={(e) => handleUpdateShift(idx, 'breakStartTime', e.target.value)}
                className="bg-white border border-slate-200 rounded-md px-2 py-1 text-slate-800"
              />
              <span>to</span>
              <input
                type="time"
                value={shift.breakEndTime || ''}
                onChange={(e) => handleUpdateShift(idx, 'breakEndTime', e.target.value)}
                className="bg-white border border-slate-200 rounded-md px-2 py-1 text-slate-800"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-2">
        {savedSuccess && (
          <span className="text-xs text-emerald-600 font-bold flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-1" /> Schedule regenerated & updated!
          </span>
        )}
        <div className="ml-auto">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : 'Save & Publish Slots'}
          </button>
        </div>
      </div>
    </div>
  );
};

