import { describe, expect, test } from 'vitest'
import {
  addColumn, createLayout, equalWidths, dropOnto, findLocation, LAYOUT_PRESETS, moveBlockTo, swapBlocks, moveItem, removeColumn,
  updateItem, WIDTH_CHOICES, withEditorKeys, withoutEditorKeys,
} from './layouts'

const item = (name) => ({ type: 'text', content: { body: name, align: 'left' }, key: name })
const names = (column) => column.items.map((each) => each.content.body)
const twoColumns = () => ({
  vertical: 'top',
  columns: [{ width: 50, items: [item('A'), item('B')] }, { width: 50, items: [item('C')] }],
})

describe('widths', () => {
  test('equal widths always add up to exactly 100', () => {
    for (const count of [2, 3, 4]) expect(equalWidths(count).reduce((sum, width) => sum + width)).toBe(100)
    expect(equalWidths(3)).toEqual([33, 34, 33])
  })

  test('every preset and every ready-made split adds up to 100', () => {
    const allSplits = [...LAYOUT_PRESETS.map((preset) => preset.widths), ...Object.values(WIDTH_CHOICES).flat()]
    for (const widths of allSplits) expect(widths.reduce((sum, width) => sum + width)).toBe(100)
  })
})

describe('createLayout', () => {
  test('a preset starts with the items its drawing shows: text boxes and empty photo spots', () => {
    const layout = createLayout('text-image')
    expect(layout.columns.map((column) => column.width)).toEqual([40, 60])
    expect(layout.columns[0].items[0].type).toBe('text')
    expect(layout.columns[1].items.map((item) => [item.type, item.content.src])).toEqual([['image', '']])
  })

  test('"One large, two stacked" really has two spots stacked on the right', () => {
    const [left, right] = createLayout('large-stacked').columns
    expect([left.items.length, right.items.length]).toEqual([1, 2])
  })

  test('every preset turns into exactly what its drawing shows', () => {
    for (const preset of LAYOUT_PRESETS) {
      const layout = createLayout(preset.name)
      const drawn = layout.columns.map((column) => column.items.map((item) => (item.type === 'image' ? 'media' : item.type)))
      expect(drawn).toEqual(preset.sketch)
    }
  })
})

describe('columns', () => {
  test('adding a column makes every column the same width', () => {
    expect(addColumn(twoColumns()).columns.map((column) => column.width)).toEqual([33, 34, 33])
  })

  test('there are never more than 4 columns or fewer than 2', () => {
    let layout = twoColumns()
    for (let step = 0; step < 5; step++) layout = addColumn(layout)
    expect(layout.columns).toHaveLength(4)
    expect(removeColumn(twoColumns(), 0).columns).toHaveLength(2)
  })

  test("removing a column hands its items to the neighbour instead of deleting them", () => {
    const layout = removeColumn(addColumn(twoColumns()), 1)
    expect(layout.columns.map(names)).toEqual([['A', 'B', 'C'], []])
  })
})

describe('items', () => {
  test('an item moves down inside its column', () => {
    const layout = moveItem(twoColumns(), { columnIndex: 0, itemIndex: 0 }, { columnIndex: 0, itemIndex: 1 })
    expect(names(layout.columns[0])).toEqual(['B', 'A'])
  })

  test('an item moves into another column at the chosen spot', () => {
    const layout = moveItem(twoColumns(), { columnIndex: 0, itemIndex: 1 }, { columnIndex: 1, itemIndex: 0 })
    expect(layout.columns.map(names)).toEqual([['A'], ['B', 'C']])
  })

  test('changing one item leaves the original layout untouched', () => {
    const before = twoColumns()
    const after = updateItem(before, 1, 0, { body: 'Changed' })
    expect(names(after.columns[1])).toEqual(['Changed'])
    expect(names(before.columns[1])).toEqual(['C'])
  })
})

describe('editor keys', () => {
  test('come off before saving, at both levels, and nothing else changes', () => {
    const saved = { type: 'layout', content: { vertical: 'center', columns: [{ width: 50, items: [{ type: 'text', content: { body: 'x' } }] }, { width: 50, items: [] }] } }
    const keyed = withEditorKeys(saved)
    expect(keyed.key).toBeTruthy()
    expect(keyed.content.columns[0].items[0].key).toBeTruthy()
    expect(withoutEditorKeys(keyed)).toEqual(saved)
  })
})

describe('drag and drop: moveBlockTo and swapBlocks', () => {
  // The page: heading H, a layout L with columns [A, B] and [C], then text T
  const page = () => [
    { ...item('H'), type: 'heading' },
    { type: 'layout', key: 'L', content: twoColumns() },
    item('T'),
  ]
  const pageNames = (blocks) => blocks.map((block) => block.key)
  const layoutNames = (blocks) => blocks.find((block) => block.key === 'L').content.columns.map(names)

  test('finds things on the page and inside columns', () => {
    expect(findLocation(page(), 'T')).toEqual({ container: 'page', index: 2 })
    expect(findLocation(page(), 'C')).toEqual({ container: 'column', layoutKey: 'L', columnIndex: 1, index: 0 })
    expect(findLocation(page(), 'nope')).toBeNull()
  })

  test('moves a block to a spot on the page', () => {
    expect(pageNames(moveBlockTo(page(), 'H', { container: 'page', index: 2 }))).toEqual(['L', 'T', 'H'])
    expect(pageNames(moveBlockTo(page(), 'T', { container: 'page', index: 0 }))).toEqual(['T', 'H', 'L'])
  })

  test('a page block dropped into a column becomes part of the layout', () => {
    const blocks = moveBlockTo(page(), 'T', { container: 'column', layoutKey: 'L', columnIndex: 1, index: 0 })
    expect(pageNames(blocks)).toEqual(['H', 'L'])
    expect(layoutNames(blocks)).toEqual([['A', 'B'], ['T', 'C']])
  })

  test('an item dragged out of a column becomes a block on the page', () => {
    const blocks = moveBlockTo(page(), 'B', { container: 'page', index: 0 })
    expect(pageNames(blocks)).toEqual(['B', 'H', 'L', 'T'])
    expect(layoutNames(blocks)).toEqual([['A'], ['C']])
  })

  test('items move between columns, and to the end of a column', () => {
    const blocks = moveBlockTo(page(), 'A', { container: 'column', layoutKey: 'L', columnIndex: 1, index: 1 })
    expect(layoutNames(blocks)).toEqual([['B'], ['C', 'A']])
  })

  test('a layout cannot be dropped into a column', () => {
    const before = page()
    expect(moveBlockTo(before, 'L', { container: 'column', layoutKey: 'L', columnIndex: 0, index: 0 })).toBe(before)
  })

  test('two blocks on the page swap places; nothing else moves', () => {
    expect(pageNames(swapBlocks(page(), 'H', 'T'))).toEqual(['T', 'L', 'H'])
  })

  test('two items in different columns swap places', () => {
    expect(layoutNames(swapBlocks(page(), 'A', 'C'))).toEqual([['C', 'B'], ['A']])
  })

  test('an item in a column and a block on the page swap places', () => {
    const blocks = swapBlocks(page(), 'B', 'T')
    expect(pageNames(blocks)).toEqual(['H', 'L', 'B'])
    expect(layoutNames(blocks)).toEqual([['A', 'T'], ['C']])
  })

  test('a layout can swap with a page block, but never with something inside a column', () => {
    expect(pageNames(swapBlocks(page(), 'L', 'H'))).toEqual(['L', 'H', 'T'])
    const before = page()
    expect(swapBlocks(before, 'L', 'A')).toBe(before)       // would put the layout inside itself
    expect(swapBlocks(before, 'A', 'L')).toBe(before)
  })

  test('two items in the same column swap places', () => {
    expect(layoutNames(swapBlocks(page(), 'A', 'B'))).toEqual([['B', 'A'], ['C']])
  })

  test("an item moved to its own column's empty space goes to the bottom", () => {
    // the column has 2 items, so the drop target says index 2 (counted before the item is lifted out)
    const blocks = moveBlockTo(page(), 'A', { container: 'column', layoutKey: 'L', columnIndex: 0, index: 2 })
    expect(layoutNames(blocks)).toEqual([['B', 'A'], ['C']])
  })

  test('dropping on an empty photo spot fills it, and the spot is gone (not swapped)', () => {
    const withSpot = page()
    withSpot[1].content.columns[1].items.push({ type: 'image', content: { src: '' }, key: 'spot' })
    const blocks = dropOnto(withSpot, 'H', 'spot')
    expect(pageNames(blocks)).toEqual(['L', 'T'])
    expect(layoutNames(blocks)).toEqual([['A', 'B'], ['C', 'H']])
  })

  test('dropping on a filled block is a normal swap', () => {
    expect(pageNames(dropOnto(page(), 'H', 'T'))).toEqual(['T', 'L', 'H'])
  })

  test('an empty spot dropped on another empty spot changes nothing', () => {
    const withSpots = page()
    withSpots[1].content.columns[0].items.push({ type: 'image', content: { src: '' }, key: 'spot1' })
    withSpots[1].content.columns[1].items.push({ type: 'image', content: { src: '' }, key: 'spot2' })
    expect(dropOnto(withSpots, 'spot1', 'spot2')).toBe(withSpots)
  })
})
