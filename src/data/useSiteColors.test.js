import { expect, test } from 'vitest'
import { colorsToRemember, isKnownPair } from './useSiteColors'

test('a pair of palette colours is accepted', () => {
  expect(isKnownPair({ backgroundColor: 'white', textColor: 'obsidian-ink' })).toBe(true)
})

test('a colour this site does not know is rejected, so the defaults are used instead', () => {
  expect(isKnownPair({ backgroundColor: 'neon-green', textColor: 'obsidian-ink' })).toBe(false)
})

test('missing or broken saved colours are rejected', () => {
  expect(isKnownPair(null)).toBe(false)
  expect(isKnownPair({})).toBe(false)
})

test('the saved colours carry their codes, for the early script in index.html', () => {
  const saved = colorsToRemember({ backgroundColor: 'white', textColor: 'obsidian-ink' })
  expect(saved).toEqual({ backgroundColor: 'white', textColor: 'obsidian-ink', paperHex: '#FFFFFF', inkHex: '#181716' })
  expect(isKnownPair(saved)).toBe(true)   // the extra codes don't stop it being read back
})
