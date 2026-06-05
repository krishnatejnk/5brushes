import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner container">
        <div className="footer-brand">
          <img src="/logo.png" alt="3 Brushes" />
          <span>3 Brushes</span>
          <p>The world's leading online art gallery. Discover original artworks from emerging artists around the world.</p>
        </div>

        <div className="footer-nav">
          <div className="footer-col">
            <h4>Explore</h4>
            <Link to="/">Home</Link>
            <Link to="/gallery">Gallery</Link>
            <Link to="/about">About</Link>
          </div>
          <div className="footer-col">
            <h4>Artists</h4>
            <Link to="/artist/register">Join as Artist</Link>
            <Link to="/artist/login">Artist Login</Link>
            <Link to="/artist/dashboard">My Studio</Link>
          </div>
          <div className="footer-col">
            <h4>Styles</h4>
            <Link to="/gallery?style=Paintings">Paintings</Link>
            <Link to="/gallery?style=Abstract">Abstract</Link>
            <Link to="/gallery?style=Photography">Photography</Link>
            <Link to="/gallery?style=Sculptures">Sculptures</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom container">
        <p>© {new Date().getFullYear()} 3 Brushes. All rights reserved.</p>
        <div className="footer-socials">
          <a href="#" aria-label="Instagram">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="2" y="2" width="20" height="20" rx="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
            </svg>
          </a>
          <a href="#" aria-label="X / Twitter">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <a href="#" aria-label="Facebook">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  )
}
