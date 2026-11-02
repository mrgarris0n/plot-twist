import { X } from 'lucide-react'
import { useState } from 'react'
import { en } from '../strings/en'
import { feedbackHref } from './alpha'

const KEY = 'plottwist.openAlphaNotice.dismissed'

/** Dismissible banner saying Plot Twist is in open alpha, linking to the GitHub bug-report form. */
export function AlphaNotice() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(KEY) === '1'
    } catch {
      return false
    }
  })
  if (dismissed) return null
  const dismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(KEY, '1')
    } catch {
      /* blocked: hidden for this visit only */
    }
  }
  return (
    <div className="alpha-notice" role="status">
      <span>{en.alpha.app.notice}</span>
      <a href={feedbackHref(__BUILD__, navigator.userAgent)} target="_blank" rel="noopener">{en.alpha.app.noticeLink}</a>
      <button type="button" className="icon-button" aria-label={en.alpha.app.dismiss} onClick={dismiss}>
        <X aria-hidden="true" size={16} />
      </button>
    </div>
  )
}
