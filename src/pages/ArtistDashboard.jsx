import { useEffect, useState, useRef } from 'react'
import { supabase } from '../supabase'
import { uploadToCloudinary } from '../lib/cloudinary'
import { useAuth } from '../context/AuthContext'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'
import './ArtistDashboard.css'

const STYLES = ['Paintings','Drawings','Sketches','Prints','Photography','Sculptures','Modern Art','Abstract','Floral','Pop Art','Other']
const EMPTY  = { title: '', style: 'Paintings', medium: '', dimensions: '', price: '', description: '' }

export default function ArtistDashboard() {
  const { user, artistProfile } = useAuth()
  const { toast, showToast }    = useToast()
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading]   = useState(true)
  const [form, setForm]         = useState(EMPTY)
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview]     = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress]   = useState(0)
  const fileRef = useRef()

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const loadArtworks = async () => {
    const { data } = await supabase
      .from('artworks')
      .select('*')
      .eq('artist_id', user.id)
      .order('created_at', { ascending: false })
    setArtworks(data ?? [])
    setLoading(false)
  }

  useEffect(() => { loadArtworks() }, [])

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      setImageFile(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const resetForm = () => {
    setForm(EMPTY)
    setImageFile(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!imageFile)        return showToast('Please select an artwork image.', 'error')
    if (!form.title.trim()) return showToast('Please enter a title.', 'error')
    if (!form.price)       return showToast('Please enter a price.', 'error')

    setUploading(true)
    setProgress(0)
    try {
      const image_url = await uploadToCloudinary(imageFile, setProgress)

      const { error } = await supabase.from('artworks').insert({
        ...form,
        price:       Number(form.price),
        image_url,
        artist_id:   user.id,
        artist_name: artistProfile.name,
        status:      'pending',
      })

      if (error) throw error

      resetForm()
      showToast('Artwork submitted for review!', 'success')
      loadArtworks()
    } catch {
      showToast('Upload failed. Please try again.', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this artwork? This cannot be undone.')) return
    const { error } = await supabase.from('artworks').delete().eq('id', id)
    if (error) {
      showToast('Could not delete. Please try again.', 'error')
    } else {
      setArtworks(prev => prev.filter(a => a.id !== id))
      showToast('Artwork deleted.', 'success')
    }
  }

  return (
    <main className="page dashboard container">
      <div className="page-header">
        <h1>My Studio</h1>
        <p>Welcome back, <strong>{artistProfile?.name}</strong>. Upload artworks and track your submissions.</p>
      </div>

      <div className="dashboard-layout">

        {/* Upload form */}
        <section className="upload-panel">
          <h2>Upload New Artwork</h2>
          <form onSubmit={handleSubmit} className="upload-form">

            <div
              className={`image-drop ${preview ? 'has-preview' : ''}`}
              onClick={() => fileRef.current.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
            >
              {preview ? (
                <img src={preview} alt="Preview" />
              ) : (
                <div className="drop-hint">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".4">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <p>Click or drag to upload artwork image</p>
                  <small>JPG, PNG, WEBP — max 10MB</small>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />

            <div className="field">
              <label>Title *</label>
              <input value={form.title} onChange={set('title')} placeholder="Artwork title" required />
            </div>

            <div className="form-row-2">
              <div className="field">
                <label>Style *</label>
                <select value={form.style} onChange={set('style')}>
                  {STYLES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Price (USD) *</label>
                <input type="number" value={form.price} onChange={set('price')} placeholder="0" min="0" step="0.01" required />
              </div>
            </div>

            <div className="form-row-2">
              <div className="field">
                <label>Medium</label>
                <input value={form.medium} onChange={set('medium')} placeholder="e.g. Oil on canvas" />
              </div>
              <div className="field">
                <label>Dimensions</label>
                <input value={form.dimensions} onChange={set('dimensions')} placeholder='e.g. 24" × 36"' />
              </div>
            </div>

            <div className="field">
              <label>Description</label>
              <textarea value={form.description} onChange={set('description')} placeholder="Tell the story behind this piece…" />
            </div>

            {uploading && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <span>{progress}%</span>
              </div>
            )}

            <div className="upload-actions">
              <button type="button" className="btn btn-ghost" onClick={resetForm} disabled={uploading}>Clear</button>
              <button type="submit" className="btn btn-primary" disabled={uploading}>
                {uploading ? 'Uploading…' : 'Submit for Review'}
              </button>
            </div>
          </form>
        </section>

        {/* Artwork list */}
        <section className="my-artworks">
          <h2>My Artworks <span className="count-badge">{artworks.length}</span></h2>
          {loading ? (
            <div className="loading"><div className="spin" /></div>
          ) : artworks.length === 0 ? (
            <div className="empty-state">
              <h3>No artworks yet</h3>
              <p>Use the form to upload your first piece for review.</p>
            </div>
          ) : (
            <div className="artworks-list">
              {artworks.map(a => (
                <div key={a.id} className="artwork-row">
                  <div className="artwork-row-thumb">
                    {a.image_url
                      ? <img src={a.image_url} alt={a.title} />
                      : <div className="thumb-ph" />
                    }
                  </div>
                  <div className="artwork-row-info">
                    <p className="artwork-row-title">{a.title}</p>
                    <p className="artwork-row-meta">{a.style} · ${Number(a.price).toLocaleString()}</p>
                  </div>
                  <span className={`badge badge-${a.status}`}>{a.status}</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(a.id)}>Delete</button>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      <Toast toast={toast} />
    </main>
  )
}
