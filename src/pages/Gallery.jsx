import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../supabase'
import ArtCard from '../components/ArtCard'
import './Gallery.css'

const STYLES = ['All','Paintings','Drawings','Sketches','Prints','Photography','Sculptures','Modern Art','Abstract','Floral','Pop Art','Curated artworks']

export default function Gallery() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading]   = useState(true)

  const styleFilter    = searchParams.get('style') || 'All'
  const maxPriceFilter = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : null
  const searchQuery    = searchParams.get('q') || ''

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('artworks')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
      setArtworks(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    return artworks.filter(a => {
      if (styleFilter !== 'All' && a.style !== styleFilter) return false
      if (maxPriceFilter && Number(a.price) > maxPriceFilter) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (!a.title?.toLowerCase().includes(q) && !a.artist_name?.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [artworks, styleFilter, maxPriceFilter, searchQuery])

  const setStyle = (s) => {
    const p = new URLSearchParams(searchParams)
    if (s === 'All') p.delete('style')
    else p.set('style', s)
    p.delete('q')
    setSearchParams(p)
  }

  const pageTitle = searchQuery
    ? `Results for "${searchQuery}"`
    : styleFilter !== 'All' ? styleFilter : 'Gallery'

  return (
    <main className="page gallery-page container">
      <div className="page-header">
        <h1>{pageTitle}</h1>
        <p>{filtered.length} {filtered.length === 1 ? 'artwork' : 'artworks'} available</p>
      </div>

      <div className="gallery-filters">
        {STYLES.map(s => (
          <button
            key={s}
            className={`filter-chip ${styleFilter === s ? 'active' : ''}`}
            onClick={() => setStyle(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading"><div className="spin" /></div>
      ) : filtered.length > 0 ? (
        <div className="art-grid">
          {filtered.map(a => <ArtCard key={a.id} artwork={a} />)}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No artworks found</h3>
          <p>Try a different filter, or check back soon for new additions.</p>
        </div>
      )}
    </main>
  )
}
