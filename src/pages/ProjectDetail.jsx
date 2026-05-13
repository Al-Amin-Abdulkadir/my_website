import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { designProjects, techProjects } from '../data/projects'

const allProjects = [...designProjects, ...techProjects]

function LightboxModal({ images, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setCurrent(i => (i + 1) % images.length)
      if (e.key === 'ArrowLeft') setCurrent(i => (i - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [images.length, onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(8,8,8,0.96)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <button
        onClick={onClose}
        data-cursor
        style={{
          position: 'absolute',
          top: '24px',
          right: '32px',
          background: 'none',
          border: 'none',
          color: 'var(--grey-4)',
          fontSize: '28px',
          cursor: 'none',
          lineHeight: 1,
        }}
      >×</button>

      <button
        onClick={(e) => { e.stopPropagation(); setCurrent(i => (i - 1 + images.length) % images.length) }}
        data-cursor
        style={{
          position: 'absolute',
          left: '24px',
          background: 'none',
          border: '1px solid var(--grey-2)',
          color: 'var(--white)',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          fontSize: '18px',
          cursor: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >←</button>

      <img
        src={images[current]}
        alt=""
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '90vw',
          maxHeight: '88vh',
          objectFit: 'contain',
          borderRadius: '4px',
        }}
      />

      <button
        onClick={(e) => { e.stopPropagation(); setCurrent(i => (i + 1) % images.length) }}
        data-cursor
        style={{
          position: 'absolute',
          right: '24px',
          background: 'none',
          border: '1px solid var(--grey-2)',
          color: 'var(--white)',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          fontSize: '18px',
          cursor: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >→</button>

      <div style={{
        position: 'absolute',
        bottom: '24px',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        color: 'var(--grey-4)',
        letterSpacing: '0.1em',
      }}>
        {current + 1} / {images.length}
      </div>
    </div>
  )
}

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const project = allProjects.find(p => p.id === id)
  const [lightboxIndex, setLightboxIndex] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  if (!project) {
    return (
      <div style={{ padding: '160px 40px', color: 'var(--white)' }}>
        <p>Project not found.</p>
        <Link to="/" style={{ color: 'var(--grey-4)' }}>← Back home</Link>
      </div>
    )
  }

  const hasImages = project.images && project.images.length > 0

  return (
    <div style={{ minHeight: '100vh', paddingTop: 'var(--nav-height)' }}>

      {/* Hero header */}
      <div style={{
        padding: '80px 40px 72px',
        borderBottom: '1px solid var(--grey-2)',
      }}>
        <button
          onClick={() => navigate(-1)}
          data-cursor
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--grey-4)',
            background: 'none',
            border: 'none',
            cursor: 'none',
            padding: 0,
            marginBottom: '56px',
          }}
        >← Back</button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px' }}>
          <div style={{ maxWidth: '640px' }}>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--grey-4)',
              marginBottom: '16px',
            }}>
              {project.category}, {project.year}
            </p>
            <h1 style={{
              fontSize: 'var(--text-4xl)',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              lineHeight: 0.92,
              color: 'var(--white)',
              marginBottom: '28px',
            }}>
              {project.title}
            </h1>
            <p style={{
              fontSize: 'var(--text-base)',
              color: 'var(--grey-5)',
              lineHeight: 1.75,
              marginBottom: '32px',
            }}>
              {project.description}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {project.tags.map(tag => (
                <span
                  key={tag}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--grey-4)',
                    border: '1px solid var(--grey-2)',
                    borderRadius: '2px',
                    padding: '4px 10px',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '200px' }}>
            {project.status && (
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--grey-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Status</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--white)', letterSpacing: '0.08em' }}>{project.status}</p>
              </div>
            )}
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--white)',
                  textDecoration: 'none',
                  border: '1px solid var(--grey-2)',
                  borderRadius: '2px',
                  padding: '10px 16px',
                  transition: 'border-color 0.2s ease',
                  alignSelf: 'flex-start',
                }}
              >
                GitHub ↗
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Gallery */}
      {hasImages ? (
        <div style={{ padding: '80px 40px 120px' }}>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--grey-3)',
            marginBottom: '48px',
          }}>
            {project.images.length} images
          </p>
          <div style={{
            columns: '2',
            columnGap: '12px',
          }}>
            {project.images.map((src, i) => (
              <div
                key={i}
                onClick={() => setLightboxIndex(i)}
                data-cursor
                style={{
                  breakInside: 'avoid',
                  marginBottom: '12px',
                  overflow: 'hidden',
                  borderRadius: '3px',
                  border: '1px solid var(--grey-1)',
                  cursor: 'none',
                  position: 'relative',
                }}
              >
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  style={{
                    width: '100%',
                    display: 'block',
                    transition: 'transform 0.4s cubic-bezier(0.19,1,0.22,1)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{
          padding: '120px 40px',
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--grey-3)',
          }}>
            Visuals in progress
          </p>
        </div>
      )}

      {lightboxIndex !== null && (
        <LightboxModal
          images={project.images}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  )
}
