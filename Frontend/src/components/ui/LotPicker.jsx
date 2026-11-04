import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ParkingSquare, CheckCircle2 } from 'lucide-react';


export default function LotPicker({ lots = [], value, onChange, required }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = lots.find(l => String(l.id) === String(value)) || null;

  // Close on outside click
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const occupancyColor = (lot) => {
    const pct = lot.total_capacity > 0 ? lot.current_occupied / lot.total_capacity : 0;
    if (pct >= 1)    return '#F87171';   // full → red
    if (pct >= 0.8)  return '#FBBF24';  // near-full → amber
    return '#34D399';                    // fine → green
  };

  const occupancyBg = (lot) => {
    const pct = lot.total_capacity > 0 ? lot.current_occupied / lot.total_capacity : 0;
    if (pct >= 1)   return 'rgba(248,113,113,0.10)';
    if (pct >= 0.8) return 'rgba(251,191,36,0.10)';
    return 'rgba(52,211,153,0.06)';
  };

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
          border: `1.5px solid ${open ? 'rgba(45,212,191,0.55)' : 'var(--border-input)'}`,
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
          boxShadow: open ? 'var(--shadow-input-focus)' : 'none',
        }}
      >
        {selected ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: occupancyBg(selected), border: `1px solid ${occupancyColor(selected)}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ParkingSquare style={{ width: 13, height: 13, color: occupancyColor(selected) }} />
            </div>
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selected.name}
              </p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.3, marginTop: 1 }}>
                {selected.available_spots} of {selected.total_capacity} spaces free
              </p>
            </div>
            {/* Mini fill bar */}
            <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden', flexShrink: 0 }}>
              <div style={{
                height: '100%', borderRadius: 99, background: occupancyColor(selected),
                width: `${Math.min(100, Math.round((selected.current_occupied / selected.total_capacity) * 100))}%`,
                transition: 'width 0.4s',
              }} />
            </div>
          </div>
        ) : (
          <span style={{ flex: 1, textAlign: 'left', fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>
            Select a parking lot…
          </span>
        )}
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ marginLeft: 8, flexShrink: 0 }}>
          <ChevronDown style={{ width: 14, height: 14, color: open ? 'var(--teal)' : 'var(--text-muted)' }} />
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
        {lots.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
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
              maxHeight: 320,
              overflowY: 'auto',
            }}
            className="custom-scrollbar"
          >
            {/* Header */}
            <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                {lots.length} Lot{lots.length !== 1 ? 's' : ''} Available
              </p>
            </div>

            {/* Options */}
            <div style={{ padding: '6px' }}>
              {lots.length === 0 ? (
                <div style={{ padding: '16px 12px', textAlign: 'center' }}>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No active lots found.</p>
                </div>
              ) : (
                lots.map(lot => {
                  const pct = lot.total_capacity > 0 ? Math.round((lot.current_occupied / lot.total_capacity) * 100) : 0;
                  const isFull = lot.available_spots <= 0;
                  const isSelected = String(lot.id) === String(value);
                  const color = occupancyColor(lot);

                  return (
                    <motion.button
                      key={lot.id}
                      type="button"
                      whileHover={!isFull ? { x: 2 } : {}}
                      onClick={() => { if (!isFull) { onChange(String(lot.id)); setOpen(false); } }}
                      disabled={isFull}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        width: '100%',
                        padding: '10px 10px',
                        borderRadius: 10,
                        background: isSelected ? 'rgba(45,212,191,0.08)' : 'transparent',
                        border: `1px solid ${isSelected ? 'rgba(45,212,191,0.2)' : 'transparent'}`,
                        cursor: isFull ? 'not-allowed' : 'pointer',
                        opacity: isFull ? 0.45 : 1,
                        transition: 'background 0.12s, border-color 0.12s',
                        marginBottom: 2,
                      }}
                      onMouseEnter={e => { if (!isFull && !isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                      onMouseLeave={e => { if (!isFull && !isSelected) e.currentTarget.style.background = 'transparent'; }}
                    >
                      {/* Icon */}
                      <div style={{ width: 32, height: 32, borderRadius: 9, background: occupancyBg(lot), border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <ParkingSquare style={{ width: 14, height: 14, color }} />
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: isFull ? 'var(--text-muted)' : 'var(--text-primary)', lineHeight: 1 }}>
                            {lot.name}
                          </p>
                          {isFull && (
                            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#F87171', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 99, padding: '2px 6px' }}>
                              Full
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {lot.available_spots}/{lot.total_capacity} free · {lot.location || lot.lot_type}
                        </p>
                      </div>

                      {/* Occupancy */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color, lineHeight: 1, marginBottom: 4, fontFamily: 'var(--font-mono)' }}>{pct}%</p>
                        <div style={{ width: 36, height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99 }} />
                        </div>
                      </div>

                      {/* Selected check */}
                      {isSelected && (
                        <CheckCircle2 style={{ width: 14, height: 14, color: 'var(--teal)', flexShrink: 0, marginLeft: 4 }} />
                      )}
                    </motion.button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
