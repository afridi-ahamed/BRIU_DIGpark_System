import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi } from 'lucide-react';

const buildSlotGrid = (lot) => {
  const slots = [];
  for (let i = 0; i < lot.total_capacity; i++) {
    const num = String(i + 1).padStart(2, '0');
    slots.push({ id: `${lot.id}-${num}`, num, occupied: i < lot.current_occupied });
  }
  return slots;
};

export default function ParkingMapPanel({ lots, sensorEvent }) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (!lots || lots.length === 0) {
    return (
      <div className="lg:col-span-2 glass rounded-[20px] p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-16 h-16 rounded-[20px] bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-4">
          <svg className="h-7 w-7 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
          </svg>
        </div>
        <h3 className="text-[15px] font-[600] text-white mb-2">No Parking Lots</h3>
        <p className="text-[13px] text-[var(--text-secondary)] max-w-[260px] leading-relaxed">
          Create your first parking lot from the Admin Hub → Parking Grid.
        </p>
      </div>
    );
  }

  const lot = lots[activeIdx] || lots[0];
  const slots = buildSlotGrid(lot);
  const freeCount = lot.available_spots;
  const occupiedCount = lot.current_occupied;
  const fillPct = lot.total_capacity > 0 ? Math.round((occupiedCount / lot.total_capacity) * 100) : 0;

  return (
    <div className="lg:col-span-2 glass rounded-[20px] overflow-hidden">
      {/* Panel header */}
      <div className="px-5 pt-5 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[15px] font-[700] text-white tracking-[-0.02em]">Parking Space Map</h2>
            <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">Real-time vehicle placement data</p>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-teal-500/8 border border-teal-500/20">
            <span className="live-dot" />
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="text-[11px] font-[600] text-teal-400 flex items-center gap-1.5"
            >
              <Wifi className="h-3 w-3" />
              Sensor Live
            </motion.span>
          </div>
        </div>

        {/* Lot tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {lots.map((l, i) => (
            <button
              key={l.id}
              onClick={() => setActiveIdx(i)}
              className={`px-3 py-1.5 rounded-[8px] text-[11px] font-[600] transition-all duration-150 ${
                i === activeIdx
                  ? 'bg-white/10 text-white border border-white/15'
                  : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.05] border border-transparent'
              }`}
            >
              {l.name}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Sensor ticker */}
        <AnimatePresence mode="wait">
          <motion.div
            key={sensorEvent?.time}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] border border-teal-500/15 bg-teal-500/[0.04]"
          >
            <span className="live-dot flex-shrink-0" />
            <p className="text-[12px] leading-snug">
              <span className="font-[500] font-mono text-[var(--text-muted)] mr-2">{sensorEvent?.time}</span>
              <span className="text-[var(--text-secondary)]">{sensorEvent?.text}</span>
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Stats strip */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Capacity',   value: lot.total_capacity, color: '#60A5FA' },
            { label: 'Occupied',   value: occupiedCount, color: fillPct >= 90 ? '#F87171' : '#2DD4BF' },
            { label: 'Available',  value: freeCount,    color: '#34D399' },
            { label: 'Fill Rate',  value: `${fillPct}%`, color: fillPct >= 90 ? '#F87171' : '#FBBF24' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-[12px] p-3 text-center border border-white/[0.06]"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="section-label mb-1.5">{label}</p>
              <p className="text-[20px] font-[800] tracking-[-0.03em] leading-none" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Occupancy bar */}
        <div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${fillPct}%` }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full"
              style={{
                background: fillPct >= 90
                  ? 'linear-gradient(90deg, #9F1239, #F87171)'
                  : 'linear-gradient(90deg, #0D9488, #2DD4BF)',
                boxShadow: fillPct >= 90
                  ? '0 0 8px rgba(248,113,113,0.5)'
                  : '0 0 8px rgba(45,212,191,0.4)',
              }}
            />
          </div>
        </div>

        {/* Slot grid */}
        <div className="rounded-[14px] p-4 border border-white/[0.05] " style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="flex items-center justify-between mb-3 ">
            <p className="text-[11px] font-[600] text-[var(--text-muted)]">{lot.name} — Space Layout</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[10px] font-[600] text-[var(--text-muted)]">
                <span className="w-2 h-2 rounded-sm inline-block" style={{ background: '#34D399' }} /> Free
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-[600] text-[var(--text-muted)]">
                <span className="w-2 h-2 rounded-sm inline-block" style={{ background: '#F87171' }} /> Taken
              </span>
            </div>
          </div>

          {slots.length === 0 ? (
            <p className="text-[12px] text-[var(--text-muted)] text-center py-6">Lot capacity is 0.</p>
          ) : (
            <div className="grid grid-cols-8 gap-1.5 max-h-[600px] overflow-y-auto custom-scrollbar">
              {slots.map((slot) => (
                <motion.div
                  key={slot.id}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 24 }}
                  title={`Space ${slot.num} — ${slot.occupied ? 'Occupied' : 'Free'}`}
                  className="aspect-square rounded-[6px] flex items-center justify-center border relative overflow-hidden"
                  style={{
                    background: slot.occupied ? 'rgba(248,113,113,0.12)' : 'rgba(52,211,153,0.08)',
                    borderColor: slot.occupied ? 'rgba(248,113,113,0.3)' : 'rgba(52,211,153,0.2)',
                    boxShadow: slot.occupied
                      ? '0 0 6px rgba(248,113,113,0.15)'
                      : 'none',
                  }}
                >
                  <span className="text-[8px] font-[700]"
                    style={{ color: slot.occupied ? '#F87171' : '#34D399' }}>
                    {slot.num}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
