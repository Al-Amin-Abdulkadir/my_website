import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import TextReveal from '../components/ui/TextReveal'
import MagneticButton from '../components/ui/MagneticButton'
import { firstStepMedia } from '../data/projects'
import useIsMobile from '../hooks/useIsMobile'

const allSections = [
  {
    key: 'heroPages',
    label: 'Hero Pages',
    description: 'Concept web and app hero page designs.',
    images: firstStepMedia.heroPages,
  },
  {
    key: 'editorial',
    label: 'Editorial',
    description: 'Magazine covers, fashion editorial, and print design.',
    images: firstStepMedia.editorial,
  },
  {
    key: 'posters',
    label: 'Posters',
    description: 'Typographic and concept poster designs.',
    images: firstStepMedia.posters,
  },
  {
    key: 'branding',
    label: 'Branding',
    description: 'Brand identity and visual system design.',
    images: firstStepMedia.branding,
  },
]

const socials = [
  { label: 'Behance',   href: 'https://www.behance.net/firststepmedia' },
  { label: 'Dribbble',  href: 'https://dribbble.com/firststepmedia' },
  { label: 'Instagram', href: 'https://www.instagram.com/f1rststepmedia/' },
  { label: 'TikTok',    href: 'https://www.tiktok.com/@f1rststepmedia' },
  { label: 'Pinterest', href: 'https://www.pinterest.com/firststepmedia/' },
]

function Carousel({ images }) {
  const [index, setIndex] = useState(0)
  const timerRef  = useRef(null)
  const touchXRef = useRef(null)
  const isMobile  = useIsMobile()
  const visible   = isMobile ? 1 : 3
  const total     = images.length

  useEffect(() => {
    timerRef.current = setInterval(() => setIndex(i => (i + 1) % total), 3800)
    return () => clearInterval(timerRef.current)
  }, [total])

  const resetTimer = () => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setIndex(i => (i + 1) % total), 3800)
  }

  const handlePrev = () => { setIndex(i => (i - 1 + total) % total); resetTimer() }
  const handleNext = () => { setIndex(i => (i + 1) % total); resetTimer() }

  const onTouchStart = (e) => { touchXRef.current = e.touches[0].clientX }
  const onTouchEnd   = (e) => {
    if (touchXRef.current === null) return
    const delta = touchXRef.current - e.changedTouches[0].clientX
    if (Math.abs(delta) > 50) { delta > 0 ? handleNext() : handlePrev() }
    touchXRef.current = null
  }

  const getSlide = (offset) => images[(index + offset + total) % total]

  return (
    <div style={{ position: 'relative' }} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div style={{
        display: 'flex',
        gap: isMobile ? '0' : '12px',
        alignItems: 'stretch',
        height: isMobile ? '420px' : '520px',
        overflow: 'hidden',
      }}>
        {Array.from({ length: visible }).map((_, i) => {
          const isCenter = isMobile ? true : i === 1
          const src = getSlide(isMobile ? 0 : i - 1)
          return (
            <div
              key={`${index}-${i}`}
              style={{
                flex: isCenter ? 2 : 1,
                overflow: 'hidden',
                borderRadius: '4px',
                backgroundColor: '#e4e4e2',
                opacity: isCenter ? 1 : 0.55,
                transform: isCenter ? 'scale(1)' : 'scale(0.97)',
                transition: 'all 0.5s cubic-bezier(0.19,1,0.22,1)',
              }}
            >
              <img
                src={src}
                alt=""
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center',
                  display: 'block',
                  padding: '12px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )
        })}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '24px',
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => { setIndex(i); resetTimer() }}
              data-cursor
              style={{
                width: i === index ? '24px' : '6px',
                height: '6px',
                borderRadius: '999px',
                backgroundColor: i === index ? '#0a0a0a' : '#bbb',
                border: 'none',
                padding: 0,
                transition: 'all 0.3s ease',
                cursor: isMobile ? 'pointer' : 'none',
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handlePrev} data-cursor style={{
            width: '40px', height: '40px', borderRadius: '50%',
            border: '1px solid #ccc', backgroundColor: 'transparent',
            color: '#0a0a0a', fontSize: '16px',
            cursor: isMobile ? 'pointer' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>←</button>
          <button onClick={handleNext} data-cursor style={{
            width: '40px', height: '40px', borderRadius: '50%',
            border: '1px solid #ccc', backgroundColor: 'transparent',
            color: '#0a0a0a', fontSize: '16px',
            cursor: isMobile ? 'pointer' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>→</button>
        </div>
      </div>
    </div>
  )
}

function RevealImage({ src, index }) {
  const ref     = useRef(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(false)
    const delay = setTimeout(() => {
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) { setShow(true); observer.disconnect() } },
        { threshold: 0.1 }
      )
      if (ref.current) observer.observe(ref.current)
      return () => observer.disconnect()
    }, index * 60)
    return () => clearTimeout(delay)
  }, [src, index])

  return (
    <div
      ref={ref}
      style={{
        backgroundColor: '#e8e8e6',
        borderRadius: '10px',
        overflow: 'hidden',
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.97)',
        transition: 'opacity 0.55s ease, transform 0.55s cubic-bezier(0.19,1,0.22,1)',
      }}
    >
      <img
        src={src}
        alt=""
        loading="lazy"
        style={{ width: '100%', display: 'block', objectFit: 'contain' }}
      />
    </div>
  )
}

function MobileGallery({ images }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {images.map((src, i) => (
        <RevealImage key={src} src={src} index={i} />
      ))}
    </div>
  )
}

export default function FirstStepMedia() {
  const [activeTab, setActiveTab] = useState('heroPages')
  const isMobile = useIsMobile()
  const current = allSections.find(s => s.key === activeTab)

  useEffect(() => {
    document.body.style.backgroundColor    = '#f7f7f5'
    document.body.style.backgroundImage    = 'radial-gradient(circle, #b0b0b0 1.3px, transparent 1.3px)'
    document.body.style.backgroundSize     = '22px 22px'
    document.body.style.backgroundAttachment = 'fixed'
    return () => {
      document.body.style.backgroundColor    = ''
      document.body.style.backgroundImage    = ''
      document.body.style.backgroundSize     = ''
      document.body.style.backgroundAttachment = ''
    }
  }, [])

  return (
    <div style={{ position: 'relative', minHeight: '100vh', paddingTop: 'var(--nav-height)' }}>

      {/* Hero */}
      <div style={{
        padding: isMobile ? '80px 20px 60px' : '100px 40px 80px',
        borderBottom: '1px solid #d4d4d4',
      }}>
        <Link to="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#222',
          textDecoration: 'none',
          marginBottom: '48px',
        }}>← Back</Link>

        <TextReveal>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#444',
            marginBottom: '16px',
          }}>Creative Studio</p>
        </TextReveal>

        <TextReveal delay={100}>
          <h1 style={{
            fontSize: 'var(--text-4xl)',
            fontWeight: 700,
            lineHeight: 0.92,
            letterSpacing: '-0.04em',
            color: '#0a0a0a',
            margin: '0 0 24px',
          }}>
            First<br />Step<br />Media.
          </h1>
        </TextReveal>

        <TextReveal delay={200}>
          <p style={{
            fontSize: 'var(--text-base)',
            color: '#222',
            lineHeight: 1.7,
            maxWidth: '540px',
            marginBottom: '40px',
          }}>
            A digital design brand built on concept, craft, and creative direction.
            UI/UX, editorial, and visual design, shared across platforms.
          </p>
        </TextReveal>

        <TextReveal delay={300}>
          <nav style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {socials.map(({ label, href }) => (
              <MagneticButton key={label} href={href} target="_blank" rel="noopener noreferrer">
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#222',
                  textDecoration: 'none',
                  borderBottom: '1px solid #999',
                  paddingBottom: '2px',
                }}>{label}</span>
              </MagneticButton>
            ))}
          </nav>
        </TextReveal>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: isMobile ? '24px 20px 0' : '32px 40px 0',
        borderBottom: '1px solid #d4d4d4',
        flexWrap: 'wrap',
      }}>
        {allSections.map((sec) => (
          <button
            key={sec.key}
            onClick={() => setActiveTab(sec.key)}
            data-cursor
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '10px 20px',
              border: '1px solid transparent',
              borderBottom: 'none',
              borderRadius: '2px 2px 0 0',
              cursor: 'none',
              transition: 'all 0.2s ease',
              backgroundColor: activeTab === sec.key ? 'rgba(247,247,245,0.9)' : 'transparent',
              color: activeTab === sec.key ? '#0a0a0a' : '#444',
              borderColor: activeTab === sec.key ? '#d4d4d4' : 'transparent',
            }}
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* Gallery */}
      <div style={{ padding: isMobile ? '40px 20px 80px' : '60px 40px 120px' }}>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#444',
          marginBottom: '40px',
        }}>
          {current.description}
        </p>
        {isMobile
          ? <MobileGallery key={activeTab} images={current.images} />
          : <Carousel key={activeTab} images={current.images} />
        }
      </div>

    </div>
  )
}
