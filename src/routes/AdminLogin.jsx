import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import BrushMark from '../components/BrushMark';

// Dedicated admin sign-in (dark). Only users with profile.role = 'admin'
// can reach /admin; everyone else is bounced by <AdminRoute>.
export default function AdminLogin() {
  const navigate = useNavigate();
  const { session, profile, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (session && profile?.role === 'admin') navigate('/admin', { replace: true });
  }, [session, profile, loading, navigate]);

  async function submit(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setBusy(false); return; }
    // confirm role
    const { data: prof } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle();
    setBusy(false);
    if (prof?.role !== 'admin') {
      setError('This account is not an administrator.');
      await supabase.auth.signOut();
      return;
    }
    navigate('/admin');
  }

  return (
    <div className="admin-login-bg">
      <form className="admin-login" onSubmit={submit}>
        <div className="nav__brand" style={{ marginBottom: 28 }}>
          <BrushMark />
          <span className="serif" style={{ fontSize: 22 }}>5 Brushes</span>
        </div>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Admin console</div>
        <h1 className="serif" style={{ fontSize: 30, margin: '0 0 24px' }}>Sign in to moderate</h1>
        <div className="field"><label>Admin email</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@5brushes.in" /></div>
        <div className="field"><label>Password</label><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></div>
        {error && <p className="form-error" style={{ marginBottom: 12 }}>{error}</p>}
        <button className="btn btn-dark btn-block btn-lg" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <p className="form-hint" style={{ textAlign: 'center', marginTop: 16 }}>Restricted · role = admin (Supabase)</p>
      </form>
    </div>
  );
}
