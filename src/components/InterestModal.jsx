import { useState } from 'react'
import { supabase } from '../supabase'

export default function InterestModal({ artwork, onClose, onSuccess }) {
  const [form, setForm]     = useState({ name: '', email: '', phone: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) return setError('Name and email are required.')
    setLoading(true)
    setError('')
    const { error: err } = await supabase.from('leads').insert({
      artwork_id:    artwork.id,
      artwork_title: artwork.title,
      artwork_image: artwork.image_url || '',
      artist_id:     artwork.artist_id,
      artist_name:   artwork.artist_name,
      buyer_name:    form.name.trim(),
      buyer_email:   form.email.trim(),
      buyer_phone:   form.phone.trim(),
      message:       form.message.trim(),
    })
    if (err) {
      setError('Something went wrong. Please try again.')
    } else {
      onSuccess()
    }
    setLoading(false)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>Express Interest</h2>
        <p className="subtitle">
          Leave your details and we'll be in touch about <strong>{artwork.title}</strong>.
        </p>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Full Name *</label>
            <input value={form.name} onChange={set('name')} placeholder="Your name" required />
          </div>
          <div className="field">
            <label>Email Address *</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="your@email.com" required />
          </div>
          <div className="field">
            <label>Phone Number</label>
            <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+1 555 000 0000" />
          </div>
          <div className="field">
            <label>Message</label>
            <textarea
              value={form.message}
              onChange={set('message')}
              placeholder="Tell us more about your interest in this piece..."
            />
          </div>

          {error && <p style={{ color: 'var(--red)', fontSize: '13px' }}>{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Sending…' : 'Send Enquiry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
