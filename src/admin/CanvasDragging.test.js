import { describe, expect, test } from 'vitest'
import { chooseDropTarget } from './CanvasDragging'

// A fake canvas, no browser needed. Each drop target gets a box (left, top, width, height):
//   P   a text block on the page          (0,   0) 400×100
//   L   a layout on the page              (0, 200) 400×300
//   col the layout's left column, inside L (0, 200) 200×300
//   A   an item inside that column        (0, 200) 200×100
//   M   another layout on the page        (0, 600) 400×200
const box = (left, top, width, height) => ({ left, top, width, height, right: left + width, bottom: top + height })
const targets = {
  P: { box: box(0, 0, 400, 100), data: { container: 'page', type: 'text' } },
  L: { box: box(0, 200, 400, 300), data: { container: 'page', type: 'layout' } },
  col: { box: box(0, 200, 200, 300), data: { container: 'column:L:0', kind: 'column' } },
  A: { box: box(0, 200, 200, 100), data: { container: 'column:L:0', type: 'image' } },
  M: { box: box(0, 600, 400, 200), data: { container: 'page', type: 'layout' } },
}

function winnerFor(draggingId, pointer) {
  const dragging = targets[draggingId]
  const ids = chooseDropTarget({
    active: { id: draggingId, data: { current: dragging.data } },
    collisionRect: dragging.box,
    droppableRects: new Map(Object.entries(targets).map(([id, target]) => [id, target.box])),
    droppableContainers: Object.entries(targets).map(([id, target]) => ({ id, data: { current: target.data } })),
    pointerCoordinates: pointer,
  }).map((hit) => hit.id)
  return ids[0] ?? null
}

describe('chooseDropTarget', () => {
  test('inside a column, the item under the pointer wins over the column and the layout', () => {
    expect(winnerFor('P', { x: 100, y: 250 })).toBe('A')
  })

  test("on a column's empty space, the column wins over the layout around it", () => {
    expect(winnerFor('P', { x: 100, y: 450 })).toBe('col')
  })

  test('a dragged layout only sees the page: over a column item it targets the layout itself, never the item', () => {
    expect(winnerFor('M', { x: 100, y: 250 })).toBe('L')
  })

  test('an item from a column never targets a layout (it could not swap into a column)', () => {
    expect(winnerFor('A', { x: 300, y: 700 })).toBeNull()     // over layout M's area
    expect(winnerFor('A', { x: 300, y: 50 })).toBe('P')       // a normal page block is fine
  })

  test('in a gap between blocks there is no target, so letting go does nothing', () => {
    expect(winnerFor('P', { x: 100, y: 150 })).toBeNull()
  })
})
