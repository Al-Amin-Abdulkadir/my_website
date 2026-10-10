import { Link } from 'react-router-dom'
import { resizeCloudinaryImage } from '../../data/cloudinary'
import { coverStyle, showsWholeCover } from './coverFraming'
import '../../pages/Projects.css'

// The editorial rows from the Projects design, shared by the Projects and Case
// Studies pages. `linkBase` is where a card leads: '/project/' or '/case-study/'.

// One full-width image; title on the left, description on the right
export function FeatureRow({ entry, linkBase, isFirst = false }) {
  return (
    <section className="feature-row">
      <EntryImage entry={entry} linkBase={linkBase} size="full" isAboveTheFold={isFirst} />
      <div className="feature-row__caption">
        <EntryTitle entry={entry} linkBase={linkBase} />
        <EntryDescription entry={entry} />
      </div>
    </section>
  )
}

// A large and a small image side by side. The small one's caption sits under
// its image; the large one's caption sits below the whole row (see Projects.css).
export function PairRow({ large, small, largeSide, linkBase }) {
  return (
    <section className={`pair-row pair-row--large-${largeSide}`}>
      <div className="pair-row__large-image">
        <EntryImage entry={large} linkBase={linkBase} size="large" />
      </div>

      <div className="pair-row__small">
        <EntryImage entry={small} linkBase={linkBase} size="small" />
        <EntryTitle entry={small} linkBase={linkBase} />
        <EntryDescription entry={small} />
      </div>

      <div className="pair-row__large-caption">
        <EntryTitle entry={large} linkBase={linkBase} />
        <EntryDescription entry={large} />
      </div>
    </section>
  )
}

function EntryImage({ entry, linkBase, size, isAboveTheFold = false }) {
  return (
    <Link
      to={`${linkBase}${entry.slug}`}
      // "whole" only with an image to take the shape from; without one the card would collapse
      className={['project-image', `project-image--${size}`, entry.coverUrl && showsWholeCover(entry) && 'project-image--whole']
        .filter(Boolean).join(' ')}
    >
      {entry.coverUrl && (
        <img
          src={resizeCloudinaryImage(entry.coverUrl, size === 'small' ? 1200 : 2000)}
          alt={entry.title}
          loading={isAboveTheFold ? 'eager' : 'lazy'}
          style={coverStyle(entry)}
        />
      )}
    </Link>
  )
}

function EntryTitle({ entry, linkBase }) {
  return (
    <h2 className="project-title">
      <Link to={`${linkBase}${entry.slug}`}>{entry.title}</Link>
    </h2>
  )
}

function EntryDescription({ entry }) {
  // Some entries don't have a description yet — show nothing rather than filler
  if (!entry.description) return null
  return <p className="project-description">{entry.description}</p>
}
