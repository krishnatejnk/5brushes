import StatusBadge from './StatusBadge';

export default function ArtworkCard({ art, onEdit }) {
  const img = art.image_url;
  const size = art.width_cm && art.height_cm ? `${art.width_cm} × ${art.height_cm} cm` : null;

  return (
    <div className="art-card">
      <div className="art-card__img placeholder">
        {img ? <img src={img} alt={art.title} /> : <span className="ph-label">painting</span>}
        <div className="art-card__badge"><StatusBadge status={art.status} /></div>
      </div>
      <div className="art-card__body">
        <h3 className="serif art-card__title">{art.title}</h3>
        <div className="art-card__meta">
          {[art.medium, size, art.year].filter(Boolean).join(' · ')}
        </div>
        {art.status === 'rejected' && art.review_note && (
          <div className="reject-note">{art.review_note}</div>
        )}
        {onEdit && (
          <button className="btn btn-ghost btn-block" onClick={() => onEdit(art)}>
            Edit details
          </button>
        )}
      </div>
    </div>
  );
}
