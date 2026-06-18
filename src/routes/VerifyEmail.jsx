import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

// Shown after sign-up ("check your inbox") AND as the email-link landing page.
// When Supabase confirms the email it creates a session; we then route the
// user onward to onboarding (if profile incomplete) or the dashboard.
export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, profile, loading } = useAuth();
  const [resent, setResent] = useState(false);
  const email = location.state?.email || session?.user?.email || 'your email';

  useEffect(() => {
    if (loading) return;
    if (session) {
      // Email confirmed → continue
      const t = setTimeout(() => {
        navigate(profile && !profile.display_name ? '/onboarding' : '/dashboard', { replace: true });
      }, 600);
      return () => clearTimeout(t);
    }
  }, [session, profile, loading, navigate]);

  async function resend() {
    if (!session && email !== 'your email') {
      await supabase.auth.resend({ type: 'signup', email });
      setResent(true);
    }
  }

  return (
    <div className="wrap-narrow" style={{ maxWidth: 560, textAlign: 'center', paddingTop: 70 }}>
      <div className="eyebrow" style={{ marginBottom: 20 }}>Step 3 of 3 · Verify</div>
      <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', fontSize: 38 }}>✉️</div>
      <h1 className="serif" style={{ fontSize: 40, lineHeight: 1.1, margin: '0 0 16px' }}>
        {session ? 'Email confirmed!' : 'Check your inbox'}
      </h1>
      {session ? (
        <p style={{ fontSize: 17, color: 'var(--ink-2)' }}>Taking you to your studio…</p>
      ) : (
        <>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--ink-2)', margin: '0 0 8px' }}>We've sent a verification link to</p>
          <p style={{ fontSize: 17, fontWeight: 600, margin: '0 0 32px' }}>{email}</p>
          <div className="card" style={{ padding: '22px 26px', textAlign: 'left', fontSize: 14.5, color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: 30 }}>
            Click the link in the email to confirm your address. The link expires in 24 hours.
            Didn't get it? Check spam, or{' '}
            <span style={{ color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }} onClick={resend}>
              {resent ? 'sent! ✓' : 'resend the email'}
            </span>.
          </div>
          <button className="btn btn-link" onClick={() => navigate('/artists')}>Use a different email</button>
        </>
      )}
    </div>
  );
}
