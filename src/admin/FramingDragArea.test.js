import { expect, test } from 'vitest'
import { focusAfterDrag } from './FramingDragArea'

// A wide photo (800×300) in a 400×300 box: it covers the box at its own size,
// so 400px stick out left and right, and nothing above or below
const wide = { focus: { x: 50, y: 50 }, zoom: 1, frame: { width: 400, height: 300 }, natural: { width: 800, height: 300 } }

test('dragging right by half the overflow shows the left edge', () => {
  expect(focusAfterDrag({ ...wide, drag: { dx: 200, dy: 0 } })).toEqual({ x: 0, y: 50 })
})

test('dragging left moves the focus towards the right side', () => {
  expect(focusAfterDrag({ ...wide, drag: { dx: -100, dy: 0 } })).toEqual({ x: 75, y: 50 })
})

test('nothing sticks out above or below, so dragging up and down changes nothing', () => {
  expect(focusAfterDrag({ ...wide, drag: { dx: 0, dy: 90 } })).toEqual({ x: 50, y: 50 })
})

test('dragging past the edge stops at the edge', () => {
  expect(focusAfterDrag({ ...wide, drag: { dx: 5000, dy: 0 } }).x).toBe(0)
  expect(focusAfterDrag({ ...wide, drag: { dx: -5000, dy: 0 } }).x).toBe(100)
})

test('zoomed in, there is more to drag over, so the same drag moves the focus less', () => {
  // at 2× the photo is 1600×600: 1200px stick out sideways, 300px up and down
  expect(focusAfterDrag({ ...wide, zoom: 2, drag: { dx: -120, dy: 30 } })).toEqual({ x: 60, y: 40 })
})
