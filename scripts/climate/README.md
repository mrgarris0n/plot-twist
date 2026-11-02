# Climate grid

Builds `public/climate/climate-v2.bin`, the file the planner reads (`src/services/climate.ts`) to show winter low, frost dates, rainfall and blocked sunshine (information only, no warning).

Sources:

- Temperature and rain: C3S agroclimatic indicator TNn (minimum of daily minimum temperature per 10-day period), WFDEI 1981-2010, 0.5 degree grid, dataset `sis-agroclimatic-indicators` on the Copernicus Climate Data Store (CC BY 4.0). Rain is the same dataset's `precipitation_sum` (mm per 10-day period).
- Cloud: ERA5 monthly means of `surface_solar_radiation_downwards` and `surface_solar_radiation_downward_clear_sky` (`reanalysis-era5-single-levels-monthly-means`), 1981-2010, regridded by the CDS to our 0.5 degree cell centres (CC BY 4.0).

Licence and attribution: see "Licenses" and "Credits" in the top-level `README.md`.

## Generate it (one time)

1. Create a free account at https://cds.climate.copernicus.eu and accept the licences on the `sis-agroclimatic-indicators` and `reanalysis-era5-single-levels-monthly-means` dataset pages.
2. Put your API key in `~/.cdsapirc` (see the CDS "How to API" page).
3. From the repo root:
   ```
   python3 -m venv /tmp/climate-venv
   /tmp/climate-venv/bin/pip install -r scripts/climate/requirements.txt
   cd scripts/climate && /tmp/climate-venv/bin/python build_climate_grid.py
   ```
   Four downloads, cached in `scripts/climate/cache/` (gitignored): `agro_tnn_10day.zip` and `agro_rr_10day.zip` (about 200 MB zipped each), `era5_ssrd_monthly.nc` and `era5_ssrdc_monthly.nc` (NetCDF, about 300 MB each). Needs about 3 GB of RAM; the build itself takes a few minutes. The CDS queue can take hours (ssrd about 1.5 h, ssrdc about 3 h). ssrd and ssrdc are requested separately because a combined request failed. Delete a cache file to download it again.
4. Commit `public/climate/climate-v2.bin` (about 3.1 MB).

Tests (no CDS account needed): `/tmp/climate-venv/bin/python -m pytest scripts/climate`.

## Method

- Winter low: mean over years of the annual minimum of the 10-day TNn values (= annual minimum of daily minimum).
- Last spring frost: last day at or below 0 C in Jan 1 - Jul 31 (north) or Jul 1 - Jan 31 (south); first autumn frost: first such day in Aug 1 - Dec 31 (north) or Feb 1 - Jun 30 (south). Median over years that had frost. Southern seasons run July to June.
- A cell with frost in fewer than half the years is frost-free.
- Frost dates: a 10-day period counts as frosty when its TNn is at or below 0 C; its date is the period's middle day (5th, 15th or 25th), so dates are within about 5 days.
- Rain: yearly total and warm-half-year total (Apr-Sep north, Oct-Mar south, by cell latitude), averaged over the 30 years, whole mm. Warm-half periods follow the 10-day periods (Apr 1 - Sep 30).
- Cloud (sixth field): the share of clear-sky sunshine blocked by cloud, 100 x (1 - sum of all-sky surface solar radiation / sum of clear-sky surface solar radiation) over the warm half-year months of all 30 years (a ratio of sums, so bright months count for more), whole percent. Total cloud cover was tried first and did not separate Dublin from Bergen and Tobermory.
- Calendar: 365 days. The grid is already on 0.5 degree cell centres; land = cells with data (WFDEI covers land only).

## Binary format `climate-v2.bin` (little-endian)

Header, 16 bytes: `"TGCL"` (4 bytes), uint16 version (2), uint16 cols, uint16 rows, float32 resolution in degrees, uint16 reserved.
Then `rows x cols` records (row-major) of six int16: `minWinterC x 10`, `lastFrostDoy`, `firstFrostDoy`, `rainYearMm`, `rainWarmMm`, `cloudWarmPct` (percent of clear-sky sunshine blocked by cloud).
Row 0 is latitude `90 - res/2`, going south; column 0 is longitude `-180 + res/2`, going east.
`-32768` = no data (sea, or a value that could not be worked out); a frost day of `-1` = frost-free.

The Python writer (`grid.pack_grid`, tested in `test_build.py`) and the TypeScript reader (`src/services/climate.ts`, tested in `climate.test.ts`) must agree on this layout.
