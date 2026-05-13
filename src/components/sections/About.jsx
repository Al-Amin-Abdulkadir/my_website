import TextReveal from '../ui/TextReveal'
import MagneticButton from '../ui/MagneticButton'
import useIsMobile from '../../hooks/useIsMobile'

const s = {
  section: {
    padding: '140px 40px',
    borderTop: '1px solid var(--grey-2)',
  },
  inner: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '80px',
    maxWidth: '1200px',
    margin: '0 auto',
    alignItems: 'start',
  },
  label: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'var(--grey-4)',
    marginBottom: '40px',
  },
  heading: {
    fontSize: 'var(--text-4xl)',
    fontWeight: 700,
    lineHeight: 0.95,
    letterSpacing: '-0.04em',
    color: 'var(--white)',
    margin: '0 0 48px',
  },
  accent: {
    color: 'var(--grey-3)',
  },
  body: {
    fontSize: 'var(--text-base)',
    color: 'var(--grey-5)',
    lineHeight: 1.8,
    marginBottom: '24px',
  },
  pull: {
    fontSize: 'var(--text-xl)',
    fontWeight: 500,
    color: 'var(--white)',
    lineHeight: 1.4,
    letterSpacing: '-0.02em',
    borderLeft: '2px solid var(--grey-3)',
    paddingLeft: '24px',
    margin: '40px 0',
  },
  linksRow: {
    display: 'flex',
    gap: '20px',
    marginTop: '40px',
    flexWrap: 'wrap',
  },
  link: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--grey-4)',
    borderBottom: '1px solid var(--grey-3)',
    paddingBottom: '2px',
    transition: 'color 0.2s ease',
    textDecoration: 'none',
  },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2px',
    marginTop: '0',
  },
  stat: {
    padding: '32px 28px',
    backgroundColor: 'var(--grey-1)',
    border: '1px solid var(--grey-2)',
  },
  statNumber: {
    fontSize: 'var(--text-3xl)',
    fontWeight: 700,
    letterSpacing: '-0.04em',
    color: 'var(--white)',
    lineHeight: 1,
    marginBottom: '8px',
  },
  statLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--grey-4)',
  },
  firstStepBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '40px',
    padding: '12px 20px',
    border: '1px solid var(--grey-2)',
    borderRadius: '2px',
    textDecoration: 'none',
    transition: 'border-color 0.2s ease',
  },
  badgeLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--grey-4)',
  },
  badgeArrow: {
    color: 'var(--grey-4)',
    fontSize: '12px',
  },
}

const stats = [
  { number: '1+',  label: 'Years designing' },
  { number: '6+',  label: 'Projects shipped' },
  { number: '2',   label: 'Disciplines' },
  { number: '∞',   label: 'Curiosity' },
]

export default function About() {
  const isMobile = useIsMobile()

  return (
    <section id="about" style={{ ...s.section, padding: isMobile ? '80px 20px' : '140px 40px' }}>
      <div style={{ ...s.inner, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '48px' : '80px' }}>
        <div>
          <TextReveal>
            <p style={s.label}>About</p>
          </TextReveal>

          <TextReveal delay={100}>
            <h2 style={s.heading}>
              Not the <span style={s.accent}>typical</span><br />
              path in.
            </h2>
          </TextReveal>

          <TextReveal delay={150}>
            <p style={s.body}>
              I failed my high school exams. Multiple times. While everyone else moved on,
              I stayed behind, repeating, retrying, figuring it out alone. Eventually I found
              my way to university, moved abroad, studied marketing, and still had no clear direction.
            </p>
          </TextReveal>

          <TextReveal delay={200}>
            <p style={s.body}>
              What changed everything wasn't a classroom. It was curiosity, a hunger that
              hit every time I saw something fascinating. I'd learn it, break it down, and
              figure out how to use it myself. That habit opened mental floodgates I didn't
              know I had.
            </p>
          </TextReveal>

          <TextReveal delay={250}>
            <blockquote style={s.pull}>
              "I stopped focusing on what the computer could show me.
              I became interested in how it actually worked."
            </blockquote>
          </TextReveal>

          <TextReveal delay={300}>
            <p style={s.body}>
              That shift led me from design tools into backend engineering, from HTML into
              Python, FastAPI, and PostgreSQL. Now into machine learning. I build because
              I need to understand. Based in Dubai, open to opportunities globally.
            </p>
          </TextReveal>

          <TextReveal delay={350}>
            <div style={s.linksRow}>
              <MagneticButton href="https://github.com/Al-Amin-Abdulkadir" target="_blank" rel="noopener noreferrer">
                <span style={s.link}>GitHub</span>
              </MagneticButton>
              <MagneticButton href="https://www.linkedin.com/in/amin-abdulkadir-59a50129b/" target="_blank" rel="noopener noreferrer">
                <span style={s.link}>LinkedIn</span>
              </MagneticButton>
              <MagneticButton href="mailto:alaminabdulkadir5@gmail.com">
                <span style={s.link}>Email</span>
              </MagneticButton>
            </div>
          </TextReveal>
        </div>

        <div>
          <TextReveal delay={100}>
            <div style={s.statGrid}>
              {stats.map(({ number, label }) => (
                <div key={label} style={s.stat}>
                  <p style={s.statNumber}>{number}</p>
                  <p style={s.statLabel}>{label}</p>
                </div>
              ))}
            </div>
          </TextReveal>

          <TextReveal delay={150}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              marginTop: '20px',
              padding: '10px 18px',
              border: '1px solid var(--grey-2)',
              borderRadius: '999px',
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--white)',
                display: 'inline-block',
                flexShrink: 0,
              }} />
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--grey-4)',
              }}>
                7 months in software engineering
              </span>
            </div>
          </TextReveal>

          <TextReveal delay={200}>
            <MagneticButton
              href="https://www.behance.net/firststepmedia"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'block' }}
            >
              <div style={s.firstStepBadge}>
                <span style={s.badgeLabel}>FirstStepMedia, Design Brand</span>
                <span style={s.badgeArrow}>↗</span>
              </div>
            </MagneticButton>
          </TextReveal>
        </div>
      </div>
    </section>
  )
}
