import React, { useState } from 'react';
import { QueueToken } from '../../types';
import {
  Users,
  Clock,
  Volume2,
  ChevronRight,
  Maximize2,
  Building2,
  Plus,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';

export const LiveQueueBoardPage: React.FC = () => {
  const [tokens, setTokens] = useState<QueueToken[]>([
    {
      id: 'q-101',
      tokenNumber: 'A-101',
      appointmentId: 'apt-001',
      patientName: 'Ramesh K***',
      doctorName: 'Dr. Ramesh Sharma',
      specialization: 'Cardiology',
      roomCabin: 'OPD Cabin 1',
      scheduledTime: '09:00 AM',
      status: 'IN_CABIN',
      estimatedWaitMinutes: 0
    },
    {
      id: 'q-102',
      tokenNumber: 'A-102',
      appointmentId: 'apt-002',
      patientName: 'Priya S***',
      doctorName: 'Dr. Ramesh Sharma',
      specialization: 'Cardiology',
      roomCabin: 'OPD Cabin 1',
      scheduledTime: '09:30 AM',
      status: 'UP_NEXT',
      estimatedWaitMinutes: 8
    },
    {
      id: 'q-103',
      tokenNumber: 'A-103',
      appointmentId: 'apt-003',
      patientName: 'Amit V***',
      doctorName: 'Dr. Ramesh Sharma',
      specialization: 'Cardiology',
      roomCabin: 'OPD Cabin 1',
      scheduledTime: '10:00 AM',
      status: 'WAITING',
      estimatedWaitMinutes: 25
    },
    {
      id: 'q-201',
      tokenNumber: 'B-201',
      appointmentId: 'apt-004',
      patientName: 'Sunita M***',
      doctorName: 'Dr. Priya Patel',
      specialization: 'Dermatology',
      roomCabin: 'OPD Cabin 2',
      scheduledTime: '09:15 AM',
      status: 'IN_CABIN',
      estimatedWaitMinutes: 0
    },
    {
      id: 'q-202',
      tokenNumber: 'B-202',
      appointmentId: 'apt-005',
      patientName: 'Karan D***',
      doctorName: 'Dr. Priya Patel',
      specialization: 'Dermatology',
      roomCabin: 'OPD Cabin 2',
      scheduledTime: '09:45 AM',
      status: 'UP_NEXT',
      estimatedWaitMinutes: 12
    },
    {
      id: 'q-301',
      tokenNumber: 'C-301',
      appointmentId: 'apt-006',
      patientName: 'Vikram N***',
      doctorName: 'Dr. Anil Kumar',
      specialization: 'Orthopedics',
      roomCabin: 'OPD Cabin 3',
      scheduledTime: '09:30 AM',
      status: 'IN_CABIN',
      estimatedWaitMinutes: 0
    }
  ]);

  const [lastChimeToken, setLastChimeToken] = useState<string | null>('A-101');
  const [isDigitalSignageMode, setIsDigitalSignageMode] = useState(false);

  const handleCallNext = (cabin: string) => {
    const cabinTokens = tokens.filter(t => t.roomCabin === cabin);
    const inCabin = cabinTokens.find(t => t.status === 'IN_CABIN');
    const upNext = cabinTokens.find(t => t.status === 'UP_NEXT');
    const firstWaiting = cabinTokens.find(t => t.status === 'WAITING');

    if (!upNext && !firstWaiting) {
      alert(`No more waiting patients for ${cabin}.`);
      return;
    }

    setTokens(prev =>
      prev.map(t => {
        if (t.id === inCabin?.id) return { ...t, status: 'COMPLETED' };
        if (t.id === upNext?.id) return { ...t, status: 'IN_CABIN', estimatedWaitMinutes: 0 };
        if (t.id === firstWaiting?.id) return { ...t, status: 'UP_NEXT', estimatedWaitMinutes: 10 };
        return t;
      })
    );

    const nextTokenNum = upNext ? upNext.tokenNumber : firstWaiting?.tokenNumber;
    if (nextTokenNum) {
      setLastChimeToken(nextTokenNum);
    }
  };

  const handleAddWalkIn = () => {
    const newNum = `W-${Math.floor(100 + Math.random() * 900)}`;
    const newEntry: QueueToken = {
      id: `walkin-${Date.now()}`,
      tokenNumber: newNum,
      appointmentId: `apt-walk-${Date.now()}`,
      patientName: 'Walk-in Patient',
      doctorName: 'Dr. Ramesh Sharma',
      specialization: 'General OPD',
      roomCabin: 'OPD Cabin 1',
      scheduledTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'WAITING',
      estimatedWaitMinutes: 35
    };
    setTokens(prev => [...prev, newEntry]);
  };

  const activeInCabin = tokens.filter(t => t.status === 'IN_CABIN');
  const upNextList = tokens.filter(t => t.status === 'UP_NEXT');
  const waitingList = tokens.filter(t => t.status === 'WAITING');

  return (
    <div className={`space-y-6 pb-20 ${isDigitalSignageMode ? 'fixed inset-0 z-50 bg-slate-50 p-8 overflow-y-auto' : ''}`}>
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">Live Clinic Token Board</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                LIVE OPD
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              DPDP-compliant real-time waiting room queue display and patient calling system
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={handleAddWalkIn}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Walk-In Token</span>
          </button>

          <button
            onClick={() => setIsDigitalSignageMode(!isDigitalSignageMode)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition"
          >
            <Maximize2 className="w-4 h-4" />
            <span>{isDigitalSignageMode ? 'Exit TV Mode' : 'Waiting Room TV Mode'}</span>
          </button>
        </div>
      </div>

      {/* Audio Announcement Simulation Banner */}
      {lastChimeToken && (
        <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs">
              <Volume2 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
                Audio Announcement Chime:
              </span>
              <p className="text-sm font-bold text-slate-900">
                "Token Number <strong className="text-blue-600 text-base">#{lastChimeToken}</strong>, please proceed to Consultation Cabin."
              </p>
            </div>
          </div>
          <button
            onClick={() => setLastChimeToken(null)}
            className="text-xs text-slate-500 hover:text-slate-800 px-3 py-1.5 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Primary Section: Now Serving in Cabins */}
      <div>
        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span>Now In Cabin (Serving)</span>
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {activeInCabin.map((token) => (
            <div
              key={token.id}
              className="bg-white border-2 border-blue-500/80 rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs tracking-wider border border-blue-200">
                    {token.roomCabin}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{token.scheduledTime}</span>
                </div>

                {/* Big Token Number */}
                <div className="text-center my-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest">
                    ACTIVE TOKEN
                  </span>
                  <span className="text-4xl sm:text-5xl font-black text-blue-600 font-mono tracking-wider">
                    #{token.tokenNumber}
                  </span>
                  <span className="text-xs text-slate-600 block mt-1 font-semibold">{token.patientName}</span>
                </div>

                <div className="mt-3 text-xs text-slate-600 space-y-1">
                  <p className="font-bold text-slate-900 text-sm">{token.doctorName}</p>
                  <p className="text-blue-600 font-semibold">{token.specialization}</p>
                </div>
              </div>

              {/* Action: Call Next Patient for this Cabin */}
              <button
                onClick={() => handleCallNext(token.roomCabin)}
                className="mt-6 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <span>Call Next Patient</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Secondary Section: Up Next & Waiting Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Up Next List */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Up Next (Prepare for Cabin)</span>
            </h3>
            <span className="text-xs font-bold text-amber-800 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200">
              {upNextList.length} In Line
            </span>
          </div>

          <div className="space-y-3">
            {upNextList.map((token) => (
              <div
                key={token.id}
                className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl hover:border-amber-400 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center font-mono font-black text-lg">
                    {token.tokenNumber}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{token.patientName}</h4>
                    <p className="text-[11px] text-slate-500">
                      {token.doctorName} • <span className="text-slate-700 font-semibold">{token.roomCabin}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    ~{token.estimatedWaitMinutes}m wait
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium">Scheduled: {token.scheduledTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* General Waiting Queue */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span>Waiting Room Pool</span>
            </h3>
            <span className="text-xs font-semibold text-slate-600 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200">
              {waitingList.length} Waiting
            </span>
          </div>

          <div className="space-y-2.5">
            {waitingList.map((token) => (
              <div
                key={token.id}
                className="flex items-center justify-between p-3 bg-slate-50/70 border border-slate-200/60 rounded-xl text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-700 px-2 py-1 rounded bg-white border border-slate-200 text-xs shadow-2xs">
                    {token.tokenNumber}
                  </span>
                  <div>
                    <span className="font-semibold text-slate-800 block">{token.patientName}</span>
                    <span className="text-[10px] text-slate-500">{token.doctorName}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-slate-600 font-medium text-[11px]">Est. ~{token.estimatedWaitMinutes}m</span>
                  <span className="text-[10px] text-slate-400 block">{token.roomCabin}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
