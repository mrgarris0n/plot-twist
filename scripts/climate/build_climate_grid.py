"""Download the C3S agroclimatic indicators TNn (minimum of daily minimum temperature) and precipitation sum per
10-day period (WFDEI 1981-2010, 0.5 degree) plus ERA5 monthly surface solar radiation (all-sky and clear-sky), and write public/climate/climate-v2.bin.
Needs a CDS account and ~/.cdsapirc. See README.md. Aggregation lives in grid.py (tested)."""
import sys
import zipfile
from pathlib import Path

import numpy as np

from grid import (DEKADS, NORTH_SPLIT, SOUTH_SPLIT, SOUTH_START_INDEX, dekads_to_daily, pack_grid, reduce_seasons,
                  season_stats, warm_half_blocked, warm_half_rain, yearly_rain)

HERE = Path(__file__).parent
CACHE = HERE / "cache"
OUT = HERE.parent.parent / "public" / "climate" / "climate-v2.bin"
YEARS = range(1981, 2011)
RES = 0.5


def _agro(variable, name):
    """One request for the whole 1981-2010 series of an agroclimatic indicator (10-day); cached. Returns the .nc path."""
    import cdsapi

    target = CACHE / f"agro_{name}_10day.zip"
    if not target.exists():
        CACHE.mkdir(exist_ok=True)
        part = target.with_suffix(".part")  # renamed only when complete, so an interrupted download is retried
        cdsapi.Client().retrieve(
            "sis-agroclimatic-indicators",
            {
                "origin": "era_interim_reanalysis",
                "variable": variable,
                "experiment": "historical",
                "temporal_aggregation": "10_day",
                "period": "198101_201012",
                "version": "1_1",
            },
            str(part),
        )
        part.rename(target)
    out = CACHE / f"agro_{name}"
    with zipfile.ZipFile(target) as z:
        nc = next(n for n in z.namelist() if n.endswith(".nc"))
        if not (out / nc).exists():
            z.extract(nc, out)
    return out / nc


def retrieve_tnn():
    return _agro("minimum_of_daily_minimum_temperature", "tnn")


def retrieve_rain():
    """Precipitation sum per 10-day period, same dataset and origin as TNn."""
    return _agro("precipitation_sum", "rr")


def _era5_monthly(variable, name):
    """ERA5 monthly means of one variable, 1981-2010, on our 0.5 degree cell centres; cached."""
    import cdsapi

    target = CACHE / f"era5_{name}_monthly.nc"
    if not target.exists():
        CACHE.mkdir(exist_ok=True)
        part = target.with_suffix(".part")
        cdsapi.Client().retrieve(
            "reanalysis-era5-single-levels-monthly-means",
            {
                "product_type": "monthly_averaged_reanalysis",
                "variable": variable,
                "year": [str(y) for y in YEARS],
                "month": [f"{m:02d}" for m in range(1, 13)],
                "time": "00:00",
                "grid": [0.5, 0.5],
                "area": [89.75, -179.75, -89.75, 179.75],
                "data_format": "netcdf",
            },
            str(part),
        )
        part.rename(target)
    return target


def retrieve_ssrd():
    """Surface solar radiation downwards (all-sky). With the clear-sky one it says how much sunshine cloud blocks."""
    return _era5_monthly("surface_solar_radiation_downwards", "ssrd")


def retrieve_ssrdc():
    """Surface solar radiation downwards, clear-sky."""
    return _era5_monthly("surface_solar_radiation_downward_clear_sky", "ssrdc")


def _same_grid(a, ref):
    """Same lat/lon cell centres (values, not just counts) as the reference grid."""
    return (
        a["lat"].shape == ref["lat"].shape and a["lon"].shape == ref["lon"].shape
        and np.allclose(a["lat"], ref["lat"]) and np.allclose(a["lon"], ref["lon"])
    )


def _monthly(path, var, ref):
    """ERA5 monthly series as float32 (years, 12, rows, cols), checked against the TNn grid `ref`."""
    import xarray as xr

    m = xr.open_dataset(path)[var].rename(latitude="lat", longitude="lon").sortby("lat", ascending=False).sortby("lon")
    if m.sizes["valid_time"] != 12 * len(YEARS):
        raise RuntimeError(f"expected {12 * len(YEARS)} months of {var}, got {m.sizes['valid_time']}")
    if not _same_grid(m, ref):
        raise RuntimeError(f"{var} grid differs from TNn grid")
    rows, cols = ref.sizes["lat"], ref.sizes["lon"]
    return m.values.reshape(len(YEARS), 12, rows, cols).astype(np.float32)


def main():
    import xarray as xr

    da = xr.open_dataset(retrieve_tnn())["TNn"].sortby("lat", ascending=False).sortby("lon")
    if da.sizes["time"] != DEKADS * len(YEARS):
        raise RuntimeError(f"expected {DEKADS * len(YEARS)} ten-day periods, got {da.sizes['time']}")
    rows, cols = da.sizes["lat"], da.sizes["lon"]
    lat = da["lat"].values

    north, south = [], []
    prev = None
    land = np.zeros((rows, cols), dtype=bool)
    for i, year in enumerate(YEARS):
        dek = da.isel(time=slice(i * DEKADS, (i + 1) * DEKADS)).values.astype(np.float32) - 273.15
        land |= np.isfinite(dek).any(axis=0)  # WFDEI has values over land only
        cur = dekads_to_daily(np.nan_to_num(dek, nan=99.0))
        north.append(season_stats(cur, NORTH_SPLIT))
        if prev is not None:
            season = np.concatenate([prev[SOUTH_START_INDEX:], cur[:SOUTH_START_INDEX]])
            south.append(season_stats(season, SOUTH_SPLIT))
        prev = cur
        print(year, file=sys.stderr)

    # rain (mm per period) and radiation: float32 arrays, (years, periods, rows, cols)
    rr = xr.open_dataset(retrieve_rain())["RR"].sortby("lat", ascending=False).sortby("lon")
    if rr.sizes["time"] != DEKADS * len(YEARS):
        raise RuntimeError(f"expected {DEKADS * len(YEARS)} ten-day periods of rain, got {rr.sizes['time']}")
    if rr.attrs.get("units") != "mm":
        raise RuntimeError(f"expected rain in mm, got {rr.attrs.get('units')!r}")
    if not _same_grid(rr, da):
        raise RuntimeError("rain grid differs from TNn grid")
    dek_rain = rr.values.reshape(len(YEARS), DEKADS, rows, cols).astype(np.float32)
    ssrd = _monthly(retrieve_ssrd(), "ssrd", da)
    ssrdc = _monthly(retrieve_ssrdc(), "ssrdc", da)

    n_min, n_last, n_first = reduce_seasons(north, south=False)
    s_min, s_last, s_first = reduce_seasons(south, south=True)
    is_south = (lat < 0)[:, None]
    pick = lambda n, s: np.where(is_south, s, n)
    rain_year = yearly_rain(dek_rain)
    rain_warm = pick(warm_half_rain(dek_rain, south=False), warm_half_rain(dek_rain, south=True))
    cloud_warm = pick(warm_half_blocked(ssrd, ssrdc, south=False), warm_half_blocked(ssrd, ssrdc, south=True))
    data = pack_grid(pick(n_min, s_min), pick(n_last, s_last), pick(n_first, s_first), rain_year, rain_warm, cloud_warm, land, RES)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_bytes(data)
    print(f"wrote {OUT} ({len(data)} bytes)", file=sys.stderr)


if __name__ == "__main__":
    main()
