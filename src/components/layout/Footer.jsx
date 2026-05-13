import MagneticButton from '../ui/MagneticButton'

const socials = [
  { label: 'GitHub',    href: 'https://github.com/Al-Amin-Abdulkadir' },
  { label: 'LinkedIn',  href: 'https://www.linkedin.com/in/amin-abdulkadir-59a50129b/' },
  { label: 'Behance',   href: 'https://www.behance.net/firststepmedia' },
  { label: 'Dribbble',  href: 'https://dribbble.com/firststepmedia' },
  { label: 'Instagram', href: 'https://www.instagram.com/f1rststepmedia/' },
]

const s = {
  footer: {
    borderTop: '1px solid var(--grey-2)',
    padding: '48px 40px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    alignItems: 'center',
    gap: '24px',
  },
  brand: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--grey-4)',
  },
  socials: {
    display: 'flex',
    gap: '28px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  socialLink: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--grey-4)',
    transition: 'color 0.2s ease',
    textDecoration: 'none',
  },
  copy: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    color: 'var(--grey-3)',
    textAlign: 'right',
    letterSpacing: '0.05em',
  },
}

export default function Footer() {
  return (
    <footer style={s.footer}>
      <span style={s.brand}>Al-Amin Abdulkadir</span>

      <nav style={s.socials}>
        {socials.map(({ label, href }) => (
          <MagneticButton key={label} href={href} target="_blank" rel="noopener noreferrer">
            <span style={s.socialLink}>{label}</span>
          </MagneticButton>
        ))}
      </nav>

      <span style={s.copy}>© {new Date().getFullYear()}</span>
    </footer>
  )
}
