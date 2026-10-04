import { describe, expect, test } from 'vitest'
import { PALETTE, contrastRatio, hexOf, readability } from './palette'

describe('contrastRatio', () => {
  test('black on white is the maximum, 21 : 1', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5)
  })

  test('a colour on itself is the minimum, 1 : 1', () => {
    expect(contrastRatio('#7E96A3', '#7E96A3')).toBeCloseTo(1, 5)
  })

  test('the order of the two colours does not matter', () => {
    expect(contrastRatio('#F1EDE3', '#181716')).toBeCloseTo(contrastRatio('#181716', '#F1EDE3'), 10)
  })

  test('pure white is in the palette, and Obsidian Ink on it is easy to read', () => {
    expect(hexOf('white')).toBe('#FFFFFF')
    expect(readability(contrastRatio(hexOf('white'), hexOf('obsidian-ink'))).level).toBe('good')
  })

  test("the redesign's own pair (Parchment + Obsidian Ink) is easy to read", () => {
    expect(readability(contrastRatio(hexOf('parchment'), hexOf('obsidian-ink'))).level).toBe('good')
  })
})

describe('readability', () => {
  test.each([
    [7, 'good'], [4.5, 'good'], [4.49, 'okay'], [3, 'okay'], [2.99, 'poor'], [1, 'poor'],
  ])('a ratio of %s is "%s"', (ratio, level) => {
    expect(readability(ratio).level).toBe(level)
  })
})

describe('hexOf', () => {
  test('turns a palette name into its colour', () => {
    expect(hexOf('dusty-blue')).toBe('#7E96A3')
  })

  test('refuses a colour that is not in the palette', () => {
    expect(() => hexOf('neon-green')).toThrow('isn’t a colour in the palette')
  })

  test('every palette colour is a full #RRGGBB code with a unique name', () => {
    for (const color of PALETTE) expect(color.hex).toMatch(/^#[0-9A-F]{6}$/)
    expect(new Set(PALETTE.map((color) => color.key)).size).toBe(PALETTE.length)
  })
})
