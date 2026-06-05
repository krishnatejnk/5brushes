import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'
import './AdminPanel.css'

export default function AdminPanel() {
  const [tab, setTab]           = useState('pending')
  const [artworks, setArtworks] = useState([])
  const [leads, setLeads]       = useState([])
  const [loading, setLoading]   = useState(true)
  const { toast, showToast }    = useToast()

  const loadAll = async () => {
    setLoading(true)
    const [{ data: art }, { data: lds }] = await Promise.all([
      supabase.from('artworks').select('*').order('created_at', { ascending: false }),
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
    ])
    setArtworks(art ?? [])
    setLeads(lds ?? [])
    setLoading(false)
  }

  useEffect(() => { loadAll() }, [])

  const updateStatus = async (id, status) => {
    const { error } = await supabase.from('artworks').update({ status }).eq('id', id)
    if (error) {
      showToast('Update failed.', 'error')
    } else {
      setArtworks(prev => prev.map(a => a.id === id ? { ...a, status } : a))
      showToast(`Artwork ${status}.`, 'success')
    }
  }

  const deleteArtwork = async (id) => {
    if (!confirm('Permanently delete this artwork?')) return
    const { error } = await supabase.from('artworks').delete().eq('id', id)
    if (error) {
      showToast('Delete failed.', 'error')
    } else {
      setArtworks(prev => prev.filter(a => a.id !== id))
      showToast('Artwork deleted.', 'success')
    }
  }

  const pending  = artworks.filter(a => a.status === 'pending')
  const approved = artworks.filter(a => a.status === 'approved')
  const rejected = artworks.filter(a => a.status === 'rejected')

  const displayed =
    tab === 'pending'  ? pending  :
    tab === 'approved' ? approved :
    tab === 'rejected' ? rejected :
    tab === 'leads'    ? []       : artworks

  const fmtDate = ts => ts ? new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

  return (
    <main className="page admin-page container">
      <div className="page-header">
        <h1>Admin Panel</h1>
        <p>Manage artwork submissions and buyer enquiry leads.</p>
      </div>

      <div className="admin-stats">
        <div className="stat-card stat-pending"  onClick={() => setTab('pending')}>
          <div className="stat-num">{pending.length}</div>
          <div className="stat-lbl">Pending Review</div>
        </div>
        <div className="stat-card stat-approved" onClick={() => setTab('approved')}>
          <div className="stat-num">{approved.length}</div>
          <div className="stat-lbl">Approved</div>
        </div>
        <div className="stat-card stat-rejected" onClick={() => setTab('rejected')}>
          <div className="stat-num">{rejected.length}</div>
          <div className="stat-lbl">Rejected</div>
        </div>
        <div className="stat-card stat-leads" onClick={() => setTab('leads')}>
          <div className="stat-num">{leads.length}</div>
          <div className="stat-lbl">Buyer Leads</div>
        </div>
      </div>

      {tab !== 'leads' && (
        <section className="admin-section">
          <div className="admin-section-hd">
            <h2>Artworks</h2>
            <div className="tabs">
              {[['pending','Pending'],['approved','Approved'],['rejected','Rejected'],['all','All']].map(([v, l]) => (
                <button key={v} className={`tab-btn ${tab === v ? 'active' : ''}`} onClick={() => setTab(v)}>{l}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="loading"><div className="spin" /></div>
          ) : displayed.length === 0 ? (
            <div className="empty-state"><h3>No artworks in this category</h3></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Artwork</th><th>Artist</th><th>Style</th><th>Price</th><th>Status</th><th>Submitted</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map(a => (
                    <tr key={a.id}>
                      <td>
                        <div className="cell-art">
                          {a.image_url
                            ? <img src={a.image_url} alt={a.title} className="table-thumb" />
                            : <div className="table-thumb-ph" />
                          }
                          <span className="cell-art-title">{a.title}</span>
                        </div>
                      </td>
                      <td>{a.artist_name}</td>
                      <td>{a.style}</td>
                      <td>${Number(a.price).toLocaleString()}</td>
                      <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                      <td>{fmtDate(a.created_at)}</td>
                      <td>
                        <div className="row-actions">
                          {a.status !== 'approved' && (
                            <button className="btn btn-sm btn-orange" onClick={() => updateStatus(a.id, 'approved')}>Approve</button>
                          )}
                          {a.status !== 'rejected' && (
                            <button className="btn btn-sm btn-ghost" onClick={() => updateStatus(a.id, 'rejected')}>Reject</button>
                          )}
                          <button className="btn btn-sm btn-danger" onClick={() => deleteArtwork(a.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {tab === 'leads' && (
        <section className="admin-section">
          <div className="admin-section-hd">
            <h2>Buyer Interest Leads</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => setTab('pending')}>← Back to Artworks</button>
          </div>

          {leads.length === 0 ? (
            <div className="empty-state">
              <h3>No leads yet</h3>
              <p>When buyers express interest in an artwork, their contact details will appear here.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Artwork</th><th>Artist</th><th>Buyer Name</th><th>Email</th><th>Phone</th><th>Message</th><th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map(l => (
                    <tr key={l.id}>
                      <td>
                        <div className="cell-art">
                          {l.artwork_image && <img src={l.artwork_image} alt={l.artwork_title} className="table-thumb" />}
                          <span className="cell-art-title">{l.artwork_title}</span>
                        </div>
                      </td>
                      <td>{l.artist_name}</td>
                      <td>{l.buyer_name}</td>
                      <td><a href={`mailto:${l.buyer_email}`} className="lead-email">{l.buyer_email}</a></td>
                      <td>{l.buyer_phone || '—'}</td>
                      <td className="lead-msg">{l.message || '—'}</td>
                      <td>{fmtDate(l.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <Toast toast={toast} />
    </main>
  )
}
