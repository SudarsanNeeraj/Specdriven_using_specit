import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { OperationalReport } from '../../types';
import { MetricsSummaryCard } from '../../components/reports/MetricsSummaryCard';
import { UtilizationChart } from '../../components/reports/UtilizationChart';
import { ReceptionistWalkInBookingModal } from '../../components/admin/ReceptionistWalkInBookingModal';
import {
  CalendarCheck,
  CheckCircle2,
  DollarSign,
  Activity,
  AlertTriangle,
  Users,
  Plus,
  RefreshCw,
  Loader2
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [showWalkInModal, setShowWalkInModal] = useState(false);

  const { data: report, isLoading, refetch } = useQuery<OperationalReport>({
    queryKey: ['admin-operational-report'],
    queryFn: async () => {
      const res = await api.get('/admin/reports/operational');
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div className="p-24 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto mb-2" />
        <p className="text-xs">Computing clinical analytics & operational reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Clinic Operations & Analytics</h1>
          <p className="text-xs text-slate-500">Live operational oversight, front-desk bookings, revenue, and doctor utilization.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => refetch()}
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl transition"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowWalkInModal(true)}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Walk-In Booking
          </button>
        </div>
      </div>

      {/* Metric Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsSummaryCard
          title="Total Consultations"
          value={report?.totalBookings ?? 0}
          subtitle={`${report?.completedVisits ?? 0} successfully completed`}
          icon={CalendarCheck}
          colorClass="text-brand-600 bg-brand-50"
        />

        <MetricsSummaryCard
          title="Gross Revenue"
          value={`₹${(report?.totalRevenue ?? 0).toLocaleString()}`}
          subtitle="Collected & Pay-at-Clinic"
          icon={DollarSign}
          colorClass="text-emerald-600 bg-emerald-50"
          trend="+18% vs last month"
          isPositive={true}
        />

        <MetricsSummaryCard
          title="Doctor Utilization"
          value={`${report?.doctorUtilizationRatePercent ?? 0}%`}
          subtitle="Active bookable shifts"
          icon={Activity}
          colorClass="text-indigo-600 bg-indigo-50"
        />

        <MetricsSummaryCard
          title="Cancellation Rate"
          value={`${report?.cancellationRatePercent ?? 0}%`}
          subtitle={`No-show rate: ${report?.noShowRatePercent ?? 0}%`}
          icon={AlertTriangle}
          colorClass="text-amber-600 bg-amber-50"
          isPositive={false}
        />
      </div>

      {/* Main Grid: Doctor Utilization & Specialization Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Utilization Ranking (2 cols) */}
        <div className="lg:col-span-2">
          <UtilizationChart doctors={report?.doctorUtilization ?? []} />
        </div>

        {/* Specialization Breakdown (1 col) */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Revenue by Specialization
          </h3>

          <div className="space-y-3">
            {report?.specializationBreakdown?.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No departmental bookings recorded</p>
            ) : (
              report?.specializationBreakdown?.map((spec, i) => (
                <div key={i} className="flex justify-between items-center text-xs p-2.5 bg-slate-50 rounded-xl">
                  <span className="font-semibold text-slate-800">{spec.specialization}</span>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">₹{spec.revenue.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400">{spec.count} booking(s)</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Walk-in Booking Modal */}
      {showWalkInModal && (
        <ReceptionistWalkInBookingModal
          onClose={() => setShowWalkInModal(false)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
};

