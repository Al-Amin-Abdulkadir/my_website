import { useEffect, useState } from 'react'
import { api } from './api'
import MediaUpload from './MediaUpload'

// /admin/home-photos — the photos in the Home page cloud. Each one can have a
// caption and a link, shown when a visitor clicks the photo to bring it forward.

// Measured: past 16 photos the cloud starts to crowd on phones, and past 20 photos
// start hiding each other. The API refuses more than MAX_HOME_PHOTOS too.
const CROWDED_AFTER = 16
const MAX_HOME_PHOTOS = 20

export default function HomePhotosEditor() {
  const [photos, setPhotos] = useState(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [saveState, setSaveState] = useState({ status: 'idle' })

  useEffect(() => {
    api.get('/api/admin/home-photos')
      .then((loaded) => setPhotos(loaded.map(withKey)))
      .catch((problem) => setSaveState({ status: 'error', message: problem.message }))
  }, [])

  const changePhotos = (change) => {
    setPhotos(change)
    setHasUnsavedChanges(true)
    setSaveState({ status: 'idle' })
  }

  const changePhoto = (key, changes) =>
    changePhotos((list) => list.map((photo) => (photo.key === key ? { ...photo, ...changes } : photo)))

  const movePhoto = (index, step) =>
    changePhotos((list) => {
      const reordered = [...list]
      const [moved] = reordered.splice(index, 1)
      reordered.splice(index + step, 0, moved)
      return reordered
    })

  const save = async () => {
    setSaveState({ status: 'saving' })
    try {
      const saved = await api.put('/api/admin/home-photos', photos.map(({ key, ...photo }) => photo))
      setPhotos(saved.map(withKey))
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
          <h1>Home photos</h1>
          <p className="admin-muted">Each photo or video appears once in the Home cloud. Captions and links show when it’s clicked.</p>
        </div>
        <div className="admin-page__actions">
          <span className="editor-bar__status">
            {saveState.status === 'saving' && 'Saving…'}
            {saveState.status === 'saved' && 'Saved'}
            {saveState.status === 'idle' && hasUnsavedChanges && 'Unsaved changes'}
          </span>
          {photos && <PhotoCount count={photos.length} />}
          {/* At the limit, the button is swapped for a note: an upload would only be refused at Save */}
          {photos && photos.length < MAX_HOME_PHOTOS && (
            <MediaUpload
              label="+ Add photo or video"
              accept="any"
              onUploaded={(imageUrl) => changePhotos((list) => [...list, withKey({ imageUrl, alt: '', caption: null, linkLabel: null, linkUrl: null })])}
            />
          )}
          <button className="admin-button admin-button--primary" onClick={save} disabled={!photos || saveState.status === 'saving'}>
            Save
          </button>
        </div>
      </div>

      {saveState.status === 'error' && <p className="admin-error">{saveState.message}</p>}
      {!photos && saveState.status !== 'error' && <p className="admin-muted">Loading photos…</p>}

      {photos && (
        <ol className="photo-rows">
          {photos.map((photo, index) => (
            <li key={photo.key} className="photo-row">
              {/\.(mp4|webm|mov)$/i.test(photo.imageUrl)
                ? <video className="photo-row__image" src={photo.imageUrl} muted loop autoPlay playsInline />
                : <img className="photo-row__image" src={photo.imageUrl} alt="" />}

              <div className="photo-row__fields">
                <label className="editor-field">
                  Caption
                  <textarea
                    rows={2}
                    placeholder="A sentence about this photo"
                    value={photo.caption ?? ''}
                    onChange={(e) => changePhoto(photo.key, { caption: e.target.value || null })}
                  />
                </label>
                <div className="editor-field-pair">
                  <label className="editor-field">
                    Link text <span className="admin-muted">(optional)</span>
                    <input
                      placeholder="See the project"
                      value={photo.linkLabel ?? ''}
                      onChange={(e) => changePhoto(photo.key, { linkLabel: e.target.value || null })}
                    />
                  </label>
                  <label className="editor-field">
                    Link address
                    <input
                      placeholder="/project/nomad or https://…"
                      value={photo.linkUrl ?? ''}
                      onChange={(e) => changePhoto(photo.key, { linkUrl: e.target.value || null })}
                    />
                  </label>
                </div>
                <label className="editor-field">
                  Image description <span className="admin-muted">(for screen readers)</span>
                  <input value={photo.alt} onChange={(e) => changePhoto(photo.key, { alt: e.target.value })} />
                </label>
              </div>

              <div className="photo-row__actions">
                <button className="admin-button" onClick={() => movePhoto(index, -1)} disabled={index === 0}>↑</button>
                <button className="admin-button" onClick={() => movePhoto(index, 1)} disabled={index === photos.length - 1}>↓</button>
                <MediaUpload label="Replace" accept="any" onUploaded={(imageUrl) => changePhoto(photo.key, { imageUrl })} />
                <button
                  className="admin-button admin-button--danger"
                  onClick={() => changePhotos((list) => list.filter((item) => item.key !== photo.key))}
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

// "12 of 20" — with a warning once the cloud starts to get crowded
function PhotoCount({ count }) {
  if (count >= MAX_HOME_PHOTOS) {
    return <span className="photo-count photo-count--full">{count} of {MAX_HOME_PHOTOS} — full. Remove one to add another.</span>
  }
  if (count > CROWDED_AFTER) {
    return <span className="photo-count photo-count--crowded">{count} of {MAX_HOME_PHOTOS} — more than {CROWDED_AFTER} can feel crowded on phones</span>
  }
  return <span className="photo-count">{count} of {MAX_HOME_PHOTOS}</span>
}

function withKey(photo) {
  return { ...photo, key: crypto.randomUUID() }
}
