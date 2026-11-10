import { useCallback, useEffect, useState } from 'react';
import { CalendarClock, Car, Clock3, KeyRound, Loader2, ParkingSquare, UserRound } from 'lucide-react';
import { useAuth } from '../context/auth';
import { createBooking, getAllBookings, getAllParkingLots } from '../services/api';
import { useToast } from '../context/ToastContext';

const durations = [1, 2, 4, 8, 12, 24];
const dateTime = (value) => value
  ? new Date(value).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
  : 'Not set';
const localInputValue = (date) => { const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000); return d.toISOString().slice(0, 16); };
const earliestStart = () => new Date(Math.ceil((Date.now() + 60000) / 60000) * 60000);
const latestStart = () => new Date(Date.now() + 8 * 60 * 60 * 1000);
const endOfToday = () => { const d = new Date(); d.setHours(23, 59, 0, 0); return localInputValue(d); };
const inputTime = (date) => localInputValue(date).slice(11, 16);
const todayAtTime = (time) => `${localInputValue(new Date()).slice(0, 10)}T${time}`;

export default function MemberPortalPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [lots, setLots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [lotId, setLotId] = useState('');
  const [durationHours, setDurationHours] = useState(2);
  const [startTime, setStartTime] = useState(() => localInputValue(earliestStart()));
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState('');

  const fetchPortalData = useCallback(async () => {
    try {
      const [lotData, bookingData] = await Promise.all([getAllParkingLots(), getAllBookings()]);
      setLots(lotData);
      setBookings(bookingData);
      setPageError('');
    } catch {
      setPageError('Could not load your parking information. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortalData();
    const timer = window.setInterval(fetchPortalData, 30000);
    return () => window.clearInterval(timer);
  }, [fetchPortalData]);

  const now = new Date();
  const activeBooking = bookings.find(booking => booking.status === 'active' && new Date(booking.end_time) > now);
  const activeLots = lots.filter(lot => lot.is_active);

  const handleBooking = async (event) => {
    event.preventDefault();
    if (!user?.universityId || !lotId) return;
    const start = new Date(startTime);
    const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
    if (start.toDateString() !== now.toDateString() || end.toDateString() !== start.toDateString() || start < now) {
      toast.error('Choose a future start and end time today.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await createBooking({
        university_id: user.universityId,
        parking_lot: Number(lotId),
        vehicle_number: vehicleNumber.trim(),
        start_time: start.toISOString(),
        end_time: end.toISOString(),
      });
      toast.success(`Booking confirmed. Your exit token is ${result.booking.exit_token}.`, 9000);
      setVehicleNumber('');
      await fetchPortalData();
    } catch (error) {
      const message = error?.data?.error || 'Could not create your booking.';
      toast.error(message);
      setPageError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <section className="glass rounded-[20px] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="mb-2 text-[11px] font-[700] uppercase tracking-[0.16em] text-teal-400">BRIU DigPark · Member Portal</p>
            <h1 className="text-2xl font-[800] tracking-[-0.03em] text-white">Welcome, {user?.name || 'Member'}</h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">View parking availability and manage your bookings.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="badge badge-teal">{user?.category || 'Member'}</span>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-mono text-[var(--text-secondary)]">{user?.universityId}</span>
          </div>
        </div>
      </section>

      {pageError && <div role="alert" className="rounded-xl border border-rose-500/25 bg-rose-500/[0.08] px-4 py-3 text-sm text-rose-200">{pageError}</div>}

      {loading ? (
        <div className="flex h-56 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-teal-400" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="glass rounded-[20px] p-5 lg:col-span-2">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-teal-400/20 bg-teal-400/10"><ParkingSquare className="h-4 w-4 text-teal-300" /></div>
              <div>
                <h2 className="text-base font-[700] text-white">Parking availability</h2>
                <p className="text-xs text-[var(--text-muted)]">All parking slots, free spaces, and today’s booking times. Refreshes automatically.</p>
              </div>
            </div>
            {lots.length === 0 ? (
              <p className="rounded-xl border border-white/[0.06] p-5 text-sm text-[var(--text-muted)]">No parking lots are configured yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {lots.map(lot => (
                  <div key={lot.id} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-[650] text-white">{lot.name}</p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">{lot.location}</p>
                        <p className="mt-2 text-[10px] uppercase tracking-wider text-teal-300">{lot.lot_type}</p>
                        {!lot.is_active && <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-rose-300">Currently unavailable</p>}
                      </div>
                      <span className="whitespace-nowrap rounded-full border border-teal-400/20 bg-teal-400/[0.08] px-2.5 py-1 text-xs font-[700] text-teal-200">
                        {lot.available_spots} free
                      </span>
                    </div>
                    {lot.availability_schedule?.length > 0 ? (
                      <p className="mt-3 border-t border-white/[0.06] pt-2 text-[11px] text-[var(--text-muted)]">
                        Today’s bookings: {lot.availability_schedule.map(slot => `${new Date(slot.start_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}–${new Date(slot.end_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`).join(' · ')}
                      </p>
                    ) : (
                      <p className="mt-3 border-t border-white/[0.06] pt-2 text-[11px] text-teal-200">{lot.is_active ? `${lot.available_spots} spaces available today — no bookings scheduled.` : 'Unavailable today.'}</p>
                    )}
                    {lot.available_spots === 0 && lot.next_available_time && <p className="mt-2 text-[11px] text-amber-200">Next space frees at {dateTime(lot.next_available_time)}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="glass rounded-[20px] p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10"><CalendarClock className="h-4 w-4 text-blue-300" /></div>
              <div>
                <h2 className="text-base font-[700] text-white">Book a space</h2>
                <p className="text-xs text-[var(--text-muted)]">Choose a start time from now through the next 8 hours.</p>
              </div>
            </div>
            {activeBooking ? (
              <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-sm text-amber-100">
                <p className="font-semibold">You already have a booking.</p>
                <p className="mt-1">You can book again after this booking ends at {dateTime(activeBooking.end_time)}.</p>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="space-y-4">
                <div className="field">
                  <label className="label" htmlFor="member-start-time">Starting time (today)</label>
                  <input id="member-start-time" type="time" className="input" value={inputTime(new Date(startTime))} min={inputTime(earliestStart())} max={inputTime(new Date(Math.min(latestStart().getTime(), new Date(endOfToday()).getTime())))} required onChange={e => setStartTime(todayAtTime(e.target.value))} />
                </div>
                <div className="field">
                  <label className="label" htmlFor="member-lot">Parking lot</label>
                  <select id="member-lot" className="input" value={lotId} required onChange={e => setLotId(e.target.value)}>
                    <option value="" disabled>Select an available lot</option>
                    {activeLots.map(lot => <option key={lot.id} value={lot.id}>{lot.name} · {lot.available_spots} free</option>)}
                  </select>
                  {activeLots.length === 0 && <p className="mt-1 text-[11px] text-[var(--text-muted)]">No spaces are currently available.</p>}
                </div>
                <div className="field">
                  <label className="label" htmlFor="member-duration">Duration</label>
                  <select id="member-duration" className="input" value={durationHours} onChange={e => setDurationHours(Number(e.target.value))}>
                    {durations.filter(hours => new Date(startTime).getTime() + hours * 3600000 <= new Date(`${new Date(startTime).toDateString()} 23:59`).getTime()).map(hours => <option key={hours} value={hours}>{hours} {hours === 1 ? 'hour' : 'hours'}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label className="label" htmlFor="member-vehicle">Vehicle plate <span className="normal-case font-normal text-[var(--text-muted)]">(optional)</span></label>
                  <input id="member-vehicle" className="input" value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)} placeholder="e.g. DHAKA-1234" />
                </div>
                <button type="submit" className="btn btn-primary btn-wide" disabled={submitting || !lotId || activeLots.length === 0}>
                  {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Booking…</> : <><Car className="h-4 w-4" /> Book parking</>}
                </button>
              </form>
            )}
          </section>

          <section className="glass rounded-[20px] p-5 lg:col-span-3">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-400/10"><UserRound className="h-4 w-4 text-purple-300" /></div>
              <div>
                <h2 className="text-base font-[700] text-white">My bookings</h2>
                <p className="text-xs text-[var(--text-muted)]">Show your exit token to gate staff when leaving.</p>
              </div>
            </div>
            {bookings.length === 0 ? (
              <p className="rounded-xl border border-white/[0.06] p-5 text-sm text-[var(--text-muted)]">You don’t have any bookings yet.</p>
            ) : (
              <div className="space-y-3">
                {bookings.map(booking => (
                  <article key={booking.id} className="flex flex-col justify-between gap-4 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 md:flex-row md:items-center">
                    <div>
                      <p className="text-sm font-[650] text-white">{booking.parking_lot_name}</p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">Started {dateTime(booking.start_time)} · Ends {dateTime(booking.end_time)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`badge ${booking.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>{booking.status}</span>
                      {booking.status === 'active' && <span className="inline-flex items-center gap-1.5 rounded-lg border border-teal-400/20 bg-teal-400/[0.08] px-3 py-2 font-mono text-sm font-[700] tracking-[0.12em] text-teal-200"><KeyRound className="h-3.5 w-3.5" />{booking.exit_token}</span>}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      <p className="flex items-center justify-center gap-2 pb-2 text-center text-[11px] text-[var(--text-muted)]"><Clock3 className="h-3.5 w-3.5" /> Exit processing is handled by parking staff at the gate.</p>
    </div>
  );
}
