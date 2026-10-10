import { describe, expect, test } from 'vitest'
import { coverPositionOf, coverStyle, focusOfCoverPosition } from './coverFraming'

describe('coverStyle', () => {
  test('places the cover on its focus point, zooming around it', () => {
    expect(coverStyle({ coverPosition: '40% 25%', coverZoom: 1.5 }))
      .toEqual({ objectPosition: '40% 25%', transformOrigin: '40% 25%', '--cover-zoom': 1.5 })
  })

  test('a cover saved before framing existed shows from the middle, unzoomed', () => {
    expect(coverStyle({})).toEqual({ objectPosition: 'center', transformOrigin: 'center', '--cover-zoom': 1 })
  })
})

describe('focusOfCoverPosition and coverPositionOf', () => {
  test('the older words become focus points', () => {
    expect(focusOfCoverPosition('top')).toEqual({ x: 50, y: 0 })
    expect(focusOfCoverPosition('bottom')).toEqual({ x: 50, y: 100 })
    expect(focusOfCoverPosition('center')).toEqual({ x: 50, y: 50 })
  })

  test('a dragged focus point goes round the trip unchanged', () => {
    expect(focusOfCoverPosition(coverPositionOf({ x: 33.3, y: 70 }))).toEqual({ x: 33.3, y: 70 })
  })

  test('saves at most one decimal, as the API expects', () => {
    expect(coverPositionOf({ x: 33.333, y: 0.06 })).toBe('33.3% 0.1%')
  })

  test('anything unreadable falls back to the middle', () => {
    expect(focusOfCoverPosition(undefined)).toEqual({ x: 50, y: 50 })
    expect(focusOfCoverPosition('nonsense')).toEqual({ x: 50, y: 50 })
  })
})
