import TextReveal from '../ui/TextReveal'
import useIsMobile from '../../hooks/useIsMobile'

const designSkills = [
  { name: 'Figma',     level: 90 },
  { name: 'Canva',     level: 85 },
  { name: 'Photopea',  level: 75 },
  { name: 'InDesign',  level: 30 },
  { name: 'Webflow',   level: 25 },
]

const techSkills = [
  { name: 'Python',      level: 80 },
  { name: 'FastAPI',     level: 75 },
  { name: 'PostgreSQL',  level: 70 },
  { name: 'HTML / CSS',  level: 85 },
  { name: 'C++',         level: 30 },
  { name: 'Machine Learning', level: 35 },
]

const s = {
  section: {
    padding: '140px 40px',
    borderTop: '1px solid var(--grey-2)',
  },
  inner: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  label: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'var(--grey-4)',
    marginBottom: '16px',
  },
  heading: {
    fontSize: 'var(--text-4xl)',
    fontWeight: 700,
    lineHeight: 0.95,
    letterSpacing: '-0.04em',
    color: 'var(--white)',
    margin: '0 0 80px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '80px',
  },
  colLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--grey-4)',
    marginBottom: '32px',
    paddingBottom: '16px',
    borderBottom: '1px solid var(--grey-2)',
  },
  skillRow: {
    marginBottom: '24px',
  },
  skillTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  skillName: {
    fontSize: 'var(--text-base)',
    fontWeight: 500,
    color: 'var(--white)',
    letterSpacing: '-0.01em',
  },
  skillPct: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    color: 'var(--grey-4)',
  },
  barBg: {
    width: '100%',
    height: '1px',
    backgroundColor: 'var(--grey-2)',
    position: 'relative',
    overflow: 'hidden',
  },
  barFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: 'var(--white)',
    transition: 'width 1.2s cubic-bezier(0.19, 1, 0.22, 1)',
  },
}

function SkillBar({ name, level, delay }) {
  return (
    <TextReveal delay={delay}>
      <div style={s.skillRow}>
        <div style={s.skillTop}>
          <span style={s.skillName}>{name}</span>
          <span style={s.skillPct}>{level}</span>
        </div>
        <div style={s.barBg}>
          <div style={{ ...s.barFill, width: `${level}%` }} />
        </div>
      </div>
    </TextReveal>
  )
}

export default function Skills() {
  const isMobile = useIsMobile()

  return (
    <section id="skills" style={{ ...s.section, padding: isMobile ? '80px 20px' : '140px 40px' }}>
      <div style={s.inner}>
        <TextReveal>
          <p style={s.label}>Capabilities</p>
        </TextReveal>
        <TextReveal delay={100}>
          <h2 style={s.heading}>
            What I work<br />with.
          </h2>
        </TextReveal>

        <div style={{ ...s.grid, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '48px' : '80px' }}>
          <div>
            <TextReveal>
              <p style={s.colLabel}>Design</p>
            </TextReveal>
            {designSkills.map((sk, i) => (
              <SkillBar key={sk.name} {...sk} delay={i * 60} />
            ))}
          </div>

          <div>
            <TextReveal>
              <p style={s.colLabel}>Engineering</p>
            </TextReveal>
            {techSkills.map((sk, i) => (
              <SkillBar key={sk.name} {...sk} delay={i * 60} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
