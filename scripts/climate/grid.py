"""Pure numpy logic for the climate grid: no I/O, no xarray. Tested in test_build.py.

Calendar: every year is 365 days (Feb 29 dropped). Day offsets inside a "season year":
  north: Jan 1 .. Dec 31 (last-frost window Jan 1-Jul 31 = offsets 0..211, first-frost Aug 1-Dec 31 = 212..364)
  south: Jul 1 .. Jun 30 (last-frost window Jul 1-Jan 31 = offsets 0..214, first-frost Feb 1-Jun 30 = 215..364)
"""
import struct
import warnings
import numpy as np

NO_DATA = -32768
FROST_FREE = -1
DAYS = 365
NORTH_SPLIT = 212
SOUTH_SPLIT = 215
SOUTH_START_INDEX = 181  # Jul 1 in a 365-day year (0-based)
MIN_FROST_YEAR_FRACTION = 0.5


def season_stats(t, split):
    """t: (365, rows, cols) daily minimum temperature in C for one season year.
    Returns dict: tmin (annual minimum), last_off / first_off (float offsets, nan when none), frost (bool)."""
    assert t.shape[0] == DAYS
    cold = t <= 0.0
    idx = np.arange(DAYS).reshape(-1, 1, 1)
    in_last = idx < split
    last_cold = cold & in_last
    first_cold = cold & ~in_last
    last_off = np.where(last_cold, idx, -1).max(axis=0).astype(float)
    last_off[~last_cold.any(axis=0)] = np.nan
    first_off = np.where(first_cold, idx, DAYS).min(axis=0).astype(float)
    first_off[~first_cold.any(axis=0)] = np.nan
    return {"tmin": t.min(axis=0), "last_off": last_off, "first_off": first_off, "frost": cold.any(axis=0)}


DEKADS = 36
# 0-based day-of-year (365-day calendar) of the 5th, 15th and 25th of each month: the middle of each 10-day period.
_MONTH_START = np.cumsum([0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30])
DEKAD_MID_DAY = np.array([start + d for start in _MONTH_START for d in (4, 14, 24)])
NO_FROST_C = 99.0


def dekads_to_daily(dek):
    """(36, rows, cols) minimum of daily minimum per 10-day period -> (365, rows, cols) for season_stats.
    Each period's value sits on its middle day; other days are NO_FROST_C, so the annual minimum is kept and
    frost dates fall mid-period (within about 5 days of the true date)."""
    assert dek.shape[0] == DEKADS
    daily = np.full((DAYS,) + dek.shape[1:], NO_FROST_C, dtype=np.float32)
    daily[DEKAD_MID_DAY] = dek
    return daily


def offset_to_doy(off, south):
    """Season offset -> calendar day of year (1..365). nan stays nan."""
    off = np.asarray(off, dtype=float)
    if south:
        return (off + SOUTH_START_INDEX) % DAYS + 1
    return off + 1


def reduce_seasons(stats, south):
    """Combine per-season stats (list) for one hemisphere convention.
    Returns (min_winter_c float, last_doy int, first_doy int). Frost-free (frost in < 50 % of years): both -1.
    A frost-prone cell lacking frost in one window gets NO_DATA for that date."""
    n = len(stats)
    tmin = np.mean([s["tmin"] for s in stats], axis=0)
    frost_years = np.sum([s["frost"] for s in stats], axis=0)
    frost_prone = frost_years >= MIN_FROST_YEAR_FRACTION * n

    def med(key):
        a = np.stack([s[key] for s in stats])
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", RuntimeWarning)  # all-nan slices -> nan
            return np.nanmedian(a, axis=0)

    last = offset_to_doy(med("last_off"), south)
    first = offset_to_doy(med("first_off"), south)
    out = []
    for d in (last, first):
        v = np.where(np.isnan(d), NO_DATA, np.round(np.nan_to_num(d))).astype(np.int16)
        v[~frost_prone] = FROST_FREE
        out.append(v)
    return tmin, out[0], out[1]


NORTH_WARM_DEKADS = slice(9, 27)  # Apr 1 - Sep 30
NORTH_WARM_MONTHS = slice(3, 9)  # Apr - Sep


def _warm_idx(n, north_slice, south):
    """Index array of the warm half: north slice, or its complement (Oct-Mar) for the south."""
    idx = np.arange(n)[north_slice]
    return np.setdiff1d(np.arange(n), idx) if south else idx


def yearly_rain(dek_rain):
    """(years, 36, rows, cols) mm per 10-day period -> mean yearly total, mm."""
    return dek_rain.sum(axis=1).mean(axis=0)


def warm_half_rain(dek_rain, south):
    """(years, 36, rows, cols) mm per 10-day period -> mean warm-half-year total, mm.
    North warm half is Apr-Sep, south is Oct-Mar."""
    idx = _warm_idx(DEKADS, NORTH_WARM_DEKADS, south)
    return dek_rain[:, idx].sum(axis=1).mean(axis=0)


def warm_half_blocked(monthly_ssrd, monthly_ssrdc, south):
    """(years, 12, rows, cols) monthly mean surface solar radiation, all-sky and clear-sky, same units ->
    percent of clear-sky sunshine blocked by cloud over the warm-half-year months of all years:
    100 * (1 - sum(all-sky) / sum(clear-sky)). A ratio of sums, so bright months count for more.
    NaN where the clear-sky sum is 0."""
    idx = _warm_idx(12, NORTH_WARM_MONTHS, south)
    sky = monthly_ssrd[:, idx].astype(np.float64).sum(axis=(0, 1))
    clear = monthly_ssrdc[:, idx].astype(np.float64).sum(axis=(0, 1))
    with np.errstate(divide="ignore", invalid="ignore"):
        return np.where(clear > 0, 100 * (1 - sky / np.where(clear > 0, clear, 1)), np.nan)


def _whole(a, scale=1):
    """Round to whole int16 units; non-finite -> NO_DATA."""
    a = np.asarray(a, dtype=float) * scale
    ok = np.isfinite(a)
    return np.where(ok, np.clip(np.round(np.where(ok, a, 0)), -32767, 32767), NO_DATA)


def pack_grid(min_winter_c, last_doy, first_doy, rain_year_mm, rain_warm_mm, cloud_warm_pct, land, res_deg):
    """Binary climate-v2: see README. land: bool (rows, cols). Six int16 per cell:
    min winter C x10, last frost doy, first frost doy, yearly rain mm, warm-half rain mm, warm-half cloud %."""
    rows, cols = land.shape
    rec = np.empty((rows, cols, 6), dtype="<i2")
    for i, (v, scale) in enumerate([(min_winter_c, 10), (last_doy, 1), (first_doy, 1), (rain_year_mm, 1), (rain_warm_mm, 1), (cloud_warm_pct, 1)]):
        rec[..., i] = np.where(land, _whole(v, scale), NO_DATA)
    return struct.pack("<4sHHHfH", b"TGCL", 2, cols, rows, res_deg, 0) + rec.tobytes()
