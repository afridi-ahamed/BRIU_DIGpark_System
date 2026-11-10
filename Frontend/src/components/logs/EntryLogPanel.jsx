import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Lock, CheckCircle, User, Search, AlertCircle, Loader2 } from 'lucide-react';
import LogEntry from './LogEntry';
import LotPicker from '../ui/LotPicker';
import { verifyUniversityMember, createBooking, exitVehicle } from '../../services/api';
import { useToast } from '../../context/ToastContext';


const localInputValue = (date) => { const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000); return d.toISOString().slice(0, 16); };
const earliestStart = () => new Date(Math.ceil((Date.now() + 60000) / 60000) * 60000);
const latestStart = () => new Date(Date.now() + 8 * 60 * 60 * 1000);
const localDayEnd = () => { const d = new Date(); d.setHours(23, 59, 0, 0); return d; };
const latestAllowedStart = () => localInputValue(latestStart()) < localInputValue(localDayEnd()) ? latestStart() : localDayEnd();
const todayAtTime = (time) => `${localInputValue(new Date()).slice(0, 10)}T${time}`;
const buildBookingTimes = (durationHours, startValue) => {
  const now = new Date(startValue);
  return {
    start_time: now.toISOString(),
    end_time: new Date(now.getTime() + durationHours * 60 * 60 * 1000).toISOString(),
  };
};
const formatTime = (iso) => new Date(iso).toLocaleTimeString('en-GB', { hour12: false });
const formatDateTime = (iso) => new Date(iso).toLocaleString('en-GB', {
  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
});


const TABS = ['entry', 'exit', 'logs'];
const TAB_LABELS = { entry: 'Grant Entry', exit: 'Process Exit', logs: 'Activity Log' };

export default function EntryLogPanel({ bookings, lots, onBookingCreated, onVehicleExited }) {
  const { toast } = useToast();
  const [tab, setTab] = useState('entry');
  const [durationHours, setDurationHours] = useState(2);
  const [startTime, setStartTime] = useState(() => localInputValue(earliestStart()));
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const notifiedOverdueRef = useRef(new Set());

  // Entry
  const [uniId, setUniId] = useState('');
  const [lotId, setLotId] = useState('');
  const [plate, setPlate] = useState('');
  const [member, setMember] = useState(null);
  const [verifyErr, setVerifyErr] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [booking, setBooking] = useState(false);

  // Exit
  const [exitToken, setExitToken] = useState('');
  const [exiting, setExiting] = useState(false);

  const activeLots = lots.filter(l => l.is_active);
  const activeBookings = bookings.filter(b => b.status === 'active' && new Date(b.start_time) <= currentTime && b.end_time && new Date(b.end_time) > currentTime);
  const overdueBookings = bookings.filter(b => b.status === 'active' && new Date(b.start_time) <= currentTime && b.end_time && new Date(b.end_time) <= currentTime);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    overdueBookings.forEach((b) => {
      if (notifiedOverdueRef.current.has(b.id)) return;
      notifiedOverdueRef.current.add(b.id);
      toast.warning(`${b.university_member_name}'s parking time is overdue.`, 10000);
    });
  }, [overdueBookings, toast]);

  const resetEntry = () => { setUniId(''); setLotId(''); setPlate(''); setMember(null); setVerifyErr(''); };
  const resetExit  = () => { setExitToken(''); };
  const switchTab  = (t) => { setTab(t); resetEntry(); resetExit(); };

  // Verify
  const handleVerify = async () => {
    if (!uniId.trim()) return;
    setVerifying(true); setVerifyErr(''); setMember(null);
    try {
      const res = await verifyUniversityMember(uniId.trim());
      setMember(res.user);
      toast.success(`${res.user.full_name} — verified`);
    } catch (err) {
      const msg = err?.data?.error || 'University ID not found.';
      setVerifyErr(msg); toast.error(msg);
    } finally { setVerifying(false); }
  };

  const handleEntry = async (e) => {
    e.preventDefault();
    if (!member) { setVerifyErr('Verify university ID first.'); return; }
    const lot = lots.find(l => l.id === parseInt(lotId));
    if (!lot) return;
    setBooking(true);
    try {
      const times = buildBookingTimes(durationHours, startTime);
      if (new Date(times.start_time) < new Date() || new Date(times.start_time).toDateString() !== new Date().toDateString() || new Date(times.end_time).toDateString() !== new Date(times.start_time).toDateString()) {
        toast.error('Choose a future start and end time today.');
        return;
      }
      const res = await createBooking({ parking_lot: parseInt(lotId), university_id: member.university_id, vehicle_number: plate.trim(), ...times });
      onBookingCreated(res.booking, member.full_name);
      const lotType = lot.lot_type ? ` (${lot.lot_type.charAt(0).toUpperCase() + lot.lot_type.slice(1)})` : '';
      toast.entry(`Space allocated in ${lot.name}${lotType} for ${member.full_name}. Ends at ${formatDateTime(res.booking.end_time)}.`);
      resetEntry();
    } catch (err) {
      toast.error(err?.data?.error || 'Failed to create booking.');
    } finally { setBooking(false); }
  };

  const handleExit = async (e) => {
    e.preventDefault();
    if (!exitToken.trim()) return;
    setExiting(true);
    try {
      const res = await exitVehicle(exitToken.trim());
      onVehicleExited(res.booking);
      toast.exit(`${res.booking.university_member_name} exited ${res.booking.parking_lot_name}. Space is now free.`);
      resetExit();
    } catch (err) {
      toast.error(err?.data?.error || 'Invalid exit token or booking already closed.');
    } finally { setExiting(false); }
  };

  return (
    <div className="glass rounded-[20px] overflow-hidden flex flex-col">
      {/* Panel header */}
      <div className="px-5 pt-5 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-[10px] bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
            <Car className="h-4 w-4 text-teal-400" />
          </div>
          <div>
            <h2 className="text-[15px] font-[700] text-white tracking-[-0.02em]">Gate Terminal</h2>
            <p className="text-[11px] text-[var(--text-secondary)]">{activeBookings.length} vehicles currently inside</p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 p-1 rounded-[11px] border border-white/[0.06]" style={{ background: 'rgba(0,0,0,0.3)' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => switchTab(t)}
              className={`relative flex-1 py-2 text-[11px] font-[600] rounded-[8px] transition-all duration-200 z-10 ${tab === t ? 'text-white' : 'text-[var(--text-secondary)] hover:text-white'}`}>
              {tab === t && (
                <motion.div layoutId="gate-tab"
                  className="absolute inset-0 rounded-[8px] border border-white/10"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
              )}
              <span className="relative z-10 uppercase tracking-wider">{TAB_LABELS[t]}</span>
            </button>
          ))}
        </div>
      </div>

      {overdueBookings.length > 0 && (
        <div role="alert" className="mx-5 mt-4 flex items-start gap-2.5 rounded-[12px] border border-amber-500/30 bg-amber-500/[0.08] px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-300" />
          <div>
            <p className="text-[12px] font-[700] text-amber-200">
              {overdueBookings.length} booking{overdueBookings.length === 1 ? '' : 's'} overdue
            </p>
            <p className="mt-0.5 text-[11px] text-amber-100/75">
              {overdueBookings.map(b => b.university_member_name).join(', ')} — process the exit or contact the driver.
            </p>
          </div>
        </div>
      )}

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
        <AnimatePresence mode="wait">

          {/* ── ENTRY ─────────────────────────── */}
          {tab === 'entry' && (
            <motion.div key="entry" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }} className="space-y-4">

              <form onSubmit={handleEntry} className="space-y-4">
                {/* University ID */}
                <div className="field">
                  <label className="label">University ID</label>
                  <div style={{ display:'flex', gap:8 }}>
                    <div className="input-wrap" style={{ flex:1 }}>
                      <User className="input-icon" style={{ width:14, height:14 }} />
                      <input
                        value={uniId}
                        onChange={e => { setUniId(e.target.value); setMember(null); setVerifyErr(''); }}
                        placeholder="e.g. 20241234"
                        className="input with-icon-l font-mono"
                        style={{ letterSpacing:'0.06em' }}
                      />
                    </div>
                    <button type="button" onClick={handleVerify} disabled={verifying || !uniId.trim()}
                      className="btn btn-secondary btn-sm" style={{ flexShrink:0, paddingLeft:14, paddingRight:14 }}>
                      {verifying ? <Loader2 style={{ width:13, height:13, animation:'spin 1s linear infinite' }} /> : <Search style={{ width:13, height:13 }} />}
                      Verify
                    </button>
                  </div>
                </div>

                {/* Member card / error */}
                <AnimatePresence>
                  {member && (
                    <motion.div initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-3 px-4 py-3 rounded-[12px] border border-teal-500/20 bg-teal-500/[0.06]">
                      <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-4 w-4 text-teal-400" />
                      </div>
                      <div>
                        <p className="text-[13px] font-[600] text-white">{member.full_name}</p>
                        <p className="text-[11px] text-[var(--text-secondary)] capitalize">{member.category} · {member.university_id}</p>
                      </div>
                      <span className="ml-auto badge badge-teal">Verified</span>
                    </motion.div>
                  )}
                  {verifyErr && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-start gap-2.5 px-4 py-3 rounded-[12px] border border-red-500/20 bg-red-500/[0.06]">
                      <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-[12px] text-red-300 leading-snug">{verifyErr}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Lot */}
                <div className="field">
                  <label className="label">Parking Lot</label>
                  <LotPicker
                    lots={activeLots}
                    value={lotId}
                    onChange={setLotId}
                    required
                  />
                </div>

                {/* Parking duration */}
                <div className="field">
                  <label className="label" htmlFor="booking-start-time">Starting time (today)</label>
                  <input id="booking-start-time" type="time" className="input" value={new Date(startTime).toTimeString().slice(0, 5)} min={localInputValue(earliestStart()).slice(11, 16)} max={localInputValue(latestAllowedStart()).slice(11, 16)} required onChange={e => setStartTime(todayAtTime(e.target.value))} />
                  <p className="mt-1 text-[11px] text-[var(--text-muted)]">Start time can be set up to 8 hours ahead.</p>
                </div>
                <div className="field">
                  <label className="label" htmlFor="booking-duration">Parking Duration</label>
                  <select id="booking-duration" className="input" value={durationHours}
                    onChange={e => setDurationHours(Number(e.target.value))}>
                    {[1, 2, 4, 8, 12, 24].map(hours => (
                      <option key={hours} value={hours}>{hours} {hours === 1 ? 'hour' : 'hours'}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                    Scheduled to end at {formatDateTime(new Date(new Date(startTime).getTime() + durationHours * 60 * 60 * 1000).toISOString())}
                  </p>
                </div>

                {/* Plate */}
                <div className="field">
                  <label className="label">License Plate <span style={{ textTransform:'none', letterSpacing:'normal', fontWeight:400, color:'var(--text-dim)' }}>(optional)</span></label>
                  <input value={plate} onChange={e => setPlate(e.target.value)} placeholder="e.g. DHAKA-1234"
                    className="input font-mono" style={{ letterSpacing:'0.05em' }} />
                </div>

                <button type="submit" disabled={booking || !member || !lotId} className="btn btn-primary btn-wide mt-1">
                  {booking ? <><Loader2 className="h-4 w-4 animate-spin" /> Allocating…</> : <>Allocate Parking Space</>}
                </button>
              </form>
            </motion.div>
          )}

          {/* ── EXIT ──────────────────────────── */}
          {tab === 'exit' && (
            <motion.div key="exit" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }} className="space-y-4">

              <form onSubmit={handleExit} className="space-y-4">
                <div className="field">
                  <label className="label">Exit Token</label>
                  <div className="input-wrap">
                    <Lock className="input-icon" style={{ width:14, height:14 }} />
                    <input
                      value={exitToken}
                      onChange={e => { setExitToken(e.target.value.toUpperCase()); }}
                      placeholder="Enter 8-character token"
                      maxLength={10}
                      className="input with-icon-l font-mono"
                      style={{ letterSpacing: '0.18em', fontSize: 15 }}
                    />
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>Issued at entry — shown on screen and emailed to the member.</p>
                </div>

                <button type="submit" disabled={exiting || !exitToken.trim()}
                  className="btn btn-wide font-[700]"
                  style={{ background: 'linear-gradient(135deg, #9F1239, #E11D48)', color: 'white', border: '1px solid rgba(244,63,94,0.4)', boxShadow: '0 0 20px rgba(244,63,94,0.2)' }}>
                  {exiting ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</> : 'Verify Token & Open Gate'}
                </button>
              </form>

              {/* Parked now */}
              {activeBookings.length > 0 && (
                <div>
                  <p className="section-label mb-2">Inside Now ({activeBookings.length})</p>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                    {activeBookings.map(b => (
                      <div key={b.id} className="flex items-center justify-between px-3 py-2.5 rounded-[10px] border border-white/[0.05] hover:border-white/10 transition-colors"
                        style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <div>
                          <p className="text-[12px] font-[500] text-white">{b.university_member_name}</p>
                          <p className="text-[10px] text-[var(--text-muted)]">{b.parking_lot_name} · Ends {b.end_time ? formatDateTime(b.end_time) : 'time not set'}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] font-[600] font-mono text-teal-400">{formatTime(b.start_time)}</span>
                          {b.end_time && new Date(b.end_time) <= currentTime && (
                            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[9px] font-[700] uppercase tracking-wide text-amber-300">Overdue</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── LOGS ──────────────────────────── */}
          {tab === 'logs' && (
            <motion.div key="logs" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}>
              {bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-3">
                    <Car className="h-5 w-5 text-[var(--text-muted)]" />
                  </div>
                  <p className="text-[13px] font-[500] text-[var(--text-secondary)]">No activity yet</p>
                  <p className="text-[12px] text-[var(--text-muted)] mt-1">Entries and exits will appear here.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                  {bookings.map(b => (
                    <LogEntry key={b.id}
                      booking={b}
                      plate={b.vehicle_number || `UID-${b.university_member_name?.slice(0,6)}`}
                      model={b.university_member_name}
                      status={b.status === 'active' ? 'AUTHORIZED' : b.status === 'completed' ? 'EXITED' : 'CANCELLED'}
                      gate={b.parking_lot_name}
                      time={formatTime(b.created_at)}
                      isFlagged={b.status === 'cancelled'}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
