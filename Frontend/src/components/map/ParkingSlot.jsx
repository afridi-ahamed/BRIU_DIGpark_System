import { motion } from 'framer-motion';
import { Car, AlertTriangle } from 'lucide-react';

const statusStyles = {
  vacant: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  occupied: 'bg-teal-900/40 border-teal-500/50 text-teal-300 shadow-[0_0_15px_rgba(20,184,166,0.15)]',
  violation: 'bg-red-500/20 border-red-500/70 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]',
};

const ParkingSlot = ({ id, status, memberId }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.05, y: -2 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`aspect-[3/4] rounded-xl flex flex-col items-center justify-center p-2 text-center border-2 transition-colors relative overflow-hidden ${statusStyles[status]}`}
    >
      {/* Decorative Glow */}
      {status === 'occupied' && <div className="absolute inset-0 bg-teal-400/5 blur-xl"></div>}
      {status === 'violation' && <div className="absolute inset-0 bg-red-400/10 blur-xl"></div>}

      <div className="relative z-10 flex flex-col items-center w-full">
        <span className="text-[10px] font-bold opacity-70 mb-1 tracking-widest">{id}</span>
        
        {status === 'vacant' ? (
          <div className="flex-1 flex items-center justify-center py-2 h-8">
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500/60 leading-none">EMPTY</span>
          </div>
        ) : status === 'violation' ? (
          <div className="py-1">
            <AlertTriangle className="h-5 w-5 mb-1 text-red-500 stroke-[2] drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
          </div>
        ) : (
          <div className="py-1">
            <Car className="h-5 w-5 mb-1 text-teal-400 stroke-[1.5] drop-shadow-[0_0_5px_rgba(45,212,191,0.5)]" />
          </div>
        )}

        {memberId ? (
          <span className="text-[9px] mt-1 font-mono tracking-widest bg-black/40 px-1 py-0.5 rounded border border-white/5 w-[90%] truncate">
            ID-{memberId}
          </span>
        ) : (
          <span className="text-[8px] mt-1 opacity-0">-</span> // Placeholder to keep height
        )}
      </div>
    </motion.div>
  );
};

export default ParkingSlot;
