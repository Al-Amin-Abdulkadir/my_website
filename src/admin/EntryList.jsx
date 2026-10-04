import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from './api'
import { resizeCloudinaryImage } from '../data/projects'

// A list of projects or case studies as cover cards, plus "New …"
export default function EntryList({ kind, title, editorPath }) {
  const navigate = useNavigate()
  const [entries, setEntries] = useState(null)
  const [error, setError] = useState(null)
  const [newTitle, setNewTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const singular = kind === 'project' ? 'project' : 'case study'

  useEffect(() => {
    setEntries(null)
    api.get(`/api/admin/entries?kind=${kind}`).then(setEntries).catch((problem) => setError(problem.message))
  }, [kind])

  const createEntry = async (event) => {
    event.preventDefault()
    setIsCreating(true)
    try {
      const entry = await api.post('/api/admin/entries', { kind, title: newTitle })
      navigate(`${editorPath}/${entry.id}`)
    } catch (problem) {
      setError(problem.message)
      setIsCreating(false)
    }
  }

  return (
    <main className="admin-page">
      <div className="admin-page__head">
        <h1>{title}</h1>
        <form className="admin-new-project" onSubmit={createEntry}>
          <input
            placeholder={`New ${singular} title`}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />
          <button className="admin-button admin-button--primary" disabled={isCreating}>
            {isCreating ? 'Creating…' : `New ${singular}`}
          </button>
        </form>
      </div>

      {error && <p className="admin-error">{error}</p>}
      {!entries && !error && <p className="admin-muted">Loading…</p>}
      {entries?.length === 0 && <p className="admin-muted">No {title.toLowerCase()} yet. Give the first one a title above.</p>}

      {entries?.length > 0 && (
        <ul className="admin-grid">
          {entries.map((entry) => (
            <li key={entry.id}>
              <Link to={`${editorPath}/${entry.id}`} className="admin-card">
                <div className="admin-card__cover">
                  {entry.coverUrl
                    ? <img src={resizeCloudinaryImage(entry.coverUrl, 600)} alt="" style={{ objectPosition: entry.coverPosition }} />
                    : <span className="admin-muted">No cover yet</span>}
                </div>
                <div className="admin-card__meta">
                  <span>{entry.title}</span>
                  {!entry.isPublished && <span className="admin-badge">Draft</span>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
