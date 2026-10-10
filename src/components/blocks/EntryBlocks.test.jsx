import { describe, expect, test } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import EntryBlocks, { blockFrame, layoutFrame, mediaStyle, toParagraphs } from './EntryBlocks'

describe('blockFrame', () => {
  test('places a block left, in the middle or right', () => {
    expect(blockFrame({ type: 'text', content: { align: 'center' } }).className).toContain('entry-block--align-center')
    expect(blockFrame({ type: 'text', content: { align: 'right' } }).className).toContain('entry-block--align-right')
  })

  test('gives photos and videos their width and height', () => {
    const frame = blockFrame({ type: 'video', content: { width: 50, height: 300 } })
    expect(frame.style).toEqual({ '--media-width': '50%', '--media-shape': '700 / 300' })
  })

  test("a box's laptop shape counts its layout column's share of the row", () => {
    // a full-width banner 620 high, and the same inside a 40% column
    expect(blockFrame({ type: 'image', content: { width: 100, height: 620 } }).style['--media-shape']).toBe('1400 / 620')
    expect(blockFrame({ type: 'image', content: { width: 100, height: 620 } }, '', 40).style['--media-shape']).toBe('560 / 620')
  })

  test('a photo with no height keeps its own shape', () => {
    const style = blockFrame({ type: 'image', content: { width: 100, height: null } }).style
    expect(style['--media-shape']).toBeNull()
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

describe('toParagraphs', () => {
  test('a line break in the middle of a sentence becomes a space', () => {
    expect(toParagraphs('The logo was designed to communicate the\nphilosophy\nbehind Kinetic.'))
      .toEqual(['The logo was designed to communicate the philosophy behind Kinetic.'])
  })

  test('a blank line still starts a new paragraph', () => {
    expect(toParagraphs('First.\n\nSecond.')).toEqual(['First.', 'Second.'])
  })

  test('extra blank lines and stray spaces are tidied away', () => {
    expect(toParagraphs('  One  \n\n\n\n  Two \n  ')).toEqual(['One', 'Two'])
  })
})

describe('layouts', () => {
  const textBeside = {
    type: 'layout',
    content: {
      vertical: 'center',
      columns: [
        { width: 40, items: [{ type: 'text', content: { body: 'Words', align: 'left' } }] },
        { width: 60, items: [
          { type: 'image', content: { src: '/a.jpg', alt: 'A', width: 100, height: null } },
          { type: 'image', content: { src: '/b.jpg', alt: 'B', width: 100, height: null } },
        ] },
      ],
    },
  }

  test('column widths become a grid split in the same proportions', () => {
    expect(layoutFrame(textBeside.content).style['--layout-columns']).toBe('40fr 60fr')
  })

  test('the columns line up the way the layout says', () => {
    expect(layoutFrame(textBeside.content).className).toContain('entry-layout--center')
  })

  test('the gap is the one chosen, and medium for layouts saved before gaps existed', () => {
    expect(layoutFrame({ ...textBeside.content, gap: 'none' }).className).toContain('entry-layout--gap-none')
    expect(layoutFrame(textBeside.content).className).toContain('entry-layout--gap-medium')
  })

  test('every item in every column is drawn, in order', () => {
    const html = renderToStaticMarkup(<EntryBlocks blocks={[textBeside]} />)
    expect(html.match(/entry-layout__column/g)).toHaveLength(2)
    expect(html).toContain('<p>Words</p>')
    expect(html.indexOf('alt="A"')).toBeLessThan(html.indexOf('alt="B"'))
  })
})

describe('fit, fill and crop', () => {
  const boxed = { src: '/a.jpg', height: 400 }

  test('fit shows the whole photo', () => {
    expect(mediaStyle({ ...boxed, fit: 'fit' })).toEqual({ objectFit: 'contain' })
  })

  test('fill covers the box and keeps the focus point in view', () => {
    expect(mediaStyle({ ...boxed, fit: 'fill', focus: { x: 20, y: 80 } }))
      .toEqual({ objectFit: 'cover', objectPosition: '20% 80%' })
  })

  test('crop zooms in around the focus point', () => {
    expect(mediaStyle({ ...boxed, fit: 'crop', focus: { x: 20, y: 80 }, zoom: 2 })).toEqual({
      objectFit: 'cover', objectPosition: '20% 80%', transform: 'scale(2)', transformOrigin: '20% 80%',
    })
  })

  test('fill with no fixed height shows the whole photo (the box already has its shape)', () => {
    expect(mediaStyle({ src: '/a.jpg', height: null, fit: 'fill' })).toEqual({ objectFit: 'contain' })
  })

  test('photos saved before framing existed keep their old look: fill from the middle', () => {
    expect(mediaStyle(boxed)).toEqual({ objectFit: 'cover', objectPosition: '50% 50%' })
  })
})

test('empty photo spots in a layout are never shown to visitors', () => {
  const html = renderToStaticMarkup(<EntryBlocks blocks={[{
    type: 'layout',
    content: { columns: [
      { width: 50, items: [{ type: 'image', content: { src: '/a.jpg', alt: 'A' } }, { type: 'image', content: { src: '' } }] },
      { width: 50, items: [{ type: 'image', content: { src: '' } }] },
    ] },
  }]} />)
  expect(html.match(/<img/g)).toHaveLength(1)
})

test('empty headings and text from a layout are skipped, and a layout with nothing in it is not drawn', () => {
  const layout = (items) => ({ type: 'layout', content: { columns: [{ width: 50, items }, { width: 50, items: [] }] } })
  const halfFilled = renderToStaticMarkup(<EntryBlocks blocks={[layout([
    { type: 'heading', content: { text: '  ', align: 'left' } },
    { type: 'text', content: { body: 'Words', align: 'left' } },
  ])]} />)
  expect(halfFilled).not.toContain('<h2')
  expect(halfFilled).toContain('<p>Words</p>')

  const empty = renderToStaticMarkup(<EntryBlocks blocks={[layout([{ type: 'text', content: { body: '', align: 'left' } }])]} />)
  expect(empty).not.toContain('entry-layout')
})
