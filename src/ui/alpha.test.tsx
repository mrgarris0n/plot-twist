import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CreditsDialog } from './CreditsDialog'
import { AlphaNotice } from './AlphaNotice'
import { SettingsMenu } from './SettingsMenu'
import { REPO_URL, feedbackHref } from './alpha'

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('feedbackHref', () => {
  it('points at the bug form with version and browser', () => {
    const u = new URL(feedbackHref('abc1234', 'Mozilla/5.0 (X11) a&b #c'))
    expect(u.origin + u.pathname).toBe('https://github.com/mrgarris0n/plot-twist/issues/new')
    expect(u.searchParams.get('template')).toBe('bug.yml')
    expect(u.searchParams.get('version')).toBe('abc1234')
    expect(u.searchParams.get('browser')).toBe('Mozilla/5.0 (X11) a&b #c')
  })
})

describe('AlphaNotice', () => {
  it('shows with no env set, links to the new-issue page', () => {
    render(<AlphaNotice />)
    expect(screen.getByRole('status')).toHaveTextContent('open alpha')
    const href = screen.getByRole('link', { name: 'Report problems or ideas on GitHub' }).getAttribute('href')
    expect(href?.startsWith('https://github.com/mrgarris0n/plot-twist/issues/new')).toBe(true)
  })

  it('dismiss hides it across mounts', () => {
    const { unmount } = render(<AlphaNotice />)
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(screen.queryByRole('status')).toBeNull()
    unmount()
    render(<AlphaNotice />)
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('old closed-alpha dismissal does not hide it', () => {
    localStorage.setItem('plottwist.alphaNotice.dismissed', '1')
    render(<AlphaNotice />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('blocked storage: renders, dismiss hides for the visit', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error()
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error()
    })
    render(<AlphaNotice />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(screen.queryByRole('status')).toBeNull()
  })
})

describe('Send feedback link', () => {
  it('settings menu and About dialog show it with the GitHub href', () => {
    const { unmount } = render(<SettingsMenu showUnits={false} />)
    const inMenu = screen.getByText('Send feedback', { selector: 'a' })
    expect(inMenu.getAttribute('href')?.startsWith(`${REPO_URL}/issues/new`)).toBe(true)
    unmount()
    render(<CreditsDialog onClose={() => {}} />)
    const inAbout = screen.getByRole('link', { name: 'Send feedback' })
    expect(inAbout.getAttribute('href')?.startsWith(`${REPO_URL}/issues/new`)).toBe(true)
  })
})

describe('About dialog', () => {
  it('shows the build hash', () => {
    render(<CreditsDialog onClose={() => {}} />)
    expect(screen.getByRole('dialog')).toHaveTextContent(__BUILD__)
  })

  it('links to the privacy notice', () => {
    render(<CreditsDialog onClose={() => {}} />)
    expect(screen.getByRole('link', { name: 'Privacy notice' })).toHaveAttribute('href', '/privacy.html')
  })
})
