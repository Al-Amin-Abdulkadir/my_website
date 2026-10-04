import { resizeCloudinaryImage } from '../../data/projects'
import './blocks.css'

// Draws the blocks of a project, case study or page (About). The editor's canvas
// uses blockFrame() too, so what you see while editing is what visitors get.

export default function EntryBlocks({ blocks }) {
  return (
    <div className="entry-blocks">
      {blocks.map((block, index) => (
        <div key={index} {...blockFrame(block)}>
          <BlockContent block={block} isFirst={index === 0} />
        </div>
      ))}
    </div>
  )
}

// The outer box of a block: which side it sits on, and (for photos and videos)
// how wide and how tall it is
export function blockFrame(block, extraClassName = '') {
  const { align = 'left', width = 100, height = null } = block.content
  const isMedia = block.type === 'image' || block.type === 'video'
  return {
    className: `entry-block entry-block--${block.type} entry-block--align-${align} ${extraClassName}`,
    style: isMedia ? { '--media-width': `${width}%`, '--media-height': height ? `${height}px` : null } : undefined,
  }
}

function BlockContent({ block, isFirst }) {
  const { content } = block

  if (block.type === 'heading') return <h2 className="entry-heading">{content.text}</h2>

  if (block.type === 'text') {
    // A blank line between lines of text starts a new paragraph
    return (
      <div className="entry-text">
        {content.body.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      </div>
    )
  }

  if (block.type === 'image') {
    return (
      <img
        className={`entry-media ${content.height ? 'entry-media--fixed-height' : ''}`}
        src={resizeCloudinaryImage(content.src, 2000)}
        alt={content.alt ?? ''}
        loading={isFirst ? 'eager' : 'lazy'}
      />
    )
  }

  if (block.type === 'video') return <BlockVideo content={content} />

  return null
}

// "loop" plays silently on repeat like a moving image; "controls" lets visitors
// play, pause and turn the sound on
export function BlockVideo({ content }) {
  const loops = content.playback !== 'controls'
  return (
    <video
      className={`entry-media ${content.height ? 'entry-media--fixed-height' : ''}`}
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
