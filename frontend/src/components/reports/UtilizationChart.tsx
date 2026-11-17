import React from 'react';

interface UtilizationItem {
  id: string;
  name: string;
  specialization: string;
  clinicName: string;
  totalAppointments: number;
  completedCount: number;
}

interface UtilizationChartProps {
  doctors: UtilizationItem[];
}

export const UtilizationChart: React.FC<UtilizationChartProps> = ({ doctors }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Doctor Schedule Utilization Ranking</h3>
          <p className="text-xs text-slate-500">Completed vs scheduled consultation efficiency</p>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        {doctors.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">No doctor utilization data yet</div>
        ) : (
          doctors.map((doc) => {
            const maxRef = Math.max(...doctors.map((d) => d.totalAppointments), 1);
            const percent = Math.min(Math.round((doc.totalAppointments / maxRef) * 100), 100);

            return (
              <div key={doc.id} className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center font-medium">
                  <div>
                    <span className="font-bold text-slate-900 mr-2">{doc.name}</span>
                    <span className="text-slate-500">({doc.specialization})</span>
                  </div>
                  <span className="text-slate-600 font-semibold">
                    {doc.totalAppointments} booked ({doc.completedCount} completed)
                  </span>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-brand-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

