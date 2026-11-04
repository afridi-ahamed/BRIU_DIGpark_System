import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, LogOut, XCircle } from 'lucide-react';

const STATUS = {
  AUTHORIZED: { label: 'Active',     cls: 'badge-active',    dot: '#34D399', icon: Car },
  EXITED:     { label: 'Exited',     cls: 'badge-exited',    dot: '#64748B', icon: LogOut },
  CANCELLED:  { label: 'Cancelled',  cls: 'badge-cancelled', dot: '#F87171', icon: XCircle },
};

export default function LogEntry({ booking, plate, model, status, gate, time, isFlagged }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cfg = STATUS[status] || STATUS.EXITED;
  const Icon = cfg.icon;

  const formatDateTime = (iso) => {
    if (!iso) return 'N/A';
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className={`group flex flex-col px-3.5 py-3 rounded-[12px] border transition-all duration-150 ${
        isFlagged
          ? 'border-red-500/15 bg-red-500/[0.04] hover:bg-red-500/[0.07]'
          : 'border-white/[0.05] bg-white/[0.015] hover:bg-white/[0.04] hover:border-white/10'
      }`}
    >
      {/* ── Main Row ── */}
      <div className="flex items-center gap-3">
        {/* Status dot */}
        <div className="flex-shrink-0 relative">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.dot }}>
            {status === 'AUTHORIZED' && (
              <span className="absolute inset-0 rounded-full animate-ping opacity-40" style={{ background: cfg.dot }} />
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-[600] text-white font-mono truncate">{plate}</p>
          <p className="text-[11px] text-[var(--text-secondary)] truncate">{model}</p>
          <p className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5">{gate} · {time}</p>
        </div>

        {/* Badge & Toggle */}
        <div className="flex items-center gap-2">
          <span className={`badge ${cfg.cls} flex items-center gap-1 flex-shrink-0`}>
            <Icon className="w-2.5 h-2.5" />
            {cfg.label}
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[10px] font-[700] uppercase tracking-wider px-2 py-1.5 rounded-[6px] transition-colors border border-transparent hover:border-white/10 text-[var(--teal)] hover:text-white bg-white/[0.03] hover:bg-white/[0.06]"
          >
            {isExpanded ? 'Hide' : 'Details'}
          </button>
        </div>
      </div>

      {/* ── Expanded Area ── */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-white/[0.08] grid grid-cols-3 gap-3" style={{ background: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: '8px' }}>
              <div>
                <p className="text-[10px] font-[700] text-[var(--text-muted)] uppercase tracking-wide">Entry Time</p>
                <p className="text-[12px] text-white font-mono mt-0.5">{formatDateTime(booking?.start_time)}</p>
              </div>
              <div>
                <p className="text-[10px] font-[700] text-[var(--text-muted)] uppercase tracking-wide">Exit Time</p>
                <p className="text-[12px] text-white font-mono mt-0.5">{formatDateTime(booking?.end_time)}</p>
              </div>
              <div>
                <p className="text-[10px] font-[700] text-[var(--text-muted)] uppercase tracking-wide">Authorized By</p>
                <p className="text-[12px] text-white mt-0.5">{booking?.created_by_username || 'System'}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
