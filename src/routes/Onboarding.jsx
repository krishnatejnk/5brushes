import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const MEDIUMS = ['Oil', 'Acrylic', 'Watercolour', 'Mixed media', 'Ink', 'Gouache'];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [mediums, setMediums] = useState(['Oil']);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function toggle(m) {
    setMediums((cur) => (cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m]));
  }

  async function submit(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        location,
        phone,
        bio: bio + (mediums.length ? ` · Mediums: ${mediums.join(', ')}` : ''),
      })
      .eq('id', user.id);
    setBusy(false);
    if (error) { setError(error.message); return; }
    await refreshProfile();
    navigate('/dashboard');
  }

  return (
    <div className="wrap-narrow">
      <div className="eyebrow" style={{ marginBottom: 14 }}>Step 2 of 3 · Artist profile</div>
      <h1 className="serif" style={{ fontWeight: 600, fontSize: 44, lineHeight: 1.08, margin: '0 0 12px' }}>Set up your artist profile</h1>
      <p style={{ fontSize: 17, color: 'var(--ink-2)', margin: '0 0 38px' }}>Tell collectors who you are. You can refine all of this later.</p>

      <form className="card" style={{ padding: 34 }} onSubmit={submit}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 28 }}>
          <div className="avatar" style={{ width: 74, height: 74 }}><span className="ph-label">photo</span></div>
          <div>
            <button type="button" className="btn btn-ghost btn-sm">Upload photo</button>
            <div className="form-hint" style={{ marginTop: 7 }}>JPG or PNG · square works best</div>
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: 18 }}>
          <div className="field" style={{ margin: 0 }}><label>Display name</label><input required value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Aarohi Mehta" /></div>
          <div className="field" style={{ margin: 0 }}><label>City, State</label><input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Jaipur, Rajasthan" /></div>
        </div>
        <div className="field"><label>Phone (optional)</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91" /></div>
        <div className="field"><label>Short bio</label><textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Contemporary painter working in oil and watercolour…" /></div>

        <label className="label" style={{ marginBottom: 10 }}>Primary mediums</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginBottom: 30 }}>
          {MEDIUMS.map((m) => {
            const on = mediums.includes(m);
            return (
              <span key={m} onClick={() => toggle(m)} style={{ padding: '8px 15px', borderRadius: 30, fontSize: 13.5, fontWeight: on ? 600 : 500, cursor: 'pointer', background: on ? 'var(--accent-soft)' : '#fff', color: on ? 'var(--accent-deep)' : 'var(--ink-2)', border: `1px solid ${on ? 'rgba(201,98,46,0.25)' : 'var(--line-2)'}` }}>{m}</span>
            );
          })}
        </div>

        {error && <p className="form-error" style={{ marginBottom: 12 }}>{error}</p>}
        <button className="btn btn-primary btn-block btn-lg" disabled={busy}>{busy ? 'Saving…' : 'Save & continue →'}</button>
      </form>
    </div>
  );
}
