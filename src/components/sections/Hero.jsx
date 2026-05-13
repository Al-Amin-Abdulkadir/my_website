import { useEffect, useRef } from 'react'
import MagneticButton from '../ui/MagneticButton'
import HeroScene from '../three/HeroScene'
import useIsMobile from '../../hooks/useIsMobile'

const s = {
  section: {
    position: 'relative',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: '0 40px 64px',
    overflow: 'hidden',
  },
  eyebrow: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'var(--grey-4)',
    marginBottom: '24px',
    opacity: 0,
    animation: 'fadeUp 0.8s cubic-bezier(0.19,1,0.22,1) 0.2s forwards',
  },
  heading: {
    fontSize: 'var(--text-hero)',
    fontWeight: 700,
    lineHeight: 0.9,
    letterSpacing: '-0.04em',
    color: 'var(--white)',
    margin: 0,
  },
  line1: {
    display: 'block',
    opacity: 0,
    animation: 'fadeUp 0.9s cubic-bezier(0.19,1,0.22,1) 0.35s forwards',
  },
  line2: {
    display: 'block',
    color: 'var(--grey-3)',
    opacity: 0,
    animation: 'fadeUp 0.9s cubic-bezier(0.19,1,0.22,1) 0.5s forwards',
  },
  subtext: {
    marginTop: '40px',
    maxWidth: '520px',
    fontSize: 'var(--text-base)',
    color: 'var(--grey-4)',
    lineHeight: 1.6,
    opacity: 0,
    animation: 'fadeUp 0.8s cubic-bezier(0.19,1,0.22,1) 0.7s forwards',
  },
  ctas: {
    marginTop: '48px',
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
    opacity: 0,
    animation: 'fadeUp 0.8s cubic-bezier(0.19,1,0.22,1) 0.85s forwards',
  },
  ctaPrimary: {
    padding: '14px 32px',
    backgroundColor: 'var(--white)',
    color: 'var(--black)',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    borderRadius: '2px',
    fontWeight: 600,
    transition: 'background-color 0.2s ease, color 0.2s ease',
  },
  ctaSecondary: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--grey-4)',
    borderBottom: '1px solid var(--grey-3)',
    paddingBottom: '2px',
    transition: 'color 0.2s ease',
  },
  scrollCue: {
    position: 'absolute',
    bottom: '40px',
    right: '40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    opacity: 0,
    animation: 'fadeIn 1s ease 1.2s forwards',
  },
  scrollLine: {
    width: '1px',
    height: '48px',
    backgroundColor: 'var(--grey-3)',
    animation: 'scrollPulse 2s ease-in-out infinite',
  },
  scrollLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--grey-4)',
    writingMode: 'vertical-rl',
    textOrientation: 'mixed',
  },
  noise: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
    backgroundSize: '200px 200px',
    pointerEvents: 'none',
    zIndex: 0,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
  locationTag: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    letterSpacing: '0.1em',
    color: 'var(--grey-3)',
    marginBottom: '8px',
  },
}

export default function Hero() {
  const isMobile = useIsMobile()

  const scrollToWork = () => {
    document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="hero" style={{
      ...s.section,
      padding: isMobile ? '0 20px 56px' : '0 40px 64px',
    }}>
      <HeroScene />
      <div style={s.noise} />

      <div style={s.content}>
        <p style={s.eyebrow}>Designer &amp; Developer, Dubai, UAE</p>

        <h1 style={s.heading}>
          <span style={s.line1}>Al-Amin</span>
          <span style={s.line2}>Abdulkadir</span>
        </h1>

        <p style={{ ...s.subtext, maxWidth: isMobile ? '100%' : '520px' }}>
          I stopped focusing on what the computer could show me.
          I became interested in how it actually worked.
        </p>

        <div style={{ ...s.ctas, flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center' }}>
          <MagneticButton onClick={scrollToWork}>
            <span style={s.ctaPrimary}>View Work</span>
          </MagneticButton>
          <MagneticButton href="mailto:alaminabdulkadir5@gmail.com">
            <span style={s.ctaSecondary}>Get in Touch</span>
          </MagneticButton>
        </div>
      </div>

      {!isMobile && (
        <div style={s.scrollCue}>
          <span style={s.scrollLabel}>Scroll</span>
          <div style={s.scrollLine} />
        </div>
      )}
    </section>
  )
}
