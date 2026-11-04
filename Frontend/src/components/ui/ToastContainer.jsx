import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X, Car, LogOut } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

/* ── Type config — with inline-safe style objects ─────────── */
const TYPES = {
  success: {
    icon:   <CheckCircle2 style={{ width: 18, height: 18, flexShrink: 0 }} />,
    label:  'Success',
    accent: '#34D399',
    bg:     'rgba(52,211,153,0.07)',
    border: 'rgba(52,211,153,0.28)',
    glow:   'rgba(52,211,153,0.12)',
  },
  error: {
    icon:   <XCircle style={{ width: 18, height: 18, flexShrink: 0 }} />,
    label:  'Error',
    accent: '#F87171',
    bg:     'rgba(248,113,113,0.07)',
    border: 'rgba(248,113,113,0.28)',
    glow:   'rgba(248,113,113,0.12)',
  },
  warning: {
    icon:   <AlertTriangle style={{ width: 18, height: 18, flexShrink: 0 }} />,
    label:  'Warning',
    accent: '#FBBF24',
    bg:     'rgba(251,191,36,0.07)',
    border: 'rgba(251,191,36,0.28)',
    glow:   'rgba(251,191,36,0.10)',
  },
  info: {
    icon:   <Info style={{ width: 18, height: 18, flexShrink: 0 }} />,
    label:  'Info',
    accent: '#60A5FA',
    bg:     'rgba(96,165,250,0.07)',
    border: 'rgba(96,165,250,0.28)',
    glow:   'rgba(96,165,250,0.12)',
  },
  entry: {
    icon:   <Car style={{ width: 18, height: 18, flexShrink: 0 }} />,
    label:  'Vehicle Entered',
    accent: '#2DD4BF',
    bg:     'rgba(45,212,191,0.07)',
    border: 'rgba(45,212,191,0.28)',
    glow:   'rgba(45,212,191,0.12)',
  },
  exit: {
    icon:   <LogOut style={{ width: 18, height: 18, flexShrink: 0 }} />,
    label:  'Vehicle Exited',
    accent: '#A78BFA',
    bg:     'rgba(167,139,250,0.07)',
    border: 'rgba(167,139,250,0.28)',
    glow:   'rgba(167,139,250,0.12)',
  },
};

/* ── Single Toast ─────────────────────────────────────────── */
const Toast = ({ id, message, type, duration }) => {
  const { removeToast } = useToast();
  const [progress, setProgress] = useState(100);
  const cfg = TYPES[type] || TYPES.info;

  useEffect(() => {
    const tick = 50;
    const step = 100 / (duration / tick);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p <= 0) { clearInterval(interval); removeToast(id); return 0; }
        return p - step;
      });
    }, tick);
    return () => clearInterval(interval);
  }, [id, duration, removeToast]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 110, scale: 0.88 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 110, scale: 0.88, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      style={{
        position: 'relative',
        width: 320,
        borderRadius: 16,
        border: `1px solid ${cfg.border}`,
        background: `rgba(8,11,18,0.92)`,
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 0 ${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`,
        overflow: 'hidden',
      }}
    >
      {/* ── Colour tinted left stripe ── */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: cfg.accent, borderRadius: '16px 0 0 16px' }} />

      {/* ── Progress bar (bottom) ── */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.05)' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: cfg.accent, transition: 'none', borderRadius: '0 0 0 99px' }} />
      </div>

      {/* ── Body ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 14px 16px 18px' }}>
        {/* Icon */}
        <div style={{ color: cfg.accent, marginTop: 1, flexShrink: 0 }}>{cfg.icon}</div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: cfg.accent, marginBottom: 4, lineHeight: 1 }}>
            {cfg.label}
          </p>
          <p style={{ fontSize: 13, color: 'rgba(240,244,255,0.88)', lineHeight: 1.45, wordBreak: 'break-word', fontFamily: 'var(--font-sans)' }}>
            {message}
          </p>
        </div>

        {/* Close */}
        <button
          onClick={() => removeToast(id)}
          style={{ flexShrink: 0, marginTop: 1, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.28)', padding: 4, borderRadius: 6, display: 'flex', transition: 'color 0.12s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.28)'}
        >
          <X style={{ width: 14, height: 14 }} />
        </button>
      </div>
    </motion.div>
  );
};

/* ── Container — fixed top-right ─────────────────────────── */
const ToastContainer = () => {
  const { toasts } = useToast();
  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 99999, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
      <AnimatePresence mode="sync">
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'auto' }}>
            <Toast {...t} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
