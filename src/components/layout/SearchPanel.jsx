import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useCmsContent } from '../../data/useCmsContent'
import { stillOf } from '../../data/cloudinary'
import { coverStyle } from '../projects/coverFraming'
import './SearchPanel.css'

// Search, opened from the top bar: type a name or tag to find a project, case study
// or page, and/or pick tags to narrow the list. The site is small, so the full list
// is fetched once and filtered right here — no waiting on the server per keystroke.

// How many tags show before "+ N more" (the most-used ones come first)
const TAGS_SHOWN_AT_FIRST = 12

// Each kind of entry: its label, where it lives on the site, and its colour
// (the same colours the Directory menu uses for those pages)
const KINDS = {
  project:    { label: 'Project',    address: '/project/',    color: 'var(--dusty-rose)' },
  // Unused since Explore replaced Case Studies (the CMS can't make them any more); kept
  // so an old case study in the database can't crash the list
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
  const [selectedTags, setSelectedTags] = useState([])   // lower-case tag names
  const [isShowingAllTags, setIsShowingAllTags] = useState(false)

  const allTags = collectTags(items ?? [])
  const visibleTags = isShowingAllTags ? allTags : allTags.slice(0, TAGS_SHOWN_AT_FIRST)
  const results = findEntries(items ?? [], query, selectedTags)

  const toggleTag = (key) =>
    setSelectedTags((current) => (current.includes(key) ? current.filter((tag) => tag !== key) : [...current, key]))

  // Enter opens the first result that can be opened ("coming soon" ones can't yet)
  const openFirstResult = (event) => {
    event.preventDefault()
    const first = firstOpenableResult(results)
    if (first) navigate(addressOf(first))
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
            aria-label="Search by name or tag"
          />
        </form>

        {allTags.length > 0 && (
          <div className="search-tags" role="group" aria-label="Filter by tag">
            {visibleTags.map((tag) => (
              <button
                key={tag.key}
                type="button"
                className={`search-tag ${selectedTags.includes(tag.key) ? 'is-selected' : ''}`}
                aria-pressed={selectedTags.includes(tag.key)}
                onClick={() => toggleTag(tag.key)}
              >
                {tag.label} <span className="search-tag__count">{tag.count}</span>
              </button>
            ))}
            {allTags.length > TAGS_SHOWN_AT_FIRST && (
              <button type="button" className="search-tags__more" onClick={() => setIsShowingAllTags((shown) => !shown)}>
                {isShowingAllTags ? 'Fewer tags' : `+ ${allTags.length - TAGS_SHOWN_AT_FIRST} more`}
              </button>
            )}
            {selectedTags.length > 0 && (
              <button type="button" className="search-tags__more" onClick={() => setSelectedTags([])}>Clear</button>
            )}
          </div>
        )}

        {isLoading && <p className="search-panel__note">Loading…</p>}
        {error && <p className="search-panel__note search-panel__note--error">{error.message}</p>}
        {items && results.length === 0 && (
          <p className="search-panel__note">
            {selectedTags.length > 0
              ? 'Nothing matches all of the chosen tags' + (query.trim() ? ` and “${query.trim()}”.` : '.')
              : `Nothing called “${query.trim()}” yet.`}
          </p>
        )}

        {results.length > 0 && (
          <ul className="search-results">
            {results.map((item) => {
              const preview = item.coverUrl && stillOf(item.coverUrl, 240)
              return (
              <li key={`${item.kind}/${item.slug}`}>
                <ResultLink item={item}>
                  <span className="search-result__text">
                    <span className="search-result__title"><HighlightMatch text={item.title} query={query} /></span>
                    <span className="search-result__meta">
                      <span className="search-result__dot" style={{ background: KINDS[item.kind].color }} />
                      {KINDS[item.kind].label}
                      {item.category && <> · {item.category}</>}
                      {item.isComingSoon && <> · Coming soon</>}
                    </span>
                    {item.tags.length > 0 && (
                      <span className="search-result__tags">
                        {item.tags.map((tag, index) => (
                          <span key={index} className={selectedTags.includes(tag.toLowerCase()) ? 'is-selected' : ''}>{tag}</span>
                        ))}
                      </span>
                    )}
                  </span>
                  {/* A small preview of the cover; a plain square when there isn't one */}
                  <span className="search-result__preview">
                    {preview && (
                      <img
                        src={preview}
                        alt=""
                        loading="lazy"
                        style={coverStyle(item)}
                      />
                    )}
                  </span>
                </ResultLink>
              </li>
              )
            })}
          </ul>
        )}
      </motion.div>
    </>
  )
}

// Entries that match what was typed (in the name or any tag, ignoring capitals) AND
// have every selected tag. Nothing typed and no tags = everything, so the panel
// doubles as a quick way to browse.
export function findEntries(items, query, selectedTags = []) {
  const wanted = query.trim().toLowerCase()
  return items.filter((item) => {
    const tags = item.tags.map((tag) => tag.toLowerCase())
    const matchesText = !wanted || item.title.toLowerCase().includes(wanted) || tags.some((tag) => tag.includes(wanted))
    const hasEveryTag = selectedTags.every((selected) => tags.includes(selected))
    return matchesText && hasEveryTag
  })
}

// The result Enter opens: the first one that can be opened ("coming soon" ones can't yet)
export function firstOpenableResult(results) {
  return results.find((item) => !item.isComingSoon)
}

// Every tag in use, once each (ignoring capitals), most-used first:
// [{ key: 'ui/ux', label: 'UI/UX', count: 5 }, …]
export function collectTags(items) {
  const byKey = new Map()
  for (const item of items) {
    for (const tag of new Set(item.tags.map((name) => name.trim()).filter(Boolean))) {
      const key = tag.toLowerCase()
      const existing = byKey.get(key) ?? { key, label: tag, count: 0 }
      existing.count += 1
      byKey.set(key, existing)
    }
  }
  return [...byKey.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

// A result opens its page, unless it's "coming soon": then it's listed but not a link
function ResultLink({ item, children }) {
  if (item.isComingSoon) return <div className="search-result search-result--soon">{children}</div>
  return <Link to={addressOf(item)} className="search-result">{children}</Link>
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
