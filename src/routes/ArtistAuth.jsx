import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import BrushMark from '../components/BrushMark';

export default function ArtistAuth() {
  const [tab, setTab] = useState('signin');
  const navigate = useNavigate();
  const { session, profile } = useAuth();

  // Already signed in? Skip ahead.
  useEffect(() => {
    if (session) navigate(profile && !profile.display_name ? '/onboarding' : '/dashboard', { replace: true });
  }, [session, profile, navigate]);

  return (
    <div className="center-screen">
      <div style={{ padding: '20px 40px' }}>
        <span className="back-link" onClick={() => navigate('/')}><span style={{ fontSize: 18 }}>←</span> Back to home</span>
      </div>
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-visual">
            <div className="nav__brand">
              <BrushMark light />
              <span className="serif" style={{ fontSize: 22, color: '#f6f2ec' }}>5 Brushes</span>
            </div>
            <div>
              <h2 className="serif">Your studio, online.</h2>
              <p>Upload paintings, manage your portfolio, and reach collectors across India — all from one place.</p>
            </div>
            <div style={{ display: 'flex', gap: 9 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ width: 54, height: 70, borderRadius: 5, background: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.08) 0 8px, rgba(255,255,255,0.03) 8px 16px)' }} />
              ))}
            </div>
          </div>

          <div className="auth-form">
            <div className="tabs">
              <button className={`tab ${tab === 'signin' ? 'active' : ''}`} onClick={() => setTab('signin')}>Sign in</button>
              <button className={`tab ${tab === 'create' ? 'active' : ''}`} onClick={() => setTab('create')}>Create account</button>
            </div>
            {tab === 'signin' ? <SignInForm /> : <CreateForm />}
          </div>
        </div>
      </div>
    </div>
  );
}

function SignInForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) { setError(error.message); return; }
    navigate('/dashboard');
  }

  return (
    <form onSubmit={submit}>
      <h3 className="serif" style={{ fontSize: 28, margin: '0 0 6px' }}>Welcome back</h3>
      <p style={{ fontSize: 14.5, color: 'var(--muted)', margin: '0 0 26px' }}>Sign in to manage your paintings.</p>
      <div className="field">
        <label>Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
      </div>
      <div className="field" style={{ marginBottom: 10 }}>
        <label>Password</label>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      </div>
      {error && <p className="form-error">{error}</p>}
      <button className="btn btn-primary btn-block btn-lg" disabled={busy} style={{ marginTop: 16 }}>
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}

function CreateForm() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/verify`,
      },
    });
    setBusy(false);
    if (error) { setError(error.message); return; }
    navigate('/verify', { state: { email } });
  }

  return (
    <form onSubmit={submit}>
      <h3 className="serif" style={{ fontSize: 28, margin: '0 0 6px' }}>Join as an artist</h3>
      <p style={{ fontSize: 14.5, color: 'var(--muted)', margin: '0 0 26px' }}>Free to join. Start listing in minutes.</p>
      <div className="field"><label>Full name</label><input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Aarohi Mehta" /></div>
      <div className="field"><label>Email</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" /></div>
      <div className="field"><label>Password</label><input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" /></div>
      {error && <p className="form-error">{error}</p>}
      <button className="btn btn-primary btn-block btn-lg" disabled={busy}>{busy ? 'Creating…' : 'Create account →'}</button>
      <p className="form-hint" style={{ textAlign: 'center', marginTop: 16 }}>By continuing you agree to our Terms &amp; Privacy Policy.</p>
    </form>
  );
}
