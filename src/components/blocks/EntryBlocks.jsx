import { resizeCloudinaryImage } from '../../data/cloudinary'
import './blocks.css'

// Draws the blocks of a project, case study or page (About). The editor's canvas
// uses blockFrame() too, so what you see while editing is what visitors get.
// A "layout" block is a row split into columns, each holding its own stack of
// headings, text, images and videos (stacked one under another on phones).

export default function EntryBlocks({ blocks }) {
  return (
    <div className="entry-blocks">
      {blocks.filter(isFilled).map((block, index) => (
        <div key={index} {...blockFrame(block)}>
          <BlockContent block={block} isFirst={index === 0} />
        </div>
      ))}
    </div>
  )
}

// The page's content width on a 1440px laptop (the size the designs were drawn
// at): what a box's laptop shape is measured against
export const LAPTOP_PAGE_WIDTH = 1400

// The outer box of a block: which side it sits on, and (for photos and videos)
// how wide and how tall it is. `columnWidth` is the share of the row a layout
// column takes (100 outside layouts).
//
// --media-shape is the box's laptop shape (width / height). Every screen uses it, so
// the saved height means "the height on a 1440px laptop" and the box grows and
// shrinks with the page, showing the same crop everywhere, the editor included.
// Gaps between layout columns are left out on purpose: they make the shape at most
// ~5% too wide, which isn't worth the extra sums.
export function blockFrame(block, extraClassName = '', columnWidth = 100) {
  const { align = 'left', width = 100, height = null } = block.content
  const isMedia = block.type === 'image' || block.type === 'video'
  const laptopWidth = Math.round(LAPTOP_PAGE_WIDTH * (columnWidth / 100) * (width / 100))
  return {
    className: `entry-block entry-block--${block.type} entry-block--align-${align} ${extraClassName}`,
    style: isMedia
      ? {
          '--media-width': `${width}%`,
          '--media-shape': height ? `${laptopWidth} / ${height}` : null,
        }
      : undefined,
  }
}

function BlockContent({ block, isFirst }) {
  const { content } = block

  if (block.type === 'heading') return <h2 className="entry-heading">{content.text}</h2>

  if (block.type === 'text') {
    return (
      <div className="entry-text">
        {toParagraphs(content.body).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      </div>
    )
  }

  if (block.type === 'image' || block.type === 'video') {
    return <BlockMedia type={block.type} content={content} isFirst={isFirst} />
  }

  if (block.type === 'layout') {
    return (
      <div {...layoutFrame(content)}>
        {content.columns.map((column, columnIndex) => (
          <div key={columnIndex} className="entry-layout__column">
            {column.items.filter(isFilled).map((item, itemIndex) => (
              <div key={itemIndex} {...blockFrame(item, '', column.width)}>
                <BlockContent block={item} isFirst={isFirst} />
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  return null
}

// A layout starts with empty photo spots (no file yet); the editor shows them as
// "+ Image or video" boxes
export function isEmptySpot(block) {
  return (block.type === 'image' || block.type === 'video') && !block.content.src
}

// Visitors only see blocks with something in them: a layout's unused photo spots,
// headings and text boxes — or a layout left completely empty — would show as gaps
function isFilled(block) {
  if (block.type === 'heading') return (block.content.text ?? '').trim() !== ''
  if (block.type === 'text') return (block.content.body ?? '').trim() !== ''
  if (block.type === 'layout') return block.content.columns.some((column) => column.items.some(isFilled))
  return !isEmptySpot(block)
}

// The grid of a layout block: e.g. widths 40 and 60 → "40fr 60fr", a 40 : 60 split.
// The gap class sets the space between columns and between stacked items.
export function layoutFrame(content) {
  return {
    className: `entry-layout entry-layout--${content.vertical ?? 'top'} entry-layout--gap-${content.gap ?? 'medium'}`,
    style: { '--layout-columns': content.columns.map((column) => `${column.width}fr`).join(' ') },
  }
}

// A blank line starts a new paragraph. A single line break inside a paragraph is
// treated as a space: text pasted from Figma, Notion or PDFs often has line breaks
// mid-sentence, and keeping them made ragged one-word lines on phones.
export function toParagraphs(body) {
  return body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean)
}

// A photo or video inside its frame. The frame is the box (width and height from
// the editor) and hides whatever is cropped away. The editor passes `children` to
// lay its drag area over the top.
export function BlockMedia({ type, content, isFirst = false, imageWidth = 2000, children }) {
  const { fit } = framingOf(content)
  const frameClassName = [
    'entry-media-frame',
    content.height ? 'entry-media-frame--fixed-height' : '',
    fit === 'fit' ? 'entry-media-frame--fit' : '',
  ].join(' ')

  return (
    <div className={frameClassName}>
      {type === 'image' ? (
        <img
          className="entry-media"
          src={resizeCloudinaryImage(content.src, imageWidth)}
          alt={content.alt ?? ''}
          loading={isFirst ? 'eager' : 'lazy'}
          style={mediaStyle(content)}
        />
      ) : (
        <BlockVideo content={content} />
      )}
      {children}
    </div>
  )
}

// Blocks saved before fit/fill/crop existed have none of these, so they get the
// old behaviour: fill, from the middle, no zoom
export function framingOf(content) {
  return { fit: content.fit ?? 'fill', focus: content.focus ?? { x: 50, y: 50 }, zoom: content.zoom ?? 1 }
}

// How the photo/video sits in its frame:
//   fit  → the whole thing shows (contain)
//   fill → covers the frame (cover), with the focus point kept in view
//   crop → fill, then zoomed in around the focus point
// With no fixed height the frame already has the photo's own shape, so "fill"
// simply shows all of it — contain keeps tall screenshots whole under max-height.
export function mediaStyle(content) {
  const { fit, focus, zoom } = framingOf(content)
  const showsWhole = fit === 'fit' || (fit === 'fill' && !content.height)
  if (showsWhole) return { objectFit: 'contain' }

  const focusPoint = `${focus.x}% ${focus.y}%`
  const style = { objectFit: 'cover', objectPosition: focusPoint }
  if (fit === 'crop' && zoom > 1) {
    style.transform = `scale(${zoom})`
    style.transformOrigin = focusPoint      // zoom in towards the focus point, so it stays put
  }
  return style
}

// "loop" plays silently on repeat like a moving image; "controls" lets visitors
// play, pause and turn the sound on
export function BlockVideo({ content }) {
  const loops = content.playback !== 'controls'
  return (
    <video
      className="entry-media"
      style={mediaStyle(content)}
      // With controls, "#t=0.1" asks the browser to show a frame instead of a black box before play
      src={loops ? content.src : `${content.src}#t=0.1`}
      autoPlay={loops}
      muted={loops}
      loop={loops}
      controls={!loops}
      playsInline
      preload="metadata"
    />
  )
}
