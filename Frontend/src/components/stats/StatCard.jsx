import { motion } from 'framer-motion';

const ACCENTS = {
  teal:   { from: '#0D9488', to: '#2DD4BF', text: '#2DD4BF', bar: '#2DD4BF', glow: 'rgba(20,184,166,0.25)',  dim: 'rgba(45,212,191,0.08)'  },
  blue:   { from: '#1D4ED8', to: '#60A5FA', text: '#60A5FA', bar: '#60A5FA', glow: 'rgba(96,165,250,0.25)',  dim: 'rgba(96,165,250,0.08)'  },
  purple: { from: '#6D28D9', to: '#A78BFA', text: '#A78BFA', bar: '#A78BFA', glow: 'rgba(139,92,246,0.25)',  dim: 'rgba(167,139,250,0.08)' },
  red:    { from: '#9F1239', to: '#F87171', text: '#F87171', bar: '#F87171', glow: 'rgba(248,113,113,0.25)', dim: 'rgba(248,113,113,0.08)' },
  amber:  { from: '#B45309', to: '#FBBF24', text: '#FBBF24', bar: '#FBBF24', glow: 'rgba(251,191,36,0.25)',  dim: 'rgba(251,191,36,0.08)'  },
};

export default function StatCard({ title, value, total, progress, color = 'teal', icon: Icon, subtitle }) {
  const a = ACCENTS[color] || ACCENTS.teal;

  return (
    <motion.div
      whileHover={{ y: -3, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
      className="relative overflow-hidden rounded-[20px] p-5 h-full cursor-default select-none group"
      style={{
        background: `linear-gradient(145deg, ${a.dim} 0%, rgba(14,18,30,0.9) 100%)`,
        border: `1px solid rgba(255,255,255,0.07)`,
        boxShadow: `0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
    >
      {/* Top gradient edge */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] rounded-t-[20px]"
        style={{ background: `linear-gradient(90deg, transparent, ${a.bar}55, transparent)` }} />

      {/* Background orb */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-3xl opacity-60 transition-opacity duration-300 group-hover:opacity-90"
        style={{ background: a.bar }} />

      {/* Header row */}
      <div className="relative flex items-start justify-between mb-4">
        <p className="section-label">{title}</p>
        {Icon && (
          <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0"
            style={{ background: a.dim, border: `1px solid ${a.bar}33` }}>
            <Icon className="h-4 w-4" style={{ color: a.text }} />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="relative flex items-baseline gap-2 mb-1">
        <motion.span
          key={value}
          initial={{ opacity: 0, y: 8, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          className="text-[32px] font-[800] text-white leading-none tracking-[-0.04em]"
        >
          {value}
        </motion.span>
        {total && (
          <span className="text-[13px] font-[500]" style={{ color: 'var(--text-muted)' }}>{total}</span>
        )}
      </div>

      {subtitle && (
        <p className="text-[12px] mb-3" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>
      )}

      {/* Progress bar */}
      {progress !== undefined && (
        <div className="relative mt-4">
          <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${a.from}, ${a.to})`, boxShadow: `0 0 8px ${a.glow}` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1.5">
            <p className="text-[11px] font-[600]" style={{ color: a.text }}>{progress}% utilized</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
