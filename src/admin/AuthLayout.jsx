import { Link } from 'react-router-dom'
import './auth.css'

// The split screen from the CMS login designs (Personal Website Redesign/CMS Login.png):
// the form on a cream half with a "Go Back" button; a Dusty Blue half with the
// hand-drawn sun and a cream circle saying "Keep Learning".
export default function AuthLayout({ backTo, backLabel = 'Go Back', title = 'My CMS', subtitle, children }) {
  return (
    <main className="auth">
      <section className="auth__form-side">
        <Link to={backTo} className="auth-back" aria-label={backLabel}>
          <span className="auth-back__circle"><CloseIcon /></span>
          <span className="auth-back__label">{backLabel}</span>
        </Link>

        <div className="auth__form-area">
          <h1 className="auth__title">{title}</h1>
          {subtitle && <p className="auth__subtitle">{subtitle}</p>}
          {children}
        </div>
      </section>

      <section className="auth__art-side" aria-hidden="true">
        <img className="auth__sun" src="/images/cms/sun.webp" alt="" />
        <div className="auth__circle" />
        <p className="auth__motto">Keep Learning</p>
      </section>
    </main>
  )
}

// One underlined field from the designs. The label sits where you type and stays
// readable for screen readers through aria-label.
export function AuthField({ label, ...inputProps }) {
  return <input className="auth-field" placeholder={label} aria-label={label} {...inputProps} />
}

export function CloseIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function CheckIcon() {
  return (
    <svg width="48%" height="48%" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12.5l4.5 4.5L20 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
