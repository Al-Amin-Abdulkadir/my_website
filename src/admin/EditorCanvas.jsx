import MediaUpload from './MediaUpload'
import { blockFrame, BlockVideo } from '../components/blocks/EntryBlocks'
import { EntryHeader } from '../pages/EntryPage'
import { resizeCloudinaryImage } from '../data/projects'

// The middle of the editor: the entry drawn with the real page styles, so what you
// see here is what visitors will see. Hover (or click into) a block for its toolbar.

const WIDTHS = [25, 33, 50, 66, 75, 100]

export default function EditorCanvas({ entry, updateBlocks }) {
  const changeContent = (key, changes) =>
    updateBlocks((blocks) => blocks.map((block) =>
      block.key === key ? { ...block, content: { ...block.content, ...changes } } : block))

  const moveBlock = (index, step) =>
    updateBlocks((blocks) => {
      const reordered = [...blocks]
      const [moved] = reordered.splice(index, 1)
      reordered.splice(index + step, 0, moved)
      return reordered
    })

  const removeBlock = (key) => updateBlocks((blocks) => blocks.filter((block) => block.key !== key))

  return (
    <main className="editor-canvas detail-page" data-lenis-prevent>
      <EntryHeader entry={entry} />

      {entry.blocks.length === 0 && (
        <p className="editor-empty">This page is empty. Add a heading, text, image or video from the panel on the right →</p>
      )}

      {entry.blocks.map((block, index) => (
        <section key={block.key} className="editor-block">
          <BlockToolbar
            block={block}
            isFirst={index === 0}
            isLast={index === entry.blocks.length - 1}
            onMove={(step) => moveBlock(index, step)}
            onChange={(changes) => changeContent(block.key, changes)}
            onRemove={() => removeBlock(block.key)}
          />
          <div {...blockFrame(block)}>
            <EditableBlock block={block} onChange={(changes) => changeContent(block.key, changes)} />
          </div>
          {block.type === 'image' && (
            <input
              className="editor-alt"
              placeholder="Describe this image (for screen readers)"
              value={block.content.alt ?? ''}
              onChange={(e) => changeContent(block.key, { alt: e.target.value })}
            />
          )}
        </section>
      ))}
    </main>
  )
}

function EditableBlock({ block, onChange }) {
  const { content } = block

  if (block.type === 'heading') {
    return (
      <input
        className="entry-heading editor-inline"
        placeholder="Heading"
        value={content.text}
        onChange={(e) => onChange({ text: e.target.value })}
      />
    )
  }

  if (block.type === 'text') {
    return (
      <textarea
        className="entry-text editor-inline editor-text"
        placeholder="Write something… (leave an empty line to start a new paragraph)"
        value={content.body}
        rows={Math.max(3, content.body.split('\n').length + 1)}
        onChange={(e) => onChange({ body: e.target.value })}
      />
    )
  }

  if (block.type === 'image') {
    return (
      <img
        className={`entry-media ${content.height ? 'entry-media--fixed-height' : ''}`}
        src={resizeCloudinaryImage(content.src, 1600)}
        alt={content.alt}
      />
    )
  }

  if (block.type === 'video') return <BlockVideo content={content} />

  return null
}

// The dark bar above a block: move, place left/middle/right, size, replace, remove
function BlockToolbar({ block, isFirst, isLast, onMove, onChange, onRemove }) {
  const { content } = block
  const isMedia = block.type === 'image' || block.type === 'video'

  return (
    <div className="editor-block__toolbar">
      <button onClick={() => onMove(-1)} disabled={isFirst} title="Move up">↑</button>
      <button onClick={() => onMove(1)} disabled={isLast} title="Move down">↓</button>

      <span className="editor-toolbar__group" role="group" aria-label="Position">
        {[['left', 'Left'], ['center', 'Middle'], ['right', 'Right']].map(([value, label]) => (
          <button
            key={value}
            className={content.align === value ? 'is-active' : ''}
            onClick={() => onChange({ align: value })}
          >
            {label}
          </button>
        ))}
      </span>

      {isMedia && (
        <>
          <label className="editor-toolbar__field">
            Width
            <select value={content.width} onChange={(e) => onChange({ width: Number(e.target.value) })}>
              {WIDTHS.map((width) => <option key={width} value={width}>{width}%</option>)}
            </select>
          </label>
          <label className="editor-toolbar__field">
            Height
            <input
              type="number"
              min="50"
              max="3000"
              step="10"
              placeholder="auto"
              value={content.height ?? ''}
              onChange={(e) => onChange({ height: e.target.value === '' ? null : Number(e.target.value) })}
            />
            px
          </label>
        </>
      )}

      {block.type === 'video' && (
        <label className="editor-toolbar__field">
          <select value={content.playback} onChange={(e) => onChange({ playback: e.target.value })}>
            <option value="loop">Silent loop</option>
            <option value="controls">With controls</option>
          </select>
        </label>
      )}

      {isMedia && (
        <MediaUpload
          label="Replace"
          accept={block.type}
          className=""
          onUploaded={(src) => onChange({ src })}
        />
      )}

      <button onClick={onRemove} className="editor-block__remove" title="Remove block">Remove</button>
    </div>
  )
}
