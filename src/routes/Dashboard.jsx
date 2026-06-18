import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import Nav from '../components/Nav';
import ArtworkCard from '../components/ArtworkCard';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editProfile, setEditProfile] = useState(false);
  const [editArt, setEditArt] = useState(null);
  const [toast, setToast] = useState('');

  function flash(msg) { setToast(msg); setTimeout(() => setToast(''), 2400); }

  async function load() {
    if (!user) return;
    const { data } = await supabase
      .from('artworks')
      .select('*')
      .eq('artist_id', user.id)
      .order('created_at', { ascending: false });
    setArtworks(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user]);

  // Redirect to onboarding if the profile was never completed.
  useEffect(() => {
    if (profile && !profile.display_name) navigate('/onboarding', { replace: true });
  }, [profile, navigate]);

  const total = artworks.length;
  const approved = artworks.filter((a) => a.status === 'approved').length;
  const pending = artworks.filter((a) => a.status === 'pending').length;

  return (
    <div>
      <Nav variant="app" />
      <div className="wrap">
        {/* profile */}
        <div className="card profile-row">
          <div className="avatar" style={{ width: 84, height: 84 }}>
            {profile?.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : <span className="ph-label">photo</span>}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="serif" style={{ fontSize: 32, margin: '0 0 4px' }}>{profile?.display_name || 'Your name'}</h1>
            <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 8 }}>{profile?.location || 'Add your location'}</div>
            <p style={{ fontSize: 14.5, color: 'var(--ink-2)', margin: 0, maxWidth: 560, lineHeight: 1.55 }}>{profile?.bio || 'Add a short bio so collectors get to know you.'}</p>
          </div>
          <button className="btn btn-ghost" onClick={() => setEditProfile(true)}>Edit profile</button>
        </div>

        {/* stats */}
        <div className="stats">
          <div className="card stat"><b>{total}</b><span>Paintings</span></div>
          <div className="card stat"><b style={{ color: 'var(--green)' }}>{approved}</b><span>Live in catalogue</span></div>
          <div className="card stat"><b style={{ color: 'var(--accent)' }}>{pending}</b><span>Awaiting review</span></div>
        </div>

        {/* paintings */}
        <div className="section-head">
          <h2 className="serif">My paintings</h2>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard/new')}>
            <span style={{ fontSize: 18, marginRight: 6 }}>+</span> Add painting
          </button>
        </div>

        {loading ? (
          <div className="empty">Loading your studio…</div>
        ) : (
          <div className="art-grid">
            {artworks.map((art) => (
              <ArtworkCard key={art.id} art={art} onEdit={setEditArt} />
            ))}
            <div className="add-tile" onClick={() => navigate('/dashboard/new')}>
              <div className="plus">+</div>
              <div style={{ fontSize: 14.5, fontWeight: 600 }}>Add a new painting</div>
            </div>
          </div>
        )}
      </div>

      {editProfile && (
        <EditProfileModal
          profile={profile}
          userId={user.id}
          onClose={() => setEditProfile(false)}
          onSaved={async () => { setEditProfile(false); await refreshProfile(); flash('Profile updated'); }}
        />
      )}
      {editArt && (
        <EditArtModal
          art={editArt}
          onClose={() => setEditArt(null)}
          onSaved={async () => { setEditArt(null); await load(); flash('Painting updated'); }}
          onDeleted={async () => { setEditArt(null); await load(); flash('Painting removed'); }}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

/* ---------- edit profile ---------- */
function EditProfileModal({ profile, userId, onClose, onSaved }) {
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    await supabase.from('profiles').update({ display_name: displayName, location, bio }).eq('id', userId);
    setBusy(false);
    onSaved();
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal__head" style={{ marginBottom: 24 }}>
          <h2 className="serif">Edit profile</h2>
          <button className="x" onClick={onClose}>×</button>
        </div>
        <div className="grid-2" style={{ marginBottom: 16 }}>
          <div className="field" style={{ margin: 0 }}><label>Display name</label><input value={displayName} onChange={(e) => setDisplayName(e.target.value)} /></div>
          <div className="field" style={{ margin: 0 }}><label>Location</label><input value={location} onChange={(e) => setLocation(e.target.value)} /></div>
        </div>
        <div className="field"><label>Bio</label><textarea value={bio} onChange={(e) => setBio(e.target.value)} /></div>
        <div className="modal-actions">
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 2 }} disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save changes'}</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- edit artwork ---------- */
function EditArtModal({ art, onClose, onSaved, onDeleted }) {
  const [title, setTitle] = useState(art.title || '');
  const [medium, setMedium] = useState(art.medium || '');
  const [price, setPrice] = useState(art.price_inr ?? '');
  const [description, setDescription] = useState(art.description || '');
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    // Note: status/review fields are protected by a DB trigger — artists can't self-approve.
    await supabase.from('artworks').update({
      title, medium, price_inr: price === '' ? null : Number(price), description,
    }).eq('id', art.id);
    setBusy(false);
    onSaved();
  }
  async function remove() {
    if (!confirm('Remove this painting?')) return;
    setBusy(true);
    await supabase.from('artworks').delete().eq('id', art.id);
    setBusy(false);
    onDeleted();
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h2 className="serif">Edit painting</h2>
          <button className="x" onClick={onClose}>×</button>
        </div>
        <p style={{ fontSize: 14, color: 'var(--muted)', margin: '0 0 24px' }}>
          Editing resubmits the piece for review if it was already live.
        </p>
        <div className="field"><label>Title</label><input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div className="grid-2" style={{ marginBottom: 16 }}>
          <div className="field" style={{ margin: 0 }}><label>Medium</label><input value={medium} onChange={(e) => setMedium(e.target.value)} /></div>
          <div className="field" style={{ margin: 0 }}><label>Price ₹</label><input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="—" /></div>
        </div>
        <div className="field"><label>Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        <div className="modal-actions">
          <button className="btn btn-danger" onClick={remove} disabled={busy}>Delete</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
        </div>
      </div>
    </div>
  );
}
