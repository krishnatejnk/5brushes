import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { uploadImage } from '../lib/storage';
import Nav from '../components/Nav';

export default function AddArtwork() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [form, setForm] = useState({ title: '', medium: '', year: '', width_cm: '', height_cm: '', price_inr: '', description: '' });
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function pick(f) {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!file) { setError('Please add an image of the painting.'); return; }
    setBusy(true);
    try {
      const { url, publicId } = await uploadImage(file, setProgress);
      const { error } = await supabase.from('artworks').insert({
        artist_id: user.id,
        title: form.title,
        medium: form.medium || null,
        year: form.year ? Number(form.year) : null,
        width_cm: form.width_cm ? Number(form.width_cm) : null,
        height_cm: form.height_cm ? Number(form.height_cm) : null,
        price_inr: form.price_inr ? Number(form.price_inr) : null,
        description: form.description || null,
        image_url: url,
        image_public_id: publicId,
        status: 'pending',
      });
      if (error) throw error;
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Something went wrong.');
      setBusy(false);
    }
  }

  return (
    <div>
      <Nav variant="app" />
      <div className="wrap-narrow">
        <span className="back-link" onClick={() => navigate('/dashboard')} style={{ marginBottom: 22, display: 'inline-flex' }}>
          <span style={{ fontSize: 18 }}>←</span> Back to studio
        </span>
        <h1 className="serif" style={{ fontWeight: 600, fontSize: 40, margin: '14px 0 6px' }}>Add a painting</h1>
        <p style={{ fontSize: 16, color: 'var(--ink-2)', margin: '0 0 32px' }}>Submit a new piece. It'll be reviewed by our team before going live.</p>

        <form className="card" style={{ padding: 34 }} onSubmit={submit}>
          {/* uploader */}
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files[0])} />
          <div className="placeholder dropzone" onClick={() => fileRef.current?.click()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {preview ? (
              <img src={preview} alt="preview" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
            ) : (
              <>
                <div style={{ fontSize: 30 }}>⬆</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-2)' }}>Drag image or click to upload</div>
                <div className="ph-label">min 2000px recommended</div>
              </>
            )}
          </div>

          {busy && progress > 0 && (
            <div style={{ height: 6, background: 'var(--line)', borderRadius: 4, overflow: 'hidden', marginBottom: 18 }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent)', transition: 'width .2s' }} />
            </div>
          )}

          <div className="field"><label>Title</label><input required value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Untitled" /></div>
          <div className="grid-2" style={{ marginBottom: 16 }}>
            <div className="field" style={{ margin: 0 }}><label>Medium</label><input value={form.medium} onChange={(e) => set('medium', e.target.value)} placeholder="Oil on canvas" /></div>
            <div className="field" style={{ margin: 0 }}><label>Year</label><input value={form.year} onChange={(e) => set('year', e.target.value)} placeholder="2026" /></div>
          </div>
          <div className="grid-3" style={{ marginBottom: 16 }}>
            <div className="field" style={{ margin: 0 }}><label>Width cm</label><input value={form.width_cm} onChange={(e) => set('width_cm', e.target.value)} placeholder="50" /></div>
            <div className="field" style={{ margin: 0 }}><label>Height cm</label><input value={form.height_cm} onChange={(e) => set('height_cm', e.target.value)} placeholder="70" /></div>
            <div className="field" style={{ margin: 0 }}><label>Price ₹</label><input value={form.price_inr} onChange={(e) => set('price_inr', e.target.value)} placeholder="—" /></div>
          </div>
          <div className="field"><label>Description</label><textarea value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="A few words about this piece…" /></div>

          {error && <p className="form-error" style={{ marginBottom: 12 }}>{error}</p>}
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => navigate('/dashboard')}>Cancel</button>
            <button className="btn btn-primary" style={{ flex: 2 }} disabled={busy}>{busy ? `Uploading… ${progress}%` : 'Submit for review'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
