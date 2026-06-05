import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Gallery from './pages/Gallery'
import ArtworkDetail from './pages/ArtworkDetail'
import About from './pages/About'
import ArtistLogin from './pages/ArtistLogin'
import ArtistRegister from './pages/ArtistRegister'
import ArtistDashboard from './pages/ArtistDashboard'
import AdminPanel from './pages/AdminPanel'

function ArtistRoute({ children }) {
  const { user, isArtist, loading } = useAuth()
  if (loading) return <div className="loading"><div className="spin" /></div>
  return (user && isArtist) ? children : <Navigate to="/artist/login" replace />
}

function AdminRoute({ children }) {
  const { isAdmin, loading } = useAuth()
  if (loading) return <div className="loading"><div className="spin" /></div>
  return isAdmin ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"                 element={<Home />} />
        <Route path="/gallery"          element={<Gallery />} />
        <Route path="/artwork/:id"      element={<ArtworkDetail />} />
        <Route path="/about"            element={<About />} />
        <Route path="/artist/login"     element={<ArtistLogin />} />
        <Route path="/artist/register"  element={<ArtistRegister />} />
        <Route path="/artist/dashboard" element={<ArtistRoute><ArtistDashboard /></ArtistRoute>} />
        <Route path="/admin"            element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="*"                 element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
