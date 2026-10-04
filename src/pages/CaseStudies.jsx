import { useCmsContent } from '../data/useCmsContent'
import { FeatureRow } from '../components/projects/ProjectRows'
import './Projects.css'

// Case Studies (Personal Website Redesign/UI:UX/Case Studies.png): the design's
// header line, each published case study as a feature row, and the giant
// two-line CASE STUDIES wordmark cut off by the bottom of the page.
// Case studies are added in the CMS (Admin → Case studies).
export default function CaseStudies() {
  const { data: caseStudies, error } = useCmsContent('/api/case-studies')

  return (
    <main className="projects-page">
      <p className="projects-intro">
        A Selection of case studies on projects,<br />research and findings…
      </p>

      {error && <p className="projects-error">{error.message}</p>}

      {caseStudies?.map((caseStudy, index) => (
        <FeatureRow key={caseStudy.slug} entry={caseStudy} linkBase="/case-study/" isFirst={index === 0} />
      ))}

      <p className="projects-more">
        More on the way <span className="projects-more__dot" style={{ background: 'var(--sage-moss)' }} aria-hidden="true" />
      </p>

      <div className="projects-wordmark projects-wordmark--two-lines" aria-hidden="true">
        CASE<br />STUDIES
      </div>
    </main>
  )
}
