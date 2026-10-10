import { expect, test } from 'vitest'
import { collectTags, findEntries } from './SearchPanel'

const items = [
  { kind: 'project', slug: 'nomad', title: 'Nomad', tags: ['Branding', 'Fashion'] },
  { kind: 'project', slug: 'noir-brutalism', title: 'Noir Brutalism', tags: ['Editorial'] },
  { kind: 'case_study', slug: 'pulse-research', title: 'Pulse Research', tags: [] },
  { kind: 'project', slug: 'kinetic', title: 'Kinetic', tags: ['Fitness', 'branding', 'UI/UX'] },
]
const titles = (results) => results.map((item) => item.title)

test('finds names containing what was typed, ignoring capitals', () => {
  expect(titles(findEntries(items, 'NO'))).toEqual(['Nomad', 'Noir Brutalism'])
})

test('matches in the middle of a name too', () => {
  expect(titles(findEntries(items, 'search'))).toEqual(['Pulse Research'])
})

test('ignores spaces typed around the search', () => {
  expect(titles(findEntries(items, '  nomad '))).toEqual(['Nomad'])
})

test('nothing typed shows everything, for browsing', () => {
  expect(findEntries(items, '')).toHaveLength(4)
  expect(findEntries(items, '   ')).toHaveLength(4)
})

test('typing a tag finds entries with that tag, ignoring capitals', () => {
  expect(titles(findEntries(items, 'FITNESS'))).toEqual(['Kinetic'])
})

test('a chosen tag keeps only entries with it, whatever its capitals', () => {
  expect(titles(findEntries(items, '', ['branding']))).toEqual(['Nomad', 'Kinetic'])
})

test('choosing more tags narrows the list: an entry needs every chosen tag', () => {
  expect(titles(findEntries(items, '', ['branding', 'fitness']))).toEqual(['Kinetic'])
  expect(findEntries(items, '', ['branding', 'editorial'])).toEqual([])
})

test('typing and chosen tags work together', () => {
  expect(titles(findEntries(items, 'nom', ['branding']))).toEqual(['Nomad'])
})

test('collectTags lists each tag once, ignoring capitals, most-used first', () => {
  const tags = collectTags(items)
  expect(tags[0]).toEqual({ key: 'branding', label: 'Branding', count: 2 })
  expect(tags.map((tag) => tag.key)).toEqual(['branding', 'editorial', 'fashion', 'fitness', 'ui/ux'])
})

test('no match gives an empty list', () => {
  expect(findEntries(items, 'zzz')).toEqual([])
})
