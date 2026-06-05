import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import './AuthPage.css'

export default function ArtistRegister() {
  const [form, setForm]       = useState({ name: '', bio: '', email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim())        return setError('Please enter your name.')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')
    setError('')
    setLoading(true)

    const { error: signUpErr } = await supabase.auth.signUp({
      email:    form.email,
      password: form.password,
      options: {
        data: {
          name: form.name.trim(),
          bio:  form.bio.trim(),
        },
      },
    })

    if (signUpErr) {
      if (signUpErr.message.toLowerCase().includes('already registered')) {
        setError('This email is already registered.')
      } else {
        setError(signUpErr.message || 'Registration failed. Please try again.')
      }
      setLoading(false)
      return
    }

    // Artist profile is created automatically via database trigger.
    // Sign in immediately so the session is active.
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email:    form.email,
      password: form.password,
    })

    if (signInErr) {
      // Account created — redirect to login
      navigate('/artist/login')
    } else {
      navigate('/artist/dashboard')
    }
    setLoading(false)
  }

  return (
    <main className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-logo">
          <img src="/logo.png" alt="5 Brushes" />
        </div>
        <h1>Join as Artist</h1>
        <p className="auth-sub">Create your profile and start showcasing your work</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label>Full Name *</label>
            <input
              value={form.name}
              onChange={set('name')}
              placeholder="Your name as you'd like it displayed"
              required
            />
          </div>
          <div className="field">
            <label>Short Bio</label>
            <textarea
              value={form.bio}
              onChange={set('bio')}
              placeholder="Tell collectors about yourself and your work… (optional)"
              style={{ minHeight: 90 }}
            />
          </div>
          <div className="field">
            <label>Email Address *</label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="your@email.com"
              required
            />
          </div>
          <div className="field">
            <label>Password *</label>
            <input
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="Minimum 6 characters"
              required
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Artist Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/artist/login">Sign in →</Link>
        </p>
      </div>
    </main>
  )
}
