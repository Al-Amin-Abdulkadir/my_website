import { expect, test } from 'vitest'
import { toCloudPhoto } from './Home'

test('turns a CMS photo into a cloud photo, with its link', () => {
  expect(toCloudPhoto({ imageUrl: '/a.jpg', alt: 'A', caption: 'Hi', linkLabel: 'See it', linkUrl: '/project/nomad' }))
    .toEqual({ src: '/a.jpg', alt: 'A', caption: 'Hi', link: { label: 'See it', url: '/project/nomad' } })
})

test('a link without its own text is labelled "View"', () => {
  expect(toCloudPhoto({ imageUrl: '/a.jpg', alt: '', caption: null, linkLabel: null, linkUrl: '/about' }).link)
    .toEqual({ label: 'View', url: '/about' })
})

test('a photo without a link has none', () => {
  expect(toCloudPhoto({ imageUrl: '/a.jpg', alt: '', caption: null, linkLabel: 'orphan label', linkUrl: null }).link).toBeNull()
})
