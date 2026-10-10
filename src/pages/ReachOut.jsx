import './Projects.css'
import './ReachOut.css'

// Reach Out: no design was drawn for it, so it follows Projects and Case Studies:
// the centred serif intro, the content, a sign-off with a dot, then the giant
// wordmark cut off by the bottom of the page. The details are the old
// portfolio's (src/components/sections/Contact.jsx).

const EMAIL = 'alaminabdulkadir5@gmail.com'

const SOCIAL_LINKS = [
  { label: 'GitHub',    handle: 'Al-Amin-Abdulkadir', href: 'https://github.com/Al-Amin-Abdulkadir' },
  { label: 'LinkedIn',  handle: 'Amin Abdulkadir',    href: 'https://www.linkedin.com/in/amin-abdulkadir-59a50129b/' },
  { label: 'Behance',   handle: 'firststepmedia',     href: 'https://www.behance.net/firststepmedia' },
  { label: 'Dribbble',  handle: 'firststepmedia',     href: 'https://dribbble.com/firststepmedia' },
  { label: 'TikTok',    handle: '@f1rststepmedia',    href: 'https://www.tiktok.com/@f1rststepmedia' },
  { label: 'Instagram', handle: '@f1rststepmedia',    href: 'https://www.instagram.com/f1rststepmedia/' },
]

export default function ReachOut() {
  return (
    <main className="projects-page">
      <p className="projects-intro">
        Open to roles in software engineering and design.<br />Based in Dubai, available remotely…
      </p>

      {/* <wbr /> lets a narrow phone break the address after the @, not mid-word */}
      <a className="reach-out__email" href={`mailto:${EMAIL}`}>
        alaminabdulkadir5@<wbr />gmail.com
      </a>

      <ul className="reach-out__links">
        {SOCIAL_LINKS.map((link) => (
          <li key={link.label}>
            <a className="reach-out__link" href={link.href} target="_blank" rel="noopener noreferrer">
              <span className="reach-out__label">{link.label}</span>
              <span className="reach-out__handle">
                {link.handle} <span className="reach-out__arrow" aria-hidden="true">↗</span>
              </span>
            </a>
          </li>
        ))}
      </ul>

      <p className="projects-more">
        FirstStepMedia · Dubai, UAE <span className="projects-more__dot" style={{ background: 'var(--faded-ochre)' }} aria-hidden="true" />
      </p>

      <div className="projects-wordmark projects-wordmark--two-lines" aria-hidden="true">
        REACH<br />OUT
      </div>
    </main>
  )
}
