import { useState } from 'react'
import MediaUpload from './MediaUpload'
import { resizeCloudinaryImage } from '../data/projects'

// The editor's right-hand panel: add content (like Behance's "Add Content"),
// then the entry's details. Pages like About only need a title and an intro.
export default function EntrySettings({ entry, siteAddress, updateEntry, updateBlocks, onDelete }) {
  const isPage = entry.kind === 'page'
  const addBlock = (type, content) =>
    updateBlocks((blocks) => [...blocks, { type, content, key: crypto.randomUUID() }])

  return (
    <aside className="editor-panel" data-lenis-prevent>
      <section>
        <h2>Add content</h2>
        <div className="editor-panel__add">
          <button className="editor-add-button" onClick={() => addBlock('heading', { text: '', align: 'left' })}>
            + Heading
          </button>
          <button className="editor-add-button" onClick={() => addBlock('text', { body: '', align: 'left' })}>
            + Text
          </button>
          <MediaUpload
            label="+ Image"
            accept="image"
            className="editor-add-button"
            onUploaded={(src) => addBlock('image', { src, alt: '', align: 'center', width: 100, height: null })}
          />
          <MediaUpload
            label="+ Video"
            accept="video"
            className="editor-add-button"
            onUploaded={(src) => addBlock('video', { src, align: 'center', width: 100, height: null, playback: 'loop' })}
          />
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
              {entry.coverUrl && (
                <img
                  className="editor-cover"
                  src={resizeCloudinaryImage(entry.coverUrl, 600)}
                  alt=""
                  style={{ objectPosition: entry.coverPosition }}
                />
              )}
              <MediaUpload
                label={entry.coverUrl ? 'Replace cover' : 'Upload cover'}
                onUploaded={(coverUrl) => updateEntry({ coverUrl })}
              />
            </div>

            <label className="editor-field">
              Keep this part of the cover in view
              <select value={entry.coverPosition} onChange={(e) => updateEntry({ coverPosition: e.target.value })}>
                <option value="center">Middle</option>
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
              </select>
            </label>

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
          onChange(e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean))
        }}
      />
    </label>
  )
}
