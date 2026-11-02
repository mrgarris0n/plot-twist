#!/usr/bin/env python3
"""Fill `water: { minRainMm }` in data/plants/*.json from USDA PLANTS "Precipitation, Minimum".

Standard library only. Idempotent: running it again changes nothing. It never overwrites a `water`
value that is not a USDA minimum (wording-based values stay), and never touches plants USDA has no
number for. Usage:

    python3 scripts/water/usda_water.py            # write the files
    python3 scripts/water/usda_water.py --dry-run  # only print what it found
"""
import glob
import json
import os
import re
import sys
import urllib.parse
import urllib.request

API = "https://plantsservices.sc.egov.usda.gov/api/"
ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
PLANTS = os.path.join(ROOT, "data", "plants")
CACHE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cache")
LICENCE = "Public domain (US Gov)"


def get(path):
    """GET a USDA API path, cached on disk so reruns are reproducible and offline-friendly."""
    os.makedirs(CACHE, exist_ok=True)
    key = re.sub(r"[^A-Za-z0-9_.-]", "_", path)[:150]
    cp = os.path.join(CACHE, key + ".json")
    if os.path.exists(cp):
        with open(cp, encoding="utf-8") as f:
            return json.load(f)
    req = urllib.request.Request(API + path, headers={"User-Agent": "plottwist-data/1.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = json.loads(r.read().decode("utf-8"))
    with open(cp, "w", encoding="utf-8") as f:
        json.dump(data, f)
    return data


def plain(name):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", name or "")).strip()


def search_name(latin):
    """Latin name as USDA writes it: no cultivar, hybrid sign for ' x '."""
    n = re.sub(r"\s*'[^']*'", "", latin).strip()
    return n.replace(" x ", " × ")


def find_symbol(latin):
    want = search_name(latin)
    for hit in get("PlantSearch?searchText=" + urllib.parse.quote(want)):
        plant = hit["Plant"]
        name = plain(plant["ScientificName"])
        if not (name == want or name.startswith(want + " ")):
            continue
        rest = name[len(want):].strip()
        # Skip infraspecific taxa and hybrids of the species; keep "Genus species Author".
        if re.match(r"(var\.|ssp\.|subsp\.|f\.|×|\[)", rest) and "subsp." not in want:
            continue
        if plant["AcceptedId"] not in (0, plant["Id"]):
            continue  # a synonym: USDA keeps the data on the accepted name
        return plant["Symbol"], plant["Id"]
    return None


def min_precip_inches(symbol):
    prof = get("PlantProfile?symbol=" + symbol)
    if not prof.get("HasCharacteristics"):
        return None
    for ch in get("PlantCharacteristics/%d" % prof["Id"]):
        if ch["PlantCharacteristicName"] == "Precipitation, Minimum" and not ch.get("CultivarName"):
            try:
                return float(ch["PlantCharacteristicValue"])
            except (TypeError, ValueError):
                return None
    return None


def dump(plants):
    return json.dumps(plants, indent=2, ensure_ascii=False) + "\n"


def apply(p, symbol, inches):
    """Set water/fieldSources.water/source on plant dict p. Returns True if it changed."""
    mm = round(inches * 25.4)
    sid = "usda-plants-" + symbol.lower()
    before = json.dumps(p, sort_keys=False)
    if not any(s["id"] == sid for s in p["sources"]):
        p["sources"].append({
            "id": sid,
            "title": "%s (USDA PLANTS Database)" % search_name(p["latinName"]).replace("×", "x"),
            "url": "https://plants.usda.gov/plant-profile/" + symbol,
            "licence": LICENCE,
        })
    if "water" not in p:  # keep key order: put it just before `sources`
        items = list(p.items())
        p.clear()
        for k, v in items:
            if k == "sources":
                p["water"] = None
            p[k] = v
    p["water"] = {"minRainMm": mm}
    p["fieldSources"]["water"] = [sid]
    return json.dumps(p, sort_keys=False) != before


def main():
    dry = "--dry-run" in sys.argv
    found = 0
    for path in sorted(glob.glob(os.path.join(PLANTS, "*.json"))):
        with open(path, encoding="utf-8") as f:
            plants = json.load(f)
        changed = False
        for p in plants:
            w = p.get("water")
            if w is not None and "minRainMm" not in w:
                continue  # wording-based level: leave alone
            hit = find_symbol(p["latinName"])
            inches = min_precip_inches(hit[0]) if hit else None
            if inches is None or inches <= 0:
                print("none  %-22s %s" % (p["id"], hit[0] if hit else "-"))
                continue
            found += 1
            print("USDA  %-22s %s %.0f in -> %d mm" % (p["id"], hit[0], inches, round(inches * 25.4)))
            if not dry and apply(p, hit[0], inches):
                changed = True
        if changed:
            with open(path, "w", encoding="utf-8") as f:
                f.write(dump(plants))
    print("%d plants with a USDA minimum" % found)


if __name__ == "__main__":
    main()
