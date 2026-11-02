# Plant data spot-check

15 plants chosen by `random.Random(20261021).sample(plants sorted by id, 15)` over all 131 plants in `data/plants/*.json`, plus known weak values flagged in review.
For each field, open the linked source and tick it if the page states the value. Note anything wrong next to it.

**Automated check (2026-10-21).** Every cited page was fetched directly (curl with a browser user-agent, text extracted with Python; PDFs via pdftotext) and each field line was compared with the page text. Result over 230 field lines: 220 verified (ticked), 1 mismatch, 9 unverifiable. Unticked lines are annotated inline; mismatches and unverifiable lines need a human look. Three cited pages returned HTTP 403 and could not be read (mgnv.org, fs.usda.gov FEIS, uncommonfruit.cias.wisc.edu). Several lines were ticked with a caveat (page lists "full sun, partial shade" with no preference, or gives a season rather than exact months); see the report in .superpowers/sdd/2026-10-20-terragrid-food-forest/spotcheck-verify-report.md. **Follow-up (2026-10-22):** the one mismatch (red raspberry width) and the six unverified common names were fixed in the data; those lines are now ticked and marked "Fixed after check". Three lines remain unverified because their pages block automated requests (New Jersey tea nitrogen-fixer role, black mulberry winter low and leaf habit).

## red-alder — Red alder (climbers-fixers.json)

- [x] **commonNames**: `["Red alder", "Oregon alder"]` — [Alnus rubra (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/alnus-rubra/)
- [x] **latinName**: `"Alnus rubra"` — [Alnus rubra (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/alnus-rubra/)
- [x] **layer**: `"canopy"` — [Alnus rubra (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/alnus-rubra/)
- [x] **variants.standard**: `{"matureHeightM": 25.0, "matureWidthM": 13.0}` — [Alnus rubra (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/alnus-rubra/)
- [x] **sunNeed**: `"full"` — [Alnus rubra (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/alnus-rubra/)
- [x] **leafHabit**: `"deciduous"` — [Alnus rubra (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/alnus-rubra/)
- [x] **minWinterC**: `-28.9` — [Alnus rubra (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/alnus-rubra/)
- [x] **roles**: `["nitrogen-fixer"]` — [Alnus rubra (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/alnus-rubra/), [Red alder, Alnus rubra (USDA NRCS Plant Guide)](https://plants.usda.gov/DocumentLibrary/plantguide/pdf/pg_alru2.pdf)
- [x] **calendar**: `[{"task": "plant", "from": "early-spring", "to": "late-summer"}]` — [Red alder, Alnus rubra (USDA NRCS Plant Guide)](https://plants.usda.gov/DocumentLibrary/plantguide/pdf/pg_alru2.pdf)
- [x] **drainage**: `["fast", "normal", "wet"]` — [Alnus rubra (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/alnus-rubra/)
- [x] **origin**: `["north-america"]` — [Alnus rubra (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/alnus-rubra/)

## anise-hyssop — Anise hyssop (herbs.json)

- [x] **commonNames**: `["Anise hyssop"]` — [Agastache foeniculum (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/agastache-foeniculum/)
- [x] **latinName**: `"Agastache foeniculum"` — [Agastache foeniculum (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/agastache-foeniculum/)
- [x] **layer**: `"herbaceous"` — [Agastache foeniculum (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/agastache-foeniculum/)
- [x] **sunNeed**: `"full"` — [Agastache foeniculum (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/agastache-foeniculum/)
- [x] **variants.standard**: `{"matureHeightM": 1.2, "matureWidthM": 0.7}` — [Agastache foeniculum (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/agastache-foeniculum/)
- [x] **minWinterC**: `-34.4` — [Agastache foeniculum (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/agastache-foeniculum/)
- [x] **calendar**: `[{"task": "plant", "from": "early-spring", "to": "late-spring"}, {"task": "plant", "from": "early-autumn", "to": "late-autumn"}]` — [Agastache foeniculum (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/agastache-foeniculum/)
- [x] **edibleParts**: `["leaves", "seeds", "flowers"]` — [Agastache foeniculum (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/agastache-foeniculum/)
- [x] **drainage**: `["fast", "normal"]` — [Agastache foeniculum (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/agastache-foeniculum/)
- [x] **roles**: `["pollinator"]` — [Agastache foeniculum (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/agastache-foeniculum/)
- [x] **origin**: `["north-america"]` — [Agastache foeniculum (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/agastache-foeniculum/)

## ramps — Ramps (ground-roots.json)

- [x] **commonNames**: `["Ramps", "Wild leek"]` — [Allium tricoccum (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/allium-tricoccum/)
- [x] **latinName**: `"Allium tricoccum"` — [Allium tricoccum (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/allium-tricoccum/)
- [x] **layer**: `"root"` — [Allium tricoccum (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/allium-tricoccum/)
- [x] **sunNeed**: `"shade"` — [Allium tricoccum (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/allium-tricoccum/), [Ramps, Allium tricoccum (University of Wisconsin Extension Horticulture)](https://hort.extension.wisc.edu/articles/ramps-allium-tricoccum/)
- [x] **variants.standard**: `{"matureHeightM": 0.23, "matureWidthM": 0.46}` — [Allium tricoccum (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/allium-tricoccum/)
- [x] **minWinterC**: `-40.0` — [Ramps, Allium tricoccum (University of Wisconsin Extension Horticulture)](https://hort.extension.wisc.edu/articles/ramps-allium-tricoccum/)
- [x] **calendar**: `[{"task": "plant", "from": "early-spring", "to": "early-spring"}, {"task": "plant", "from": "early-autumn", "to": "late-autumn"}]` — [Ramps, Allium tricoccum (University of Wisconsin Extension Horticulture)](https://hort.extension.wisc.edu/articles/ramps-allium-tricoccum/)
- [x] **edibleParts**: `["leaves", "bulbs"]` — [Ramps, Allium tricoccum (University of Wisconsin Extension Horticulture)](https://hort.extension.wisc.edu/articles/ramps-allium-tricoccum/), [Cultivation of Ramps (NC State Extension Publications)](https://content.ces.ncsu.edu/cultivation-of-ramps-allium-tricoccum-and-a-burdickii)
- [x] **firstHarvestYears**: `2.5` — [Ramps, Allium tricoccum (University of Wisconsin Extension Horticulture)](https://hort.extension.wisc.edu/articles/ramps-allium-tricoccum/), [Cultivation of Ramps (NC State Extension Publications)](https://content.ces.ncsu.edu/cultivation-of-ramps-allium-tricoccum-and-a-burdickii)
- [x] **drainage**: `["fast", "normal"]` — [Allium tricoccum (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/allium-tricoccum/)
- [x] **roles**: `["pollinator"]` — [Allium tricoccum (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/allium-tricoccum/)
- [x] **origin**: `["north-america"]` — [Allium tricoccum (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/allium-tricoccum/)

## rhubarb — Rhubarb (herbs.json)

- [x] **commonNames**: `["Rhubarb"]` — [Grow your own rhubarb, EC 797 (Oregon State University Extension)](https://extension.oregonstate.edu/catalog/ec-797-grow-your-own-rhubarb)
- [x] **latinName**: `"Rheum rhabarbarum"` — [Rheum rhabarbarum (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/rheum-rhabarbarum/)
- [x] **layer**: `"herbaceous"` — [Rhubarb, Rheum rhabarbarum (University of Wisconsin Horticulture)](https://hort.extension.wisc.edu/articles/rhubarb-rheum-rhabarbarum/)
- [x] **sunNeed**: `"full"` — [Rhubarb, Rheum rhabarbarum (University of Wisconsin Horticulture)](https://hort.extension.wisc.edu/articles/rhubarb-rheum-rhabarbarum/)
- [x] **variants.standard**: `{"matureHeightM": 0.8, "matureWidthM": 1.0}` — [Grow your own rhubarb, EC 797 (Oregon State University Extension)](https://extension.oregonstate.edu/catalog/ec-797-grow-your-own-rhubarb)
- [x] **phMin**: `6.0` — [Grow your own rhubarb, EC 797 (Oregon State University Extension)](https://extension.oregonstate.edu/catalog/ec-797-grow-your-own-rhubarb)
- [x] **phMax**: `6.8` — [Grow your own rhubarb, EC 797 (Oregon State University Extension)](https://extension.oregonstate.edu/catalog/ec-797-grow-your-own-rhubarb)
- [x] **drainage**: `["fast", "normal"]` — [Rhubarb, Rheum rhabarbarum (University of Wisconsin Horticulture)](https://hort.extension.wisc.edu/articles/rhubarb-rheum-rhabarbarum/)
- [x] **minWinterC**: `-40.0` — [Rheum rhabarbarum 'Victoria' (Chicago Botanic Garden Plant Finder)](https://www.chicagobotanic.org/plant-information/plant-finder/rheum-rhabarbarum-victoria-rhubarb)
- [x] **edibleParts**: `["leaf stalks"]` — [Rheum rhabarbarum (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/rheum-rhabarbarum/)
- [x] **calendar**: `[{"task": "plant", "frost": "last", "offsetWeeks": -5}, {"task": "harvest", "from": "late-spring", "to": "early-summer"}]` — [Rhubarb, Rheum rhabarbarum (University of Wisconsin Horticulture)](https://hort.extension.wisc.edu/articles/rhubarb-rheum-rhabarbarum/), [Grow your own rhubarb, EC 797 (Oregon State University Extension)](https://extension.oregonstate.edu/catalog/ec-797-grow-your-own-rhubarb)
- [x] **firstHarvestYears**: `2` — [Grow your own rhubarb, EC 797 (Oregon State University Extension)](https://extension.oregonstate.edu/catalog/ec-797-grow-your-own-rhubarb)
- [x] **origin**: `["asia"]` — [Rheum rhabarbarum (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/rheum-rhabarbarum/)
- [x] **grownIn**: `["europe"]` — [How to grow rhubarb (RHS Grow Your Own)](https://www.rhs.org.uk/vegetables/rhubarb/grow-your-own)

## new-jersey-tea — New Jersey tea (shrubs.json)

- [x] **commonNames**: `["New Jersey tea"]` — [Ceanothus americanus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/ceanothus-americanus) — **Fixed after check:** removed "Redroot" (not on the cited page)
- [x] **latinName**: `"Ceanothus americanus"` — [Ceanothus americanus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/ceanothus-americanus)
- [x] **layer**: `"shrub"` — [Ceanothus americanus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/ceanothus-americanus)
- [x] **sunNeed**: `"full"` — [New Jersey tea plant guide (USDA NRCS)](https://plants.usda.gov/DocumentLibrary/plantguide/pdf/cs_ceam.pdf)
- [x] **variants.standard**: `{"matureHeightM": 0.8, "matureWidthM": 1.2}` — [Ceanothus americanus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/ceanothus-americanus)
- [x] **minWinterC**: `-34.4` — [Ceanothus americanus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/ceanothus-americanus)
- [ ] **roles**: `["nitrogen-fixer"]` — [Ceanothus americanus (Master Gardeners of Northern Virginia)](https://mgnv.org/plants/native-plants/shrubs/ceanothus-americanus/), [Ceanothus americanus (USDA Forest Service Fire Effects Information System)](https://www.fs.usda.gov/database/feis/plants/shrub/ceaame/all.html) — **UNVERIFIABLE:** both cited pages returned HTTP 403 to automated fetch (mgnv.org, fs.usda.gov FEIS); nitrogen fixing not checked
- [x] **edibleParts**: `["leaves"]` — [New Jersey tea plant guide (USDA NRCS)](https://plants.usda.gov/DocumentLibrary/plantguide/pdf/cs_ceam.pdf)
- [x] **calendar**: `[{"task": "plant", "from": "late-autumn", "to": "early-winter"}]` — [New Jersey tea plant guide (USDA NRCS)](https://plants.usda.gov/DocumentLibrary/plantguide/pdf/cs_ceam.pdf)
- [x] **drainage**: `["fast", "normal"]` — [Ceanothus americanus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/ceanothus-americanus)
- [x] **textures**: `["loamy", "sandy"]` — [Ceanothus americanus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/ceanothus-americanus)
- [x] **origin**: `["north-america"]` — [Ceanothus americanus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/ceanothus-americanus)

## jerusalem-artichoke — Jerusalem artichoke (ground-roots.json)

- [x] **commonNames**: `["Jerusalem artichoke", "Sunchoke"]` — [Helianthus tuberosus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/helianthus-tuberosus/)
- [x] **latinName**: `"Helianthus tuberosus"` — [Helianthus tuberosus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/helianthus-tuberosus/)
- [x] **layer**: `"root"` — [Helianthus tuberosus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/helianthus-tuberosus/)
- [x] **sunNeed**: `"full"` — [Helianthus tuberosus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/helianthus-tuberosus/)
- [x] **variants.standard**: `{"matureHeightM": 2.4, "matureWidthM": 1.2}` — [Helianthus tuberosus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/helianthus-tuberosus/)
- [x] **minWinterC**: `-40.0` — [Helianthus tuberosus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/helianthus-tuberosus/)
- [x] **calendar**: `[{"task": "plant", "from": "early-spring", "to": "early-spring"}, {"task": "harvest", "from": "mid-autumn", "to": "early-winter"}]` — [Helianthus tuberosus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/helianthus-tuberosus/)
- [x] **edibleParts**: `["tubers"]` — [Helianthus tuberosus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/helianthus-tuberosus/)
- [x] **drainage**: `["fast", "normal"]` — [Helianthus tuberosus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/helianthus-tuberosus/)
- [x] **roles**: `["pollinator"]` — [Helianthus tuberosus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/helianthus-tuberosus/)
- [x] **origin**: `["north-america"]` — [Helianthus tuberosus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/helianthus-tuberosus/), [Helianthus tuberosus (RHS plant profile)](https://www.rhs.org.uk/plants/76796/helianthus-tuberosus/details)
- [x] **grownIn**: `["europe"]` — [How to grow Jerusalem artichokes (RHS Grow Your Own)](https://www.rhs.org.uk/vegetables/jerusalem-artichokes/grow-your-own)

## tarragon — Tarragon (herbs.json)

- [x] **commonNames**: `["Tarragon"]` — [Artemisia dracunculus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/artemisia-dracunculus/)
- [x] **latinName**: `"Artemisia dracunculus"` — [Artemisia dracunculus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/artemisia-dracunculus/)
- [x] **layer**: `"herbaceous"` — [Artemisia dracunculus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/artemisia-dracunculus/)
- [x] **sunNeed**: `"full"` — [Artemisia dracunculus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/artemisia-dracunculus/)
- [x] **variants.standard**: `{"matureHeightM": 0.6, "matureWidthM": 0.4}` — [Artemisia dracunculus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/artemisia-dracunculus/)
- [x] **minWinterC**: `-40.0` — [Artemisia dracunculus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/artemisia-dracunculus/)
- [x] **calendar**: `[{"task": "prune", "from": "early-spring", "to": "early-spring"}, {"task": "harvest", "from": "early-summer", "to": "mid-summer"}]` — [Artemisia dracunculus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/artemisia-dracunculus/), [Growing, Harvesting, and Drying Herbs (Iowa State University Extension)](https://yardandgarden.extension.iastate.edu/how-to/growing-harvesting-and-drying-herbs)
- [x] **edibleParts**: `["leaves", "seeds"]` — [Artemisia dracunculus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/artemisia-dracunculus/)
- [x] **phMin**: `6.0` — [Artemisia dracunculus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/artemisia-dracunculus/)
- [x] **phMax**: `8.0` — [Artemisia dracunculus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/artemisia-dracunculus/)
- [x] **drainage**: `["fast", "normal"]` — [Artemisia dracunculus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/artemisia-dracunculus/)
- [x] **origin**: `["europe", "asia", "north-america"]` — [Artemisia dracunculus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/artemisia-dracunculus/)
- [x] **grownIn**: `["europe"]` — [How to grow Tarragon (RHS Grow Your Own)](https://www.rhs.org.uk/herbs/tarragon/grow-your-own)

## red-raspberry — Red raspberry (shrubs.json)

- [x] **commonNames**: `["Red raspberry", "Raspberry"]` — [Rubus idaeus subsp. idaeus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/rubus-idaeus-subsp-idaeus/common-name/red-raspberry/)
- [x] **latinName**: `"Rubus idaeus"` — [Rubus idaeus subsp. idaeus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/rubus-idaeus-subsp-idaeus/common-name/red-raspberry/)
- [x] **layer**: `"shrub"` — [Rubus idaeus subsp. idaeus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/rubus-idaeus-subsp-idaeus/common-name/red-raspberry/)
- [x] **sunNeed**: `"full"` — [Brambles in the home fruit planting (Penn State Extension)](https://extension.psu.edu/brambles-in-the-home-fruit-planting)
- [x] **variants.standard**: `{"matureHeightM": 1.8, "matureWidthM": 1.8, "minSpacingM": 0.9}` — [Rubus idaeus subsp. idaeus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/rubus-idaeus-subsp-idaeus/common-name/red-raspberry/), [Raspberries (Virginia Cooperative Extension content via Piedmont Master Gardeners)](https://www.piedmontmastergardeners.org/?p=17831) — **Fixed after check:** width corrected to 1.8 m (NC State "Width: 3 ft - 9 ft")
- [x] **minWinterC**: `-23.3` — [Brambles in the home fruit planting (Penn State Extension)](https://extension.psu.edu/brambles-in-the-home-fruit-planting)
- [x] **phMin**: `6.0` — [Raspberries (Virginia Cooperative Extension content via Piedmont Master Gardeners)](https://www.piedmontmastergardeners.org/?p=17831)
- [x] **phMax**: `6.5` — [Raspberries (Virginia Cooperative Extension content via Piedmont Master Gardeners)](https://www.piedmontmastergardeners.org/?p=17831)
- [x] **edibleParts**: `["fruit"]` — [Rubus idaeus subsp. idaeus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/rubus-idaeus-subsp-idaeus/common-name/red-raspberry/)
- [x] **calendar**: `[{"task": "harvest", "from": "early-summer", "to": "late-summer"}]` — [Brambles in the home fruit planting (Penn State Extension)](https://extension.psu.edu/brambles-in-the-home-fruit-planting)
- [x] **origin**: `["europe", "asia"]` — [Rubus idaeus subsp. idaeus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/rubus-idaeus-subsp-idaeus/common-name/red-raspberry/)
- [x] **grownIn**: `["europe"]` — [How to grow raspberries (RHS Grow Your Own)](https://www.rhs.org.uk/fruit/raspberries/grow-your-own)

## american-hazelnut — American hazelnut (shrubs.json)

- [x] **commonNames**: `["American hazelnut"]` — [Corylus americana (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/Corylus-americana) — **Fixed after check:** removed "American hazel" (not on the cited page)
- [x] **latinName**: `"Corylus americana"` — [Corylus americana (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/Corylus-americana)
- [x] **layer**: `"shrub"` — [Corylus americana (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/Corylus-americana)
- [x] **sunNeed**: `"full"` — [Corylus americana (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/Corylus-americana)
- [x] **variants.standard**: `{"matureHeightM": 3.2, "matureWidthM": 3.2}` — [Corylus americana (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/Corylus-americana)
- [x] **minWinterC**: `-34.4` — [Corylus americana (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/Corylus-americana)
- [x] **edibleParts**: `["nuts"]` — [Corylus americana (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/Corylus-americana)
- [x] **calendar**: `[{"task": "harvest", "from": "early-autumn", "to": "mid-autumn"}]` — [Corylus americana (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/Corylus-americana)
- [x] **origin**: `["north-america"]` — [Corylus americana (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/Corylus-americana)

## hyssop — Hyssop (herbs.json)

- [x] **commonNames**: `["Hyssop"]` — [Hyssopus officinalis (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/hyssopus-officinalis/)
- [x] **latinName**: `"Hyssopus officinalis"` — [Hyssopus officinalis (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/hyssopus-officinalis/)
- [x] **layer**: `"herbaceous"` — [Hyssopus officinalis (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/hyssopus-officinalis/)
- [x] **sunNeed**: `"part"` — [Hyssopus officinalis (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/hyssopus-officinalis/)
- [x] **variants.standard**: `{"matureHeightM": 0.5, "matureWidthM": 0.4}` — [Hyssopus officinalis (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/hyssopus-officinalis/)
- [x] **minWinterC**: `-34.4` — [Hyssopus officinalis (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/hyssopus-officinalis/)
- [x] **calendar**: `[{"task": "prune", "from": "early-spring", "to": "late-spring"}]` — [Hyssopus officinalis (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/hyssopus-officinalis/)
- [x] **edibleParts**: `["leaves", "young shoot tips", "flowers"]` — [Hyssopus officinalis (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/hyssopus-officinalis/)
- [x] **phMin**: `6.0` — [Hyssopus officinalis (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/hyssopus-officinalis/)
- [x] **drainage**: `["fast", "normal"]` — [Hyssopus officinalis (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/hyssopus-officinalis/)
- [x] **roles**: `["pollinator"]` — [Hyssopus officinalis (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/hyssopus-officinalis/)
- [x] **origin**: `["europe", "africa", "asia"]` — [Hyssopus officinalis (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/hyssopus-officinalis/)

## apricot — Apricot (trees-temperate.json)

- [x] **layer**: `"sub-canopy"` — [Growing Tree Fruit in Colorado Gardens (Colorado State University Extension)](https://extension.colostate.edu/resource/growing-tree-fruit-in-colorado-gardens/)
- [x] **sunNeed**: `"full"` — [Prunus armeniaca (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/prunus-armeniaca/), [Prunus armeniaca (RHS plant profile)](https://www.rhs.org.uk/plants/13949/prunus-armeniaca/details)
- [x] **leafHabit**: `"deciduous"` — [Prunus armeniaca (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/prunus-armeniaca/)
- [x] **textures**: `["clay", "loamy", "sandy"]` — [Prunus armeniaca (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/prunus-armeniaca/), [Prunus armeniaca (RHS plant profile)](https://www.rhs.org.uk/plants/13949/prunus-armeniaca/details)
- [x] **drainage**: `["fast", "normal"]` — [Prunus armeniaca (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/prunus-armeniaca/), [Prunus armeniaca (RHS plant profile)](https://www.rhs.org.uk/plants/13949/prunus-armeniaca/details)
- [x] **minWinterC**: `-28.9` — [Prunus armeniaca (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/prunus-armeniaca/)
- [x] **edibleParts**: `["fruit"]` — [Prunus armeniaca (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/prunus-armeniaca/)
- [x] **variants.dwarf**: `{"matureHeightM": 2.1, "matureWidthM": 2.4}` — [Growing Tree Fruit in Colorado Gardens (Colorado State University Extension)](https://extension.colostate.edu/resource/growing-tree-fruit-in-colorado-gardens/)
- [x] **variants.standard**: `{"matureHeightM": 4.6, "matureWidthM": 6.1, "yearsToMaturity": 15}` — [Growing Tree Fruit in Colorado Gardens (Colorado State University Extension)](https://extension.colostate.edu/resource/growing-tree-fruit-in-colorado-gardens/), [Prunus armeniaca (RHS plant profile)](https://www.rhs.org.uk/plants/13949/prunus-armeniaca/details)
- [x] **commonNames**: `["Apricot"]` — [Prunus armeniaca (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/prunus-armeniaca/)
- [x] **latinName**: `"Prunus armeniaca"` — [Prunus armeniaca (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/prunus-armeniaca/)
- [x] **calendar**: `[{"task": "plant", "from": "late-autumn", "to": "early-spring"}, {"task": "prune", "from": "mid-summer", "to": "late-summer"}, {"task": "harvest", "from": "mid-summer", "to": "late-summer"}]` — [How to grow apricots (RHS)](https://www.rhs.org.uk/fruit/apricots/grow-your-own)
- [x] **origin**: `["asia"]` — [Prunus armeniaca (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/prunus-armeniaca/)
- [x] **grownIn**: `["europe"]` — [How to grow apricots (RHS)](https://www.rhs.org.uk/fruit/apricots/grow-your-own)

## bee-balm — Bee balm (herbs.json)

- [x] **commonNames**: `["Bee balm", "Beebalm"]` — [Monarda didyma (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/monarda-didyma/)
- [x] **latinName**: `"Monarda didyma"` — [Monarda didyma (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/monarda-didyma/)
- [x] **layer**: `"herbaceous"` — [Monarda didyma (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/monarda-didyma/)
- [x] **sunNeed**: `"full"` — [Growing Bee Balm in the Home Garden (Iowa State University Extension)](https://yardandgarden.extension.iastate.edu/how-to/growing-bee-balm-home-garden), [Monarda didyma (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/monarda-didyma/)
- [x] **variants.standard**: `{"matureHeightM": 0.9, "matureWidthM": 0.8}` — [Monarda didyma (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/monarda-didyma/)
- [x] **minWinterC**: `-34.4` — [Monarda didyma (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/monarda-didyma/)
- [x] **calendar**: `[{"task": "plant", "from": "early-spring", "to": "early-spring"}]` — [Growing Bee Balm in the Home Garden (Iowa State University Extension)](https://yardandgarden.extension.iastate.edu/how-to/growing-bee-balm-home-garden)
- [x] **edibleParts**: `["flowers"]` — [Monarda didyma (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/monarda-didyma/)
- [x] **phMax**: `8.0` — [Monarda didyma (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/monarda-didyma/)
- [x] **drainage**: `["fast", "normal", "wet"]` — [Monarda didyma (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/monarda-didyma/)
- [x] **roles**: `["pollinator"]` — [Monarda didyma (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/monarda-didyma/), [Growing Bee Balm in the Home Garden (Iowa State University Extension)](https://yardandgarden.extension.iastate.edu/how-to/growing-bee-balm-home-garden)
- [x] **origin**: `["north-america"]` — [Monarda didyma (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/monarda-didyma/)

## black-mulberry — Black mulberry (trees-temperate.json)

- [x] **layer**: `"canopy"` — [Morus nigra (RHS plant profile)](https://www.rhs.org.uk/plants/11217/morus-nigra-f/details), [How to grow mulberries (RHS)](https://www.rhs.org.uk/fruit/mulberries/grow-your-own)
- [x] **sunNeed**: `"full"` — [Morus nigra (RHS plant profile)](https://www.rhs.org.uk/plants/11217/morus-nigra-f/details)
- [x] **textures**: `["clay", "loamy", "sandy"]` — [Morus nigra (RHS plant profile)](https://www.rhs.org.uk/plants/11217/morus-nigra-f/details)
- [x] **drainage**: `["fast", "normal"]` — [Morus nigra (RHS plant profile)](https://www.rhs.org.uk/plants/11217/morus-nigra-f/details)
- [ ] **minWinterC**: `-17.8` — [Mulberry (University of Wisconsin Uncommon Fruit)](https://uncommonfruit.cias.wisc.edu/mulberry/) — **UNVERIFIABLE:** cited page (uncommonfruit.cias.wisc.edu) returned HTTP 403 to automated fetch
- [x] **edibleParts**: `["fruit"]` — [How to grow mulberries (RHS)](https://www.rhs.org.uk/fruit/mulberries/grow-your-own)
- [x] **firstHarvestYears**: `8` — [How to grow mulberries (RHS)](https://www.rhs.org.uk/fruit/mulberries/grow-your-own)
- [x] **variants.standard**: `{"matureHeightM": 9, "matureWidthM": 9, "yearsToMaturity": 35}` — [How to grow mulberries (RHS)](https://www.rhs.org.uk/fruit/mulberries/grow-your-own), [Morus nigra (RHS plant profile)](https://www.rhs.org.uk/plants/11217/morus-nigra-f/details)
- [x] **commonNames**: `["Black mulberry"]` — [Morus nigra (RHS plant profile)](https://www.rhs.org.uk/plants/11217/morus-nigra-f/details)
- [x] **latinName**: `"Morus nigra"` — [Morus nigra (RHS plant profile)](https://www.rhs.org.uk/plants/11217/morus-nigra-f/details)
- [x] **calendar**: `[{"task": "plant", "from": "mid-autumn", "to": "early-spring"}, {"task": "prune", "from": "late-autumn", "to": "mid-winter"}, {"task": "harvest", "from": "late-summer", "to": "early-autumn"}]` — [How to grow mulberries (RHS)](https://www.rhs.org.uk/fruit/mulberries/grow-your-own)
- [ ] **leafHabit**: `"deciduous"` — [Mulberry (University of Wisconsin Uncommon Fruit)](https://uncommonfruit.cias.wisc.edu/mulberry/) — **UNVERIFIABLE:** cited page (uncommonfruit.cias.wisc.edu) returned HTTP 403; RHS profile for Morus nigra does state "deciduous tree"
- [x] **origin**: `["asia"]` — [Morus nigra (RHS plant profile)](https://www.rhs.org.uk/plants/11217/morus-nigra-f/details)
- [x] **grownIn**: `["europe"]` — [How to grow mulberries (RHS)](https://www.rhs.org.uk/fruit/mulberries/grow-your-own)

## creeping-thyme — Creeping thyme (ground-roots.json)

- [x] **commonNames**: `["Creeping thyme", "Wild thyme"]` — [Thymus serpyllum (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/thymus-serpyllum/)
- [x] **latinName**: `"Thymus serpyllum"` — [Thymus serpyllum (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/thymus-serpyllum/)
- [x] **layer**: `"ground-cover"` — [Thymus serpyllum (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/thymus-serpyllum/)
- [x] **sunNeed**: `"full"` — [Thymus serpyllum (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/thymus-serpyllum/)
- [x] **variants.standard**: `{"matureHeightM": 0.06, "matureWidthM": 0.17}` — [Thymus serpyllum (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/thymus-serpyllum/)
- [x] **minWinterC**: `-34.4` — [Thymus serpyllum (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/thymus-serpyllum/)
- [x] **calendar**: `[{"task": "prune", "from": "early-spring", "to": "early-spring"}]` — [Thyme (University of Illinois Extension; genus-level page)](https://extension.illinois.edu/herbs/thyme)
- [x] **drainage**: `["fast", "normal"]` — [Thymus serpyllum (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/thymus-serpyllum/)
- [x] **roles**: `["pollinator"]` — [Thymus serpyllum (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/thymus-serpyllum/)
- [x] **origin**: `["europe", "asia", "africa"]` — [Thymus serpyllum (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/thymus-serpyllum/)

## sweet-cherry — Sweet cherry (trees-temperate.json)

- [x] **layer**: `"canopy"` — [Prunus avium (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/prunus-avium/), [Growing Tree Fruit in Colorado Gardens (Colorado State University Extension)](https://extension.colostate.edu/resource/growing-tree-fruit-in-colorado-gardens/)
- [x] **sunNeed**: `"full"` — [Prunus avium (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/prunus-avium/), [Prunus avium (RHS plant profile)](https://www.rhs.org.uk/plants/13950/prunus-avium/details)
- [x] **leafHabit**: `"deciduous"` — [Prunus avium (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/prunus-avium/)
- [x] **drainage**: `["fast", "normal"]` — [Prunus avium (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/prunus-avium/)
- [x] **minWinterC**: `-28.9` — [Cherries in the Garden and the Kitchen (Penn State Extension)](https://extension.psu.edu/cherries-in-the-garden-and-the-kitchen)
- [x] **edibleParts**: `["fruit"]` — [Prunus avium (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/prunus-avium/)
- [x] **firstHarvestYears**: `5.5` — [Cherries in the Garden and the Kitchen (Penn State Extension)](https://extension.psu.edu/cherries-in-the-garden-and-the-kitchen)
- [x] **variants.dwarf**: `{"matureHeightM": 2.1, "matureWidthM": 1.2}` — [Growing Tree Fruit in Colorado Gardens (Colorado State University Extension)](https://extension.colostate.edu/resource/growing-tree-fruit-in-colorado-gardens/)
- [x] **variants.standard**: `{"matureHeightM": 7.6, "matureWidthM": 9.1}` — [Growing Tree Fruit in Colorado Gardens (Colorado State University Extension)](https://extension.colostate.edu/resource/growing-tree-fruit-in-colorado-gardens/), [Prunus avium (RHS plant profile)](https://www.rhs.org.uk/plants/13950/prunus-avium/details)
- [x] **commonNames**: `["Sweet cherry", "Wild cherry"]` — [Prunus avium (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/prunus-avium/), [Prunus avium (RHS plant profile)](https://www.rhs.org.uk/plants/13950/prunus-avium/details) — **Fixed after check:** "Wild cherry" now cited to the RHS profile
- [x] **latinName**: `"Prunus avium"` — [Prunus avium (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/prunus-avium/)
- [x] **calendar**: `[{"task": "plant", "from": "late-autumn", "to": "early-spring"}, {"task": "prune", "from": "mid-summer", "to": "late-summer"}, {"task": "harvest", "from": "early-summer", "to": "late-summer"}]` — [Prunus avium (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/prunus-avium/), [How to grow cherries (RHS)](https://www.rhs.org.uk/fruit/cherries/grow-your-own)
- [x] **origin**: `["europe", "asia", "africa"]` — [Prunus avium (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/prunus-avium/)
- [x] **grownIn**: `["europe"]` — [How to grow cherries (RHS)](https://www.rhs.org.uk/fruit/cherries/grow-your-own)

## blackthorn — Blackthorn (europe.json)
_Known weak value: Winter low −20 °C is the RHS H7 floor ("colder than −20"); likely hardier._

- [x] **commonNames**: `["Blackthorn", "Sloe"]` — [Prunus spinosa (RHS plant profile)](https://www.rhs.org.uk/plants/14041/prunus-spinosa/details)
- [x] **latinName**: `"Prunus spinosa"` — [Prunus spinosa (RHS plant profile)](https://www.rhs.org.uk/plants/14041/prunus-spinosa/details)
- [x] **layer**: `"shrub"` — [Prunus spinosa (RHS plant profile)](https://www.rhs.org.uk/plants/14041/prunus-spinosa/details)
- [x] **sunNeed**: `"full"` — [Prunus spinosa (RHS plant profile)](https://www.rhs.org.uk/plants/14041/prunus-spinosa/details)
- [x] **leafHabit**: `"deciduous"` — [Prunus spinosa (RHS plant profile)](https://www.rhs.org.uk/plants/14041/prunus-spinosa/details)
- [x] **textures**: `["clay", "loamy", "sandy"]` — [Prunus spinosa (RHS plant profile)](https://www.rhs.org.uk/plants/14041/prunus-spinosa/details)
- [x] **drainage**: `["fast", "normal"]` — [Prunus spinosa (RHS plant profile)](https://www.rhs.org.uk/plants/14041/prunus-spinosa/details)
- [x] **variants.standard**: `{"matureHeightM": 3.25, "matureWidthM": 3.25, "yearsToMaturity": 35}` — [Prunus spinosa (RHS plant profile)](https://www.rhs.org.uk/plants/14041/prunus-spinosa/details)
- [x] **minWinterC**: `-20.0` — [Prunus spinosa (RHS plant profile)](https://www.rhs.org.uk/plants/14041/prunus-spinosa/details)
- [x] **calendar**: `[{"task": "harvest", "from": "early-autumn", "to": "late-autumn"}]` — [Hedgerow fruit (RHS advice)](https://www.rhs.org.uk/fruit/hedgerow)
- [x] **family**: `"Rosaceae"` — [Prunus spinosa (RHS plant profile)](https://www.rhs.org.uk/plants/14041/prunus-spinosa/details)
- [x] **origin**: `["europe"]` — [Prunus spinosa (RHS plant profile)](https://www.rhs.org.uk/plants/14041/prunus-spinosa/details)
- [x] **edibleParts**: `["fruit"]` — [Hedgerow fruit (RHS advice)](https://www.rhs.org.uk/fruit/hedgerow)

## daubentons-kale — Daubenton's kale (europe.json)
_Known weak value: Winter low −20 °C is the RHS floor; may be optimistic (informal reports: zone 6–8)._

- [x] **commonNames**: `["Daubenton's kale", "Perpetual kale"]` — [Brassica oleracea 'Daubenton's' (RHS plant profile)](https://www.rhs.org.uk/plants/351825/brassica-oleracea-daubentons/details) — **Fixed after check:** renamed to RHS "perpetual kale"
- [x] **latinName**: `"Brassica oleracea 'Daubenton's'"` — [Brassica oleracea 'Daubenton's' (RHS plant profile)](https://www.rhs.org.uk/plants/351825/brassica-oleracea-daubentons/details)
- [x] **layer**: `"shrub"` — [Brassica oleracea 'Daubenton's' (RHS plant profile)](https://www.rhs.org.uk/plants/351825/brassica-oleracea-daubentons/details)
- [x] **sunNeed**: `"full"` — [Brassica oleracea 'Daubenton's' (RHS plant profile)](https://www.rhs.org.uk/plants/351825/brassica-oleracea-daubentons/details)
- [x] **leafHabit**: `"evergreen"` — [Brassica oleracea 'Daubenton's' (RHS plant profile)](https://www.rhs.org.uk/plants/351825/brassica-oleracea-daubentons/details)
- [x] **textures**: `["clay", "loamy", "sandy"]` — [Brassica oleracea 'Daubenton's' (RHS plant profile)](https://www.rhs.org.uk/plants/351825/brassica-oleracea-daubentons/details)
- [x] **drainage**: `["fast", "normal"]` — [Brassica oleracea 'Daubenton's' (RHS plant profile)](https://www.rhs.org.uk/plants/351825/brassica-oleracea-daubentons/details)
- [x] **variants.standard**: `{"matureHeightM": 1.25, "matureWidthM": 0.75, "yearsToMaturity": 3.5}` — [Brassica oleracea 'Daubenton's' (RHS plant profile)](https://www.rhs.org.uk/plants/351825/brassica-oleracea-daubentons/details)
- [x] **minWinterC**: `-20.0` — [Brassica oleracea 'Daubenton's' (RHS plant profile)](https://www.rhs.org.uk/plants/351825/brassica-oleracea-daubentons/details)
- [x] **calendar**: `[{"task": "harvest", "from": "early-spring", "to": "late-winter"}]` — [Brassica oleracea 'Daubenton's' (RHS plant profile)](https://www.rhs.org.uk/plants/351825/brassica-oleracea-daubentons/details)
- [x] **family**: `"Brassicaceae"` — [Brassica oleracea 'Daubenton's' (RHS plant profile)](https://www.rhs.org.uk/plants/351825/brassica-oleracea-daubentons/details)

## dog-rose — Dog rose (europe.json)
_Known weak value: Not marked edible: RHS profile says hips not to be eaten, RHS hedgerow page says cooked hips are edible._

- [x] **commonNames**: `["Dog rose"]` — [Rosa canina (RHS plant profile)](https://www.rhs.org.uk/plants/16017/rosa-canina-s/details) — **Fixed after check:** removed "Rosehip" (not on the cited page)
- [x] **latinName**: `"Rosa canina"` — [Rosa canina (RHS plant profile)](https://www.rhs.org.uk/plants/16017/rosa-canina-s/details)
- [x] **layer**: `"shrub"` — [Rosa canina (RHS plant profile)](https://www.rhs.org.uk/plants/16017/rosa-canina-s/details)
- [x] **sunNeed**: `"full"` — [Rosa canina (RHS plant profile)](https://www.rhs.org.uk/plants/16017/rosa-canina-s/details)
- [x] **leafHabit**: `"deciduous"` — [Rosa canina (RHS plant profile)](https://www.rhs.org.uk/plants/16017/rosa-canina-s/details)
- [x] **textures**: `["clay", "loamy", "sandy"]` — [Rosa canina (RHS plant profile)](https://www.rhs.org.uk/plants/16017/rosa-canina-s/details)
- [x] **drainage**: `["fast", "normal"]` — [Rosa canina (RHS plant profile)](https://www.rhs.org.uk/plants/16017/rosa-canina-s/details)
- [x] **variants.standard**: `{"matureHeightM": 3.25, "matureWidthM": 2.0, "yearsToMaturity": 7.5}` — [Rosa canina (RHS plant profile)](https://www.rhs.org.uk/plants/16017/rosa-canina-s/details)
- [x] **minWinterC**: `-28.9` — [Rosa canina (Chicago Botanic Garden Plant Finder)](https://www.chicagobotanic.org/plant-information/plant-finder/rosa-canina-dog-rose)
- [x] **calendar**: `[{"task": "harvest", "from": "early-autumn", "to": "late-autumn"}]` — [Hedgerow fruit (RHS advice)](https://www.rhs.org.uk/fruit/hedgerow)
- [x] **family**: `"Rosaceae"` — [Rosa canina (RHS plant profile)](https://www.rhs.org.uk/plants/16017/rosa-canina-s/details)
- [x] **origin**: `["europe", "africa", "asia"]` — [Rosa canina (RHS plant profile)](https://www.rhs.org.uk/plants/16017/rosa-canina-s/details)

## maypop — Maypop (climbers-fixers.json)
_Fixed after review: size now 2.1 × 1.4 m from the Missouri Department of Conservation field guide (was 1.5 × 0.75 m from an RHS cultivar profile). Check the new source._

- [x] **commonNames**: `["Maypop"]` — [Passiflora incarnata (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/passiflora-incarnata/) — **Fixed after check:** removed "Hardy passionflower" (not on the cited page)
- [x] **latinName**: `"Passiflora incarnata"` — [Passiflora incarnata (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/passiflora-incarnata/)
- [x] **layer**: `"climber"` — [Passiflora incarnata (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/passiflora-incarnata/)
- [x] **variants.standard**: `{"matureHeightM": 2.1, "matureWidthM": 1.4, "yearsToMaturity": 3.5}` — [Passion flower, Passiflora incarnata (Missouri Department of Conservation field guide)](https://mdc.mo.gov/discover-nature/field-guide/passion-flower), [Passiflora incarnata (F) (Royal Horticultural Society plant profile)](https://www.rhs.org.uk/plants/65975/passiflora-incarnata-f/details)
- [x] **sunNeed**: `"full"` — [Passiflora incarnata (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/passiflora-incarnata/), [Passiflora incarnata (F) (Royal Horticultural Society plant profile)](https://www.rhs.org.uk/plants/65975/passiflora-incarnata-f/details)
- [x] **leafHabit**: `"deciduous"` — [Passiflora incarnata (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/passiflora-incarnata/)
- [x] **minWinterC**: `-28.9` — [Passiflora incarnata (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/passiflora-incarnata/)
- [x] **roles**: `["pollinator"]` — [Passiflora incarnata (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/passiflora-incarnata/)
- [x] **calendar**: `[{"task": "harvest", "from": "early-summer", "to": "late-autumn"}]` — [Passiflora incarnata (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/passiflora-incarnata/)
- [x] **edibleParts**: `["fruit"]` — [Passiflora incarnata (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/passiflora-incarnata/)
- [x] **drainage**: `["fast", "normal"]` — [Passiflora incarnata (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/passiflora-incarnata/)
- [x] **origin**: `["north-america"]` — [Passiflora incarnata (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/passiflora-incarnata/)

## Water need (`water`)

15 plants chosen by `random.Random(20261022).sample(plants sorted by id that have a `water` value, 15)` (2026-10-22). For each line, open the linked source and tick it if the page states the wording. USDA lines: the PLANTS profile lists Precipitation, Minimum in inches; mm = round(inches x 25.4).

- [ ] **silver-buffaloberry — water** (shrubs.json): `{"minRainMm": 381}` — [Shepherdia argentea (USDA PLANTS Database)](https://plants.usda.gov/plant-profile/SHAR)
- [ ] **jostaberry — water** (shrubs.json): `{"level": "low"}` — [Dwarf Fruits and Berries for the Home Garden (University of Wisconsin-Madison Horticulture)](https://kenosha.extension.wisc.edu/files/2021/03/Dwarf-Fruit-and-berries-for-the-Home-Garden.pdf)
- [ ] **red-alder — water** (climbers-fixers.json): `{"minRainMm": 610}` — [Alnus rubra (USDA PLANTS Database)](https://plants.usda.gov/plant-profile/ALRU2)
- [ ] **hazel — water** (seed.json): `{"level": "medium"}` — [Corylus avellana (F) (RHS plant profile)](https://www.rhs.org.uk/plants/4511/corylus-avellana-f/details)
- [ ] **crimson-clover — water** (ground-roots.json): `{"minRainMm": 813}` — [Trifolium incarnatum (USDA PLANTS Database)](https://plants.usda.gov/plant-profile/TRIN3)
- [ ] **asian-persimmon — water** (trees-temperate.json): `{"level": "low"}` — [Diospyros kaki (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/diospyros-kaki/)
- [ ] **garlic — water** (ground-roots.json): `{"level": "high"}` — [Garlic (University of Illinois Extension)](https://extension.illinois.edu/herbs/garlic)
- [ ] **garden-sage — water** (herbs.json): `{"level": "low"}` — [Salvia officinalis (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/salvia-officinalis/), [How to grow Sage (RHS Grow Your Own)](https://www.rhs.org.uk/herbs/sage/grow-your-own)
- [ ] **american-hazelnut — water** (shrubs.json): `{"minRainMm": 813}` — [Corylus americana (USDA PLANTS Database)](https://plants.usda.gov/plant-profile/COAM3)
- [ ] **sweet-chestnut — water** (trees-temperate.json): `{"level": "low"}` — [Castanea sativa (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/castanea-sativa/)
- [ ] **persian-lime — water** (warm-climate.json): `{"level": "high"}` — [Citrus x latifolia (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/citrus-x-latifolia/)
- [ ] **chives — water** (seed.json): `{"level": "low"}` — [Chives, Allium schoenoprasum (University of Wisconsin Extension Horticulture)](https://hort.extension.wisc.edu/articles/chives-allium-schoenoprasum/), [Allium schoenoprasum (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/allium-schoenoprasum/)
- [ ] **asparagus — water** (herbs.json): `{"level": "medium"}` — [Asparagus officinalis (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/asparagus-officinalis/)
- [ ] **elder — water** (trees-temperate.json): `{"level": "medium"}` — [Sambucus nigra (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/sambucus-nigra/)
- [ ] **daubentons-kale — water** (europe.json): `{"level": "medium"}` — [Brassica oleracea 'Daubenton's' (RHS plant profile)](https://www.rhs.org.uk/plants/351825/brassica-oleracea-daubentons/details)

## Veggie beds (2026-10-23)

15 (plant, field) lines chosen by `random.Random(20261023).sample(pairs, 15)` over the 330 sourced fields of the 23 new plants in `data/plants/vegetables.json` plus the `rotationGroup` field on the 8 existing plants (pairs sorted by plant id, then field order in the record), plus 5 known weak values flagged by the implementer (tomato winter low, parsnip size, broad bean winter low, tomato and radish rotation group).

**Check (2026-10-23).** Each cited page was fetched with curl and a browser user-agent (text extracted with Python; the USDA NRCS fava guide with pdftotext) and each line was compared with the page text. Result: 19 of 20 verified, 1 not verified (kale layer). Lines carrying a caveat are annotated inline.

- [x] **layer** (coriander, vegetables.json): `"herbaceous"` — [Coriandrum sativum (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/coriandrum-sativum/) *(ticked with a caveat: NC State lists Plant Type "Annual ... Edible Herb" and does not use the word herbaceous.)*
- [x] **calendar** (coriander, vegetables.json): `[{"task": "plant", "from": "early-spring", "to": "late-summer"}]` — [How to grow coriander (RHS Grow Your Own)](https://www.rhs.org.uk/herbs/coriander/grow-your-own)
- [x] **phMax** (cauliflower, vegetables.json): `8.0` — [Brassica oleracea Cauliflower & Broccoli Group (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/brassica-oleracea-cauliflower-broccoli-group/)
- [x] **sunNeed** (sweet-pepper, vegetables.json): `"full"` — [Capsicum annuum (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/capsicum-annuum/)
- [x] **calendar** (dill, vegetables.json): `[{"task": "plant", "from": "mid-spring", "to": "mid-summer"}]` — [How to grow dill (RHS Grow Your Own)](https://www.rhs.org.uk/herbs/dill/grow-your-own)
- [x] **annual** (chard, vegetables.json): `true` — [Beta vulgaris Leaf Beet Group (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/beta-vulgaris-leaf-beet-group/)
- [x] **annual** (sweetcorn, vegetables.json): `true` — [Zea mays (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/zea-mays/)
- [ ] **layer** (kale, vegetables.json): `"herbaceous"` — [Brassica oleracea Kale Group (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/brassica-oleracea-kale-group/) *(Not verified: the NC State Kale Group page has no Plant Type or layer statement, only Habit/Form "Arching, Erect".)*
- [x] **origin** (aubergine, vegetables.json): `["asia"]` — [Solanum melongena (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/solanum-melongena/)
- [x] **commonNames** (lettuce, vegetables.json): `["Lettuce"]` — [Lactuca sativa (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/lactuca-sativa/)
- [x] **grownIn** (beetroot, vegetables.json): `["europe"]` — [How to grow beetroot (RHS Grow Your Own)](https://www.rhs.org.uk/vegetables/beetroot/grow-your-own)
- [x] **calendar** (leek, vegetables.json): `[{"task": "plant", "frost": "last", "offsetWeeks": -6}]` — [Vegetables for spring and fall planting and summer planting (University of Maryland Extension)](https://extension.umd.edu/sites/extension.umd.edu/files/2022-04/2%20VEGETABLES%20FOR%20SPRING%20AND%20FALL%20PLANTING%20and%20Summer.pdf)
- [x] **drainage** (cauliflower, vegetables.json): `["fast", "normal"]` — [Brassica oleracea Cauliflower & Broccoli Group (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/brassica-oleracea-cauliflower-broccoli-group/)
- [x] **variants.standard** (cucumber, vegetables.json): `{"matureHeightM": 0.3, "matureWidthM": 1.7, "yearsToMaturity": 0, "minSpacingM": 0.3}` — [Cucumis sativus (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/cucumis-sativus/), [How to grow cucumbers (RHS Grow Your Own)](https://www.rhs.org.uk/vegetables/cucumbers/grow-your-own) *(Caveat: height is the NC State ground-trailing range 8 in to 1.5 ft; RHS advises outdoor cucumbers on supports.)*
- [x] **minWinterC** (dill, vegetables.json): `-45.6` — [Anethum graveolens (NC State Extension Plant Toolbox)](https://plants.ces.ncsu.edu/plants/anethum-graveolens/)
- [x] **minWinterC** (tomato, vegetables.json): `5.0` — [Solanum lycopersicum (RHS plant profile)](https://www.rhs.org.uk/plants/293619/solanum-lycopersicum/details) *(Interpretation: the NC State tomato page lists no zone, so the RHS rating H1C (5 to 10 C) is used at its lower bound, 5.)*
- [x] **variants.standard** (parsnip, vegetables.json): `{"matureHeightM": 0.3, "matureWidthM": 0.3, "yearsToMaturity": 0, "minSpacingM": null}` — [Pastinaca sativa (RHS plant profile)](https://www.rhs.org.uk/plants/24473/pastinaca-sativa/details) *(Caveat: the RHS profile bands are 0.1-0.5 m, midpoint 0.3; its description also says the flowering second-year plant reaches 1.2 m.)*
- [x] **minWinterC** (broad-bean, vegetables.json): `-10.0` — [Fava bean, Vicia faba (USDA NRCS Plant Guide, copy hosted by SARE)](https://projects.sare.org/media/pdf/N/R/C/NRCSs-Fava-Plant-Guide.pdf) *(Caveat: NRCS says "hardier cultivars from the Mediterranean can tolerate winter temperatures as low as 14 F"; RHS cultivar pages rate H3 to H5.)*
- [x] **rotationGroup** (tomato, vegetables.json): `"potatoes"` — [Crop rotation (RHS Advice)](https://www.rhs.org.uk/vegetables/crop-rotation)
- [x] **rotationGroup** (radish, ground-roots.json): `"brassicas"` — [Crop rotation (RHS Advice)](https://www.rhs.org.uk/vegetables/crop-rotation)

## Companion pairs (2026-10-23)

10 pairs chosen by `random.Random(20261023).sample(pairs sorted by (a, b), 10)` over the 24 pairs in `data/companions.json`. Open the linked page and tick the line if it states the effect. Not yet checked by a human; every page was read directly when the pair was written.

- [ ] **onion + bush-bean** (bad): "Onions and garlic can stunt the growth of beans, so keep them apart." — [Companion Planting (West Virginia University Extension)](https://extension.wvu.edu/lawn-gardening-pests/gardening/garden-management/companion-planting), [Companion Plants for the Vegetable Garden (University of Wisconsin Extension, Kenosha County; list by North Dakota State Extension)](https://kenosha.extension.wisc.edu/files/2020/05/Companion-plants-article.pdf)
- [ ] **white-clover + kale** (good): "Low clover under kale hides it from cabbage root fly." — [Three ways to use companion planting (RHS Grow Your Own)](https://www.rhs.org.uk/advice/grow-your-own/features/companion-planting)
- [ ] **lettuce + sweet-pepper** (good): "Lettuce can grow in the gaps between peppers and is shaded by it once it is big." — [Companion Planting (West Virginia University Extension)](https://extension.wvu.edu/lawn-gardening-pests/gardening/garden-management/companion-planting)
- [ ] **tomato + bush-bean** (bad): "Tall tomatoes can shade out bush beans, which need full sun." — [The Art of Companion Planting (University of Arizona Cooperative Extension, Yavapai County)](https://extension.arizona.edu/sites/extension.arizona.edu/files/attachment/CompanionPlantingApr2023.pdf)
- [ ] **spinach + sweet-pepper** (good): "Spinach can grow in the gaps between peppers and is shaded by it once it is big." — [Companion Planting (West Virginia University Extension)](https://extension.wvu.edu/lawn-gardening-pests/gardening/garden-management/companion-planting)
- [ ] **lettuce + tomato** (good): "Lettuce can grow in the gaps between tomatoes and is shaded by it once it is big." — [Companion Planting (West Virginia University Extension)](https://extension.wvu.edu/lawn-gardening-pests/gardening/garden-management/companion-planting)
- [ ] **tomato + sweetcorn** (bad): "Tomatoes and sweetcorn are attacked by the same worm." — [Companion Plants for the Vegetable Garden (University of Wisconsin Extension, Kenosha County; list by North Dakota State Extension)](https://kenosha.extension.wisc.edu/files/2020/05/Companion-plants-article.pdf), [Companion planting in the vegetable garden (UC Master Gardener Program, UC ANR)](https://ucanr.edu/sites/default/files/2023-09/388577.pdf)
- [ ] **beetroot + sweet-pepper** (good): "Beetroot can grow in the gaps between peppers and is shaded by it once it is big." — [Companion Planting (West Virginia University Extension)](https://extension.wvu.edu/lawn-gardening-pests/gardening/garden-management/companion-planting)
- [ ] **sweetcorn + lettuce** (good): "Quick lettuce can be grown between slower sweetcorn and picked before it is shaded." — [Three ways to use companion planting (RHS Grow Your Own)](https://www.rhs.org.uk/advice/grow-your-own/features/companion-planting)
- [ ] **beetroot + tomato** (good): "Beetroot can grow in the gaps between tomatoes and is shaded by it once it is big." — [Companion Planting (West Virginia University Extension)](https://extension.wvu.edu/lawn-gardening-pests/gardening/garden-management/companion-planting)


## Hungarian names (2026-10-23)

15 plants chosen by `random.Random(20261023).sample(plants with commonNamesHu sorted by id, 15)` over the 136 plants with a Hungarian name. Open the linked Hungarian Wikipedia page and tick the line if the page shows the Latin binomial next to the name.

### japanese-plum — Japanese plum (trees-temperate.json)

- [ ] **commonNamesHu**: `["Japánszilva", "Fűzlevelű ringló"]` for `Prunus salicina` — [Japánszilva (Hungarian Wikipedia)](https://hu.wikipedia.org/wiki/Japánszilva)

### jostaberry — Jostaberry (shrubs.json)

- [ ] **commonNamesHu**: `["Josta", "Ribiszkeköszméte"]` for `Ribes x nidigrolaria` — [Josta (Hungarian Wikipedia)](https://hu.wikipedia.org/wiki/Josta)

### goji — Goji (shrubs.json)

- [ ] **commonNamesHu**: `["Goji bogyó", "Közönséges ördögcérna"]` (reordered 2026-10-23) for `Lycium barbarum` — [Közönséges ördögcérna (Hungarian Wikipedia)](https://hu.wikipedia.org/wiki/Közönséges_ördögcérna)

### oregano — Oregano (herbs.json)

- [ ] **commonNamesHu**: `["Szurokfű", "Vadmajoránna", "Oregánó"]` for `Origanum vulgare` — [Szurokfű (növényfaj) (Hungarian Wikipedia)](https://hu.wikipedia.org/wiki/Szurokfű_(növényfaj))

### hops — Hops (climbers-fixers.json)

- [ ] **commonNamesHu**: `["Közönséges komló"]` for `Humulus lupulus` — [Közönséges komló (Hungarian Wikipedia)](https://hu.wikipedia.org/wiki/Közönséges_komló)

### pawpaw — Pawpaw (trees-temperate.json)

- [ ] **commonNamesHu**: `["Indiánbanán", "Pawpaw", "Papau"]` for `Asimina triloba` — [Pawpaw (Hungarian Wikipedia)](https://hu.wikipedia.org/wiki/Pawpaw)

### asian-pear — Asian pear (trees-temperate.json)

- [ ] **commonNamesHu**: `["Japán körte", "Ázsiai körte"]` for `Pyrus pyrifolia` — [Japán körte (Hungarian Wikipedia)](https://hu.wikipedia.org/wiki/Japán_körte)

### red-clover — Red clover (ground-roots.json)

- [ ] **commonNamesHu**: `["Vörös here", "Réti here"]` for `Trifolium pratense` — [Réti here (Hungarian Wikipedia)](https://hu.wikipedia.org/wiki/Réti_here)

### blackthorn — Blackthorn (europe.json)

- [ ] **commonNamesHu**: `["Kökény"]` for `Prunus spinosa` — [Kökény (növényfaj) (Hungarian Wikipedia)](https://hu.wikipedia.org/wiki/Kökény_(növényfaj))

### radish — Radish (ground-roots.json)

- [ ] **commonNamesHu**: `["Retek", "Kerti retek"]` for `Raphanus sativus` — [Retek (Hungarian Wikipedia)](https://hu.wikipedia.org/wiki/Retek)

### gooseberry — Gooseberry (shrubs.json)

- [ ] **commonNamesHu**: `["Egres", "Köszméte", "Pöszméte"]` for `Ribes uva-crispa` — [Egres (növényfaj) (Hungarian Wikipedia)](https://hu.wikipedia.org/wiki/Egres_(növényfaj))

### lovage — Lovage (europe.json)

- [ ] **commonNamesHu**: `["Lestyán", "Orvosi lestyán"]` for `Levisticum officinale` — [Orvosi lestyán (Hungarian Wikipedia)](https://hu.wikipedia.org/wiki/Orvosi_lestyán)

### onion — Onion (ground-roots.json)

- [ ] **commonNamesHu**: `["Vöröshagyma"]` for `Allium cepa` — [Vöröshagyma (Hungarian Wikipedia)](https://hu.wikipedia.org/wiki/Vöröshagyma)

### lemon-verbena — Lemon verbena (warm-climate.json)

- [ ] **commonNamesHu**: `["Citromverbéna"]` for `Aloysia citriodora` — [Citromverbéna (Hungarian Wikipedia)](https://hu.wikipedia.org/wiki/Citromverbéna)

### jerusalem-artichoke — Jerusalem artichoke (ground-roots.json)

- [ ] **commonNamesHu**: `["Csicsóka"]` for `Helianthus tuberosus` — [Csicsóka (növényfaj) (Hungarian Wikipedia)](https://hu.wikipedia.org/wiki/Csicsóka_(növényfaj))

## Hungarian names, institutional sources (2026-10-25)

Every new display name and every newly named plant. Open the source and tick the line if it prints the name beside the binomial (NÉBIH: the species list at the start of the document; AGROVOC: the Hungarian labels).

- [ ] **english-walnut**: `Dió` for `Juglans regia` — [NÉBIH 2019 fruit](https://portal.nebih.gov.hu/documents/10182/81819/NFJ_sz%C5%91l%C5%91-gy%C3%BCm%C3%B6lcs_2019/b60aa006-0d4c-aa81-d205-b68c465ada3a)
- [ ] **hazel**: `Mogyoró` for `Corylus avellana` — [NÉBIH 2019 fruit](https://portal.nebih.gov.hu/documents/10182/81819/NFJ_sz%C5%91l%C5%91-gy%C3%BCm%C3%B6lcs_2019/b60aa006-0d4c-aa81-d205-b68c465ada3a)
- [ ] **pear**: `Körte` for `Pyrus communis` — [NÉBIH 2019 fruit](https://portal.nebih.gov.hu/documents/10182/81819/NFJ_sz%C5%91l%C5%91-gy%C3%BCm%C3%B6lcs_2019/b60aa006-0d4c-aa81-d205-b68c465ada3a)
- [ ] **plum**: `Szilva` for `Prunus domestica` — [NÉBIH 2019 fruit](https://portal.nebih.gov.hu/documents/10182/81819/NFJ_sz%C5%91l%C5%91-gy%C3%BCm%C3%B6lcs_2019/b60aa006-0d4c-aa81-d205-b68c465ada3a)
- [ ] **damson**: `Kökényszilva` for `Prunus insititia` — [NÉBIH 2019 fruit](https://portal.nebih.gov.hu/documents/10182/81819/NFJ_sz%C5%91l%C5%91-gy%C3%BCm%C3%B6lcs_2019/b60aa006-0d4c-aa81-d205-b68c465ada3a)
- [ ] **asparagus**: `Spárga` for `Asparagus officinalis` — [NÉBIH 2016 vegetables](https://portal.nebih.gov.hu/documents/10182/81819/NFJ_z%C3%B6lds%C3%A9g_2016_v.1.0.pdf)
- [ ] **sweet-pepper**: `Paprika` for `Capsicum annuum` — [NÉBIH 2016 vegetables](https://portal.nebih.gov.hu/documents/10182/81819/NFJ_z%C3%B6lds%C3%A9g_2016_v.1.0.pdf)
- [ ] **english-lavender**: `Levendula` for `Lavandula angustifolia` — [NÉBIH 2016 vegetables](https://portal.nebih.gov.hu/documents/10182/81819/NFJ_z%C3%B6lds%C3%A9g_2016_v.1.0.pdf)
- [ ] **hyssop**: `Izsóp` for `Hyssopus officinalis` — [NÉBIH 2016 vegetables](https://portal.nebih.gov.hu/documents/10182/81819/NFJ_z%C3%B6lds%C3%A9g_2016_v.1.0.pdf)
- [ ] **apple**: `Alma` for `Malus domestica` — [NÉBIH 2019 fruit](https://portal.nebih.gov.hu/documents/10182/81819/NFJ_sz%C5%91l%C5%91-gy%C3%BCm%C3%B6lcs_2019/b60aa006-0d4c-aa81-d205-b68c465ada3a)
- [ ] **damson**: `Kökényszilva` for `Prunus insititia` — [AGROVOC c_6286](https://agrovoc.fao.org/browse/agrovoc/en/page/c_6286)
- [ ] **hyacinth-bean**: `Jácintbab` for `Lablab purpureus` — [AGROVOC c_4125](https://agrovoc.fao.org/browse/agrovoc/en/page/c_4125)
- [ ] **american-persimmon**: `Amerikai datolyaszilva` for `Diospyros virginiana` — [AGROVOC c_2306](https://agrovoc.fao.org/browse/agrovoc/en/page/c_2306)
- [ ] **malabar-spinach**: `Malabári spenót` for `Basella alba` — [AGROVOC c_834](https://agrovoc.fao.org/browse/agrovoc/en/page/c_834)

## Hungarian names, gardener decision (2026-10-27)

No published source. Tick the line once the name reads right in the Hungarian app.

- [ ] **american-hazelnut**: `Amerikai mogyoró` for `Corylus americana` — gardener decision
- [ ] **daubentons-kale**: `Zöld évelő káposzta` for `Brassica oleracea 'Daubenton's'` — gardener decision
- [ ] **feijoa**: `Mirtuszdió` for `Acca sellowiana` — gardener decision
- [ ] **leadplant**: `Molyhos gyalogakác` for `Amorpha canescens` — gardener decision
- [ ] **meyer-lemon**: `Meyer-citrom` for `Citrus x limon 'Meyer'` — gardener decision
- [ ] **new-jersey-tea**: `Fehér táskavirág` for `Ceanothus americanus` — gardener decision
- [ ] **northern-bayberry**: `Északi viaszbogyó` for `Morella pensylvanica` — gardener decision
- [ ] **persian-lime**: `Perzsa lime` for `Citrus x latifolia` — gardener decision
- [ ] **ramps**: `Amerikai medvehagyma` for `Allium tricoccum` — gardener decision
- [ ] **red-mulberry**: `Vörös eperfa` for `Morus rubra` — gardener decision
- [ ] **silver-buffaloberry**: `Szirtiezüstfa` for `Shepherdia argentea` — gardener decision
- [ ] **spicebush**: `Vad szegfűszeg` for `Lindera benzoin` — gardener decision
- [ ] **sweet-cicely**: `Illatos mirhafű` for `Myrrhis odorata` — gardener decision
- [ ] **walking-onion**: `Fahagyma` for `Allium x proliferum` — gardener decision
