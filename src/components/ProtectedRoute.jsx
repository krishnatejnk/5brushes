import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Requires a signed-in (and email-confirmed) user.
export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageLoader />;
  if (!session) return <Navigate to="/artists" replace state={{ from: location }} />;

  return children;
}

// Requires an admin user.
export function AdminRoute({ children }) {
  const { session, profile, loading } = useAuth();

  if (loading) return <FullPageLoader />;
  if (!session) return <Navigate to="/admin/login" replace />;
  if (profile?.role !== 'admin') return <Navigate to="/" replace />;

  return children;
}

function FullPageLoader() {
  return (
    <div className="full-loader">
      <div className="spinner" />
    </div>
  );
}
