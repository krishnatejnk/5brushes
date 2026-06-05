import { Link } from 'react-router-dom'

export default function ArtCard({ artwork }) {
  return (
    <Link to={`/artwork/${artwork.id}`} className="art-card">
      <div className="art-card-img">
        {artwork.image_url
          ? <img src={artwork.image_url} alt={artwork.title} loading="lazy" />
          : <div className="art-card-img-placeholder" />
        }
      </div>
      <div className="art-card-body">
        <h3 className="art-card-title">{artwork.title}</h3>
        <p className="art-card-artist">{artwork.artist_name}</p>
        <div className="art-card-footer">
          <span className="art-card-price">${Number(artwork.price).toLocaleString()}</span>
          {artwork.style && <span className="art-card-tag">{artwork.style}</span>}
        </div>
      </div>
    </Link>
  )
}
