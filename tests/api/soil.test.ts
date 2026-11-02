import { afterEach, describe, expect, it, vi } from 'vitest'
import { GET, HEAD, OPTIONS } from '../../api/soil'

const layer = (name: string, v: number | null) => ({
  name,
  depths: [
    { label: '0-5cm', values: { mean: v } },
    { label: '5-15cm', values: { mean: v } },
  ],
})
const upstream = (ph: number | null, sand: number | null, silt: number | null, clay: number | null) =>
  Response.json({ properties: { layers: [layer('phh2o', ph), layer('sand', sand), layer('silt', silt), layer('clay', clay)] } })

const req = (qs: string) => new Request(`https://x.test/api/soil?${qs}`)
const stub = (r: Response) => { const f = vi.fn(async () => r); vi.stubGlobal('fetch', f); return f }

afterEach(() => vi.unstubAllGlobals())

describe('GET /api/soil', () => {
  it('returns normalised soil with long cache', async () => {
    const f = stub(upstream(64, 400, 400, 200))
    const res = await GET(req('lat=47.5&lon=19.04'))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ available: true, ph: 6.4, sandPct: 40, siltPct: 40, clayPct: 20 })
    expect(res.headers.get('Cache-Control')).toContain('s-maxage=31536000')
    expect(f).toHaveBeenCalledOnce()
  })
  it('normalises fractions that do not sum to 100', async () => {
    stub(upstream(64, 200, 200, 100))
    const body = await (await GET(req('lat=47.5&lon=19.04'))).json()
    expect(body).toMatchObject({ sandPct: 40, siltPct: 40, clayPct: 20 })
  })
  it('reports unavailable for null data with short cache', async () => {
    stub(upstream(null, null, null, null))
    const res = await GET(req('lat=47.5&lon=19.04'))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ available: false })
    expect(res.headers.get('Cache-Control')).toContain('s-maxage=3600')
  })
  it('reports unavailable when one property is missing', async () => {
    stub(upstream(64, 400, null, 200))
    expect(await (await GET(req('lat=47.5&lon=19.04'))).json()).toEqual({ available: false })
  })
  it('maps upstream failure to 502 no-store', async () => {
    stub(new Response('down', { status: 503 }))
    const res = await GET(req('lat=47.5&lon=19.04'))
    expect(res.status).toBe(502)
    expect(await res.json()).toEqual({ available: false })
    expect(res.headers.get('Cache-Control')).toBe('no-store')
  })
  it('rejects bad coordinates', async () => {
    const f = stub(upstream(1, 1, 1, 1))
    for (const qs of ['lat=91&lon=0', 'lat=abc&lon=0', 'lat=0&lon=181', 'lat=0', 'lat=NaN&lon=0', 'lat=0x10&lon=0', 'lat=1e1&lon=0']) {
      const res = await GET(req(qs))
      expect(res.status).toBe(400)
      expect(await res.json()).toHaveProperty('error')
    }
    expect(f).not.toHaveBeenCalled()
  })
  it('queries upstream with rounded coordinates', async () => {
    const f = stub(upstream(64, 400, 400, 200))
    await GET(req('lat=47.5012&lon=19.0391'))
    const url = new URL(String((f.mock.calls[0] as unknown[])[0]))
    expect(url.searchParams.get('lat')).toBe('47.5')
    expect(url.searchParams.get('lon')).toBe('19.04')
    expect(url.searchParams.getAll('property')).toEqual(['phh2o', 'sand', 'silt', 'clay'])
  })
})

describe('HEAD and OPTIONS /api/soil', () => {
  it('HEAD answers like GET without a body', async () => {
    stub(upstream(64, 400, 400, 200))
    const res = await HEAD(req('lat=47.5&lon=19.04'))
    expect(res.status).toBe(200)
    expect(res.headers.get('Cache-Control')).toContain('s-maxage=31536000')
    expect(res.body).toBeNull()
    expect((await HEAD(req('lat=x&lon=1'))).status).toBe(400)
  })
  it('OPTIONS lists the allowed methods', () => {
    const res = OPTIONS()
    expect(res.status).toBe(204)
    expect(res.headers.get('Allow')).toBe('GET, HEAD, OPTIONS')
  })
})
