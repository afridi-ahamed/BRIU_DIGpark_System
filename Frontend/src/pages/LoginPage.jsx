import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, Navigation2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/auth';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setError(''); setLoading(true);
    const result = await login(username.trim(), password.trim());
    if (result.success) {
      navigate(result.role === 'superadmin' ? '/admin' : result.role === 'member' ? '/member' : '/');
    } else {
      setError(result.error || 'Invalid credentials. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div style={{ position:'absolute', top:'-10%', left:'20%', width:560, height:560, background:'rgba(99, 202, 188, 0.2)', borderRadius:'50%', filter:'blur(120px)' }} />
        <div style={{ position:'absolute', bottom:'-10%', right:'15%', width:480, height:480, background:'rgba(96,130,246,0.045)', borderRadius:'50%', filter:'blur(100px)' }} />
        {/* Subtle grid */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)', backgroundSize:'60px 60px' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full relative z-10"
        style={{ maxWidth: 400 }}
      >
        <div className="glass-panel rounded-[24px] p-8"
          style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.65), 0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)' }}>

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 240, damping: 18 }}
              className="mb-5 relative"
            >
              <div style={{ position:'absolute', inset:0, background:'rgba(45,212,191,0.18)', borderRadius:18, filter:'blur(18px)', transform:'scale(1.4)' }} />
              <div className="relative flex items-center justify-center"
                style={{ width:56, height:56, background:'linear-gradient(145deg, rgba(45,212,191,0.2), rgba(45,212,191,0.06))', borderRadius:18, border:'1px solid rgba(45,212,191,0.28)', boxShadow:'0 0 32px rgba(45,212,191,0.18)' }}>
                <Navigation2 className="h-7 w-7" style={{ color:'#2DD4BF' }} />
              </div>
            </motion.div>
            <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }} className="text-center">
              <h1 style={{ fontSize:22, fontWeight:800, color:'white', letterSpacing:'-0.03em', marginBottom:4 }}>UniPark</h1>
              <p style={{ fontSize:13, color:'var(--text-secondary)' }}>BRIU Digital Parking Management</p>
            </motion.div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Username */}
            <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}
              className="field" style={{ marginBottom:16 }}>
              <label className="label" htmlFor="login-username">Username or University ID</label>
              <div className="input-wrap">
                <User className="input-icon" />
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setError(''); }}
                  placeholder="Username or university ID"
                  autoComplete="username"
                  required
                  className="input with-icon-l"
                />
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                Member portal accounts are created by the university administrator.
              </p>
            </motion.div>

            {/* Password */}
            <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
              className="field" style={{ marginBottom:16 }}>
              <label className="label" htmlFor="login-password">Password</label>
              <div className="input-wrap">
                <Lock className="input-icon" />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Your password"
                  autoComplete="current-password"
                  required
                  className="input with-icon-l with-icon-r"
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="input-icon-r btn-ghost"
                  style={{ position:'absolute', right:10, background:'none', border:'none', cursor:'pointer', padding:'6px', borderRadius:6, color:'var(--text-muted)', display:'flex', alignItems:'center' }}>
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </motion.div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity:0, height:0, marginBottom:0 }}
                  animate={{ opacity:1, height:'auto', marginBottom:16 }}
                  exit={{ opacity:0, height:0, marginBottom:0 }}
                  style={{ overflow:'hidden' }}
                >
                  <div style={{ display:'flex', alignItems:'flex-start', gap:10, background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.22)', borderRadius:12, padding:'12px 14px' }}>
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color:'#F87171' }} />
                    <p style={{ fontSize:13, color:'#fca5a5', lineHeight:1.45 }}>{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}>
              <button type="submit" disabled={loading || !username || !password}
                className="btn btn-primary btn-wide btn-lg">
                {loading ? (
                  <>
                    <span className="loader-ring" style={{ width:18, height:18 }} />
                    Authenticating…
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </motion.div>
          </form>

          <p style={{ textAlign:'center', fontSize:11, color:'var(--text-dim)', marginTop:24, letterSpacing:'0.03em' }}>
            Member, faculty, staff, and administrator access
          </p>
        </div>

        <p style={{ textAlign:'center', fontSize:10, color:'var(--text-dim)', marginTop:16, letterSpacing:'0.1em', textTransform:'uppercase' }}>
          UniPark v2.0 · 2026
        </p>
      </motion.div>
    </div>
  );
}
