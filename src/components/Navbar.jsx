import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

const CATEGORIES = ['Paintings','Drawings','Sketches','Prints','Photography','Sculptures','Curated artworks']

export default function Navbar() {
  const { user, isAdmin, isArtist } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch]   = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/gallery?q=${encodeURIComponent(search.trim())}`)
      setMenuOpen(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <header className="site-header">
      <div className="nav-top container">
        <Link to="/" className="nav-logo">
          <img src="/logo.png" alt="5 Brushes" />
          <span>5 Brushes</span>
        </Link>

        <form className="nav-search" onSubmit={handleSearch}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search artworks, artists..."
          />
        </form>

        <div className="nav-actions">
          {user ? (
            <>
              {isAdmin && <Link to="/admin" className="nav-link nav-admin">Admin Panel</Link>}
              {isArtist && !isAdmin && <Link to="/artist/dashboard" className="nav-link">My Studio</Link>}
              <button className="btn btn-ghost btn-sm" onClick={handleSignOut}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/artist/login"    className="nav-link">Account</Link>
              <Link to="/artist/register" className="btn btn-primary btn-sm">Join as Artist</Link>
            </>
          )}
        </div>

        <button className="nav-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>

      <nav className="nav-cats container">
        {CATEGORIES.map(cat => (
          <Link key={cat} to={`/gallery?style=${encodeURIComponent(cat)}`} className="nav-cat">
            {cat}
          </Link>
        ))}
        <Link to="/gallery" className="nav-cat">All Works</Link>
        <Link to="/about"   className="nav-cat">About</Link>
      </nav>

      {menuOpen && (
        <div className="nav-mobile-menu">
          <form className="nav-search-mobile" onSubmit={handleSearch}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." />
          </form>

          {CATEGORIES.map(cat => (
            <Link key={cat} to={`/gallery?style=${encodeURIComponent(cat)}`} className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
              {cat}
            </Link>
          ))}
          <Link to="/gallery" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>All Works</Link>
          <Link to="/about"   className="mobile-nav-link" onClick={() => setMenuOpen(false)}>About</Link>

          <div className="mobile-nav-auth">
            {user ? (
              <>
                {isAdmin  && <Link to="/admin"            className="btn btn-ghost btn-sm" onClick={() => setMenuOpen(false)}>Admin Panel</Link>}
                {isArtist && <Link to="/artist/dashboard" className="btn btn-ghost btn-sm" onClick={() => setMenuOpen(false)}>My Studio</Link>}
                <button className="btn btn-outline btn-sm" onClick={handleSignOut}>Sign out</button>
              </>
            ) : (
              <>
                <Link to="/artist/login"    className="btn btn-ghost btn-sm"   onClick={() => setMenuOpen(false)}>Artist Login</Link>
                <Link to="/artist/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>Join as Artist</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
