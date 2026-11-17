import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricsSummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  isPositive?: boolean;
  colorClass?: string;
}

export const MetricsSummaryCard: React.FC<MetricsSummaryCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  isPositive = true,
  colorClass = 'text-brand-600 bg-brand-50'
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex justify-between items-start">
      <div>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">{title}</span>
        <div className="text-2xl font-black text-slate-900 tracking-tight">{value}</div>
        {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
        {trend && (
          <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }`}>
            {trend}
          </span>
        )}
      </div>

      <div className={`p-3 rounded-2xl ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

