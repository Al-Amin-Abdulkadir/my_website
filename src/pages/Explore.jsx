import { useEffect, useRef, useState } from 'react'
import { useCmsContent } from '../data/useCmsContent'
import { compressCloudinaryVideo, isVideoUrl, resizeCloudinaryImage, videoStillOf } from '../data/cloudinary'
import LoopingVideo, { prefersReducedMotion } from '../components/ui/LoopingVideo'
import { EXPLORE_CATEGORIES, layoutRuns, ratioOf } from './explorePieces'
import './Projects.css'
import './Explore.css'

// Explore: a masonry wall of single pieces (designs, inspirations, assets), each
// a photo or a video, added in the CMS (Admin → Explore). Banners run across the
// page; everything else flows into columns (the rules are in explorePieces.js).
// Clicking a piece opens it larger with its title, caption and link.
export default function Explore() {
  const { data: pieces, error } = useCmsContent('/api/explore-pieces')
  const [openPiece, setOpenPiece] = useState(null)
  const columnCount = useColumnCount()

  const runs = layoutRuns(pieces ?? [], columnCount)

  return (
    <main className="projects-page">
      <p className="projects-intro">
        Pieces of design, inspiration<br />and assets, collected…
      </p>

      {error && <p className="projects-error">{error.message}</p>}

      <div className="explore-wall">
        {runs.map((run, runIndex) => (
          run.type === 'banner' ? (
            <PieceTile key={run.index} piece={run.piece} imageWidth={2400} onOpen={setOpenPiece} />
          ) : (
            <div key={`run-${runIndex}`} className="explore-columns" style={{ '--explore-columns': columnCount }}>
              {run.columns.map((column, columnIndex) => (
                <div key={columnIndex} className="explore-column">
                  {column.map(({ piece, index }) => (
                    <PieceTile key={index} piece={piece} imageWidth={900} onOpen={setOpenPiece} />
                  ))}
                </div>
              ))}
            </div>
          )
        ))}
      </div>

      <p className="projects-more">
        More on the way <span className="projects-more__dot" style={{ background: 'var(--sage-moss)' }} aria-hidden="true" />
      </p>

      <div className="projects-wordmark" aria-hidden="true">EXPLORE</div>

      {openPiece && <PieceView piece={openPiece} onClose={() => setOpenPiece(null)} />}
    </main>
  )
}

// One piece in the wall: its box has the piece's shape before the file loads,
// so the wall doesn't jump around while images arrive
function PieceTile({ piece, imageWidth, onOpen }) {
  return (
    <button
      type="button"
      className={`explore-piece ${piece.shape === 'banner' ? 'explore-piece--banner' : ''}`}
      style={{ aspectRatio: ratioOf(piece) }}
      onClick={() => onOpen(piece)}
      aria-label={piece.title ? `Open “${piece.title}”` : 'Open this piece'}
    >
      {/* The button already names the piece, so the picture itself stays silent */}
      <PieceMedia piece={piece} width={imageWidth} isDecorative />
    </button>
  )
}

// A photo, or a video looping silently (its first frame for visitors who asked
// their device to reduce motion)
function PieceMedia({ piece, width, className = 'explore-piece__media', isDecorative = false }) {
  const description = isDecorative ? '' : piece.title
  if (!isVideoUrl(piece.mediaUrl)) {
    return <img className={className} src={resizeCloudinaryImage(piece.mediaUrl, width)} alt={description} loading="lazy" />
  }

  const still = videoStillOf(piece.mediaUrl, width)
  const shouldPlay = !prefersReducedMotion()
  if (!shouldPlay && still) return <img className={className} src={still} alt={description} loading="lazy" />
  return (
    <LoopingVideo
      className={className}
      src={compressCloudinaryVideo(piece.mediaUrl, width)}
      poster={still}
      label={description || undefined}
      shouldPlay={shouldPlay}
    />
  )
}

// The piece brought forward over a dark backdrop, whole (nothing cropped), with
// its title, type, caption and link. Escape, the close button or a click on the
// backdrop sends it back.
//
// A real <dialog> opened with showModal(): the browser keeps Tab inside it and
// hides the page behind from screen readers, which a plain <div> can't promise.
function PieceView({ piece, onClose }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const opener = document.activeElement      // focus goes back here on close, for keyboard users
    dialogRef.current.showModal()              // also moves focus to the first button (Close)
    document.body.style.overflow = 'hidden'    // freeze the page behind

    return () => {
      document.body.style.overflow = ''
      opener?.focus()
    }
  }, [])

  // Escape fires "cancel". Let React close it (by removing it), not the browser on its own.
  const closeOnEscape = (event) => {
    event.preventDefault()
    onClose()
  }

  return (
    <dialog ref={dialogRef} className="piece-view" aria-label={piece.title || 'Piece'} onCancel={closeOnEscape} data-lenis-prevent>
      <div className="piece-view__backdrop" onClick={onClose} />
      <button type="button" className="piece-view__close" onClick={onClose}>Close</button>

      <figure className="piece-view__figure">
        <PieceMedia piece={piece} width={2000} className="piece-view__media" />
        {(piece.title || piece.category || piece.caption || piece.linkUrl) && (
          <figcaption className="piece-view__caption">
            {piece.title && <span className="piece-view__title">{piece.title}</span>}
            {piece.category && <span className="piece-view__type">{EXPLORE_CATEGORIES[piece.category]}</span>}
            {piece.caption && <p>{piece.caption}</p>}
            {piece.linkUrl && (
              <a className="piece-view__link" href={piece.linkUrl} target="_blank" rel="noreferrer">
                {piece.linkLabel || 'See more'} ↗
              </a>
            )}
          </figcaption>
        )}
      </figure>
    </dialog>
  )
}

// 4 columns on a laptop, 3 on a tablet, 2 on a phone. The placement happens in
// JavaScript (explorePieces.js), so it needs to know the count, not just the CSS.
const COLUMN_BREAKPOINTS = [
  { query: '(max-width: 700px)', columns: 2 },
  { query: '(max-width: 1100px)', columns: 3 },
]

function useColumnCount() {
  const countNow = () => COLUMN_BREAKPOINTS.find(({ query }) => window.matchMedia(query).matches)?.columns ?? 4
  const [count, setCount] = useState(countNow)

  useEffect(() => {
    const lists = COLUMN_BREAKPOINTS.map(({ query }) => window.matchMedia(query))
    const update = () => setCount(countNow())
    lists.forEach((list) => list.addEventListener('change', update))
    return () => lists.forEach((list) => list.removeEventListener('change', update))
  }, [])

  return count
}
