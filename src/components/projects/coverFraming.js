// How a project's cover sits in its card on the Projects list (and in search and the
// admin's thumbnails). Saved per project:
//   coverFit      → "card": cropped to the design's card shape (the default)
//                   "whole": the card takes the image's own shape, nothing cropped
// and, when cropped, WHAT is cropped:
//   coverPosition → the focus point: "40% 25%", or the older "top" / "center" / "bottom"
//   coverZoom     → 1 (whole card filled, no extra zoom) up to 4

export function showsWholeCover(entry) {
  return entry.coverFit === 'whole'
}

// The styles for a cover <img>. The zoom goes in a CSS variable rather than a
// transform, so each place's own hover zoom can multiply it instead of replacing it.
export function coverStyle(entry) {
  // A whole cover has nothing cropped, so the focus point and zoom don't apply
  if (showsWholeCover(entry)) return { objectPosition: 'center', transformOrigin: 'center', '--cover-zoom': 1 }
  const position = entry.coverPosition ?? 'center'
  return { objectPosition: position, transformOrigin: position, '--cover-zoom': entry.coverZoom ?? 1 }
}

const WORDS_AS_FOCUS = { top: { x: 50, y: 0 }, center: { x: 50, y: 50 }, bottom: { x: 50, y: 100 } }

// The saved position as a focus point the editor can drag: { x, y } in %
export function focusOfCoverPosition(position) {
  if (WORDS_AS_FOCUS[position]) return WORDS_AS_FOCUS[position]
  const [x, y] = (position ?? '').split(' ').map((part) => Number.parseFloat(part))
  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : WORDS_AS_FOCUS.center
}

// …and back to what's saved (the API accepts "X% Y%" with at most one decimal)
export function coverPositionOf(focus) {
  return `${Math.round(focus.x * 10) / 10}% ${Math.round(focus.y * 10) / 10}%`
}
