import { useEffect, useMemo, useRef } from 'react'
import { library } from '../data/library'
import { buildCalendar, undatedTasks, type CalendarJob } from '../engine/calendar'
import { useStore } from '../state/store'
import { en } from '../strings/en'
import { getLang } from '../strings/lang'

const HIGHLIGHT_MS = 2000
/** Month names are lower-case inside Hungarian sentences; as a heading the first letter is capital. */
const heading = (s: string) => s.charAt(0).toLocaleUpperCase(getLang()) + s.slice(1)

/** Seasonal to-do list, 12 months starting with the current one; clicking a job pulses that plant on the canvas. */
export function CalendarView() {
  const project = useStore((s) => s.project)
  const setHighlight = useStore((s) => s.setHighlight)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  const jobs = useMemo(() => (project ? buildCalendar(project, library, project.settings.year) : []), [project])
  const undated = useMemo(() => (project ? undatedTasks(project, library, project.settings.year) : []), [project])
  if (!project) return null
  const start = new Date().getMonth() // 0-based
  const order = Array.from({ length: 12 }, (_, i) => ((start + i) % 12) + 1)
  const highlight = (job: CalendarJob) => {
    clearTimeout(timer.current)
    setHighlight(job.placedId)
    timer.current = setTimeout(() => {
      if (useStore.getState().highlightId === job.placedId) useStore.getState().setHighlight(null)
    }, HIGHLIGHT_MS)
  }
  return (
    <div className="stack calendar">
      {!project.location && <p className="hint">{en.calendar.needLocation}</p>}
      {project.plants.length === 0 && <p className="hint">{en.calendar.empty}</p>}
      {order.map((m, i) => {
        const monthJobs = jobs.filter((j) => j.month === m)
        return (
          <section key={m} aria-label={en.climate.months[m - 1]}>
            <h3>{heading(en.climate.months[m - 1])}{i === 0 ? ` (${en.calendar.thisMonth.toLowerCase()})` : ''}</h3>
            {monthJobs.length === 0 ? (
              <p className="hint">{en.calendar.nothing}</p>
            ) : (
              <ul className="results">
                {monthJobs.map((j) => (
                  <li key={`${j.plantId}-${j.task}`}>
                    <button type="button" className="calendar-job" onClick={() => highlight(j)}>{j.text}</button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
      {undated.length > 0 && (
        <section>
          <ul className="results">
            {undated.map((u) => (
              <li key={`${u.plantId}-${u.task}`} className="hint">{en.calendar.undated(u.name)}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
