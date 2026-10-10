import { useState } from 'react'
import MediaUpload from './MediaUpload'
import AddContentButtons from './AddContentButtons'
import { createLayout, LAYOUT_PRESETS, newItem } from './layouts'
import FramingDragArea from './FramingDragArea'
import { resizeCloudinaryImage } from '../data/cloudinary'
import { coverPositionOf, coverStyle, focusOfCoverPosition } from '../components/projects/coverFraming'

// The editor's right-hand panel: add content (like Behance's "Add Content"),
// then the entry's details. Pages like About only need a title and an intro.
export default function EntrySettings({ entry, siteAddress, updateEntry, updateBlocks, onDelete }) {
  const isPage = entry.kind === 'page'
  const addBlock = (type, content) => updateBlocks((blocks) => [...blocks, newItem(type, content)])

  return (
    <aside className="editor-panel" data-lenis-prevent>
      <section>
        <h2>Add content</h2>
        <AddContentButtons onAdd={addBlock} />

        <h3 className="editor-panel__subheading">Layouts</h3>
        <div className="layout-presets">
          {LAYOUT_PRESETS.map((preset) => (
            <button
              key={preset.name}
              className="layout-preset"
              onClick={() => addBlock('layout', createLayout(preset.name))}
            >
              <LayoutSketch preset={preset} />
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2>Details</h2>

        <label className="editor-field editor-field--row">
          <input
            type="checkbox"
            checked={entry.isPublished}
            onChange={(e) => updateEntry({ isPublished: e.target.checked })}
          />
          Published (visible on the site)
        </label>

        <label className="editor-field">
          Title
          <input value={entry.title} onChange={(e) => updateEntry({ title: e.target.value })} />
        </label>

        <label className="editor-field">
          Page address
          <span className="editor-field__prefix">
            {siteAddress}
            <input
              value={entry.slug}
              disabled={isPage}          // the site's menu links to /about — it can't move
              onChange={(e) => updateEntry({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
            />
          </span>
        </label>

        <label className="editor-field">
          Intro
          <textarea
            rows={5}
            value={entry.description ?? ''}
            onChange={(e) => updateEntry({ description: e.target.value || null })}
          />
        </label>

        {!isPage && (
          <>
            <TagsField tags={entry.tags} onChange={(tags) => updateEntry({ tags })} />

            <div className="editor-field">
              Cover image <span className="admin-muted">(shown in the grid)</span>
              {entry.coverUrl && <CoverFraming entry={entry} onChange={updateEntry} />}
              <MediaUpload
                label={entry.coverUrl ? 'Replace cover' : 'Upload cover'}
                onUploaded={(coverUrl) => updateEntry({ coverUrl })}
              />
            </div>

            <div className="editor-field-pair">
              <label className="editor-field">
                Category
                <input value={entry.category ?? ''} onChange={(e) => updateEntry({ category: e.target.value || null })} />
              </label>
              <label className="editor-field">
                Year
                <input value={entry.year ?? ''} onChange={(e) => updateEntry({ year: e.target.value || null })} />
              </label>
            </div>

            <label className="editor-field">
              GitHub link <span className="admin-muted">(optional)</span>
              <input value={entry.githubUrl ?? ''} onChange={(e) => updateEntry({ githubUrl: e.target.value || null })} />
            </label>
          </>
        )}
      </section>

      {onDelete && (
        <section>
          <button className="admin-button admin-button--danger" onClick={onDelete}>Delete</button>
        </section>
      )}
    </aside>
  )
}

// The box keeps exactly what you type (commas included); only the saved value is
// split into a list. Re-joining on every keystroke would swallow a comma the
// moment you typed it.
function TagsField({ tags, onChange }) {
  const [text, setText] = useState(tags.join(', '))

  return (
    <label className="editor-field">
      Tags <span className="admin-muted">(comma separated)</span>
      <input
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          const typed = e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean)
          onChange([...new Set(typed)])        // the same tag twice only counts once
        }}
      />
    </label>
  )
}

// A tiny drawing of a layout: columns at their real proportions, with lines for
// text and filled boxes for photos
function LayoutSketch({ preset }) {
  return (
    <span className="layout-sketch" style={{ gridTemplateColumns: preset.widths.map((width) => `${width}fr`).join(' ') }}>
      {preset.sketch.map((parts, columnIndex) => (
        <span key={columnIndex} className="layout-sketch__column">
          {parts.map((part, partIndex) => <span key={partIndex} className={`layout-sketch__${part}`} />)}
        </span>
      ))}
    </span>
  )
}

// The Projects list shows a cover in one of three fixed card shapes (from the design),
// always cropped to fill it. Here the cover is previewed in all three: drag any of
// them to choose what stays in view, and zoom in. It's one setting per project, so
// all the shapes (and the search thumbnail) move together.
const CARD_SHAPES = [
  { name: 'Wide', ratio: '1405 / 705' },
  { name: 'Large', ratio: '804 / 725' },
  { name: 'Small', ratio: '572 / 415' },
]

function CoverFraming({ entry, onChange }) {
  const focus = focusOfCoverPosition(entry.coverPosition)
  const zoom = entry.coverZoom ?? 1
  // FramingDragArea speaks the page editor's language (fit/focus/zoom); a cover is always "crop"
  const framing = { fit: 'crop', focus, zoom }
  const moveFocus = (changes) => onChange({ coverPosition: coverPositionOf(changes.focus) })

  return (
    <div className="cover-framing">
      <div className="cover-framing__shapes">
        {CARD_SHAPES.map((shape) => (
          <figure key={shape.name} className="cover-framing__shape">
            <div className="cover-framing__frame" style={{ aspectRatio: shape.ratio }}>
              <img src={resizeCloudinaryImage(entry.coverUrl, 800)} alt="" style={coverStyle(entry)} />
              <FramingDragArea content={framing} onChange={moveFocus} label={`${shape.name} card: drag to choose what stays in view`} />
            </div>
            <figcaption className="admin-muted">{shape.name}</figcaption>
          </figure>
        ))}
      </div>
      <label className="cover-framing__zoom">
        Zoom
        <input
          type="range"
          min="1"
          max="4"
          step="0.05"
          value={zoom}
          onChange={(e) => onChange({ coverZoom: Number(e.target.value) })}
        />
        <span className="admin-muted">{zoom.toFixed(2)}×</span>
      </label>
      <p className="admin-muted">Drag a preview to choose what stays in view.</p>
    </div>
  )
}
