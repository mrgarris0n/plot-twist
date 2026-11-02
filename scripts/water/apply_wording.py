#!/usr/bin/env python3
"""Apply wording.json (water level + cited source ids) to data/plants/*.json. Idempotent, stdlib only.

Refuses to touch a plant that already has a USDA minimum, and checks every source id exists in the plant's `sources`.
"""
import glob
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
PLANTS = os.path.normpath(os.path.join(HERE, "..", "..", "data", "plants"))


def main():
    with open(os.path.join(HERE, "wording.json"), encoding="utf-8") as f:
        wording = {k: v for k, v in json.load(f).items() if not k.startswith("_")}
    done = set()
    for path in sorted(glob.glob(os.path.join(PLANTS, "*.json"))):
        with open(path, encoding="utf-8") as f:
            plants = json.load(f)
        for p in plants:
            if p["id"] not in wording:
                continue
            level, src_ids, _quote = wording[p["id"]]
            have = {s["id"] for s in p["sources"]}
            missing = [s for s in src_ids if s not in have]
            if missing:
                sys.exit("%s: sources not cited by the plant: %s" % (p["id"], missing))
            if isinstance(p.get("water"), dict) and "minRainMm" in p["water"]:
                sys.exit("%s already has a USDA minimum; remove it from wording.json" % p["id"])
            if "water" not in p:
                items = list(p.items())
                p.clear()
                for k, v in items:
                    if k == "sources":
                        p["water"] = None
                    p[k] = v
            p["water"] = {"level": level}
            p["fieldSources"]["water"] = list(src_ids)
            done.add(p["id"])
        with open(path, "w", encoding="utf-8") as f:
            f.write(json.dumps(plants, indent=2, ensure_ascii=False) + "\n")
    unknown = set(wording) - done
    if unknown:
        sys.exit("unknown plant ids: %s" % sorted(unknown))
    print("%d wording-based values applied" % len(done))


if __name__ == "__main__":
    main()
