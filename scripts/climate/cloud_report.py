"""Print the warm-half-year blocked sunshine (percent of clear-sky sunshine blocked by cloud) for named places from a climate-v2 grid.
Usage: python cloud_report.py ../../public/climate/climate-v2.bin London=51.51,-0.13 Paris=48.86,2.35
Uses the same cell lookup as climateAt in src/services/climate.ts, including the nearest-land fallback for sea points."""
import math
import struct
import sys

import numpy as np

NO_DATA = -32768
HEADER = 16


def load(path):
    buf = open(path, "rb").read()
    magic, version, cols, rows, res, _ = struct.unpack("<4sHHHfH", buf[:HEADER])
    assert magic == b"TGCL" and version == 2, "need a climate-v2 grid"
    data = np.frombuffer(buf, dtype="<i2", offset=HEADER).reshape(rows, cols, 6)
    return data, res


def cell(data, r, c):
    if r < 0 or r >= data.shape[0]:
        return None
    rec = data[r, c % data.shape[1]]
    return None if rec[0] == NO_DATA else rec


def lookup(data, res, lat, lon):
    rows, cols = data.shape[:2]
    row_f, col_f = (90 - lat) / res, (lon + 180) / res
    row = min(rows - 1, max(0, math.floor(row_f)))
    col = min(cols - 1, max(0, math.floor(col_f)))
    here = cell(data, row, col)
    if here is not None:
        return here, False
    kx = math.cos(math.radians(lat))
    best, best_d = None, math.inf
    for dr in (-1, 0, 1):
        for dc in (-1, 0, 1):
            if dr == 0 and dc == 0:
                continue
            c = cell(data, row + dr, col + dc)
            if c is None:
                continue
            d = (row + dr + 0.5 - row_f) ** 2 + ((col + dc + 0.5 - col_f) * kx) ** 2
            if d < best_d:
                best, best_d = c, d
    return best, True


def main(argv):
    data, res = load(argv[0])
    for arg in argv[1:]:
        name, ll = arg.split("=")
        lat, lon = map(float, ll.split(","))
        rec, sea = lookup(data, res, lat, lon)
        if rec is None:
            print(f"{name:12s} no data")
        else:
            print(f"{name:12s} blocked sunshine {int(rec[5]):3d} %  rain {int(rec[3])} mm/yr, {int(rec[4])} mm warm half{'  (sea, nearest land)' if sea else ''}")


if __name__ == "__main__":
    main(sys.argv[1:])
