import { Routes, Route } from 'react-router-dom';
import ProtectedRoute, { AdminRoute } from './components/ProtectedRoute';

import Landing from './routes/Landing';
import ArtistAuth from './routes/ArtistAuth';
import VerifyEmail from './routes/VerifyEmail';
import Onboarding from './routes/Onboarding';
import Dashboard from './routes/Dashboard';
import AddArtwork from './routes/AddArtwork';
import Admin from './routes/Admin';
import AdminLogin from './routes/AdminLogin';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/artists" element={<ArtistAuth />} />
      <Route path="/verify" element={<VerifyEmail />} />

      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/new"
        element={
          <ProtectedRoute>
            <AddArtwork />
          </ProtectedRoute>
        }
      />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        }
      />

      <Route path="*" element={<Landing />} />
    </Routes>
  );
}
