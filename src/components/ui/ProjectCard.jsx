import { useState } from 'react'

const s = {
  card: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '4px',
    backgroundColor: 'var(--grey-1)',
    border: '1px solid var(--grey-2)',
    cursor: 'none',
    transition: 'transform 0.5s cubic-bezier(0.19,1,0.22,1), border-color 0.3s ease',
  },
  image: {
    width: '100%',
    aspectRatio: '16/10',
    objectFit: 'cover',
    display: 'block',
    transition: 'transform 0.6s cubic-bezier(0.19,1,0.22,1)',
  },
  noImage: {
    width: '100%',
    aspectRatio: '16/10',
    backgroundColor: 'var(--grey-2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '8px',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(8,8,8,0.95) 0%, rgba(8,8,8,0.3) 60%, transparent 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: '28px',
    transition: 'opacity 0.3s ease',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  category: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--grey-4)',
  },
  year: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    color: 'var(--grey-4)',
  },
  title: {
    fontSize: 'var(--text-xl)',
    fontWeight: 700,
    letterSpacing: '-0.03em',
    lineHeight: 1,
    marginBottom: '12px',
    color: 'var(--white)',
  },
  description: {
    fontSize: 'var(--text-sm)',
    color: 'var(--grey-5)',
    lineHeight: 1.5,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '14px',
  },
  tag: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    padding: '3px 10px',
    border: '1px solid var(--grey-3)',
    borderRadius: '999px',
    color: 'var(--grey-4)',
    letterSpacing: '0.05em',
  },
  statusBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    padding: '3px 10px',
    border: '1px solid var(--grey-3)',
    borderRadius: '999px',
    color: 'var(--grey-5)',
    letterSpacing: '0.05em',
    alignSelf: 'flex-start',
    marginBottom: '10px',
  },
  arrow: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: '1px solid var(--grey-3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    color: 'var(--white)',
    transition: 'transform 0.3s ease, border-color 0.3s ease',
  },
}

export default function ProjectCard({ project }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={{
        ...s.card,
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        borderColor: hovered ? 'var(--grey-3)' : 'var(--grey-2)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-cursor
    >
      {project.cover ? (
        <img
          src={project.cover}
          alt={project.title}
          style={{
            ...s.image,
            transform: hovered ? 'scale(1.04)' : 'scale(1)',
          }}
          loading="lazy"
        />
      ) : (
        <div style={s.noImage}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--grey-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Visuals Coming Soon
          </span>
        </div>
      )}

      <div style={s.overlay}>
        {project.status && (
          <span style={s.statusBadge}>{project.status}</span>
        )}
        <div style={s.meta}>
          <span style={s.category}>{project.category}</span>
          <span style={s.year}>{project.year}</span>
        </div>
        <h3 style={s.title}>{project.title}</h3>
        <p style={s.description}>{project.description}</p>
        <div style={s.tags}>
          {project.tags.slice(0, 4).map(tag => (
            <span key={tag} style={s.tag}>{tag}</span>
          ))}
        </div>
      </div>

      {project.github && (
        <a
          href={project.github}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            ...s.arrow,
            transform: hovered ? 'rotate(45deg)' : 'rotate(0deg)',
            borderColor: hovered ? 'var(--grey-5)' : 'var(--grey-3)',
          }}
          data-cursor
        >
          ↗
        </a>
      )}
    </div>
  )
}
