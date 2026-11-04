import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Shield, Users, CheckCircle2 } from 'lucide-react';

const ROLES = [
  { id: 'staff', name: 'Staff — Gate Guard', desc: 'Terminal access and vehicle verification.', icon: Users, color: '#60A5FA' },
  { id: 'superadmin', name: 'Super Admin', desc: 'Full system control & provisioning.', icon: Shield, color: '#A78BFA' }
];

export default function RolePicker({ value, onChange, required }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = ROLES.find(r => r.id === value) || ROLES[0]; // fallback to staff

  // Close on outside click
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* ── Trigger ── */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          padding: '10px 14px',
          background: 'var(--bg-input)',
          border: `1.5px solid ${open ? 'rgba(167,139,250,0.55)' : 'var(--border-input)'}`,
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
          boxShadow: open ? 'var(--shadow-input-focus)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: `${selected.color}15`, border: `1px solid ${selected.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <selected.icon style={{ width: 14, height: 14, color: selected.color }} />
          </div>
          <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {selected.name}
            </p>
          </div>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ marginLeft: 8, flexShrink: 0 }}>
          <ChevronDown style={{ width: 14, height: 14, color: open ? '#A78BFA' : 'var(--text-muted)' }} />
        </motion.div>
      </button>

      {/* Hidden native select for form validation */}
      <select
        required={required}
        value={value}
        onChange={() => {}}
        tabIndex={-1}
        aria-hidden="true"
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 1, height: 1 }}
      >
        <option value="" />
        {ROLES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
      </select>

      {/* ── Dropdown panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.15 } }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0, right: 0,
              zIndex: 9999,
              background: 'rgba(10,13,22,0.97)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 16,
              boxShadow: '0 16px 48px rgba(0,0,0,0.65), 0 4px 16px rgba(0,0,0,0.5)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '6px' }}>
              {ROLES.map(role => {
                const isSelected = role.id === value;
                return (
                  <motion.button
                    key={role.id}
                    type="button"
                    whileHover={{ x: 2 }}
                    onClick={() => { onChange(role.id); setOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      width: '100%',
                      padding: '10px 10px',
                      borderRadius: 10,
                      background: isSelected ? 'rgba(167,139,250,0.08)' : 'transparent',
                      border: `1px solid ${isSelected ? 'rgba(167,139,250,0.2)' : 'transparent'}`,
                      cursor: 'pointer',
                      transition: 'background 0.12s, border-color 0.12s',
                      marginBottom: 2,
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: `${role.color}15`, border: `1px solid ${role.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <role.icon style={{ width: 14, height: 14, color: role.color }} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                        {role.name}
                      </p>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.3, marginTop: 2 }}>
                        {role.desc}
                      </p>
                    </div>

                    {isSelected && (
                      <CheckCircle2 style={{ width: 14, height: 14, color: '#A78BFA', flexShrink: 0, marginLeft: 4 }} />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
