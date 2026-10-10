import { isEmptySpot } from '../components/blocks/EntryBlocks'

// Editing a layout block (a row split into columns). Each function takes the
// layout's content and returns a new copy with one change — nothing is changed in
// place — so the editor just swaps in the new copy, and each step is easy to test.

// Starting points in the "Add content" panel. `sketch` lists what sits in each
// column ("heading", "text" or "media"); it draws the little preview AND becomes
// the layout's starting items: empty headings, empty text boxes, and empty photo
// spots waiting for an upload (see createLayout).
export const LAYOUT_PRESETS = [
  { name: 'two-side-by-side', label: 'Two side by side', widths: [50, 50], sketch: [['media'], ['media']] },
  { name: 'text-image', label: 'Text, then image', widths: [40, 60], sketch: [['text'], ['media']] },
  { name: 'image-text', label: 'Image, then text', widths: [60, 40], sketch: [['media'], ['text']] },
  { name: 'stacked-large', label: 'Two stacked, one large', widths: [35, 65], sketch: [['media', 'media'], ['media']] },
  { name: 'large-stacked', label: 'One large, two stacked', widths: [65, 35], sketch: [['media'], ['media', 'media']] },
  { name: 'three-columns', label: 'Three columns', widths: [33, 34, 33], sketch: [['media'], ['media'], ['media']] },
  { name: 'photo-grid', label: 'Four-photo grid', widths: [50, 50], sketch: [['media', 'media'], ['media', 'media']] },
  { name: 'photo-text-photo', label: 'Photo, text, photo', widths: [33, 34, 33], sketch: [['media'], ['text'], ['media']] },
  { name: 'heading-text-image', label: 'Heading and text, then image', widths: [40, 60], sketch: [['heading', 'text'], ['media']] },
  { name: 'large-between-pairs', label: 'Large between pairs', widths: [25, 50, 25], sketch: [['media', 'media'], ['media'], ['media', 'media']] },
  { name: 'four-columns', label: 'Four columns', widths: [25, 25, 25, 25], sketch: [['media'], ['media'], ['media'], ['media']] },
]

// Ready-made splits offered in the layout's toolbar, by number of columns
export const WIDTH_CHOICES = {
  2: [[50, 50], [40, 60], [60, 40], [33, 67], [67, 33], [25, 75], [75, 25]],
  3: [[33, 34, 33], [25, 50, 25], [50, 25, 25], [25, 25, 50]],
  4: [[25, 25, 25, 25]],
}

export const MAX_COLUMNS = 4
export const MIN_COLUMNS = 2

// What a brand-new block of each type starts with
export function newBlockContent(type, src = '') {
  if (type === 'heading') return { text: '', align: 'left' }
  if (type === 'text') return { body: '', align: 'left' }
  if (type === 'image') return { src, alt: '', align: 'center', width: 100, height: null }
  if (type === 'video') return { src, align: 'center', width: 100, height: null, playback: 'loop' }
  throw new Error(`Unknown block type “${type}”`)
}

export function createLayout(presetName) {
  const preset = LAYOUT_PRESETS.find((candidate) => candidate.name === presetName)
  if (!preset) throw new Error(`Unknown layout “${presetName}”`)
  return {
    vertical: 'top',
    gap: 'medium',
    columns: preset.widths.map((width, index) => ({
      width,
      items: preset.sketch[index].map((part) => {
        if (part === 'media') return newItem('image', newBlockContent('image'))   // an empty photo spot
        return newItem(part, newBlockContent(part))
      }),
    })),
  }
}

// A new block or layout item. It carries an editor-only key so React can tell
// blocks apart while they move.
export function newItem(type, content) {
  return { type, content, key: crypto.randomUUID() }
}

// Equal widths that still add up to exactly 100 (3 columns → 33, 34, 33)
export function equalWidths(count) {
  const base = Math.floor(100 / count)
  const widths = Array(count).fill(base)
  widths[Math.floor(count / 2)] += 100 - base * count
  return widths
}

export function setWidths(content, widths) {
  return { ...content, columns: content.columns.map((column, index) => ({ ...column, width: widths[index] })) }
}

export function addColumn(content) {
  if (content.columns.length >= MAX_COLUMNS) return content
  const columns = [...content.columns, { width: 0, items: [] }]
  return setWidths({ ...content, columns }, equalWidths(columns.length))
}

// The removed column's items move to its neighbour, so nothing is lost by accident
export function removeColumn(content, columnIndex) {
  if (content.columns.length <= MIN_COLUMNS) return content
  const removed = content.columns[columnIndex]
  const neighbourIndex = columnIndex === 0 ? 1 : columnIndex - 1
  const columns = content.columns
    .map((column, index) => (index === neighbourIndex ? { ...column, items: [...column.items, ...removed.items] } : column))
    .filter((column, index) => index !== columnIndex)
  return setWidths({ ...content, columns }, equalWidths(columns.length))
}

export function addItem(content, columnIndex, item) {
  return changeColumn(content, columnIndex, (items) => [...items, item])
}

// Swaps an item for a different one in the same spot (an empty photo spot → a video)
export function replaceItem(content, columnIndex, itemIndex, replacement) {
  return changeColumn(content, columnIndex, (items) =>
    items.map((item, index) => (index === itemIndex ? replacement : item)))
}

export function updateItem(content, columnIndex, itemIndex, changes) {
  return changeColumn(content, columnIndex, (items) =>
    items.map((item, index) => (index === itemIndex ? { ...item, content: { ...item.content, ...changes } } : item)))
}

export function removeItem(content, columnIndex, itemIndex) {
  return changeColumn(content, columnIndex, (items) => items.filter((item, index) => index !== itemIndex))
}

// Takes an item out of one place and puts it in another: up/down inside a column,
// or into another column (`to.itemIndex` is its position in the new column)
export function moveItem(content, from, to) {
  const moving = content.columns[from.columnIndex].items[from.itemIndex]
  const withoutIt = removeItem(content, from.columnIndex, from.itemIndex)
  return changeColumn(withoutIt, to.columnIndex, (items) => {
    const reordered = [...items]
    reordered.splice(to.itemIndex, 0, moving)
    return reordered
  })
}

function changeColumn(content, columnIndex, changeItems) {
  return {
    ...content,
    columns: content.columns.map((column, index) =>
      (index === columnIndex ? { ...column, items: changeItems(column.items) } : column)),
  }
}

// ── Drag and drop: swapping and moving ─────────────────
// A block's place is either on the page itself or inside a layout column:
//   { container: 'page', index }
//   { container: 'column', layoutKey, columnIndex, index }

export function findLocation(blocks, key) {
  for (const [index, block] of blocks.entries()) {
    if (block.key === key) return { container: 'page', index }
    if (block.type !== 'layout') continue
    for (const [columnIndex, column] of block.content.columns.entries()) {
      const itemIndex = column.items.findIndex((item) => item.key === key)
      if (itemIndex !== -1) return { container: 'column', layoutKey: block.key, columnIndex, index: itemIndex }
    }
  }
  return null
}

// Takes the block/item with `key` out of wherever it is and puts it at `target`
// (used when dropping on a column's empty space or at the end of the page).
// Moving a layout into a column is refused (layouts can't hold layouts), and the
// page is returned unchanged.
export function moveBlockTo(blocks, key, target) {
  const from = findLocation(blocks, key)
  if (!from) return blocks
  const moving = blockAt(blocks, from)
  if (moving.type === 'layout' && target.container === 'column') return blocks

  const withoutIt = from.container === 'page'
    ? blocks.filter((block) => block.key !== key)
    : changeLayout(blocks, from.layoutKey, (content) => removeItem(content, from.columnIndex, from.index))

  if (target.container === 'page') {
    const reordered = [...withoutIt]
    reordered.splice(target.index, 0, moving)
    return reordered
  }
  return changeLayout(withoutIt, target.layoutKey, (content) =>
    changeColumn(content, target.columnIndex, (items) => {
      const reordered = [...items]
      reordered.splice(target.index, 0, moving)
      return reordered
    }))
}

// Drop one block/item on another and they trade places — on the page, between
// columns, or one on the page and one in a column. Refused (page unchanged) when it
// would put a layout inside a column, including a layout swapping with its own item.
export function swapBlocks(blocks, keyA, keyB) {
  const a = findLocation(blocks, keyA)
  const b = findLocation(blocks, keyB)
  if (!a || !b || keyA === keyB) return blocks
  const blockA = blockAt(blocks, a)
  const blockB = blockAt(blocks, b)
  const layoutWouldGoInColumn = (blockA.type === 'layout' && b.container === 'column')
    || (blockB.type === 'layout' && a.container === 'column')
  if (layoutWouldGoInColumn) return blocks
  return replaceAt(replaceAt(blocks, a, blockB), b, blockA)
}

// Dropping one block on another: they swap — except on an empty photo spot, which
// is filled and disappears (otherwise the empty spot would drift to where the
// dropped block came from). One empty spot dropped on another changes nothing.
export function dropOnto(blocks, key, targetKey) {
  const from = findLocation(blocks, key)
  const target = findLocation(blocks, targetKey)
  if (!from || !target) return blocks
  const targetIsEmptySpot = isEmptySpot(blockAt(blocks, target))
  if (targetIsEmptySpot && isEmptySpot(blockAt(blocks, from))) return blocks

  const swapped = swapBlocks(blocks, key, targetKey)
  if (swapped === blocks || !targetIsEmptySpot) return swapped
  return removeByKey(swapped, targetKey)
}

function removeByKey(blocks, key) {
  const location = findLocation(blocks, key)
  if (location.container === 'page') return blocks.filter((block) => block.key !== key)
  return changeLayout(blocks, location.layoutKey, (content) => removeItem(content, location.columnIndex, location.index))
}

// The block/item at a place found by findLocation()
export function blockAt(blocks, location) {
  if (location.container === 'page') return blocks[location.index]
  return layoutByKey(blocks, location.layoutKey).content.columns[location.columnIndex].items[location.index]
}

function replaceAt(blocks, location, replacement) {
  if (location.container === 'page') {
    return blocks.map((block, index) => (index === location.index ? replacement : block))
  }
  return changeLayout(blocks, location.layoutKey, (content) =>
    changeColumn(content, location.columnIndex, (items) =>
      items.map((item, index) => (index === location.index ? replacement : item))))
}

function layoutByKey(blocks, layoutKey) {
  return blocks.find((block) => block.key === layoutKey)
}

function changeLayout(blocks, layoutKey, changeContent) {
  return blocks.map((block) => (block.key === layoutKey ? { ...block, content: changeContent(block.content) } : block))
}

// Editor keys on the way in (blocks and the items inside layouts) …
export function withEditorKeys(block) {
  const keyed = { ...block, key: crypto.randomUUID() }
  if (block.type !== 'layout') return keyed
  const columns = block.content.columns.map((column) => ({
    ...column,
    items: column.items.map((item) => ({ ...item, key: crypto.randomUUID() })),
  }))
  return { ...keyed, content: { ...block.content, columns } }
}

// … and off again before saving, so the database only stores real content
export function withoutEditorKeys({ key, ...block }) {
  if (block.type !== 'layout') return block
  const columns = block.content.columns.map((column) => ({
    ...column,
    items: column.items.map(({ key: itemKey, ...item }) => item),
  }))
  return { ...block, content: { ...block.content, columns } }
}
