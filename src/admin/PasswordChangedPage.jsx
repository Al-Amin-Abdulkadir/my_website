import { Link } from 'react-router-dom'
import { CheckIcon } from './AuthLayout'
import './auth.css'

// Personal Website Redesign/CMS fogort password successfull.png
export default function PasswordChangedPage() {
  return (
    <main className="auth-done">
      <img className="auth-done__sun" src="/images/cms/sun.webp" alt="" />
      <div className="auth-done__planet" aria-hidden="true" />
      <img className="auth-done__rocket" src="/images/cms/rocket.webp" alt="" />

      <div className="auth-done__message">
        <span className="auth-done__check"><CheckIcon /></span>
        <h1 className="auth-done__title">Password Changed Successfully</h1>
        <Link to="/admin" className="auth-done__button">Back to CMS</Link>
      </div>
    </main>
  )
}
