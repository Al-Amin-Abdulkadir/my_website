import { expect, test } from 'vitest'
import { orderOf } from './PageTransition'

// Going to a page later in this order slides down (like scrolling down); earlier slides up
test('pages follow the scroll order Home → Projects → a project → Case Studies → a case study → About', () => {
  const order = ['/', '/projects', '/project/nomad', '/case-studies', '/case-study/pulse', '/about', '/reach-out'].map(orderOf)
  expect(order).toEqual([...order].sort((a, b) => a - b))
  expect(new Set(order).size).toBe(order.length)
})

test('every project page shares the same place in the order', () => {
  expect(orderOf('/project/nomad')).toBe(orderOf('/project/steward'))
})

test('an unknown address counts as the start', () => {
  expect(orderOf('/somewhere-else')).toBe(0)
})
