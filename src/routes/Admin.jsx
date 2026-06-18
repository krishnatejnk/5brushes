import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import Nav from '../components/Nav';
import StatusBadge from '../components/StatusBadge';

const TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Disapproved' },
];

export default function Admin() {
  const { user } = useAuth();
  const [tab, setTab] = useState('pending');
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [rejecting, setRejecting] = useState(null);
  const [toast, setToast] = useState('');

  function flash(msg) { setToast(msg); setTimeout(() => setToast(''), 2400); }

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('artworks')
      .select('*, artist:profiles!artworks_artist_id_fkey(display_name, location)')
      .eq('status', tab)
      .order('created_at', { ascending: false });
    console.log('items query:', { data, error });
    setItems(data || []);
    setLoading(false);

    // counts for the tab pills
    const all = await supabase.from('artworks').select('status');
    if (all.data) {
      setCounts({
        pending: all.data.filter((a) => a.status === 'pending').length,
        approved: all.data.filter((a) => a.status === 'approved').length,
        rejected: all.data.filter((a) => a.status === 'rejected').length,
      });
    }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tab]);

  async function approve(id) {
    await supabase.from('artworks').update({
      status: 'approved', review_note: null, reviewed_by: user.id, reviewed_at: new Date().toISOString(),
    }).eq('id', id);
    flash('Approved — now live in the catalogue');
    load();
  }

  async function confirmReject(id, note) {
    await supabase.from('artworks').update({
      status: 'rejected', review_note: note, reviewed_by: user.id, reviewed_at: new Date().toISOString(),
    }).eq('id', id);
    setRejecting(null);
    flash('Disapproved — the artist has been notified');
    load();
  }

  return (
    <div>
      <Nav variant="admin" />
      <div className="wrap" style={{ maxWidth: 1000 }}>
        <h1 className="serif" style={{ fontWeight: 600, fontSize: 38, margin: '0 0 6px' }}>Moderation queue</h1>
        <p style={{ fontSize: 16, color: 'var(--ink-2)', margin: '0 0 28px' }}>Review each submission and approve or disapprove before it goes live.</p>

        <div className="pills">
          {TABS.map((t) => (
            <button key={t.key} className={`pill ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
              {t.label} · {counts[t.key]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="empty">Loading…</div>
        ) : items.length === 0 ? (
          <div className="empty"><div style={{ fontSize: 34, marginBottom: 10 }}>✓</div><div style={{ fontSize: 15, fontWeight: 600 }}>Nothing here right now</div></div>
        ) : (
          <div className="queue">
            {items.map((sub) => {
              const img = sub.image_url;
              const size = sub.width_cm && sub.height_cm ? `${sub.width_cm} × ${sub.height_cm} cm` : '';
              return (
                <div className="q-item" key={sub.id}>
                  <div className="q-item__img placeholder">
                    {img ? <img src={img} alt={sub.title} /> : <span className="ph-label">painting</span>}
                  </div>
                  <div className="q-item__body">
                    <div className="q-item__title">
                      <h3 className="serif">{sub.title}</h3>
                      <StatusBadge status={sub.status} />
                    </div>
                    <div className="q-item__meta">{[sub.medium, size].filter(Boolean).join(' · ')}</div>
                    <div className="q-item__artist">
                      <div className="avatar" style={{ width: 26, height: 26 }} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#3a3128' }}>{sub.artist?.display_name || 'Unknown artist'}</span>
                      <span style={{ fontSize: 13, color: 'var(--faint)' }}>· {sub.artist?.location || '—'}</span>
                    </div>
                    {sub.status === 'rejected' && sub.review_note && (
                      <div className="reject-note" style={{ marginTop: 10 }}>Reason: {sub.review_note}</div>
                    )}
                    {sub.status === 'pending' && (
                      <div className="q-actions">
                        <button className="btn btn-green btn-sm" onClick={() => approve(sub.id)}>✓ Approve</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setRejecting(sub)}>✕ Disapprove</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {rejecting && <RejectModal sub={rejecting} onClose={() => setRejecting(null)} onConfirm={confirmReject} />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function RejectModal({ sub, onClose, onConfirm }) {
  const [note, setNote] = useState('');
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal__head" style={{ marginBottom: 8 }}>
          <h2 className="serif">Disapprove painting</h2>
          <button className="x" onClick={onClose}>×</button>
        </div>
        <p style={{ fontSize: 14, color: 'var(--muted)', margin: '0 0 20px' }}>
          Let <b>{sub.artist?.display_name || 'the artist'}</b> know what needs to change. They'll see this note on “{sub.title}”.
        </p>
        <div className="field"><label>Reason</label><textarea autoFocus value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Image resolution too low — please re-upload at 2000px or larger." /></div>
        <div className="modal-actions">
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" style={{ flex: 2, background: 'var(--red)', color: '#fff', borderColor: 'var(--red)' }} disabled={!note.trim()} onClick={() => onConfirm(sub.id, note.trim())}>Disapprove &amp; notify</button>
        </div>
      </div>
    </div>
  );
}
