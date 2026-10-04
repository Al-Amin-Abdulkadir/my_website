import { Link } from 'react-router-dom'
import { findProject, projectsPageRows } from '../data/projects'
import './Projects.css'

// The Projects page from the redesign: an editorial grid of "feature" rows
// (one big image) and "pair" rows (large + small image), then a sign-off
// and a giant PROJECTS wordmark cut off by the bottom of the page.
export default function Projects() {
  return (
    <main className="projects-page">
      <p className="projects-intro">
        A Selection of Branding, UI/UX,<br />and Engineering projects…
      </p>

      {projectsPageRows.map((row, index) => (
        row.type === 'feature'
          ? <FeatureRow key={index} project={findProject(row.project)} isFirst={index === 0} />
          : <PairRow
              key={index}
              large={findProject(row.large)}
              small={findProject(row.small)}
              largeSide={row.largeSide}
            />
      ))}

      <p className="projects-more">
        More on the way <span className="projects-more__dot" aria-hidden="true" />
      </p>

      <div className="projects-wordmark" aria-hidden="true">PROJECTS</div>
    </main>
  )
}

// One full-width image; title on the left, description on the right
function FeatureRow({ project, isFirst }) {
  return (
    <section className="feature-row">
      <ProjectImage project={project} size="full" isAboveTheFold={isFirst} />
      <div className="feature-row__caption">
        <ProjectTitle project={project} />
        <ProjectDescription project={project} />
      </div>
    </section>
  )
}

// A large and a small image side by side. The small project's caption sits under
// its image; the large project's caption sits below the whole row (see Projects.css).
function PairRow({ large, small, largeSide }) {
  return (
    <section className={`pair-row pair-row--large-${largeSide}`}>
      <div className="pair-row__large-image">
        <ProjectImage project={large} size="large" />
      </div>

      <div className="pair-row__small">
        <ProjectImage project={small} size="small" />
        <ProjectTitle project={small} />
        <ProjectDescription project={small} />
      </div>

      <div className="pair-row__large-caption">
        <ProjectTitle project={large} />
        <ProjectDescription project={large} />
      </div>
    </section>
  )
}

function ProjectImage({ project, size, isAboveTheFold = false }) {
  return (
    <Link to={`/project/${project.id}`} className={`project-image project-image--${size}`}>
      <img
        src={resizeCloudinaryImage(project.cover, size === 'small' ? 1200 : 2000)}
        alt={project.title}
        loading={isAboveTheFold ? 'eager' : 'lazy'}
        style={{ objectPosition: project.coverPosition ?? 'center' }}
      />
    </Link>
  )
}

function ProjectTitle({ project }) {
  return (
    <h2 className="project-title">
      <Link to={`/project/${project.id}`}>{project.title}</Link>
    </h2>
  )
}

function ProjectDescription({ project }) {
  // Some projects don't have their real description yet — show nothing rather than filler
  if (!project.description) return null
  return <p className="project-description">{project.description}</p>
}

// Old projects' covers live on Cloudinary at full size. Asking Cloudinary for a
// width avoids downloading 5000px images for a 1400px slot. Local covers pass through.
function resizeCloudinaryImage(url, width) {
  if (!url.includes('res.cloudinary.com')) return url
  return url.replace('/upload/f_auto,q_auto', `/upload/f_auto,q_auto,w_${width}`)
}
