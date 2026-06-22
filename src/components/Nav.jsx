import { Link, useNavigate } from 'react-router-dom';
import BrushMark from './BrushMark';
import { useAuth } from '../context/AuthContext';

// Top app bar. `variant` = 'landing' | 'app' | 'admin'
export default function Nav({ variant = 'landing' }) {
  const { session, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const light = variant === 'admin';

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <header className={`nav nav--${variant}`}>
      <Link to="/" className="nav__brand">
        <BrushMark light={light} />
        <span className="serif nav__name">5&nbsp;Brushes</span>
        {variant === 'app' && <span className="nav__tag">Studio</span>}
        {variant === 'admin' && <span className="nav__tag nav__tag--admin">Admin</span>}
      </Link>

      {variant === 'landing' && (
        <nav className="nav__links">
{/*           <Link to="/">Paintings</Link> */}
{/*           <a href="#artists">Artists</a> */}
          {session ? (
            <Link to="/dashboard" className="btn btn-dark btn-sm">My studio</Link>
          ) : (
            <Link to="/artists" className="btn btn-dark btn-sm">For Artists</Link>
          )}
        </nav>
      )}

      {(variant === 'app' || variant === 'admin') && (
        <div className="nav__right">
          {session?.user?.email && <span className="nav__email">{session.user.email}</span>}
          {variant === 'app' && isAdmin && (
            <Link to="/admin" className="btn btn-ghost btn-sm">Admin</Link>
          )}
          <button className="btn btn-ghost btn-sm" onClick={handleSignOut}>Sign out</button>
        </div>
      )}
    </header>
  );
}
