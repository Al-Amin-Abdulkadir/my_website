import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from './api'
import EditorCanvas from './EditorCanvas'
import EntrySettings from './EntrySettings'
import { withEditorKeys, withoutEditorKeys } from './layouts'

// A Behance-style editor for a project, case study or page (About). The canvas in
// the middle shows it as it will look on the site; the panel on the right adds
// content and edits the details. Nothing reaches the site until you press Save.

// Where each kind of entry lives on the public site
const SITE_ADDRESS = { project: '/project/', case_study: '/case-study/', page: '/' }

export default function EntryEditor({ loadPath, backTo }) {
  const navigate = useNavigate()
  const [entry, setEntry] = useState(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [saveState, setSaveState] = useState({ status: 'idle' })   // idle | saving | saved | error
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    api.get(loadPath)
      .then((loaded) => setEntry(withBlockKeys(loaded)))
      .catch((problem) => setLoadError(problem.message))
  }, [loadPath])

  // Warn before closing the tab with unsaved work
  useEffect(() => {
    if (!hasUnsavedChanges) return
    const warn = (event) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [hasUnsavedChanges])

  // Every edit goes through here, so "unsaved changes" is always accurate
  const updateEntry = (changes) => {
    setEntry((current) => ({ ...current, ...changes }))
    setHasUnsavedChanges(true)
    setSaveState({ status: 'idle' })
  }

  const updateBlocks = (changeBlocks) => {
    setEntry((current) => ({ ...current, blocks: changeBlocks(current.blocks) }))
    setHasUnsavedChanges(true)
    setSaveState({ status: 'idle' })
  }

  const save = async () => {
    setSaveState({ status: 'saving' })
    try {
      const saved = await api.put(`/api/admin/entries/${entry.id}`, {
        ...entry,
        blocks: entry.blocks.map(withoutEditorKeys),   // the editor-only keys stay here
      })
      setEntry(withBlockKeys(saved))
      setHasUnsavedChanges(false)
      setSaveState({ status: 'saved' })
    } catch (problem) {
      setSaveState({ status: 'error', message: problem.message })
    }
  }

  const deleteEntry = async () => {
    if (!window.confirm(`Delete “${entry.title}” for good? This can’t be undone.`)) return
    try {
      await api.delete(`/api/admin/entries/${entry.id}`)
      navigate(backTo.to)
    } catch (problem) {
      setSaveState({ status: 'error', message: problem.message })
    }
  }

  if (loadError) return <main className="admin-page"><p className="admin-error">{loadError}</p></main>
  if (!entry) return <main className="admin-page"><p className="admin-muted">Loading…</p></main>

  return (
    <div className="editor">
      <div className="editor-bar">
        {backTo
          ? <Link to={backTo.to} className="editor-bar__back">← {backTo.label}</Link>
          : <span className="editor-bar__back">{entry.title}</span>}
        <span className="editor-bar__status">
          {saveState.status === 'saving' && 'Saving…'}
          {saveState.status === 'saved' && 'Saved'}
          {saveState.status === 'idle' && hasUnsavedChanges && 'Unsaved changes'}
        </span>
        {/* A "coming soon" entry can't be opened on the site yet, so there's nothing to view */}
        {entry.isPublished && !entry.isComingSoon && (
          <a href={`${SITE_ADDRESS[entry.kind]}${entry.slug}`} target="_blank" rel="noreferrer" className="admin-button">
            View on site ↗
          </a>
        )}
        <button className="admin-button admin-button--primary" onClick={save} disabled={saveState.status === 'saving'}>
          Save
        </button>
      </div>
      {saveState.status === 'error' && <p className="admin-error editor-error">{saveState.message}</p>}

      <div className="editor-body">
        <EditorCanvas entry={entry} updateBlocks={updateBlocks} />
        <EntrySettings
          entry={entry}
          siteAddress={SITE_ADDRESS[entry.kind]}
          updateEntry={updateEntry}
          updateBlocks={updateBlocks}
          onDelete={entry.kind === 'page' ? null : deleteEntry}
        />
      </div>
    </div>
  )
}

// React needs a stable name for each block (and each item inside a layout) so
// moving things around doesn't mix up which text box is which. These keys exist
// only in the editor.
function withBlockKeys(entry) {
  return { ...entry, blocks: entry.blocks.map(withEditorKeys) }
}
