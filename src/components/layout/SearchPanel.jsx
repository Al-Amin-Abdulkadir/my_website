import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useCmsContent } from '../../data/useCmsContent'
import { resizeCloudinaryImage } from '../../data/projects'
import './SearchPanel.css'

// Search, opened from the top bar: type a name to find a project, case study or
// page. The site is small, so the full list of titles is fetched once and
// filtered right here as you type — no waiting on the server per keystroke.

// Each kind of entry: its label, where it lives on the site, and its colour
// (the same colours the Directory menu uses for those pages)
const KINDS = {
  project:    { label: 'Project',    address: '/project/',    color: 'var(--dusty-rose)' },
  case_study: { label: 'Case study', address: '/case-study/', color: 'var(--sage-moss)' },
  page:       { label: 'Page',       address: '/',            color: 'var(--washed-lilac)' },
}

export default function SearchPanel({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && <SearchDropdown onClose={onClose} />}
    </AnimatePresence>
  )
}

function SearchDropdown({ onClose }) {
  const navigate = useNavigate()
  const { data: items, error, isLoading } = useCmsContent('/api/search-index')
  const [query, setQuery] = useState('')
  const results = findByName(items ?? [], query)

  // Enter opens the first result
  const openFirstResult = (event) => {
    event.preventDefault()
    if (results[0]) navigate(addressOf(results[0]))
  }

  return (
    <>
      <motion.div
        className="search-backdrop"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.2 } }}
      />
      <motion.div
        className="search-panel"
        role="dialog"
        aria-label="Search"
        data-lenis-prevent
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
        transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
      >
        <form onSubmit={openFirstResult}>
          <input
            className="search-panel__input"
            type="search"
            placeholder="Search projects, case studies…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            aria-label="Search by name"
          />
        </form>

        {isLoading && <p className="search-panel__note">Loading…</p>}
        {error && <p className="search-panel__note search-panel__note--error">{error.message}</p>}
        {items && results.length === 0 && (
          <p className="search-panel__note">Nothing called “{query.trim()}” yet.</p>
        )}

        {results.length > 0 && (
          <ul className="search-results">
            {results.map((item) => (
              <li key={`${item.kind}/${item.slug}`}>
                <Link to={addressOf(item)} className="search-result">
                  <span className="search-result__text">
                    <span className="search-result__title"><HighlightMatch text={item.title} query={query} /></span>
                    <span className="search-result__meta">
                      <span className="search-result__dot" style={{ background: KINDS[item.kind].color }} />
                      {KINDS[item.kind].label}
                      {item.category && <> · {item.category}</>}
                    </span>
                  </span>
                  {/* A small preview of the cover; a plain square when there isn't one */}
                  <span className="search-result__preview">
                    {item.coverUrl && (
                      <img
                        src={resizeCloudinaryImage(item.coverUrl, 240)}
                        alt=""
                        loading="lazy"
                        style={{ objectPosition: item.coverPosition }}
                      />
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </>
  )
}

// Titles containing what was typed, ignoring capitals. Nothing typed = everything,
// so the panel doubles as a quick way to browse.
function findByName(items, query) {
  const wanted = query.trim().toLowerCase()
  if (!wanted) return items
  return items.filter((item) => item.title.toLowerCase().includes(wanted))
}

function addressOf(item) {
  return `${KINDS[item.kind].address}${item.slug}`
}

// Shows the part of the title that matched in bold
function HighlightMatch({ text, query }) {
  const wanted = query.trim()
  const start = wanted ? text.toLowerCase().indexOf(wanted.toLowerCase()) : -1
  if (start === -1) return text
  return (
    <>
      {text.slice(0, start)}
      <mark>{text.slice(start, start + wanted.length)}</mark>
      {text.slice(start + wanted.length)}
    </>
  )
}
