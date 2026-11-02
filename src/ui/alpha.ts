export const REPO_URL = 'https://github.com/mrgarris0n/plot-twist'

/** A link to the GitHub bug-report form, with the version and browser fields prefilled (ids from `bug.yml`). */
export function feedbackHref(build: string, userAgent: string): string {
  const query = new URLSearchParams({ template: 'bug.yml', version: build, browser: userAgent })
  return `${REPO_URL}/issues/new?${query}`
}
