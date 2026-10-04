import { useCmsContent } from '../data/useCmsContent'
import { FeatureRow, PairRow } from '../components/projects/ProjectRows'
import './Projects.css'

// The Projects page from the redesign: an editorial grid of "feature" rows
// (one big image) and "pair" rows (large + small image), then a sign-off and a
// giant PROJECTS wordmark cut off by the bottom of the page.
// The rows come from the CMS (Admin → Projects page layout).
export default function Projects() {
  const { data: rows, error } = useCmsContent('/api/projects-page')

  return (
    <main className="projects-page">
      <p className="projects-intro">
        A Selection of Branding, UI/UX,<br />and Engineering projects…
      </p>

      {error && <p className="projects-error">{error.message}</p>}

      {rows?.map((row, index) => (
        row.type === 'feature'
          ? <FeatureRow key={index} entry={row.mainProject} linkBase="/project/" isFirst={index === 0} />
          : <PairRow
              key={index}
              large={row.mainProject}
              small={row.secondProject}
              largeSide={row.largeSide}
              linkBase="/project/"
            />
      ))}

      <p className="projects-more">
        More on the way <span className="projects-more__dot" aria-hidden="true" />
      </p>

      <div className="projects-wordmark" aria-hidden="true">PROJECTS</div>
    </main>
  )
}
