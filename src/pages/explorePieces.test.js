import { describe, expect, test } from 'vitest'
import { layoutRuns, ratioOf } from './explorePieces'

const square = (title) => ({ title, shape: 'square' })
const a4 = (title) => ({ title, shape: 'a4' })
const banner = (title) => ({ title, shape: 'banner', width: 3000, height: 1000 })
const titlesIn = (column) => column.map(({ piece }) => piece.title)

describe('ratioOf', () => {
  test('fixed shapes ignore the file\'s own size', () => {
    expect(ratioOf({ shape: 'square', width: 300, height: 900 })).toBe(1)
    expect(ratioOf({ shape: 'a4' })).toBeCloseTo(0.707, 3)
  })

  test('natural uses the file\'s own shape, or a square when it isn\'t known', () => {
    expect(ratioOf({ shape: 'natural', width: 1200, height: 800 })).toBe(1.5)
    expect(ratioOf({ shape: 'natural' })).toBe(1)
  })

  test('a banner is never taller than 16:9', () => {
    expect(ratioOf(banner('wide'))).toBe(3)
    expect(ratioOf({ shape: 'banner', width: 800, height: 1200 })).toBeCloseTo(16 / 9)
  })
})

describe('layoutRuns', () => {
  test('the first pieces go across the top, left to right', () => {
    const [run] = layoutRuns([square('a'), square('b'), square('c')], 3)
    expect(run.columns.map(titlesIn)).toEqual([['a'], ['b'], ['c']])
  })

  test('each next piece goes under the shortest column', () => {
    // a (tall) | b (square): c goes under b, the shorter one
    const [run] = layoutRuns([a4('a'), square('b'), square('c')], 2)
    expect(run.columns.map(titlesIn)).toEqual([['a'], ['b', 'c']])
  })

  test('a banner runs across the page and starts a fresh grid under it', () => {
    const runs = layoutRuns([square('a'), banner('wide'), square('b')], 2)
    expect(runs.map((run) => run.type)).toEqual(['masonry', 'banner', 'masonry'])
    expect(runs[1].piece.title).toBe('wide')
    expect(runs[2].columns.map(titlesIn)).toEqual([['b'], []])
  })

  test('every piece remembers its place in the whole list', () => {
    const runs = layoutRuns([banner('wide'), square('a')], 2)
    expect(runs[0].index).toBe(0)
    expect(runs[1].columns[0][0].index).toBe(1)
  })

  test('no pieces, no runs', () => {
    expect(layoutRuns([], 4)).toEqual([])
  })
})
