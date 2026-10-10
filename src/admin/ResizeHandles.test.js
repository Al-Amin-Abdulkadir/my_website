import { describe, expect, test } from 'vitest'
import { resizeColumns, resizedWidth, toLaptopHeight } from './ResizeHandles'

describe('resizedWidth', () => {
  const start = { startWidth: 50, containerWidth: 1000 }

  test('a left-aligned box grows by as much as its right edge moves', () => {
    expect(resizedWidth({ ...start, dx: 100, align: 'left' })).toBe(60)
  })

  test('a centred box grows on both sides, so twice as much', () => {
    expect(resizedWidth({ ...start, dx: 100, align: 'center' })).toBe(70)
  })

  test("a right-aligned box's handle is on its left, so dragging left widens it", () => {
    expect(resizedWidth({ ...start, dx: -100, align: 'right' })).toBe(60)
  })

  test('stays between 10% and 100%, in whole percents', () => {
    expect(resizedWidth({ ...start, dx: 5000, align: 'left' })).toBe(100)
    expect(resizedWidth({ ...start, dx: -5000, align: 'left' })).toBe(10)
    expect(resizedWidth({ ...start, dx: 33, align: 'left' })).toBe(53)
  })
})

describe('resizeColumns', () => {
  test('the two columns beside the divider trade width; the total stays 100', () => {
    expect(resizeColumns([50, 50], 0, 12.4)).toEqual([62, 38])
    expect(resizeColumns([33, 34, 33], 1, -4)).toEqual([33, 30, 37])
  })

  test('neither column goes below 10%', () => {
    expect(resizeColumns([50, 50], 0, 80)).toEqual([90, 10])
    expect(resizeColumns([25, 25, 50], 0, -40)).toEqual([10, 40, 50])
  })
})

describe('toLaptopHeight', () => {
  test('a height dragged in a narrower canvas is scaled up to the laptop page', () => {
    // canvas 700 wide, laptop page 1400: twice as wide, so twice as tall
    expect(toLaptopHeight({ heightOnScreen: 310, containerWidth: 700 })).toBe(620)
  })

  test("inside a layout column, the column's laptop width counts", () => {
    // a 50% column is 700 on the laptop; here it's 350, so the height doubles
    expect(toLaptopHeight({ heightOnScreen: 200, containerWidth: 350, columnWidth: 50 })).toBe(400)
  })

  test('stays in steps of 10 between 50 and 3000', () => {
    expect(toLaptopHeight({ heightOnScreen: 333, containerWidth: 1400 })).toBe(330)
    expect(toLaptopHeight({ heightOnScreen: 10, containerWidth: 1400 })).toBe(50)
    expect(toLaptopHeight({ heightOnScreen: 5000, containerWidth: 1400 })).toBe(3000)
  })
})
