import { describe, expect, test } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import EntryBlocks, { blockFrame } from './EntryBlocks'

describe('blockFrame', () => {
  test('places a block left, in the middle or right', () => {
    expect(blockFrame({ type: 'text', content: { align: 'center' } }).className).toContain('entry-block--align-center')
    expect(blockFrame({ type: 'text', content: { align: 'right' } }).className).toContain('entry-block--align-right')
  })

  test('gives photos and videos their width and height', () => {
    const frame = blockFrame({ type: 'video', content: { width: 50, height: 300 } })
    expect(frame.style).toEqual({ '--media-width': '50%', '--media-height': '300px' })
  })

  test('a photo with no height keeps its own shape', () => {
    expect(blockFrame({ type: 'image', content: { width: 100, height: null } }).style['--media-height']).toBeNull()
  })

  test('text blocks get no size at all', () => {
    expect(blockFrame({ type: 'text', content: { align: 'left' } }).style).toBeUndefined()
  })
})

describe('EntryBlocks', () => {
  test('a blank line in text starts a new paragraph', () => {
    const html = renderToStaticMarkup(
      <EntryBlocks blocks={[{ type: 'text', content: { body: 'First.\n\nSecond.', align: 'left' } }]} />,
    )
    expect(html.match(/<p>/g)).toHaveLength(2)
  })

  test('a silent-loop video plays on its own; a "with controls" video does not', () => {
    const loop = renderToStaticMarkup(<EntryBlocks blocks={[{ type: 'video', content: { src: '/a.mp4', playback: 'loop' } }]} />)
    const withControls = renderToStaticMarkup(<EntryBlocks blocks={[{ type: 'video', content: { src: '/a.mp4', playback: 'controls' } }]} />)
    expect(loop).toContain('autoplay')
    expect(withControls).toContain('controls')
    expect(withControls).not.toContain('autoplay')
  })
})
