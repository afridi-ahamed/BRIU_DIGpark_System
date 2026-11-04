import { useContext, useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Navigation2, Shield, User, ChevronDown, UserCircle, LogOut, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoleContext } from '../../context/RoleContext';
import { useAuth } from '../../context/auth';
import Modal from '../ui/Modal';

const NavItem = ({ to, label }) => (
  <NavLink to={to} className={({ isActive }) =>
    `relative text-[13px] font-[500] px-1 pb-2 transition-colors duration-150 ${isActive ? 'text-white' : 'text-[var(--text-secondary)] hover:text-white'}`
  }>
    {({ isActive }) => (
      <>
        {label}
        {isActive && (
          <motion.div
            layoutId="nav-pill"
            className="absolute -bottom-px left-0 right-0 h-[2px] rounded-full bg-[var(--teal)] shadow-[0_0_8px_rgba(45,212,191,0.8)]"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
      </>
    )}
  </NavLink>
);

export default function DashboardHeader() {
  const { role } = useContext(RoleContext);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isSuperAdmin = role === 'superadmin';
  const roleLabel = isSuperAdmin
    ? 'Super Admin'
    : role === 'member'
      ? `${user?.category ? `${user.category[0].toUpperCase()}${user.category.slice(1)}` : 'University'} Member`
      : 'Gate Staff';

  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const initials = (user?.name || user?.username || 'U')
    .split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  return (
    <div className="relative z-50 mb-6">
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-[1600px] mx-auto glass rounded-[18px] px-6 py-3.5 flex items-center justify-between"
      >
        {/* ── LEFT: Wordmark ── */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500/25 to-teal-400/10 rounded-[10px] border border-teal-500/20 flex items-center justify-center">
              <Navigation2 className="h-4 w-4 text-teal-400" />
            </div>
            <span className="text-[15px] font-[800] text-white tracking-[-0.03em]">UniPark</span>
          </div>

          {/* Nav links (superadmin only) */}
          {isSuperAdmin && (
            <nav className="flex items-center gap-7 pt-2">
              <NavItem to="/admin" label="Admin Hub" />
              <NavItem to="/terminal" label="Live Terminal" />
              <NavItem to="/analytics" label="Analytics" />
            </nav>
          )}
        </div>

        {/* ── RIGHT: Live badge + User ── */}
        <div className="flex items-center gap-4">
          {/* Live indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/8 border border-teal-500/15">
            <span className="live-dot flex-shrink-0" />
            <span className="text-[11px] font-[600] text-teal-400 tracking-wide">Live</span>
          </div>

          {/* User menu */}
          <div className="relative" ref={ref}>
            <button
              onClick={() => setOpen(v => !v)}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-[12px] border border-transparent hover:border-[var(--border-base)] hover:bg-white/[0.04] transition-all duration-150"
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center text-[12px] font-[800] tracking-wide flex-shrink-0
                ${isSuperAdmin
                  ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
                  : 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white'
                }`}>
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[13px] font-[600] text-white leading-tight">{user?.name || user?.username}</p>
                <p className={`text-[10px] font-[700] tracking-wide uppercase leading-tight ${isSuperAdmin ? 'text-purple-400' : 'text-teal-400'}`}>
                  {roleLabel}
                </p>
              </div>
              <ChevronDown className={`h-3.5 w-3.5 text-[var(--text-muted)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute right-0 top-full mt-2 w-56 z-[9999] glass rounded-[16px] overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.6)]"
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {/* User info */}
                  <div className="px-4 py-3.5 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center text-[12px] font-[800] flex-shrink-0
                        ${isSuperAdmin ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-teal-500 to-cyan-600'} text-white`}>
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-[600] text-white truncate">{user?.name || user?.username}</p>
                        <p className="text-[11px] text-[var(--text-muted)] truncate">{isSuperAdmin ? 'Super Administrator' : roleLabel}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-1.5">
                    <button onClick={() => { setOpen(false); setProfileOpen(true); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13px] text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.05] transition-colors">
                      <UserCircle className="h-4 w-4 flex-shrink-0" />
                      View Profile
                    </button>
                    <button onClick={() => { setOpen(false); setSettingsOpen(true); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13px] text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.05] transition-colors">
                      <Settings className="h-4 w-4 flex-shrink-0" />
                      Settings
                    </button>
                  </div>

                  <div className="p-1.5 border-t border-white/[0.06]">
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13px] text-red-400 hover:text-red-300 hover:bg-red-500/[0.08] transition-colors">
                      <LogOut className="h-4 w-4 flex-shrink-0" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.header>

      {/* --- Modals --- */}
      <Modal isOpen={profileOpen} onClose={() => setProfileOpen(false)} title="My Profile">
        <div className="space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-white/[0.06]">
            <div className={`w-14 h-14 rounded-[14px] flex items-center justify-center text-[18px] font-[800] 
                ${isSuperAdmin ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-teal-500 to-cyan-600'} text-white shadow-lg`}>
              {initials}
            </div>
            <div>
              <p className="text-[16px] font-[700] text-white tracking-tight leading-tight">{user?.full_name || user?.username || 'User'}</p>
              <span className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-[6px] text-[10px] font-[700] uppercase tracking-wider
                  ${isSuperAdmin ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'}`}>
                {isSuperAdmin ? 'Super Admin' : 'Gate Staff'}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-[11px] text-[var(--text-muted)] font-[500] uppercase tracking-wide mb-1">Username</p>
              <p className="text-[14px] text-white font-mono bg-white/[0.03] border border-white/[0.05] px-3 py-2 rounded-[8px]">{user?.username || 'N/A'}</p>
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} title="System Settings">
        <div className="py-10 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-white/[0.03] flex items-center justify-center border border-white/[0.08] mb-4">
            <Settings className="w-5 h-5 text-[var(--text-muted)]" />
          </div>
          <p className="text-[14px] font-[500] text-white">This feature will update later.</p>
          <p className="text-[12px] text-[var(--text-muted)] mt-1 max-w-[200px]">Advanced settings are currently under development.</p>
        </div>
      </Modal>

    </div>
  );
}
