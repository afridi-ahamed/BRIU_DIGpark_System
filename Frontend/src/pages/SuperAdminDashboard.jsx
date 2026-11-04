import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Plus, Users, UserPlus, Server, Activity, ArrowRight,
  LayoutDashboard, KeyRound, Trash2, Edit2, Check, X, Loader2, AlertCircle, CheckCircle, LogOut, ParkingSquare,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import {
  getAllStaff, createStaff, updateStaff, deleteStaff,
  getAllParkingLots, createParkingLot, deleteParkingLot,
  getAllBookings, getUniversityMembers, createMemberAccount,
} from '../services/api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/ui/Modal';
import RolePicker from '../components/ui/RolePicker';

/* ── Feedback banner ───────────────────────────────────────── */
const FeedbackBanner = ({ type, message }) => {
  if (!message) return null;
  const isErr = type === 'error';
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '12px 14px', borderRadius: 12, marginBottom: 20,
        background: isErr ? 'rgba(248,113,113,0.07)' : 'rgba(52,211,153,0.07)',
        border: `1px solid ${isErr ? 'rgba(248,113,113,0.22)' : 'rgba(52,211,153,0.22)'}`,
      }}>
      {isErr
        ? <AlertCircle style={{ width: 15, height: 15, color: '#F87171', flexShrink: 0, marginTop: 1 }} />
        : <CheckCircle style={{ width: 15, height: 15, color: '#34D399', flexShrink: 0, marginTop: 1 }} />
      }
      <p style={{ fontSize: 13, color: isErr ? '#fca5a5' : '#6ee7b7', lineHeight: 1.45 }}>{message}</p>
    </motion.div>
  );
};

/* ── Shared form field ─────────────────────────────────────── */
const Field = ({ label, optional, children }) => (
  <div className="field">
    <label className="label">
      {label}
      {optional && <span style={{ textTransform: 'none', letterSpacing: 'normal', fontWeight: 400, color: 'var(--text-dim)', fontSize: 10 }}> (optional)</span>}
    </label>
    {children}
  </div>
);

/* ── Card panel ────────────────────────────────────────────── */
const Panel = ({ children, style }) => (
  <div style={{
    background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 16, padding: 24, ...style,
  }}>
    {children}
  </div>
);

const PanelTitle = ({ children, color = '#A78BFA' }) => (
  <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color, marginBottom: 20 }}>
    {children}
  </p>
);

/* ── Main component ────────────────────────────────────────── */
const SuperAdminDashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('staff');
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [staffList, setStaffList] = useState([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffFeedback, setStaffFeedback] = useState({ type: '', message: '' });
  const [staffSubmitting, setStaffSubmitting] = useState(false);
  const [staffForm, setStaffForm] = useState({ username: '', password: '', full_name: '', email: '', phone: '', role: 'staff' });
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [editStaffModalOpen, setEditStaffModalOpen] = useState(false);
  const [editStaffForm, setEditStaffForm] = useState({ username: '', password: '', full_name: '', email: '', phone: '', role: 'staff' });

  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [memberFeedback, setMemberFeedback] = useState({ type: '', message: '' });
  const [memberSubmitting, setMemberSubmitting] = useState(false);
  const [memberForm, setMemberForm] = useState({ university_id: '', password: '' });

  const [lots, setLots] = useState([]);
  const [lotsLoading, setLotsLoading] = useState(true);
  const [lotsFeedback, setLotsFeedback] = useState({ type: '', message: '' });
  const [lotsSubmitting, setLotsSubmitting] = useState(false);
  const [lotForm, setLotForm] = useState({ name: '', lot_type: 'general', location: '', description: '', total_capacity: 10 });

  const [overviewData, setOverviewData] = useState(null);

  useEffect(() => {
    if (activeTab === 'staff')    fetchStaff();
    if (activeTab === 'members')  fetchMembers();
    if (activeTab === 'slots')    fetchLots();
    if (activeTab === 'overview') fetchOverview();
  }, [activeTab]);

  const fetchStaff = async () => {
    setStaffLoading(true);
    try { const res = await getAllStaff(); setStaffList(res.staff || []); }
    catch { setStaffFeedback({ type: 'error', message: 'Failed to load staff list.' }); }
    finally { setStaffLoading(false); }
  };

  const fetchMembers = async () => {
    setMembersLoading(true);
    try { setMembers(await getUniversityMembers()); }
    catch { setMemberFeedback({ type: 'error', message: 'Failed to load university members.' }); }
    finally { setMembersLoading(false); }
  };

  const handleCreateMemberAccount = async (e) => {
    e.preventDefault();
    setMemberSubmitting(true);
    setMemberFeedback({ type: '', message: '' });
    try {
      const result = await createMemberAccount(memberForm);
      const message = `Login created for ${result.member_name}. Username: ${result.username}.`;
      setMemberFeedback({ type: 'success', message });
      toast.success(message);
      setMemberForm({ university_id: '', password: '' });
      fetchMembers();
    } catch (err) {
      const message = err?.data ? Object.values(err.data).flat().join(' ') : 'Failed to create member login.';
      setMemberFeedback({ type: 'error', message });
      toast.error(message);
    } finally { setMemberSubmitting(false); }
  };

  const fetchLots = async () => {
    setLotsLoading(true);
    try { const res = await getAllParkingLots(); setLots(res); }
    catch { setLotsFeedback({ type: 'error', message: 'Failed to load parking lots.' }); }
    finally { setLotsLoading(false); }
  };

  const fetchOverview = async () => {
    try {
      const [staffRes, lotsRes, bookingsRes] = await Promise.all([getAllStaff(), getAllParkingLots(), getAllBookings()]);
      setOverviewData({
        staffCount: (staffRes.staff || []).length,
        lotCount: lotsRes.length,
        totalCapacity: lotsRes.reduce((s, l) => s + l.total_capacity, 0),
        totalOccupied: lotsRes.reduce((s, l) => s + l.current_occupied, 0),
        activeBookings: (bookingsRes || []).filter(b => b.status === 'active').length,
        totalBookings: (bookingsRes || []).length,
      });
    } catch { /* silent */ }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setStaffSubmitting(true);
    setStaffFeedback({ type: '', message: '' });
    try {
      await createStaff(staffForm);
      const msg = `Staff "${staffForm.username}" created successfully.`;
      setStaffFeedback({ type: 'success', message: msg });
      toast.success(msg);
      setStaffForm({ username: '', password: '', full_name: '', email: '', phone: '', role: 'staff' });
      fetchStaff();
    } catch (err) {
      const errMsg = err?.data ? Object.values(err.data).flat().join(' ') : 'Failed to create staff.';
      setStaffFeedback({ type: 'error', message: errMsg });
      toast.error(errMsg);
    } finally { setStaffSubmitting(false); }
  };

  const handleDeleteStaff = async (pk, username) => {
    if (!window.confirm(`Delete staff "${username}"? This cannot be undone.`)) return;
    try {
      await deleteStaff(pk);
      const msg = `Staff "${username}" deleted.`;
      setStaffFeedback({ type: 'success', message: msg });
      toast.success(msg);
      fetchStaff();
    } catch (err) {
      const msg = err?.data ? Object.values(err.data).flat().join(' ') : (err?.status ? `HTTP ${err.status}` : 'Failed to delete staff.');
      setStaffFeedback({ type: 'error', message: msg });
      toast.error(msg);
      console.error("Delete Error:", err);
    }
  };

  const handleOpenEditStaff = (s) => {
    setEditingStaffId(s.id);
    setEditStaffForm({
      username: s.username || '',
      password: '',
      full_name: s.full_name || '',
      email: s.email || '',
      phone: s.phone || '',
      role: s.role || 'staff'
    });
    setEditStaffModalOpen(true);
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    setStaffSubmitting(true);
    setStaffFeedback({ type: '', message: '' });
    try {
      const payload = {
        username: editStaffForm.username,
        full_name: editStaffForm.full_name,
        email: editStaffForm.email,
        phone: editStaffForm.phone,
        role: editStaffForm.role,
      };
      if (editStaffForm.password) payload.password = editStaffForm.password;

      await updateStaff(editingStaffId, payload);
      const msg = `Staff details updated successfully.`;
      setStaffFeedback({ type: 'success', message: msg });
      toast.success(msg);
      setEditStaffModalOpen(false);
      fetchStaff();
    } catch (err) {
      const errMsg = err?.data ? Object.values(err.data).flat().join(' ') : 'Failed to update staff.';
      setStaffFeedback({ type: 'error', message: errMsg });
      toast.error(errMsg);
    } finally { setStaffSubmitting(false); }
  };

  const handleCreateLot = async (e) => {
    e.preventDefault();
    setLotsSubmitting(true);
    setLotsFeedback({ type: '', message: '' });
    try {
      await createParkingLot({ ...lotForm, total_capacity: parseInt(lotForm.total_capacity) });
      const msg = `Lot "${lotForm.name}" created successfully.`;
      setLotsFeedback({ type: 'success', message: msg });
      toast.success(msg);
      setLotForm({ name: '', lot_type: 'general', location: '', description: '', total_capacity: 10 });
      fetchLots();
    } catch (err) {
      const errMsg = err?.data ? Object.values(err.data).flat().join(' ') : 'Failed to create parking lot.';
      setLotsFeedback({ type: 'error', message: errMsg });
      toast.error(errMsg);
    } finally { setLotsSubmitting(false); }
  };

  const handleDeleteLot = async (pk, name) => {
    if (!window.confirm(`Delete lot "${name}"? This will fail if it has active bookings.`)) return;
    try {
      await deleteParkingLot(pk);
      const msg = `Lot "${name}" deleted.`;
      setLotsFeedback({ type: 'success', message: msg });
      toast.success(msg);
      fetchLots();
    } catch (err) {
      const msg = err?.data?.error || 'Failed to delete lot.';
      setLotsFeedback({ type: 'error', message: msg });
      toast.error(msg);
    }
  };

  const sidebarItems = [
    { key: 'overview', icon: <LayoutDashboard className="w-4 h-4" />, label: 'System Overview' },
    { key: 'staff',    icon: <Users className="w-4 h-4" />,           label: 'Staff Provisioning' },
    { key: 'members',  icon: <KeyRound className="w-4 h-4" />,        label: 'Member Access' },
    { key: 'slots',    icon: <Server className="w-4 h-4" />,           label: 'Parking Grid' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="grid grid-cols-1 md:grid-cols-4 gap-5"
    >
      {/* ── Sidebar ── */}
      <div className="col-span-1 space-y-4">
        <div className="glass-panel rounded-[20px] p-5">
          <div className="flex items-center gap-2 mb-5">
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield style={{ width: 15, height: 15, color: '#A78BFA' }} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>Admin Hub</p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Control panel</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {sidebarItems.map(({ key, icon, label }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 12, width: '100%', textAlign: 'left',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none',
                  transition: 'all 0.15s',
                  background: activeTab === key ? 'rgba(167,139,250,0.12)' : 'transparent',
                  color: activeTab === key ? '#C4B5FD' : 'var(--text-secondary)',
                  outline: activeTab === key ? '1px solid rgba(167,139,250,0.25)' : '1px solid transparent',
                }}>
                <span style={{ color: activeTab === key ? '#A78BFA' : 'var(--text-muted)' }}>{icon}</span>
                {label}
                {activeTab === key && <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#A78BFA', flexShrink: 0 }} />}
              </button>
            ))}
          </div>
        </div>

        {/* Quick link */}
        <div className="glass-panel rounded-[20px] p-5">
          <p className="section-label" style={{ marginBottom: 12 }}>Quick Links</p>
          <NavLink to="/terminal"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 12, background: 'rgba(45,212,191,0.07)', border: '1px solid rgba(45,212,191,0.18)', color: 'var(--teal)', fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'all 0.15s' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8,  }}>
              <Activity style={{ width: 14, height: 14 }} /> Live Terminal
            </span>
            <ArrowRight style={{ width: 13, height: 13 }} />
          </NavLink>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-3 mt-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 hover:bg-rose-500/15 hover:border-rose-500/35 transition-all font-semibold text-sm"
          >
            <span className="flex items-center gap-2"><LogOut className="w-4 h-4" /> Sign Out</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* ── Main panel ── */}
      <div className="col-span-3 glass-panel rounded-[20px] p-7" style={{ minHeight: 600 }}>
        <AnimatePresence mode="wait">

          {/* ── STAFF PROVISIONING ── */}
          {activeTab === 'staff' && (
            <motion.div key="staff" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserPlus style={{ width: 15, height: 15, color: '#A78BFA' }} />
                  </div>
                  <h1 style={{ fontSize: 18, fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>Staff Provisioning</h1>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginLeft: 42 }}>Create login credentials for gate guards or administrative staff.</p>
              </div>

              <AnimatePresence>{staffFeedback.message && <FeedbackBanner {...staffFeedback} />}</AnimatePresence>

              <div className="grid grid-cols-2 gap-6">
                {/* Form */}
                <Panel>
                  <PanelTitle>New Credentials</PanelTitle>
                  <form onSubmit={handleCreateStaff} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <Field label="Username">
                      <input type="text" value={staffForm.username} required
                        onChange={e => setStaffForm({ ...staffForm, username: e.target.value })}
                        placeholder="e.g. guard_01" className="input" />
                    </Field>
                    <Field label="Password">
                      <input type="password" value={staffForm.password} required
                        onChange={e => setStaffForm({ ...staffForm, password: e.target.value })}
                        placeholder="Min 6 characters" className="input" />
                    </Field>
                    <Field label="Full Name">
                      <input type="text" value={staffForm.full_name} required
                        onChange={e => setStaffForm({ ...staffForm, full_name: e.target.value })}
                        placeholder="e.g. John Smith" className="input" />
                    </Field>
                    <Field label="Email">
                      <input type="email" value={staffForm.email} required
                        onChange={e => setStaffForm({ ...staffForm, email: e.target.value })}
                        placeholder="guard@university.edu" className="input" />
                    </Field>
                    <Field label="Phone" optional>
                      <input type="text" value={staffForm.phone}
                        onChange={e => setStaffForm({ ...staffForm, phone: e.target.value })}
                        placeholder="+8801700000000" className="input" />
                    </Field>
                    <Field label="Role">
                      <RolePicker value={staffForm.role} onChange={val => setStaffForm({ ...staffForm, role: val })} />
                    </Field>
                    <button type="submit" disabled={staffSubmitting} className="btn btn-wide"
                      style={{ background: 'linear-gradient(135deg, #5B21B6, #7C3AED)', color: 'white', border: '1px solid rgba(167,139,250,0.3)', fontWeight: 700, marginTop: 4, boxShadow: '0 0 20px rgba(124,58,237,0.2)' }}>
                      {staffSubmitting
                        ? <><span className="loader-ring" style={{ width: 16, height: 16 }} />Creating…</>
                        : <><KeyRound style={{ width: 15, height: 15 }} />Provision Account</>
                      }
                    </button>
                  </form>
                </Panel>

                {/* Staff roster */}
                <Panel>
                  <PanelTitle color="var(--text-muted)">Active Roster ({staffList.length})</PanelTitle>
                  {staffLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}><span className="loader-ring" /></div>
                  ) : staffList.length === 0 ? (
                    <div style={{ textAlign: 'center', paddingTop: 40 }}>
                      <Users style={{ width: 28, height: 28, color: 'var(--text-dim)', margin: '0 auto 8px' }} />
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No staff accounts yet.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 380, overflowY: 'auto' }} className="custom-scrollbar">
                      {staffList.map(s => (
                        <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(167,139,250,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#C4B5FD', flexShrink: 0 }}>
                              {(s.full_name || s.username).substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 600, color: 'white', lineHeight: 1.2 }}>{s.full_name || s.username}</p>
                              <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.3 }}>{s.email}</p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className={s.is_active ? 'badge badge-active' : 'badge badge-inactive'}>
                              {s.is_active ? 'Active' : 'Inactive'}
                            </span>
                            <button onClick={() => handleOpenEditStaff(s)}
                              style={{ padding: 6, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.color = '#A78BFA'; e.currentTarget.style.background = 'rgba(167,139,250,0.08)'; }}
                              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}>
                              <Edit2 style={{ width: 14, height: 14 }} />
                            </button>
                            <button onClick={() => handleDeleteStaff(s.id, s.username)}
                              style={{ padding: 6, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.color = '#F87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; }}
                              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}>
                              <Trash2 style={{ width: 14, height: 14 }} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Panel>
              </div>
            </motion.div>
          )}

          {/* ── MEMBER ACCESS ── */}
          {activeTab === 'members' && (
            <motion.div key="members" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <KeyRound style={{ width: 15, height: 15, color: '#2DD4BF' }} />
                  </div>
                  <h1 style={{ fontSize: 18, fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>Member Access</h1>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginLeft: 42 }}>Create portal logins for registered students, faculty, and staff.</p>
              </div>

              <AnimatePresence>{memberFeedback.message && <FeedbackBanner {...memberFeedback} />}</AnimatePresence>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Panel>
                  <PanelTitle>Provision a Member Login</PanelTitle>
                  <form onSubmit={handleCreateMemberAccount} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <Field label="University Member">
                      <select className="input" value={memberForm.university_id} required
                        onChange={e => setMemberForm({ ...memberForm, university_id: e.target.value })}>
                        <option value="" disabled>Select a member without an account</option>
                        {members.filter(member => !member.has_account).map(member => (
                          <option key={member.id} value={member.university_id}>
                            {member.full_name} · {member.university_id} · {member.category}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Temporary Password">
                      <input type="password" className="input" minLength={8} required
                        autoComplete="new-password" value={memberForm.password}
                        onChange={e => setMemberForm({ ...memberForm, password: e.target.value })}
                        placeholder="At least 8 characters" />
                    </Field>
                    <p style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--text-muted)' }}>
                      The member signs in with their university ID and this password. Give the password to them privately.
                    </p>
                    <button type="submit" disabled={memberSubmitting || membersLoading || members.every(member => member.has_account)}
                      className="btn btn-primary btn-wide">
                      {memberSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating login…</> : 'Create Member Login'}
                    </button>
                  </form>
                </Panel>

                <Panel>
                  <PanelTitle>University Members ({members.length})</PanelTitle>
                  {membersLoading ? (
                    <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-teal-400" /></div>
                  ) : members.length === 0 ? (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No university member records found yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 420, overflowY: 'auto' }}>
                      {members.map(member => (
                        <div key={member.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div className="min-w-0">
                            <p style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{member.full_name}</p>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{member.university_id} · {member.category}</p>
                          </div>
                          <span className={member.has_account ? 'badge badge-active' : 'badge badge-inactive'}>
                            {member.has_account ? 'Portal ready' : 'No login'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Panel>
              </div>
            </motion.div>
          )}

          {/* ── PARKING GRID ── */}
          {activeTab === 'slots' && (
            <motion.div key="slots" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus style={{ width: 15, height: 15, color: '#2DD4BF' }} />
                  </div>
                  <h1 style={{ fontSize: 18, fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>Parking Grid</h1>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginLeft: 42 }}>Configure and deploy parking lots into the live monitoring system.</p>
              </div>

              <AnimatePresence>{lotsFeedback.message && <FeedbackBanner {...lotsFeedback} />}</AnimatePresence>

              <div className="grid grid-cols-2 gap-6">
                {/* Lot form */}
                <Panel>
                  <PanelTitle color="var(--teal)">New Lot Parameters</PanelTitle>
                  <form onSubmit={handleCreateLot} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <Field label="Lot Name">
                      <input type="text" value={lotForm.name} required
                        onChange={e => setLotForm({ ...lotForm, name: e.target.value })}
                        placeholder="e.g. North Block A" className="input" />
                    </Field>
                    <Field label="Lot Type">
                      <select value={lotForm.lot_type} onChange={e => setLotForm({ ...lotForm, lot_type: e.target.value })} className="input">
                        <option value="general">General</option>
                        <option value="faculty">Faculty Only</option>
                        <option value="vip">VIP</option>
                        <option value="disabled">Disabled</option>
                        <option value="ev">EV Charging</option>
                      </select>
                    </Field>
                    <Field label="Location">
                      <input type="text" value={lotForm.location} required
                        onChange={e => setLotForm({ ...lotForm, location: e.target.value })}
                        placeholder="e.g. Behind Academic Building" className="input" />
                    </Field>
                    <Field label="Total Capacity">
                      <input type="number" min="1" value={lotForm.total_capacity} required
                        onChange={e => setLotForm({ ...lotForm, total_capacity: e.target.value })}
                        className="input" />
                    </Field>
                    <Field label="Description" optional>
                      <input type="text" value={lotForm.description}
                        onChange={e => setLotForm({ ...lotForm, description: e.target.value })}
                        placeholder="Any additional notes…" className="input" />
                    </Field>
                    <button type="submit" disabled={lotsSubmitting} className="btn btn-primary btn-wide" style={{ marginTop: 4 }}>
                      {lotsSubmitting
                        ? <><span className="loader-ring" style={{ width: 16, height: 16 }} />Creating…</>
                        : <><ParkingSquare style={{ width: 15, height: 15 }} />Deploy to Live Map</>
                      }
                    </button>
                  </form>
                </Panel>

                {/* Lot list */}
                <Panel>
                  <PanelTitle color="var(--text-muted)">Initialized Lots ({lots.length})</PanelTitle>
                  {lotsLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}><span className="loader-ring" /></div>
                  ) : lots.length === 0 ? (
                    <div style={{ textAlign: 'center', paddingTop: 40 }}>
                      <ParkingSquare style={{ width: 28, height: 28, color: 'var(--text-dim)', margin: '0 auto 8px' }} />
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No parking lots configured yet.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 380, overflowY: 'auto' }} className="custom-scrollbar">
                      {lots.map(lot => (
                        <div key={lot.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 12, background: 'rgba(45,212,191,0.04)', border: '1px solid rgba(45,212,191,0.12)' }}>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: 'white', lineHeight: 1.2 }}>{lot.name}</p>
                            <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'capitalize', lineHeight: 1.4 }}>{lot.lot_type} · {lot.location}</p>
                            <p style={{ fontSize: 11, color: 'var(--teal)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                              {lot.current_occupied}/{lot.total_capacity} occupied
                            </p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className={lot.is_active ? 'badge badge-active' : 'badge badge-inactive'}>
                              {lot.is_active ? 'Active' : 'Inactive'}
                            </span>
                            <button onClick={() => handleDeleteLot(lot.id, lot.name)}
                              style={{ padding: 6, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.color = '#F87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; }}
                              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}>
                              <Trash2 style={{ width: 14, height: 14 }} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Panel>
              </div>
            </motion.div>
          )}

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LayoutDashboard style={{ width: 15, height: 15, color: '#60A5FA' }} />
                  </div>
                  <h1 style={{ fontSize: 18, fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>System Overview</h1>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginLeft: 42 }}>Live stats pulled directly from the database.</p>
              </div>
              {!overviewData ? (
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 64 }}><span className="loader-ring" /></div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 8 }}>
                  {[
                    { label: 'Total Staff',         value: overviewData.staffCount,    color: '#A78BFA' },
                    { label: 'Parking Lots',         value: overviewData.lotCount,      color: '#60A5FA' },
                    { label: 'Total Capacity',       value: overviewData.totalCapacity, color: '#2DD4BF' },
                    { label: 'Currently Occupied',   value: overviewData.totalOccupied, color: '#F87171' },
                    { label: 'Active Bookings',      value: overviewData.activeBookings,color: '#34D399' },
                    { label: 'All-Time Bookings',    value: overviewData.totalBookings, color: '#FBBF24' },
                  ].map(({ label, value, color }) => (
                    <motion.div key={label}
                      whileHover={{ y: -3, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px 20px 18px', textAlign: 'center', cursor: 'default' }}>
                      <p className="section-label" style={{ marginBottom: 10 }}>{label}</p>
                      <p style={{ fontSize: 32, fontWeight: 800, color, letterSpacing: '-0.04em', lineHeight: 1 }}>{value}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <Modal isOpen={editStaffModalOpen} onClose={() => setEditStaffModalOpen(false)} title="Update Staff Credentials">
        <form onSubmit={handleUpdateStaff} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Username">
            <input type="text" value={editStaffForm.username} required
              onChange={e => setEditStaffForm({ ...editStaffForm, username: e.target.value })}
              className="input" />
          </Field>
          <Field label="Password" optional>
            <input type="password" value={editStaffForm.password}
              onChange={e => setEditStaffForm({ ...editStaffForm, password: e.target.value })}
              placeholder="Leave blank to keep current password" className="input" />
          </Field>
          <Field label="Full Name">
            <input type="text" value={editStaffForm.full_name} required
              onChange={e => setEditStaffForm({ ...editStaffForm, full_name: e.target.value })}
              className="input" />
          </Field>
          <Field label="Email">
            <input type="email" value={editStaffForm.email} required
              onChange={e => setEditStaffForm({ ...editStaffForm, email: e.target.value })}
              className="input" />
          </Field>
          <Field label="Phone" optional>
            <input type="text" value={editStaffForm.phone}
              onChange={e => setEditStaffForm({ ...editStaffForm, phone: e.target.value })}
              className="input" />
          </Field>
          <Field label="Role">
            <RolePicker value={editStaffForm.role} onChange={val => setEditStaffForm({ ...editStaffForm, role: val })} />
          </Field>
          <button type="submit" disabled={staffSubmitting} className="btn btn-wide"
            style={{ background: 'linear-gradient(135deg, #5B21B6, #7C3AED)', color: 'white', border: '1px solid rgba(167,139,250,0.3)', fontWeight: 700, marginTop: 14, boxShadow: '0 0 20px rgba(124,58,237,0.2)' }}>
            {staffSubmitting ? <><span className="loader-ring" style={{ width: 16, height: 16 }} />Updating…</> : 'Save Changes'}
          </button>
        </form>
      </Modal>

    </motion.div>
  );
};

export default SuperAdminDashboard;
