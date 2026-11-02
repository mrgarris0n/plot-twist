/** Garden names compare without surrounding spaces, letter case or accent encoding differences. */
function nameKey(name: string): string {
  return name.trim().normalize('NFC').toLocaleLowerCase()
}

/** True when `name` matches one of `taken` (ignoring `exceptId`, the garden being renamed). */
export function nameTaken(name: string, taken: { id: string; name: string }[], exceptId?: string): boolean {
  const key = nameKey(name)
  return taken.some((g) => g.id !== exceptId && nameKey(g.name) === key)
}

/** `base` if free, else "base 2", "base 3", … — for default and imported names, where asking would only get in the way. */
export function uniqueName(base: string, taken: { id: string; name: string }[]): string {
  const name = base.trim()
  if (!nameTaken(name, taken)) return name
  for (let n = 2; ; n++) {
    const candidate = `${name} ${n}`
    if (!nameTaken(candidate, taken)) return candidate
  }
}
