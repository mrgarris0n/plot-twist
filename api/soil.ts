// Vercel function: proxies ISRIC SoilGrids so the browser gets one small, CDN-cacheable answer.
const UPSTREAM = 'https://rest.isric.org/soilgrids/v2.0/properties/query'
const PROPS = ['phh2o', 'sand', 'silt', 'clay'] as const
type Prop = (typeof PROPS)[number]

type Layer = { name?: string; depths?: { label?: string; values?: { mean?: number | null } }[] }

export function roundCoord(v: number): number {
  return Number((Math.round(v / 0.0025) * 0.0025).toFixed(4))
}

function json(body: unknown, status: number, cache: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': cache },
  })
}

const bad = (error: string) => json({ error }, 400, 'no-store')

function parseCoord(raw: string | null, limit: number): number | null {
  // Plain decimal only: Number() would also accept '0x10', '1e2' and similar.
  if (raw === null || !/^\s*-?\d+(\.\d+)?\s*$/.test(raw)) return null
  const n = Number(raw)
  return Number.isFinite(n) && Math.abs(n) <= limit ? n : null
}

function meanOf(layers: Layer[], name: Prop): number | null {
  const layer = layers.find((l) => l.name === name)
  const vals = (layer?.depths ?? [])
    .map((d) => d.values?.mean)
    .filter((v): v is number => typeof v === 'number' && Number.isFinite(v))
  return vals.length === 0 ? null : vals.reduce((a, b) => a + b, 0) / vals.length
}

const round1 = (v: number) => Math.round(v * 10) / 10

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const lat = parseCoord(url.searchParams.get('lat'), 90)
  const lon = parseCoord(url.searchParams.get('lon'), 180)
  if (lat === null || lon === null) return bad('lat and lon must be valid coordinates')

  const q = new URLSearchParams()
  q.set('lon', String(roundCoord(lon)))
  q.set('lat', String(roundCoord(lat)))
  for (const p of PROPS) q.append('property', p)
  q.append('depth', '0-5cm')
  q.append('depth', '5-15cm')
  q.set('value', 'mean')

  let data: { properties?: { layers?: Layer[] } }
  try {
    const res = await fetch(`${UPSTREAM}?${q}`, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return json({ available: false }, 502, 'no-store')
    data = await res.json()
  } catch {
    return json({ available: false }, 502, 'no-store')
  }

  const layers = data.properties?.layers ?? []
  const ph = meanOf(layers, 'phh2o')
  const sand = meanOf(layers, 'sand')
  const silt = meanOf(layers, 'silt')
  const clay = meanOf(layers, 'clay')
  if (ph === null || sand === null || silt === null || clay === null) {
    return json({ available: false }, 200, 'public, s-maxage=3600')
  }
  const total = sand + silt + clay
  if (total <= 0) return json({ available: false }, 200, 'public, s-maxage=3600')
  return json(
    {
      available: true,
      ph: round1(ph / 10),
      sandPct: round1((sand / total) * 100),
      siltPct: round1((silt / total) * 100),
      clayPct: round1((clay / total) * 100),
    },
    200,
    'public, s-maxage=31536000, stale-while-revalidate=86400',
  )
}

/** Same status and headers as GET, no body. */
export async function HEAD(req: Request): Promise<Response> {
  const res = await GET(req)
  return new Response(null, { status: res.status, headers: res.headers })
}

export function OPTIONS(): Response {
  return new Response(null, { status: 204, headers: { Allow: 'GET, HEAD, OPTIONS' } })
}
