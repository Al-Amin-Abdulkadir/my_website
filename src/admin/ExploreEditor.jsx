import { useEffect, useState } from 'react'
import { api } from './api'
import MediaUpload from './MediaUpload'
import { stillOf } from '../data/cloudinary'
import { EXPLORE_CATEGORIES, EXPLORE_SHAPES, ratioOf } from '../pages/explorePieces'

// /admin/explore — the pieces on the Explore page, top to bottom. Each one is a
// photo or a video with a shape (Banner runs across the page; the rest flow into
// columns), and an optional type, title, caption and link shown when a visitor
// opens it. Built like the Home photos editor: change, then Save.
export default function ExploreEditor() {
  const [pieces, setPieces] = useState(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [saveState, setSaveState] = useState({ status: 'idle' })

  useEffect(() => {
    api.get('/api/admin/explore-pieces')
      .then((loaded) => setPieces(loaded.map(withKey)))
      .catch((problem) => setSaveState({ status: 'error', message: problem.message }))
  }, [])

  const changePieces = (change) => {
    setPieces(change)
    setHasUnsavedChanges(true)
    setSaveState({ status: 'idle' })
  }

  const changePiece = (key, changes) =>
    changePieces((list) => list.map((piece) => (piece.key === key ? { ...piece, ...changes } : piece)))

  const movePiece = (index, step) =>
    changePieces((list) => {
      const reordered = [...list]
      const [moved] = reordered.splice(index, 1)
      reordered.splice(index + step, 0, moved)
      return reordered
    })

  // New pieces go first: the top of the Explore page is where visitors look
  const addPiece = (mediaUrl, kind, size) =>
    changePieces((list) => [withKey({ ...EMPTY_PIECE, mediaUrl, ...size }), ...list])

  const save = async () => {
    setSaveState({ status: 'saving' })
    try {
      const saved = await api.put('/api/admin/explore-pieces', pieces.map(({ key, ...piece }) => piece))
      setPieces(saved.map(withKey))
      setHasUnsavedChanges(false)
      setSaveState({ status: 'saved' })
    } catch (problem) {
      setSaveState({ status: 'error', message: problem.message })
    }
  }

  return (
    <main className="admin-page">
      <div className="admin-page__head">
        <div>
          <h1>Explore</h1>
          <p className="admin-muted">Designs, inspirations and assets. Each piece shows in the wall in this order; a Banner runs across the page.</p>
        </div>
        <div className="admin-page__actions">
          <span className="editor-bar__status">
            {saveState.status === 'saving' && 'Saving…'}
            {saveState.status === 'saved' && 'Saved'}
            {saveState.status === 'idle' && hasUnsavedChanges && 'Unsaved changes'}
          </span>
          {pieces && <MediaUpload label="+ Add photo or video" accept="any" onUploaded={addPiece} />}
          <button className="admin-button admin-button--primary" onClick={save} disabled={!pieces || saveState.status === 'saving'}>
            Save
          </button>
        </div>
      </div>

      {saveState.status === 'error' && <p className="admin-error">{saveState.message}</p>}
      {!pieces && saveState.status !== 'error' && <p className="admin-muted">Loading pieces…</p>}
      {pieces?.length === 0 && <p className="admin-muted">No pieces yet. Add a photo or video to start the wall.</p>}

      {pieces && (
        <ol className="photo-rows">
          {pieces.map((piece, index) => (
            <li key={piece.key} className="photo-row">
              {/* The preview takes the piece's shape, so you see the crop the wall will show */}
              <div className="explore-row__preview" style={{ aspectRatio: ratioOf(piece) }}>
                {stillOf(piece.mediaUrl, 400) && <img src={stillOf(piece.mediaUrl, 400)} alt="" />}
              </div>

              <div className="photo-row__fields">
                <div className="editor-field-pair">
                  <label className="editor-field">
                    Shape
                    <select value={piece.shape} onChange={(e) => changePiece(piece.key, { shape: e.target.value })}>
                      {Object.entries(EXPLORE_SHAPES).map(([value, { label }]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="editor-field">
                    Type <span className="admin-muted">(shown when it's opened)</span>
                    <select value={piece.category ?? ''} onChange={(e) => changePiece(piece.key, { category: e.target.value || null })}>
                      <option value="">None</option>
                      {Object.entries(EXPLORE_CATEGORIES).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="editor-field">
                  Title <span className="admin-muted">(also read out by screen readers)</span>
                  <input value={piece.title} onChange={(e) => changePiece(piece.key, { title: e.target.value })} />
                </label>
                <label className="editor-field">
                  Caption <span className="admin-muted">(optional)</span>
                  <textarea
                    rows={2}
                    value={piece.caption ?? ''}
                    onChange={(e) => changePiece(piece.key, { caption: e.target.value || null })}
                  />
                </label>
                <div className="editor-field-pair">
                  <label className="editor-field">
                    Link text <span className="admin-muted">(optional)</span>
                    <input
                      placeholder="See it on Behance"
                      value={piece.linkLabel ?? ''}
                      onChange={(e) => changePiece(piece.key, { linkLabel: e.target.value || null })}
                    />
                  </label>
                  <label className="editor-field">
                    Link address
                    <input
                      placeholder="https://…"
                      value={piece.linkUrl ?? ''}
                      onChange={(e) => changePiece(piece.key, { linkUrl: e.target.value || null })}
                    />
                  </label>
                </div>
              </div>

              <div className="photo-row__actions">
                <button className="admin-button" onClick={() => movePiece(index, -1)} disabled={index === 0} aria-label="Move up">↑</button>
                <button className="admin-button" onClick={() => movePiece(index, 1)} disabled={index === pieces.length - 1} aria-label="Move down">↓</button>
                <MediaUpload
                  label="Replace"
                  accept="any"
                  onUploaded={(mediaUrl, kind, size) => changePiece(piece.key, { mediaUrl, ...size })}
                />
                <button
                  className="admin-button admin-button--danger"
                  onClick={() => changePieces((list) => list.filter((item) => item.key !== piece.key))}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </main>
  )
}

const EMPTY_PIECE = {
  mediaUrl: '', shape: 'natural', width: null, height: null,
  category: null, title: '', caption: null, linkLabel: null, linkUrl: null,
}

// A key that stays with each piece while the list is reordered (React needs one)
function withKey(piece) {
  return { ...piece, key: crypto.randomUUID() }
}
