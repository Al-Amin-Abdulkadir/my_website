import { useRef, useState } from 'react'
import { LAPTOP_PAGE_WIDTH } from '../components/blocks/EntryBlocks'
import { setWidths } from './layouts'

// Drag-to-resize in the editor, like Figma:
//   MediaResizeHandles → the side, bottom and corner of a photo/video
//   ColumnDivider      → the line between two layout columns
// A badge shows the size while dragging. Each drag is measured from where it began,
// so small rounding never adds up.

const MIN_COLUMN_WIDTH = 10    // %, the same limit the API checks

// columnWidth: the share of the row a layout column takes (100 outside layouts)
export function MediaResizeHandles({ content, columnWidth = 100, onChange }) {
  const dragStart = useRef(null)
  const [liveSize, setLiveSize] = useState(null)   // only while dragging
  const align = content.align ?? 'center'
  const side = align === 'right' ? 'left' : 'right'  // the edge that's free to move

  const startDrag = (event, edges) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    const frame = event.currentTarget.parentElement
    dragStart.current = {
      edges,
      pointerX: event.clientX,
      pointerY: event.clientY,
      startWidth: content.width,
      startHeight: frame.getBoundingClientRect().height,   // with "auto" height, the height it has now
      containerWidth: frame.parentElement.getBoundingClientRect().width,
    }
  }

  const drag = (event) => {
    const start = dragStart.current
    if (!start) return
    const changes = {}
    if (start.edges.includes('side')) {
      changes.width = resizedWidth({ startWidth: start.startWidth, containerWidth: start.containerWidth, dx: event.clientX - start.pointerX, align })
    }
    if (start.edges.includes('bottom')) {
      const heightOnScreen = start.startHeight + (event.clientY - start.pointerY)
      changes.height = toLaptopHeight({ heightOnScreen, containerWidth: start.containerWidth, columnWidth })
    }
    onChange(changes)
    setLiveSize({ width: changes.width ?? content.width, height: changes.height ?? content.height })
  }

  const endDrag = () => {
    dragStart.current = null
    setLiveSize(null)
  }

  const handles = [
    { name: `side resize-handle--${side}`, edges: ['side'], title: 'Drag to change the width' },
    { name: 'bottom', edges: ['bottom'], title: 'Drag to change the height · double-click for its own height' },
    { name: `corner resize-handle--${side}`, edges: ['side', 'bottom'], title: 'Drag to change the width and height' },
  ]

  return (
    <>
      {handles.map((handle) => (
        <span
          key={handle.name}
          className={`resize-handle resize-handle--${handle.name}`}
          title={handle.title}
          onPointerDown={(event) => startDrag(event, handle.edges)}
          onPointerMove={drag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onDoubleClick={handle.edges.includes('bottom') ? () => onChange({ height: null }) : undefined}
        />
      ))}
      {liveSize && (
        <span className="resize-badge">
          {liveSize.width}% × {liveSize.height ? `${liveSize.height}px (laptop)` : 'auto'}
        </span>
      )}
    </>
  )
}

// The line between column `dividerIndex` and the next one. Dragging it only moves
// those two columns, so the row still adds up to 100%.
export function ColumnDivider({ content, dividerIndex, onChange }) {
  const dragStart = useRef(null)
  const [liveSplit, setLiveSplit] = useState(null)

  const startDrag = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    // the columns' own widths, without the gaps between them, are what the % share out
    const columns = [...event.currentTarget.closest('.entry-layout').children]
    dragStart.current = {
      pointerX: event.clientX,
      widths: content.columns.map((column) => column.width),
      columnsWidth: columns.reduce((total, column) => total + column.getBoundingClientRect().width, 0),
    }
  }

  const drag = (event) => {
    const start = dragStart.current
    if (!start) return
    const deltaPercent = ((event.clientX - start.pointerX) / start.columnsWidth) * 100
    const widths = resizeColumns(start.widths, dividerIndex, deltaPercent)
    onChange(setWidths(content, widths))
    setLiveSplit(widths.join(' / '))
  }

  const endDrag = () => {
    dragStart.current = null
    setLiveSplit(null)
  }

  return (
    <span
      className="column-divider"
      title="Drag to change the column widths"
      onPointerDown={startDrag}
      onPointerMove={drag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {liveSplit && <span className="resize-badge">{liveSplit}</span>}
    </span>
  )
}

// The new width (% of the space it sits in) after dragging the free edge by dx px.
// A centred box grows on both sides, so it grows twice as much as the edge moves;
// a right-aligned box's free edge is its left one, so dragging left makes it wider.
export function resizedWidth({ startWidth, containerWidth, dx, align }) {
  const growth = align === 'center' ? dx * 2 : align === 'right' ? -dx : dx
  return clamp(Math.round(startWidth + (growth / containerWidth) * 100), 10, 100)
}

// A saved height means "the height on a 1440px laptop" (see blockFrame). The editor's
// canvas is narrower than that, so a height dragged on screen is scaled up to the
// laptop's: the box's container is containerWidth wide here, but
// LAPTOP_PAGE_WIDTH × columnWidth% wide on the laptop.
export function toLaptopHeight({ heightOnScreen, containerWidth, columnWidth = 100 }) {
  const laptopContainerWidth = LAPTOP_PAGE_WIDTH * (columnWidth / 100)
  return clamp(Math.round((heightOnScreen * laptopContainerWidth) / containerWidth / 10) * 10, 50, 3000)
}

// Moves the divider after column `dividerIndex` by deltaPercent: that column and the
// next one trade width; the others stay put. Neither goes below 10%.
export function resizeColumns(widths, dividerIndex, deltaPercent) {
  const pairTotal = widths[dividerIndex] + widths[dividerIndex + 1]
  const left = clamp(widths[dividerIndex] + Math.round(deltaPercent), MIN_COLUMN_WIDTH, pairTotal - MIN_COLUMN_WIDTH)
  return widths.map((width, index) => {
    if (index === dividerIndex) return left
    if (index === dividerIndex + 1) return pairTotal - left
    return width
  })
}

function clamp(value, smallest, largest) {
  return Math.min(largest, Math.max(smallest, value))
}
