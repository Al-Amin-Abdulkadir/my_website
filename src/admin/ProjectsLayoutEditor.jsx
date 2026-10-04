import { useEffect, useState } from 'react'
import { api } from './api'

// /admin/projects-layout — the order of the Projects page grid. Each row is a
// "feature" (one big project) or a "pair" (a large and a small project side by side).
export default function ProjectsLayoutEditor() {
  const [rows, setRows] = useState(null)
  const [projects, setProjects] = useState([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [saveState, setSaveState] = useState({ status: 'idle' })

  useEffect(() => {
    Promise.all([api.get('/api/admin/projects-page-rows'), api.get('/api/admin/entries?kind=project')])
      .then(([loadedRows, loadedProjects]) => {
        setRows(loadedRows.map(toEditableRow))
        setProjects(loadedProjects)
      })
      .catch((problem) => setSaveState({ status: 'error', message: problem.message }))
  }, [])

  const changeRows = (change) => {
    setRows(change)
    setHasUnsavedChanges(true)
    setSaveState({ status: 'idle' })
  }

  const changeRow = (key, changes) =>
    changeRows((list) => list.map((row) => (row.key === key ? { ...row, ...changes } : row)))

  const moveRow = (index, step) =>
    changeRows((list) => {
      const reordered = [...list]
      const [moved] = reordered.splice(index, 1)
      reordered.splice(index + step, 0, moved)
      return reordered
    })

  const save = async () => {
    setSaveState({ status: 'saving' })
    try {
      const saved = await api.put('/api/admin/projects-page-rows', rows.map(({ key, ...row }) => row))
      setRows(saved.map(toEditableRow))
      setHasUnsavedChanges(false)
      setSaveState({ status: 'saved' })
    } catch (problem) {
      setSaveState({ status: 'error', message: problem.message })
    }
  }

  const placedIds = new Set(rows?.flatMap((row) => [row.mainProjectId, row.secondProjectId]) ?? [])
  const unplaced = projects.filter((project) => project.isPublished && !placedIds.has(project.id))

  return (
    <main className="admin-page">
      <div className="admin-page__head">
        <div>
          <h1>Projects page layout</h1>
          <p className="admin-muted">The rows of the Projects page, top to bottom.</p>
        </div>
        <div className="admin-page__actions">
          <span className="editor-bar__status">
            {saveState.status === 'saving' && 'Saving…'}
            {saveState.status === 'saved' && 'Saved'}
            {saveState.status === 'idle' && hasUnsavedChanges && 'Unsaved changes'}
          </span>
          <button
            className="admin-button"
            disabled={!rows || projects.length === 0}
            onClick={() => changeRows((list) => [...list, toEditableRow({ type: 'feature', mainProject: projects[0] })])}
          >
            + Add row
          </button>
          <button className="admin-button admin-button--primary" onClick={save} disabled={!rows || saveState.status === 'saving'}>
            Save
          </button>
        </div>
      </div>

      {saveState.status === 'error' && <p className="admin-error">{saveState.message}</p>}
      {!rows && saveState.status !== 'error' && <p className="admin-muted">Loading…</p>}

      {rows && (
        <ol className="layout-rows">
          {rows.map((row, index) => (
            <li key={row.key} className="layout-row">
              <span className="layout-row__number">{index + 1}</span>

              <label className="editor-field">
                Row type
                <select
                  value={row.type}
                  onChange={(e) => changeRow(row.key, e.target.value === 'pair'
                    ? { type: 'pair', secondProjectId: row.secondProjectId ?? projects[0]?.id, largeSide: row.largeSide ?? 'left' }
                    : { type: 'feature', secondProjectId: null, largeSide: null })}
                >
                  <option value="feature">Feature — one big project</option>
                  <option value="pair">Pair — large + small</option>
                </select>
              </label>

              <ProjectPicker
                label={row.type === 'pair' ? 'Large project' : 'Project'}
                projects={projects}
                value={row.mainProjectId}
                onChange={(mainProjectId) => changeRow(row.key, { mainProjectId })}
              />

              {row.type === 'pair' && (
                <>
                  <ProjectPicker
                    label="Small project"
                    projects={projects}
                    value={row.secondProjectId}
                    onChange={(secondProjectId) => changeRow(row.key, { secondProjectId })}
                  />
                  <label className="editor-field">
                    Large one on the
                    <select value={row.largeSide} onChange={(e) => changeRow(row.key, { largeSide: e.target.value })}>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </label>
                </>
              )}

              <div className="layout-row__actions">
                <button className="admin-button" onClick={() => moveRow(index, -1)} disabled={index === 0}>↑</button>
                <button className="admin-button" onClick={() => moveRow(index, 1)} disabled={index === rows.length - 1}>↓</button>
                <button
                  className="admin-button admin-button--danger"
                  onClick={() => changeRows((list) => list.filter((item) => item.key !== row.key))}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      {unplaced.length > 0 && (
        <p className="admin-muted layout-unplaced">
          Not in a row yet (they’ll appear at the end of the page as big feature rows):{' '}
          {unplaced.map((project) => project.title).join(', ')}
        </p>
      )}
    </main>
  )
}

function ProjectPicker({ label, projects, value, onChange }) {
  return (
    <label className="editor-field">
      {label}
      <select value={value ?? ''} onChange={(e) => onChange(Number(e.target.value))}>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.title}{project.isPublished ? '' : ' (draft)'}
          </option>
        ))}
      </select>
    </label>
  )
}

// The API's row shape → what the editor keeps (project ids + a key for React)
function toEditableRow(row) {
  return {
    key: crypto.randomUUID(),
    type: row.type,
    mainProjectId: row.mainProject?.id,
    secondProjectId: row.secondProject?.id ?? null,
    largeSide: row.largeSide ?? null,
  }
}
