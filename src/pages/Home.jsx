import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'
import ArtCard from '../components/ArtCard'
import './Home.css'

const STYLES = [
  { label: 'Modern Art',  color: '#7A5C4F' },
  { label: 'Abstract',    color: '#4D6B5E' },
  { label: 'Floral',      color: '#9E6B58' },
  { label: 'Pop Art',     color: '#B8772A' },
]

const PRICE_RANGES = [
  { label: 'Under $100',    max: 100 },
  { label: 'Under $1,000',  max: 1000 },
  { label: 'Under $5,000',  max: 5000 },
  { label: 'Under $10,000', max: 10000 },
]

const WHY_ITEMS = [
  {
    icon: <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
    title: '100% Original Artworks',
    desc:  'Every piece is verified original, hand-created by the artist — never a print-on-demand.',
  },
  {
    icon: <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    title: 'World-Wide Collection',
    desc:  'Discover unique talent and styles from artists across every corner of the globe.',
  },
  {
    icon: <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    title: 'Direct Connection',
    desc:  'We personally connect you with the artist to discuss the work and arrange your purchase.',
  },
  {
    icon: <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    title: 'Support Emerging Artists',
    desc:  'Every purchase directly supports an independent artist and helps them grow their practice.',
  },
]

export default function Home() {
  const [curated, setCurated]         = useState([])
  const [bestSellers, setBestSellers] = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('artworks')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(8)
      const all = data ?? []
      setCurated(all.slice(0, 4))
      setBestSellers(all.slice(4))
      setLoading(false)
    }
    load()
  }, [])

  return (
    <main className="home">

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container hero-content">
          <p className="hero-eyebrow">Discover · Collect · Own</p>
          <h1>The World's Leading<br />Online Art Gallery</h1>
          <p className="hero-sub">
            Discover new works by emerging artists from around the world.
            Every piece is original, curated, and ready to own.
          </p>
          <div className="hero-ctas">
            <Link to="/gallery" className="btn hero-btn-solid">Browse Gallery</Link>
            <Link to="/artist/register" className="btn hero-btn-outline">Join as Artist</Link>
          </div>
        </div>
      </section>

      {/* Curated */}
      <section className="home-section container">
        <div className="section-hd">
          <h2>Handpicked by our Curators</h2>
          <Link to="/gallery" className="see-all">See all →</Link>
        </div>
        {loading ? (
          <div className="loading"><div className="spin" /></div>
        ) : curated.length > 0 ? (
          <div className="art-grid">
            {curated.map(a => <ArtCard key={a.id} artwork={a} />)}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Artworks Coming Soon</h3>
            <p>Our curators are selecting the finest works. Check back soon.</p>
            <Link to="/artist/register" className="btn btn-primary" style={{ marginTop: 20 }}>
              Are you an artist? Join us →
            </Link>
          </div>
        )}
      </section>

      {/* Shop by Style */}
      <section className="home-section container">
        <div className="section-hd"><h2>Shop by Style</h2></div>
        <div className="style-grid">
          {STYLES.map(s => (
            <Link
              key={s.label}
              to={`/gallery?style=${encodeURIComponent(s.label)}`}
              className="style-tile"
              style={{ background: s.color }}
            >
              <span>{s.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Shop by Price */}
      <section className="home-section container">
        <div className="section-hd"><h2>Shop by Price</h2></div>
        <div className="price-filters">
          {PRICE_RANGES.map(r => (
            <Link key={r.label} to={`/gallery?maxPrice=${r.max}`} className="price-chip">
              {r.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Why Shop */}
      <section className="why-section">
        <div className="container">
          <h2 className="why-title">Why Shop On 5Brushes?</h2>
          <div className="why-grid">
            {WHY_ITEMS.map(w => (
              <div key={w.title} className="why-card">
                <div className="why-icon">{w.icon}</div>
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="home-section container">
          <div className="section-hd">
            <h2>Our Best Selling Prints</h2>
            <Link to="/gallery" className="see-all">See all →</Link>
          </div>
          <div className="art-grid">
            {bestSellers.map(a => <ArtCard key={a.id} artwork={a} />)}
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="home-section container">
        <h2 className="center-title">What Our Collectors Say</h2>
        <div className="testimonials">
          {[
            { name: 'Sarah M.', role: 'Art Collector',     text: '"A terrific piece of online art discovery. The quality is outstanding and the curation genuinely impressed me."' },
            { name: 'James L.', role: 'Interior Designer', text: '"A fantastic experience from browsing to purchase. Found exactly the right piece for my client\'s living room."' },
            { name: 'Priya K.', role: 'First-time Buyer',  text: '"I genuinely enjoyed the whole journey. The gallery connected me directly with the artist. Highly recommend!"' },
          ].map(t => (
            <div key={t.name} className="testimonial-card">
              <p className="testimonial-text">{t.text}</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.name[0]}</div>
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </main>
  )
}
