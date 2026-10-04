import { expect, test } from 'vitest'
import { findByName } from './SearchPanel'

const items = [
  { kind: 'project', slug: 'nomad', title: 'Nomad' },
  { kind: 'project', slug: 'noir-brutalism', title: 'Noir Brutalism' },
  { kind: 'case_study', slug: 'pulse-research', title: 'Pulse Research' },
]
const titles = (results) => results.map((item) => item.title)

test('finds names containing what was typed, ignoring capitals', () => {
  expect(titles(findByName(items, 'NO'))).toEqual(['Nomad', 'Noir Brutalism'])
})

test('matches in the middle of a name too', () => {
  expect(titles(findByName(items, 'search'))).toEqual(['Pulse Research'])
})

test('ignores spaces typed around the search', () => {
  expect(titles(findByName(items, '  nomad '))).toEqual(['Nomad'])
})

test('nothing typed shows everything, for browsing', () => {
  expect(findByName(items, '')).toHaveLength(3)
  expect(findByName(items, '   ')).toHaveLength(3)
})

test('no match gives an empty list', () => {
  expect(findByName(items, 'zzz')).toEqual([])
})
