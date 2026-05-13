import TextReveal from '../ui/TextReveal'
import MagneticButton from '../ui/MagneticButton'
import useIsMobile from '../../hooks/useIsMobile'

const s = {
  section: {
    padding: '140px 40px 80px',
    borderTop: '1px solid var(--grey-2)',
  },
  inner: {
    maxWidth: '900px',
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
    fontSize: 'var(--text-hero)',
    fontWeight: 700,
    lineHeight: 0.9,
    letterSpacing: '-0.04em',
    color: 'var(--white)',
    margin: '0 0 24px',
  },
  sub: {
    fontSize: 'var(--text-lg)',
    color: 'var(--grey-4)',
    lineHeight: 1.6,
    maxWidth: '520px',
    marginBottom: '56px',
  },
  emailBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '16px',
    padding: '18px 36px',
    border: '1px solid var(--grey-2)',
    borderRadius: '2px',
    transition: 'border-color 0.2s ease, background-color 0.2s ease',
    textDecoration: 'none',
    marginBottom: '80px',
  },
  emailText: {
    fontSize: 'var(--text-xl)',
    fontWeight: 500,
    letterSpacing: '-0.02em',
    color: 'var(--white)',
  },
  emailArrow: {
    fontSize: '20px',
    color: 'var(--grey-4)',
  },
  divider: {
    borderTop: '1px solid var(--grey-2)',
    marginBottom: '40px',
  },
  socRow: {
    display: 'flex',
    gap: '32px',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  socLinks: {
    display: 'flex',
    gap: '28px',
    flexWrap: 'wrap',
  },
  socLink: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--grey-4)',
    transition: 'color 0.2s ease',
    textDecoration: 'none',
    borderBottom: '1px solid var(--grey-2)',
    paddingBottom: '2px',
  },
  fsmNote: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    letterSpacing: '0.08em',
    color: 'var(--grey-3)',
  },
}

const socials = [
  { label: 'GitHub',    href: 'https://github.com/Al-Amin-Abdulkadir' },
  { label: 'LinkedIn',  href: 'https://www.linkedin.com/in/amin-abdulkadir-59a50129b/' },
  { label: 'Behance',   href: 'https://www.behance.net/firststepmedia' },
  { label: 'Dribbble',  href: 'https://dribbble.com/firststepmedia' },
  { label: 'TikTok',    href: 'https://www.tiktok.com/@f1rststepmedia' },
  { label: 'Instagram', href: 'https://www.instagram.com/f1rststepmedia/' },
]

export default function Contact() {
  const isMobile = useIsMobile()

  return (
    <section id="contact" style={{ ...s.section, padding: isMobile ? '80px 20px 60px' : '140px 40px 80px' }}>
      <div style={s.inner}>
        <TextReveal>
          <p style={s.label}>Let's Talk</p>
        </TextReveal>

        <TextReveal delay={100}>
          <h2 style={s.heading}>
            Get in<br />touch.
          </h2>
        </TextReveal>

        <TextReveal delay={200}>
          <p style={s.sub}>
            Open to roles in software engineering, ML, and design.
            Based in Dubai, available remotely.
          </p>
        </TextReveal>

        <TextReveal delay={300}>
          <MagneticButton href="mailto:alaminabdulkadir5@gmail.com">
            <div style={s.emailBtn}>
              <span style={s.emailText}>alaminabdulkadir5@gmail.com</span>
              <span style={s.emailArrow}>↗</span>
            </div>
          </MagneticButton>
        </TextReveal>

        <div style={s.divider} />

        <TextReveal delay={100}>
          <div style={s.socRow}>
            <nav style={s.socLinks}>
              {socials.map(({ label, href }) => (
                <MagneticButton key={label} href={href} target="_blank" rel="noopener noreferrer">
                  <span style={s.socLink}>{label}</span>
                </MagneticButton>
              ))}
            </nav>
            <span style={s.fsmNote}>FirstStepMedia · Dubai, UAE</span>
          </div>
        </TextReveal>
      </div>
    </section>
  )
}
