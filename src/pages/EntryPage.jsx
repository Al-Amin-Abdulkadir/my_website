import { Link, useParams } from 'react-router-dom'
import { useCmsContent } from '../data/useCmsContent'
import EntryBlocks, { toParagraphs } from '../components/blocks/EntryBlocks'
import UnbuiltPage from './UnbuiltPage'
import './EntryPage.css'

// One page made of blocks (Personal Website Redesign/UI:UX/work Detail.png):
// title, intro, coloured tag pills, then the blocks — headings, text, photos and
// videos placed left, middle or right. Used for projects, case studies and About.

// Tag pills cycle through the colours from the design
const PILL_COLORS = ['var(--dusty-blue)', 'var(--dusty-rose)', 'var(--sage-moss)', 'var(--washed-lilac)']

// key={slug}: going from one project straight to another builds a fresh page,
// instead of showing the previous project for a moment while the new one loads
export function ProjectPage() {
  const { slug } = useParams()
  return <EntryPage key={slug} apiPath={`/api/projects/${slug}`} backLink={{ to: '/projects', label: 'See all projects' }} />
}

export function CaseStudyPage() {
  const { slug } = useParams()
  return <EntryPage key={slug} apiPath={`/api/case-studies/${slug}`} backLink={{ to: '/case-studies', label: 'See all case studies' }} />
}

export function AboutPage() {
  return <EntryPage apiPath="/api/pages/about" whileUnpublished={<UnbuiltPage name="About Me" />} />
}

function EntryPage({ apiPath, backLink, whileUnpublished }) {
  const { data: entry, error, isLoading } = useCmsContent(apiPath)

  if (isLoading) return <main className="detail-page" aria-busy="true" />

  if (error?.isNotFound && whileUnpublished) return whileUnpublished

  if (error) {
    return (
      <main className="detail-page detail-page--missing">
        <p>{error.isNotFound ? 'This page doesn’t exist.' : error.message}</p>
        {backLink && <Link to={backLink.to} className="detail-back">{backLink.label}</Link>}
      </main>
    )
  }

  return (
    <main className="detail-page">
      <EntryHeader entry={entry} />
      <EntryBlocks blocks={entry.blocks} />
    </main>
  )
}

// Also used by the editor's canvas, so the header looks the same there
export function EntryHeader({ entry }) {
  return (
    <header className="detail-header">
      <h1 className="detail-title">{entry.title}</h1>
      {entry.description && (
        // Same paragraph rule as the body: a blank line starts a new paragraph
        <div className="detail-intro">
          {toParagraphs(entry.description).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </div>
      )}

      {entry.tags?.length > 0 && (
        <ul className="detail-tags">
          {entry.tags.map((tag, index) => (
            <li key={`${index}-${tag}`} className="detail-tag" style={{ background: PILL_COLORS[index % PILL_COLORS.length] }}>
              {tag}
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}
