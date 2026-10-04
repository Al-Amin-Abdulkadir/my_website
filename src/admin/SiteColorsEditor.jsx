import { useEffect, useState } from 'react'
import { api } from './api'
import { DEFAULT_COLORS, PALETTE, contrastRatio, hexOf, readability } from '../data/palette'

// /admin/colors — choose the site's background and text colour from the muted
// palette. The preview and readability meter update as you pick; nothing changes
// on the site until you press Save.
export default function SiteColorsEditor() {
  const [colors, setColors] = useState(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [saveState, setSaveState] = useState({ status: 'idle' })

  useEffect(() => {
    api.get('/api/site-settings')
      .then(setColors)
      .catch((problem) => setSaveState({ status: 'error', message: problem.message }))
  }, [])

  const choose = (changes) => {
    setColors((current) => ({ ...current, ...changes }))
    setHasUnsavedChanges(true)
    setSaveState({ status: 'idle' })
  }

  const save = async () => {
    setSaveState({ status: 'saving' })
    try {
      setColors(await api.put('/api/admin/site-settings', colors))
      setHasUnsavedChanges(false)
      setSaveState({ status: 'saved' })
    } catch (problem) {
      setSaveState({ status: 'error', message: problem.message })
    }
  }

  if (!colors) {
    return (
      <main className="admin-page">
        {saveState.status === 'error' ? <p className="admin-error">{saveState.message}</p> : <p className="admin-muted">Loading…</p>}
      </main>
    )
  }

  const background = hexOf(colors.backgroundColor)
  const text = hexOf(colors.textColor)
  const ratio = contrastRatio(background, text)
  const verdict = readability(ratio)
  const isSameColor = colors.backgroundColor === colors.textColor

  return (
    <main className="admin-page">
      <div className="admin-page__head">
        <div>
          <h1>Site colours</h1>
          <p className="admin-muted">The background and text colour of the whole public site.</p>
        </div>
        <div className="admin-page__actions">
          <span className="editor-bar__status">
            {saveState.status === 'saving' && 'Saving…'}
            {saveState.status === 'saved' && 'Saved — refresh the site to see it'}
            {saveState.status === 'idle' && hasUnsavedChanges && 'Unsaved changes'}
          </span>
          <button
            className="admin-button"
            onClick={() => choose(DEFAULT_COLORS)}
          >
            Back to the original
          </button>
          <button
            className="admin-button admin-button--primary"
            onClick={save}
            disabled={saveState.status === 'saving' || isSameColor}
          >
            Save
          </button>
        </div>
      </div>
      {saveState.status === 'error' && <p className="admin-error">{saveState.message}</p>}

      <div className="colors-layout">
        <div>
          <SwatchPicker
            title="Background"
            selected={colors.backgroundColor}
            onPick={(backgroundColor) => choose({ backgroundColor })}
          />
          <SwatchPicker
            title="Text"
            selected={colors.textColor}
            onPick={(textColor) => choose({ textColor })}
          />
        </div>

        <div>
          {/* A small piece of the site in the chosen colours */}
          <div className="colors-preview" style={{ background, color: text }}>
            <p className="colors-preview__title">Dearest Reader…</p>
            <p className="colors-preview__body">
              This is how headings and paragraphs will look across the site, on every page.
            </p>
            <span className="colors-preview__line" style={{ background: text }} />
          </div>

          <p className={`colors-meter colors-meter--${isSameColor ? 'poor' : verdict.level}`}>
            {isSameColor
              ? 'The text and background are the same colour — the words would disappear.'
              : <>Readability {ratio.toFixed(1)} : 1 — {verdict.label}</>}
          </p>
        </div>
      </div>
    </main>
  )
}

function SwatchPicker({ title, selected, onPick }) {
  return (
    <fieldset className="swatches">
      <legend>{title}</legend>
      <div className="swatches__grid">
        {PALETTE.map((color) => (
          <button
            key={color.key}
            type="button"
            className={`swatch ${selected === color.key ? 'is-selected' : ''}`}
            onClick={() => onPick(color.key)}
            aria-pressed={selected === color.key}
          >
            <span className="swatch__chip" style={{ background: color.hex }} />
            <span className="swatch__name">{color.name}</span>
          </button>
        ))}
      </div>
    </fieldset>
  )
}
