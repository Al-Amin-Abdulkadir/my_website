import { createPortal } from 'react-dom'
import {
  closestCenter, DndContext, DragOverlay, KeyboardSensor, PointerSensor, pointerWithin,
  useDndContext, useDraggable, useDroppable, useSensor, useSensors,
} from '@dnd-kit/core'
import { useState } from 'react'
import { blockAt, findLocation } from './layouts'

// Drag and drop on the editor canvas, using @dnd-kit. The library only tells us
// WHAT was dropped and WHAT it was dropped on; layouts.js does the change:
//   dropped on another block/item          → they swap places   (dropOnto)
//   dropped on an empty photo spot         → fills it           (dropOnto)
//   dropped on a column's empty space      → moves to its end   (moveBlockTo)
//   dropped on "end of the page" zone      → moves to the end   (moveBlockTo)
// Every block knows which list it's in: "page", or "column:<layout key>:<n>".

export const PAGE = 'page'
export const columnId = (layoutKey, columnIndex) => `column:${layoutKey}:${columnIndex}`

export function CanvasDragArea({ blocks, onDropOnto, onMove, children }) {
  const [draggingKey, setDraggingKey] = useState(null)
  const sensors = useSensors(
    // A drag starts after the pointer moves 5px, so a plain click on the handle does nothing
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  )

  const drop = ({ active, over }) => {
    setDraggingKey(null)
    if (!over) return
    const target = over.data.current.target          // only the empty-space and end zones have one
    if (target) onMove(active.id, target)
    else onDropOnto(active.id, over.id)
  }

  const dragging = draggingKey && findLocation(blocks, draggingKey)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={chooseDropTarget}
      onDragStart={({ active }) => setDraggingKey(active.id)}
      onDragEnd={drop}
      onDragCancel={() => setDraggingKey(null)}
    >
      {children}
      <PageEndDropZone index={blocks.length} />

      {/* The label that follows the pointer. Rendered at the end of <body> so no
          parent's styles can shift it away from the pointer. */}
      {createPortal(
        <DragOverlay dropAnimation={null} modifiers={[besidePointer]}>
          {dragging && <div className="drag-ghost">{describe(blockAt(blocks, dragging))}</div>}
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  )
}

// One block or column item: draggable by its ⠿ handle, and a place to drop another
// block onto (to swap). Gives back what the element and its handle need.
export function useDraggableBlock(key, container, type) {
  const data = { container, type }
  const draggable = useDraggable({ id: key, data })
  const droppable = useDroppable({ id: key, data })

  return {
    ref: (node) => {
      draggable.setNodeRef(node)
      droppable.setNodeRef(node)
    },
    // chooseDropTarget only offers drops layouts.js allows, so "over" always means "would swap/fill"
    className: [draggable.isDragging ? 'is-dragging' : '', droppable.isOver ? 'is-swap-target' : ''].join(' '),
    handleProps: { ref: draggable.setActivatorNodeRef, ...draggable.attributes, ...draggable.listeners },
  }
}

// A layout column as a drop target. Dropping on its empty space adds to the end.
export function ColumnDropArea({ layoutKey, columnIndex, itemCount, className, children }) {
  const id = columnId(layoutKey, columnIndex)
  const target = { container: 'column', layoutKey, columnIndex, index: itemCount }
  const { setNodeRef, isOver } = useDroppable({ id, data: { container: id, kind: 'column', target } })

  return (
    <div ref={setNodeRef} className={`${className} ${isOver ? 'is-drop-target' : ''}`}>
      {children}
    </div>
  )
}

// Only shown while dragging: drop here to put something at the very end of the page
function PageEndDropZone({ index }) {
  const { active } = useDndContext()
  const { setNodeRef, isOver } = useDroppable({
    id: 'page-end',
    data: { container: PAGE, kind: 'end', target: { container: PAGE, index } },
  })
  if (!active) return null
  return (
    <div ref={setNodeRef} className={`editor-page-end ${isOver ? 'is-drop-target' : ''}`}>
      Drop here to move it to the end of the page
    </div>
  )
}

// The overlay starts at the dragged block's top-left corner, but the ⠿ handle can
// be far from there — so shift the label to sit just below-right of the pointer
function besidePointer({ transform, activatorEvent, draggingNodeRect }) {
  if (!draggingNodeRect || !activatorEvent || !('clientX' in activatorEvent)) return transform   // keyboard drag
  return {
    ...transform,
    x: transform.x + activatorEvent.clientX - draggingNodeRect.left + 14,
    y: transform.y + activatorEvent.clientY - draggingNodeRect.top + 14,
  }
}

// Which drop target is under the pointer. The tricky case: the pointer is inside a
// layout (a block on the page) AND inside one of its columns at the same time — the
// column wins, or nothing could ever be dropped into a layout. Only drops layouts.js
// allows are offered: a layout being dragged only sees the page, and an item from a
// column never sees a layout (a layout can't swap into a column).
// In a gap between blocks there's no target, so letting go there does nothing.
export function chooseDropTarget(args) {
  const infoOf = (droppable) => droppable.data.current ?? {}
  const dragging = infoOf(args.active)
  const isAllowed = (droppable) => {
    if (droppable.id === args.active.id) return false
    if (dragging.type === 'layout') return infoOf(droppable).container === PAGE
    if (dragging.container !== PAGE) return infoOf(droppable).type !== 'layout'
    return true
  }
  const allowed = args.droppableContainers.filter(isAllowed)

  // Keyboard dragging has no pointer: the nearest block
  if (!args.pointerCoordinates) return closestCenter({ ...args, droppableContainers: allowed })

  const hits = pointerWithin({ ...args, droppableContainers: allowed })
  const infoOfHit = (hit) => infoOf(hit.data.droppableContainer)
  const insideColumns = hits.filter((hit) => infoOfHit(hit).container !== PAGE)
  if (insideColumns.length > 0) {
    // an item in the column before the column's empty space
    return [...insideColumns.filter((hit) => infoOfHit(hit).kind !== 'column'), ...insideColumns.filter((hit) => infoOfHit(hit).kind === 'column')]
  }
  return hits
}

// "Text: Kinetic began as a…" — what the label under the pointer says
function describe(block) {
  const preview = (words) => (words.length > 28 ? `${words.slice(0, 28).trim()}…` : words)
  if (block.type === 'heading') return block.content.text ? `Heading: ${preview(block.content.text)}` : 'Heading'
  if (block.type === 'text') return block.content.body ? `Text: ${preview(block.content.body)}` : 'Text'
  if (block.type === 'layout') return `Layout (${block.content.columns.length} columns)`
  return block.type === 'image' ? 'Image' : 'Video'
}
