import { afterEach, describe, expect, it, vi } from 'vitest'
import { GeocodeUnavailable, searchPlaces } from './geocode'

afterEach(() => vi.unstubAllGlobals())

describe('searchPlaces', () => {
  it('maps Photon features to places', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        type: 'FeatureCollection',
        features: [{ geometry: { coordinates: [19.04, 47.5] }, properties: { name: 'Budapest', country: 'Hungary' } }],
      }),
    })
    vi.stubGlobal('fetch', fetchMock)
    expect(await searchPlaces('Budapest')).toEqual([{ label: 'Budapest, Hungary', lat: 47.5, lon: 19.04 }])
    expect(String(fetchMock.mock.calls[0]![0])).toContain('limit=5')
  })

  it('adds city and state so same-named places differ, without repeating parts', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        features: [
          { geometry: { coordinates: [-89.65, 39.8] }, properties: { name: 'Springfield', city: 'Springfield', state: 'Illinois', country: 'United States' } },
          { geometry: { coordinates: [19.05, 47.51] }, properties: { name: 'Margaret Island', city: 'Budapest', state: 'Budapest', country: 'Hungary' } },
        ],
      }),
    }))
    expect((await searchPlaces('Springfield')).map((p) => p.label)).toEqual(['Springfield, Illinois, United States', 'Margaret Island, Budapest, Hungary'])
  })

  it('skips results with out-of-range coordinates', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        features: [
          { geometry: { coordinates: [19.04, 95] }, properties: { name: 'BadLat' } },
          { geometry: { coordinates: [200, 10] }, properties: { name: 'BadLon' } },
          { geometry: { coordinates: [19.04, 47.5] }, properties: { name: 'Good' } },
        ],
      }),
    }))
    expect(await searchPlaces('Budapest')).toEqual([{ label: 'Good', lat: 47.5, lon: 19.04 }])
  })

  it('throws GeocodeUnavailable on HTTP 429', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429 }))
    await expect(searchPlaces('Budapest')).rejects.toBeInstanceOf(GeocodeUnavailable)
  })

  it('throws GeocodeUnavailable on network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')))
    await expect(searchPlaces('Budapest')).rejects.toBeInstanceOf(GeocodeUnavailable)
  })

  it('returns [] without fetching for short queries', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    expect(await searchPlaces('Bu')).toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
