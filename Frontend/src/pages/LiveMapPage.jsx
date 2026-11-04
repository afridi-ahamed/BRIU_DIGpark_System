import { useState, useCallback, useEffect } from 'react';
import { Car, ParkingSquare, Activity, CalendarCheck } from 'lucide-react';
import StatCard from '../components/stats/StatCard';
import ParkingMapPanel from '../components/map/ParkingMapPanel';
import EntryLogPanel from '../components/logs/EntryLogPanel';
import { getAllParkingLots, getAllBookings } from '../services/api';
import { formatTimeDhaka } from '../utils/datetime';

const Spinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="loader-ring" />
  </div>
);

export default function LiveMapPage() {
  const [lots, setLots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sensorEvent, setSensorEvent] = useState({
    text: 'Monitoring entrance and exit scanners',
    time: formatTimeDhaka(new Date()),
  });

  const fetchData = useCallback(async () => {
    try {
      const [l, b] = await Promise.all([getAllParkingLots(), getAllBookings()]);
      setLots(l); setBookings(b);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const refreshTimer = window.setInterval(fetchData, 30000);
    return () => window.clearInterval(refreshTimer);
  }, [fetchData]);

  // Computed stats
  const totalCapacity = lots.reduce((s, l) => s + l.total_capacity, 0);
  const totalOccupied = lots.reduce((s, l) => s + l.current_occupied, 0);
  const occupancyPct  = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;
  const activeBookings = bookings.filter(b => b.status === 'active').length;
  const totalFree = totalCapacity - totalOccupied;

  const stats = [
    { title: 'Total Occupied',   value: String(totalOccupied),   total: `/ ${totalCapacity}`,  color: 'blue',   icon: Car,           progress: occupancyPct, subtitle: `${totalFree} spaces available` },
    { title: 'Active Bookings',  value: String(activeBookings),  total: 'active',              color: 'teal',   icon: CalendarCheck, subtitle: 'Vehicles currently parked'   },
    { title: 'Parking Lots',     value: String(lots.length),     total: 'lots',                color: 'purple', icon: ParkingSquare, subtitle: `${lots.filter(l => l.is_active).length} active lots` },
    { title: 'Occupancy Rate',   value: `${occupancyPct}%`,      color: occupancyPct >= 90 ? 'red' : 'amber', icon: Activity, subtitle: occupancyPct >= 90 ? 'Critical — nearly full' : 'Within normal range' },
  ];

  const handleBookingCreated = (booking, memberName) => {
    setSensorEvent({
      text: `Entry: ${memberName} assigned to ${booking.parking_lot_name}. Exit token emailed.`,
      time: formatTimeDhaka(new Date()),
    });
    fetchData();
  };

  const handleVehicleExited = (booking) => {
    setSensorEvent({
      text: `Exit: Booking #${booking.id} in ${booking.parking_lot_name} marked complete. Space freed.`,
      time: formatTimeDhaka(new Date()),
    });
    fetchData();
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={s.title} style={{ animationDelay: `${i * 60}ms` }}>
            <StatCard {...s} />
          </div>
        ))}
      </div>

      {/* Map + Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ParkingMapPanel lots={lots} bookings={bookings} sensorEvent={sensorEvent} />
        <EntryLogPanel
          bookings={bookings}
          lots={lots}
          onBookingCreated={handleBookingCreated}
          onVehicleExited={handleVehicleExited}
        />
      </div>
    </div>
  );
}
