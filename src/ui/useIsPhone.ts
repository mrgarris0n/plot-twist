import { useEffect, useState } from 'react'

const PHONE = '(max-width: 767px)'

/** True on viewports up to 767 px wide, where the editor is read-only. */
export function useIsPhone(): boolean {
  const [phone, setPhone] = useState(() => window.matchMedia?.(PHONE).matches ?? false)
  useEffect(() => {
    if (!window.matchMedia) return
    const mq = window.matchMedia(PHONE)
    const on = () => setPhone(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return phone
}
