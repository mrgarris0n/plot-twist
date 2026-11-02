import struct

import numpy as np

from grid import FROST_FREE, NO_DATA, NORTH_SPLIT, SOUTH_SPLIT, offset_to_doy, pack_grid, reduce_seasons, season_stats, warm_half_blocked, warm_half_rain, yearly_rain


def year(cells, fill=10.0):
    """(365,1,n) season; cells: list of {offset: temp} dicts."""
    t = np.full((365, 1, len(cells)), fill)
    for i, c in enumerate(cells):
        for off, v in c.items():
            t[off, 0, i] = v
    return t


def test_always_warm_cell_is_frost_free():
    stats = [season_stats(year([{}]), NORTH_SPLIT) for _ in range(3)]
    _, last, first = reduce_seasons(stats, south=False)
    assert last[0, 0] == FROST_FREE and first[0, 0] == FROST_FREE


def test_frost_in_only_one_of_three_years_is_frost_free():
    stats = [season_stats(year([{99: -3.0, 300: -1.0}]), NORTH_SPLIT)] + [season_stats(year([{}]), NORTH_SPLIT) for _ in range(2)]
    _, last, first = reduce_seasons(stats, south=False)
    assert last[0, 0] == FROST_FREE and first[0, 0] == FROST_FREE


def test_north_last_frost_median_and_winter_minimum():
    # offsets 99,109,119 -> doy 100,110,120
    stats = [season_stats(year([{o: -4.0 - i, 330: -2.0}]), NORTH_SPLIT) for i, o in enumerate((99, 109, 119))]
    tmin, last, first = reduce_seasons(stats, south=False)
    assert last[0, 0] == 110
    assert first[0, 0] == 331
    assert abs(tmin[0, 0] - (-5.0)) < 1e-6  # mean of -4, -5, -6


def test_only_years_with_frost_count_for_median():
    stats = [
        season_stats(year([{99: -1.0}]), NORTH_SPLIT),
        season_stats(year([{119: -1.0}]), NORTH_SPLIT),
        season_stats(year([{}]), NORTH_SPLIT),
    ]
    _, last, _ = reduce_seasons(stats, south=False)
    assert last[0, 0] == 110  # median of 100 and 120, third year ignored (2 of 3 >= 50 %)


def test_south_uses_july_to_june_season():
    # offset 100 from Jul 1 -> Oct 9 (doy 282); offset 280 -> Apr 8 (doy 98) next calendar year
    stats = [season_stats(year([{100: -2.0, 280: -2.0}]), SOUTH_SPLIT) for _ in range(3)]
    _, last, first = reduce_seasons(stats, south=True)
    assert last[0, 0] == offset_to_doy(100, True) == (100 + 181) % 365 + 1
    assert first[0, 0] == (280 + 181) % 365 + 1
    assert first[0, 0] < last[0, 0]  # autumn frost falls in the next calendar year's days


def _dek_rain():
    r = np.ones((2, 36, 1, 1))
    r[:, 9:27] = 10.0
    return r


def test_north_warm_half_is_apr_sep():
    assert warm_half_rain(_dek_rain(), south=False)[0, 0] == 180
    assert yearly_rain(_dek_rain())[0, 0] == 18 * 10 + 18 * 1


def test_south_warm_half_is_oct_mar():
    assert warm_half_rain(_dek_rain(), south=True)[0, 0] == 18


def _ssrd(warm, cool):
    """(2 years, 12 months, 1, 1): `warm` in Apr-Sep, `cool` in the other months."""
    a = np.full((2, 12, 1, 1), float(cool))
    a[:, 3:9] = warm
    return a


def test_warm_half_blocked_is_ratio_of_sums_north():
    # Apr-Sep: 40 of 100 reaches the ground -> 60 % blocked; Oct-Mar values must not matter
    assert round(float(warm_half_blocked(_ssrd(40, 5), _ssrd(100, 50), south=False)[0, 0])) == 60


def test_warm_half_blocked_south_uses_oct_mar():
    assert round(float(warm_half_blocked(_ssrd(40, 5), _ssrd(100, 50), south=True)[0, 0])) == 90


def test_warm_half_blocked_weights_by_sunshine_not_by_month():
    ssrd = np.zeros((1, 12, 1, 1)); ssrdc = np.zeros((1, 12, 1, 1))
    ssrdc[0, 3], ssrd[0, 3] = 300, 300  # bright month, nothing blocked
    ssrdc[0, 4], ssrd[0, 4] = 100, 0  # dim month, all blocked
    ssrdc[0, 5:9], ssrd[0, 5:9] = 0, 0
    assert round(float(warm_half_blocked(ssrd, ssrdc, south=False)[0, 0])) == 25  # not the 50 of a mean of ratios


def test_warm_half_blocked_nan_without_clear_sky_sun():
    z = np.zeros((1, 12, 1, 1))
    assert np.isnan(warm_half_blocked(z, z, south=False)[0, 0])


def test_pack_layout_v2():
    land = np.array([[True, False, True]])
    f = lambda *v: np.array([v])
    b = pack_grid(f(-15.3, 0, 4.0), f(105, 0, 90), f(300, 0, 280), f(640, 0, np.nan), f(310, 0, 200), f(72, 0, 50), land, 0.5)
    assert len(b) == 16 + 3 * 12
    assert struct.unpack("<4sHHHfH", b[:16]) == (b"TGCL", 2, 3, 1, 0.5, 0)
    recs = np.frombuffer(b[16:], dtype="<i2").reshape(1, 3, 6)
    assert tuple(recs[0, 0]) == (-153, 105, 300, 640, 310, 72)
    assert tuple(recs[0, 1]) == (NO_DATA,) * 6
    assert tuple(recs[0, 2]) == (40, 90, 280, NO_DATA, 200, 50)


def test_dekads_to_daily_keeps_minimum_and_puts_frost_mid_period():
    from grid import DEKAD_MID_DAY, dekads_to_daily

    dek = np.full((36, 1, 1), 5.0)
    dek[3] = -2.0  # Feb 1-10 frosty
    dek[0] = -6.0  # Jan 1-10 coldest
    daily = dekads_to_daily(dek)
    assert daily.shape == (365, 1, 1)
    s = season_stats(daily, NORTH_SPLIT)
    assert s["tmin"][0, 0] == -6.0
    assert s["last_off"][0, 0] == 35  # Feb 5 = day offset 35, middle of the period
    assert DEKAD_MID_DAY[-1] == 358  # Dec 25
