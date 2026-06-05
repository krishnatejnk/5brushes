import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabase'
import ArtCard from '../components/ArtCard'
import InterestModal from '../components/InterestModal'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'
import './ArtworkDetail.css'

export default function ArtworkDetail() {
  const { id } = useParams()
  const [artwork, setArtwork]   = useState(null)
  const [related, setRelated]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const { toast, showToast }    = useToast()

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('artworks').select('*').eq('id', id).single()
      if (data) {
        setArtwork(data)
        const { data: rel } = await supabase
          .from('artworks')
          .select('*')
          .eq('status', 'approved')
          .eq('style', data.style)
          .neq('id', id)
          .limit(4)
        setRelated(rel ?? [])
      }
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <div className="loading"><div className="spin" /></div>
  if (!artwork) return (
    <div className="container page">
      <h2>Artwork not found.</h2>
      <Link to="/gallery" className="btn btn-ghost" style={{ marginTop: 16 }}>← Back to Gallery</Link>
    </div>
  )

  return (
    <main className="page detail-page">
      <div className="container">
        <Link to="/gallery" className="back-link">← Back to Gallery</Link>

        <div className="detail-layout">
          <div className="detail-image-wrap">
            {artwork.image_url
              ? <img src={artwork.image_url} alt={artwork.title} className="detail-image" />
              : <div className="detail-image-ph" />
            }
          </div>

          <div className="detail-info">
            <p className="detail-style-label">{artwork.style}</p>
            <h1 className="detail-title">{artwork.title}</h1>
            <p className="detail-artist">by <strong>{artwork.artist_name}</strong></p>

            {artwork.medium     && <p className="detail-meta">Medium: {artwork.medium}</p>}
            {artwork.dimensions && <p className="detail-meta">Dimensions: {artwork.dimensions}</p>}

            <div className="detail-price">${Number(artwork.price).toLocaleString()}</div>

            {artwork.description && <p className="detail-desc">{artwork.description}</p>}

            <button className="btn btn-primary btn-full detail-cta" onClick={() => setShowModal(true)}>
              Express Interest
            </button>

            <p className="detail-note">
              Expressing interest does not obligate you to purchase.
              The gallery will reach out to discuss the artwork with you.
            </p>
          </div>
        </div>

        {related.length > 0 && (
          <section className="related-section">
            <h2>Related Works</h2>
            <div className="art-grid">
              {related.map(a => <ArtCard key={a.id} artwork={a} />)}
            </div>
          </section>
        )}
      </div>

      {showModal && (
        <InterestModal
          artwork={artwork}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            showToast("Your interest has been sent! We'll be in touch soon.", 'success')
          }}
        />
      )}

      <Toast toast={toast} />
    </main>
  )
}
