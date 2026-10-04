import { expect, test } from 'vitest'
import { isKnownPair } from './useSiteColors'

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
