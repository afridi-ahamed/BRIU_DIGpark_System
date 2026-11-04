import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Clock, AlertCircle } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-5"
    >
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-[800] text-white tracking-[-0.03em]">Analytics</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">Parking usage insights and historical data</p>
        </div>
        <span className="badge badge-teal">Coming Soon</span>
      </div>

      {/* Coming soon state */}
      <div className="glass rounded-[20px] p-12 flex flex-col items-center justify-center text-center min-h-[480px]">
        {/* Icon cluster */}
        <div className="relative mb-8">
          <div className="w-20 h-20 rounded-[24px] flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(45,212,191,0.12), rgba(45,212,191,0.04))', border: '1px solid rgba(45,212,191,0.2)' }}>
            <BarChart3 className="h-9 w-9 text-teal-400" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-[10px] flex items-center justify-center"
            style={{ background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.2)' }}>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </div>
          <div className="absolute -bottom-1 -left-3 w-7 h-7 rounded-[10px] flex items-center justify-center"
            style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <Clock className="h-3.5 w-3.5 text-amber-400" />
          </div>
        </div>

        <h2 className="text-[20px] font-[700] text-white tracking-[-0.025em] mb-3">Analytics Module</h2>
        <p className="text-[14px] text-[var(--text-secondary)] max-w-[380px] leading-relaxed mb-8">
          Detailed parking occupancy charts, peak-hour heatmaps, user behaviour reports,
          and revenue analytics will be available here.
        </p>

        {/* Planned features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-[600px]">
          {[
            { icon: BarChart3, label: 'Occupancy Charts',    desc: 'Daily & weekly trends',  color: 'var(--teal)' },
            { icon: TrendingUp, label: 'Peak Hour Analysis', desc: 'Busiest time slots',      color: 'var(--purple)' },
            { icon: AlertCircle, label: 'Usage Reports',     desc: 'Member & lot breakdown',  color: 'var(--amber)' },
          // eslint-disable-next-line no-unused-vars
          ].map(({ icon: Icon, label, desc, color }) => (
            <div key={label} className="rounded-[14px] p-4 border border-white/[0.06] text-center"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <Icon className="h-5 w-5 mx-auto mb-2" style={{ color }} />
              <p className="text-[12px] font-[600] text-white mb-1">{label}</p>
              <p className="text-[11px] text-[var(--text-muted)]">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
