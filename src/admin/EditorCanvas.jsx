import MediaUpload from './MediaUpload'
import AddContentButtons from './AddContentButtons'
import FramingDragArea from './FramingDragArea'
import { ColumnDivider, MediaResizeHandles } from './ResizeHandles'
import { CanvasDragArea, ColumnDropArea, columnId, PAGE, useDraggableBlock } from './CanvasDragging'
import { BlockMedia, blockFrame, framingOf, isEmptySpot, layoutFrame } from '../components/blocks/EntryBlocks'
import { EntryHeader } from '../pages/EntryPage'
import {
  addColumn, addItem, dropOnto, MAX_COLUMNS, MIN_COLUMNS, moveBlockTo, moveItem, newItem, removeColumn,
  newBlockContent, removeItem, replaceItem, setWidths, updateItem, WIDTH_CHOICES,
} from './layouts'

// The middle of the editor: the entry drawn with the real page styles, so what you
// see here is what visitors will see. Hover (or click into) a block for its toolbar.
// Layout blocks show their columns, each with its own items and "+" buttons.
// Grab any ⠿ handle and drop the block on another one to swap them — on the page,
// in a layout, or between the two — on an empty photo spot to fill it, or on a
// column's empty space to move it there (CanvasDragging.jsx). Drag a photo's edges, or the line between
// two columns, to resize them (ResizeHandles.jsx).

const WIDTHS = [25, 33, 50, 66, 75, 100]

// Only a cropped photo has hidden parts to bring into view by dragging. "Fill" with
// no fixed height shows the whole photo (see mediaStyle), so there's nothing to move.
function isCropped(content) {
  const { fit } = framingOf(content)
  return fit === 'crop' || (fit === 'fill' && Boolean(content.height))
}

// The usual widths, plus the current one if it was dragged to something else (e.g. 62%)
function widthChoices(currentWidth) {
  if (WIDTHS.includes(currentWidth)) return WIDTHS
  return [...WIDTHS, currentWidth].sort((a, b) => a - b)
}

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

  // Layouts are edited as a whole: the layout functions hand back a new copy
  const replaceContent = (key, content) =>
    updateBlocks((blocks) => blocks.map((block) => (block.key === key ? { ...block, content } : block)))

  // An empty photo spot that's been filled can become a video, so the whole block changes
  const replaceBlock = (key, replacement) =>
    updateBlocks((blocks) => blocks.map((block) => (block.key === key ? replacement : block)))

  return (
    <main className="editor-canvas detail-page" data-lenis-prevent>
      <EntryHeader entry={entry} />

      {entry.blocks.length === 0 && (
        <p className="editor-empty">This page is empty. Add a heading, text, image or video from the panel on the right →</p>
      )}

      <CanvasDragArea
        blocks={entry.blocks}
        onDropOnto={(key, targetKey) => updateBlocks((blocks) => dropOnto(blocks, key, targetKey))}
        onMove={(key, target) => updateBlocks((blocks) => moveBlockTo(blocks, key, target))}
      >
        {entry.blocks.map((block, index) => (
          <PageBlock
            key={block.key}
            block={block}
            isFirst={index === 0}
            isLast={index === entry.blocks.length - 1}
            onMove={(step) => moveBlock(index, step)}
            onChange={(changes) => changeContent(block.key, changes)}
            onReplaceContent={(content) => replaceContent(block.key, content)}
            onReplace={(replacement) => replaceBlock(block.key, replacement)}
            onRemove={() => removeBlock(block.key)}
          />
        ))}
      </CanvasDragArea>
    </main>
  )
}

// One block on the page: a layout, or a single heading/text/image/video
function PageBlock({ block, isFirst, isLast, onMove, onChange, onReplaceContent, onReplace, onRemove }) {
  const drag = useDraggableBlock(block.key, PAGE, block.type)

  if (block.type === 'layout') {
    return (
      <section ref={drag.ref} className={`editor-block editor-block--layout ${drag.className}`}>
        <LayoutToolbar
          content={block.content}
          dragHandle={drag.handleProps}
          isFirst={isFirst}
          isLast={isLast}
          onMove={onMove}
          onChange={onReplaceContent}
          onRemove={onRemove}
        />
        <div className="entry-block entry-block--layout">
          <EditableLayout layoutKey={block.key} content={block.content} onChange={onReplaceContent} />
        </div>
      </section>
    )
  }

  return (
    <section ref={drag.ref} className={`editor-block ${drag.className}`}>
      <BlockToolbar
        block={block}
        dragHandle={drag.handleProps}
        isFirst={isFirst}
        isLast={isLast}
        onMove={onMove}
        onChange={onChange}
        onRemove={onRemove}
      />
      <EditableBlockWithFrame block={block} onChange={onChange} onReplace={onReplace} />
    </section>
  )
}

// A layout's columns. Each column takes drops and has its own "+" buttons.
function EditableLayout({ layoutKey, content, onChange }) {
  const canRemoveColumn = content.columns.length > MIN_COLUMNS

  return (
    <div {...layoutFrame(content)}>
      {content.columns.map((column, columnIndex) => (
        <ColumnDropArea
          key={columnIndex}
          layoutKey={layoutKey}
          columnIndex={columnIndex}
          itemCount={column.items.length}
          className="entry-layout__column editor-column"
        >
          {column.items.map((item, itemIndex) => (
            <ColumnItem
              key={item.key}
              item={item}
              columnWidth={column.width}
              container={columnId(layoutKey, columnIndex)}
              isFirst={itemIndex === 0}
              isLast={itemIndex === column.items.length - 1}
              onMove={(step) => onChange(moveItem(content, { columnIndex, itemIndex }, { columnIndex, itemIndex: itemIndex + step }))}
              onChange={(changes) => onChange(updateItem(content, columnIndex, itemIndex, changes))}
              onReplace={(replacement) => onChange(replaceItem(content, columnIndex, itemIndex, replacement))}
              onRemove={() => onChange(removeItem(content, columnIndex, itemIndex))}
            />
          ))}

          <div className="editor-column__footer">
            <AddContentButtons
              className="editor-column__add"
              buttonClassName="editor-column__button"
              onAdd={(type, itemContent) => onChange(addItem(content, columnIndex, newItem(type, itemContent)))}
            />
            {canRemoveColumn && (
              <button
                className="editor-column__button editor-column__button--remove"
                onClick={() => onChange(removeColumn(content, columnIndex))}
                title="Its items move to the next column"
              >
                Remove column
              </button>
            )}
          </div>
          {columnIndex < content.columns.length - 1 && (
            <ColumnDivider content={content} dividerIndex={columnIndex} onChange={onChange} />
          )}
        </ColumnDropArea>
      ))}
    </div>
  )
}

// One heading/text/image/video inside a layout column
function ColumnItem({ item, columnWidth, container, isFirst, isLast, onMove, onChange, onReplace, onRemove }) {
  const drag = useDraggableBlock(item.key, container, item.type)
  return (
    <div ref={drag.ref} className={`editor-block editor-item ${drag.className}`}>
      <BlockToolbar
        block={item}
        dragHandle={drag.handleProps}
        isFirst={isFirst}
        isLast={isLast}
        onMove={onMove}
        onChange={onChange}
        onRemove={onRemove}
      />
      <EditableBlockWithFrame block={item} columnWidth={columnWidth} onChange={onChange} onReplace={onReplace} />
    </div>
  )
}

// A block (or a layout item) drawn the way the site draws it, plus the image's alt text box.
// A layout item passes its column's width, so its phone shape matches the site's.
function EditableBlockWithFrame({ block, columnWidth = 100, onChange, onReplace }) {
  if (isEmptySpot(block)) return <EmptySpot block={block} onReplace={onReplace} />

  return (
    <>
      <div {...blockFrame(block, '', columnWidth)}>
        <EditableBlock block={block} onChange={onChange} />
      </div>
      {block.type === 'image' && (
        <input
          className="editor-alt"
          placeholder="Describe this image (for screen readers)"
          value={block.content.alt ?? ''}
          onChange={(e) => onChange({ alt: e.target.value })}
        />
      )}
    </>
  )
}

// A photo spot from a layout preset, waiting for a file. Upload into it, or drag an
// existing photo onto it to fill it. Visitors never see an empty spot.
function EmptySpot({ block, onReplace }) {
  return (
    <div className="editor-empty-spot">
      <MediaUpload
        label="+ Image or video"
        accept="any"
        className="editor-column__button"
        // keep the key, so React treats it as the same spot, now filled
        onUploaded={(src, kind) => onReplace({ key: block.key, type: kind, content: newBlockContent(kind, src) })}
      />
      <span>or drag a photo here</span>
    </div>
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

  // Photos and videos: in Fill or Crop, drag the photo inside its box
  if (block.type === 'image' || block.type === 'video') {
    return (
      <BlockMedia type={block.type} content={content} imageWidth={1600}>
        {isCropped(content) && <FramingDragArea content={content} onChange={onChange} />}
        <MediaResizeHandles content={content} onChange={onChange} />
      </BlockMedia>
    )
  }

  return null
}

// The dark bar above a layout: move it, choose the column split and the gap, line
// the columns up, add a column, remove it
function LayoutToolbar({ content, dragHandle, isFirst, isLast, onMove, onChange, onRemove }) {
  const currentSplit = content.columns.map((column) => column.width).join('/')
  const splits = WIDTH_CHOICES[content.columns.length].map((widths) => widths.join('/'))
  if (!splits.includes(currentSplit)) splits.unshift(currentSplit)   // a split made some other way still shows

  return (
    <div className="editor-block__toolbar">
      <DragHandle handleProps={dragHandle} />
      <span className="editor-toolbar__label">Layout</span>
      <button onClick={() => onMove(-1)} disabled={isFirst} title="Move up">↑</button>
      <button onClick={() => onMove(1)} disabled={isLast} title="Move down">↓</button>

      <label className="editor-toolbar__field">
        Columns
        <select
          value={currentSplit}
          onChange={(e) => onChange(setWidths(content, e.target.value.split('/').map(Number)))}
        >
          {splits.map((split) => <option key={split} value={split}>{split.replaceAll('/', ' / ')}</option>)}
        </select>
      </label>

      <label className="editor-toolbar__field">
        Gap
        <select value={content.gap ?? 'medium'} onChange={(e) => onChange({ ...content, gap: e.target.value })}>
          {[['none', 'None'], ['small', 'Small'], ['medium', 'Medium'], ['large', 'Large']].map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </label>

      <span className="editor-toolbar__group" role="group" aria-label="Line up columns">
        {[['top', 'Top'], ['center', 'Middle'], ['bottom', 'Bottom']].map(([value, label]) => (
          <button
            key={value}
            className={content.vertical === value ? 'is-active' : ''}
            onClick={() => onChange({ ...content, vertical: value })}
          >
            {label}
          </button>
        ))}
      </span>

      <button onClick={() => onChange(addColumn(content))} disabled={content.columns.length >= MAX_COLUMNS}>
        + Column
      </button>
      <button onClick={onRemove} className="editor-block__remove" title="Remove the layout and everything in it">Remove</button>
    </div>
  )
}

// The dark bar above a block: drag, move, place left/middle/right, size, replace, remove
function BlockToolbar({ block, dragHandle, isFirst, isLast, onMove, onChange, onRemove }) {
  const { content } = block
  // an empty spot has no file yet, so there's nothing to size, frame or replace
  const isMedia = (block.type === 'image' || block.type === 'video') && !isEmptySpot(block)

  return (
    <div className="editor-block__toolbar">
      <DragHandle handleProps={dragHandle} />
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
              {widthChoices(content.width).map((width) => <option key={width} value={width}>{width}%</option>)}
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

      {isMedia && <FramingControls content={content} onChange={onChange} />}

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

// Fit / Fill / Crop, like Figma — and in Crop, how far to zoom in
function FramingControls({ content, onChange }) {
  const { fit, zoom } = framingOf(content)
  const titles = {
    fit: 'Show the whole photo',
    fill: 'Cover the box — drag the photo to choose what stays in view',
    crop: 'Zoom in, then drag the photo to frame it',
  }

  return (
    <>
      <span className="editor-toolbar__group" role="group" aria-label="Framing">
        {[['fit', 'Fit'], ['fill', 'Fill'], ['crop', 'Crop']].map(([value, label]) => (
          <button
            key={value}
            className={fit === value ? 'is-active' : ''}
            title={titles[value]}
            onClick={() => onChange({ fit: value })}
          >
            {label}
          </button>
        ))}
      </span>
      {fit === 'crop' && (
        <label className="editor-toolbar__field">
          Zoom
          <input
            className="editor-toolbar__zoom"
            type="range"
            min="1"
            max="4"
            step="0.05"
            value={zoom}
            onChange={(e) => onChange({ zoom: Number(e.target.value) })}
          />
          {Math.round(zoom * 100)}%
        </label>
      )}
    </>
  )
}

// Grab this to drag the block anywhere: up/down the page, into or out of a layout
function DragHandle({ handleProps }) {
  return (
    <button className="editor-drag-handle" title="Drag to move" aria-label="Drag to move" {...handleProps}>
      ⠿
    </button>
  )
}
