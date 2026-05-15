import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TextReveal from '../ui/TextReveal'
import { designProjects, techProjects, firstStepMedia } from '../../data/projects'
import useIsMobile from '../../hooks/useIsMobile'

const allCarouselImages = [
  ...firstStepMedia.heroPages,
  ...firstStepMedia.editorial,
  ...firstStepMedia.posters,
  ...firstStepMedia.branding,
]

const s = {
  section: {
    padding: '140px 0',
    borderTop: '1px solid var(--grey-2)',
    overflow: 'hidden',
  },
  header: {
    padding: '0 40px',
    marginBottom: '80px',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
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
    margin: 0,
  },
  tabRow: {
    display: 'flex',
    gap: '4px',
    padding: '0 40px',
    marginBottom: '48px',
  },
  tab: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    padding: '10px 20px',
    border: '1px solid transparent',
    borderRadius: '2px',
    cursor: 'none',
    transition: 'all 0.2s ease',
  },
  strip: {
    display: 'flex',
    gap: '3px',
    padding: '0 40px',
    marginBottom: '120px',
    height: '480px',
  },
  divider: {
    borderTop: '1px solid var(--grey-2)',
    margin: '0 40px 80px',
  },
  carouselSection: {
    padding: '0 40px',
  },
  carouselLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'var(--grey-4)',
    marginBottom: '16px',
  },
  carouselHeading: {
    fontSize: 'var(--text-2xl)',
    fontWeight: 700,
    letterSpacing: '-0.03em',
    color: 'var(--white)',
    marginBottom: '40px',
  },
  carouselTrackWrapper: {
    overflow: 'hidden',
    margin: '0 -40px',
  },
  carouselTrack: {
    display: 'flex',
    gap: '12px',
    animation: 'marquee 35s linear infinite',
    width: 'max-content',
  },
  carouselImg: {
    height: '280px',
    width: 'auto',
    objectFit: 'cover',
    borderRadius: '2px',
    flexShrink: 0,
    transition: 'transform 0.4s ease',
    filter: 'grayscale(20%)',
  },
}

function FadeSlideshow({ images }) {
  const [curr, setCurr] = useState(0)
  const [next, setNext] = useState(1)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const hold = setTimeout(() => {
      setFading(true)
      const swap = setTimeout(() => {
        setCurr(c => (c + 1) % images.length)
        setNext(n => (n + 1) % images.length)
        setFading(false)
      }, 800)
      return () => clearTimeout(swap)
    }, 4000)
    return () => clearTimeout(hold)
  }, [curr, images.length])

  const imgStyle = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    objectPosition: 'center',
    padding: '16px',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ padding: '0 20px' }}>
      <div style={{
        position: 'relative',
        height: '280px',
        backgroundColor: 'var(--grey-1)',
        borderRadius: '4px',
        border: '1px solid var(--grey-2)',
        overflow: 'hidden',
      }}>
        <img src={images[curr]} alt="" loading="lazy"
          style={{ ...imgStyle, opacity: fading ? 0 : 1, transition: 'opacity 0.8s ease' }}
        />
        <img src={images[next]} alt="" loading="lazy"
          style={{ ...imgStyle, opacity: fading ? 1 : 0, transition: 'opacity 0.8s ease' }}
        />
        <div style={{
          position: 'absolute', bottom: '16px', left: '50%',
          transform: 'translateX(-50%)', display: 'flex', gap: '6px',
        }}>
          {images.map((_, i) => (
            <span key={i} style={{
              width: i === curr ? '20px' : '5px', height: '5px',
              borderRadius: '999px',
              backgroundColor: i === curr ? 'var(--white)' : 'rgba(240,240,240,0.3)',
              transition: 'all 0.4s ease', display: 'block',
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function DesktopImageCarousel({ images }) {
  const [paused, setPaused] = useState(false)
  const doubled = [...images, ...images]

  return (
    <div
      style={{ overflow: 'hidden' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div style={{
        display: 'flex',
        gap: '12px',
        width: 'max-content',
        animation: 'marquee 30s linear infinite',
        animationPlayState: paused ? 'paused' : 'running',
        paddingLeft: '40px',
      }}>
        {doubled.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            loading="lazy"
            style={{
              height: '380px',
              width: 'auto',
              objectFit: 'cover',
              borderRadius: '3px',
              flexShrink: 0,
              border: '1px solid var(--grey-2)',
              transition: 'transform 0.4s ease, filter 0.4s ease',
              filter: 'grayscale(15%)',
              transform: paused ? 'scale(1.01)' : 'scale(1)',
            }}
          />
        ))}
      </div>
    </div>
  )
}

function DesktopCarousel({ projects }) {
  const [hoveredIdx, setHoveredIdx] = useState(null)
  const [paused, setPaused] = useState(false)
  const navigate = useNavigate()

  // duplicate for seamless infinite loop (marquee needs -50% translate)
  const items = [...projects, ...projects]

  return (
    <div
      style={{ overflow: 'hidden', margin: '0', padding: '0 0 8px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => { setPaused(false); setHoveredIdx(null) }}
    >
      <div
        style={{
          display: 'flex',
          gap: '12px',
          width: 'max-content',
          animation: 'marquee 22s linear infinite',
          animationPlayState: paused ? 'paused' : 'running',
          paddingLeft: '40px',
        }}
      >
        {items.map((project, i) => {
          const isHovered = hoveredIdx === i
          return (
            <div
              key={`${project.id}-${i}`}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => navigate(`/project/${project.id}`)}
              data-cursor
              style={{
                position: 'relative',
                width: isHovered ? '420px' : '320px',
                height: '480px',
                flexShrink: 0,
                borderRadius: '3px',
                overflow: 'hidden',
                backgroundColor: 'var(--grey-1)',
                border: '1px solid var(--grey-2)',
                cursor: 'none',
                transition: 'width 0.45s cubic-bezier(0.19,1,0.22,1)',
              }}
            >
              {project.cover ? (
                <img
                  src={project.cover}
                  alt={project.title}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'top',
                    display: 'block',
                    transition: 'transform 0.55s cubic-bezier(0.19,1,0.22,1)',
                    transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                  }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--grey-3)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    transform: 'rotate(-90deg)',
                    whiteSpace: 'nowrap',
                  }}>
                    Visuals coming soon
                  </span>
                </div>
              )}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(8,8,8,0.96) 0%, rgba(8,8,8,0.4) 55%, transparent 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '24px',
                opacity: isHovered ? 1 : 0.85,
                transition: 'opacity 0.3s ease',
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--grey-4)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                  opacity: isHovered ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                }}>
                  {project.category}
                </span>
                <h3 style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: 'var(--white)',
                  lineHeight: 1.1,
                  marginBottom: isHovered ? '10px' : 0,
                  transition: 'margin 0.3s ease',
                }}>
                  {project.title}
                </h3>
                <p style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--grey-5)',
                  lineHeight: 1.6,
                  marginBottom: '16px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  maxHeight: isHovered ? '80px' : '0px',
                  opacity: isHovered ? 1 : 0,
                  transition: 'max-height 0.35s ease, opacity 0.3s ease',
                }}>
                  {project.description}
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  maxHeight: isHovered ? '40px' : '0px',
                  opacity: isHovered ? 1 : 0,
                  overflow: 'hidden',
                  transition: 'max-height 0.35s ease, opacity 0.3s ease',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--white)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    borderBottom: '1px solid var(--grey-4)',
                    paddingBottom: '1px',
                  }}>
                    View Project ↗
                  </span>
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--grey-4)',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        textDecoration: 'none',
                        borderBottom: '1px solid var(--grey-3)',
                        paddingBottom: '1px',
                      }}
                      data-cursor
                    >
                      GitHub ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MobileProjectList({ projects }) {
  const navigate = useNavigate()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 20px' }}>
      {projects.map((project) => (
        <div
          key={project.id}
          onClick={() => navigate(`/project/${project.id}`)}
          style={{
            borderRadius: '3px',
            overflow: 'hidden',
            border: '1px solid var(--grey-2)',
            backgroundColor: 'var(--grey-1)',
            position: 'relative',
            cursor: 'pointer',
          }}
        >
          {project.cover ? (
            <img
              src={project.cover}
              alt={project.title}
              loading="lazy"
              style={{ width: '100%', height: '220px', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
            />
          ) : (
            <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--grey-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Visuals coming soon
              </span>
            </div>
          )}
          <div style={{
            padding: '20px',
            background: 'linear-gradient(to top, rgba(8,8,8,0.98) 0%, rgba(8,8,8,0.5) 100%)',
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
          }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--grey-4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>{project.category}</p>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--white)', marginBottom: '6px' }}>{project.title}</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--grey-5)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{project.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Work() {
  const [activeTab, setActiveTab] = useState('design')
  const isMobile = useIsMobile()

  const projects = activeTab === 'design' ? designProjects : techProjects

  return (
    <section id="work" style={{ ...s.section, padding: isMobile ? '80px 0' : '140px 0' }}>
      <div style={{ ...s.header, padding: isMobile ? '0 20px' : '0 40px' }}>
        <div>
          <TextReveal>
            <p style={s.label}>Selected Work</p>
          </TextReveal>
          <TextReveal delay={100}>
            <h2 style={s.heading}>
              Things I've<br />built &amp; designed.
            </h2>
          </TextReveal>
        </div>
      </div>

      <TextReveal delay={150}>
        <div style={{ ...s.tabRow, padding: isMobile ? '0 20px' : '0 40px' }}>
          {['design', 'tech'].map((tab) => (
            <button
              key={tab}
              style={{
                ...s.tab,
                backgroundColor: activeTab === tab ? 'var(--white)' : 'transparent',
                color: activeTab === tab ? 'var(--black)' : 'var(--grey-4)',
                borderColor: activeTab === tab ? 'var(--white)' : 'var(--grey-2)',
              }}
              onClick={() => setActiveTab(tab)}
              data-cursor
            >
              {tab === 'design' ? 'Design' : 'Engineering'}
            </button>
          ))}
        </div>
      </TextReveal>

      <TextReveal delay={200}>
        {isMobile
          ? <MobileProjectList projects={projects} />
          : <DesktopCarousel projects={projects} />
        }
      </TextReveal>

      <div style={s.divider} />

      <TextReveal>
        <div style={s.carouselSection}>
          <p style={s.carouselLabel}>FirstStepMedia</p>
          <h3 style={s.carouselHeading}>Design work &amp; concepts.</h3>
        </div>
      </TextReveal>

      {isMobile
        ? <FadeSlideshow images={allCarouselImages} />
        : <DesktopImageCarousel images={allCarouselImages} />
      }
    </section>
  )
}
