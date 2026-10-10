import { useRef } from 'react'
import { framingOf } from '../components/blocks/EntryBlocks'

// A see-through layer over a photo/video in Fill or Crop mode: drag the photo to
// choose which part stays in view (like moving an image inside a Figma frame).
// Arrow keys nudge it too. It only changes the saved focus point — never the file.

const KEY_STEP = 2   // % per arrow key press

export default function FramingDragArea({ content, onChange }) {
  const dragStart = useRef(null)
  const { fit, focus, zoom } = framingOf(content)
  const zoomInUse = fit === 'crop' ? zoom : 1

  const startDrag = (event) => {
    const media = event.currentTarget.parentElement.querySelector('img, video')
    const natural = media.tagName === 'IMG'
      ? { width: media.naturalWidth, height: media.naturalHeight }
      : { width: media.videoWidth, height: media.videoHeight }
    if (!natural.width) return             // still loading — its size isn't known yet

    const frame = event.currentTarget.getBoundingClientRect()
    event.currentTarget.setPointerCapture(event.pointerId)   // keep following even outside the frame
    dragStart.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      focus,
      frame: { width: frame.width, height: frame.height },
      natural,
    }
  }

  // Always measured from where the drag began, so small rounding never adds up
  const drag = (event) => {
    const start = dragStart.current
    if (!start) return
    onChange({
      focus: focusAfterDrag({
        focus: start.focus,
        zoom: zoomInUse,
        frame: start.frame,
        natural: start.natural,
        drag: { dx: event.clientX - start.pointerX, dy: event.clientY - start.pointerY },
      }),
    })
  }

  const endDrag = () => { dragStart.current = null }

  // The arrow moves the photo, so the focus point goes the other way
  const nudge = (event) => {
    const moves = { ArrowLeft: [KEY_STEP, 0], ArrowRight: [-KEY_STEP, 0], ArrowUp: [0, KEY_STEP], ArrowDown: [0, -KEY_STEP] }
    if (!moves[event.key]) return
    event.preventDefault()
    const [stepX, stepY] = moves[event.key]
    onChange({ focus: { x: clampPercent(focus.x + stepX), y: clampPercent(focus.y + stepY) } })
  }

  return (
    <div
      className="framing-drag-area"
      tabIndex={0}
      role="slider"
      aria-label="Drag to choose which part stays in view"
      aria-valuetext={`${Math.round(focus.x)}% from the left, ${Math.round(focus.y)}% from the top`}
      title="Drag to choose which part stays in view"
      onPointerDown={startDrag}
      onPointerMove={drag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={nudge}
    />
  )
}

// Where the focus point ends up after dragging the photo by (dx, dy) pixels, so the
// photo moves exactly with the pointer.
//
// In cover mode the photo is scaled until it covers the frame; whatever sticks out
// past the frame is the "overflow". A focus of 0% shows the left edge, 100% the right
// edge, so dragging across the whole overflow moves the focus by 100%. (Zooming
// around the focus point keeps this exact: the overflow just becomes
// photoWidth × zoom − frameWidth.)
export function focusAfterDrag({ focus, zoom, frame, natural, drag }) {
  const coverScale = Math.max(frame.width / natural.width, frame.height / natural.height)
  const overflowX = natural.width * coverScale * zoom - frame.width
  const overflowY = natural.height * coverScale * zoom - frame.height

  // Dragging right moves the photo right, which shows more of its left side
  return {
    x: overflowX > 0.5 ? clampPercent(focus.x - (drag.dx / overflowX) * 100) : focus.x,
    y: overflowY > 0.5 ? clampPercent(focus.y - (drag.dy / overflowY) * 100) : focus.y,
  }
}

// Kept between 0 and 100, to one decimal place so the saved numbers stay tidy
function clampPercent(value) {
  return Math.round(Math.min(100, Math.max(0, value)) * 10) / 10
}
