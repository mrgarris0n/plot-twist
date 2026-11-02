# Plant data source register

Plant records in this folder cite facts only (sizes, pH ranges, hardiness, seasons, roles). No text, tables or
database structure is copied. PFAF is link-out only (`pfafUrl`), never a data source.

Each `Source` in `seed.json` carries its own `licence` string. Publishers used so far:

| Publisher | Licence string used | Terms URL | Date checked | Terms check |
| --- | --- | --- | --- | --- |
| USDA NRCS (Plant Materials, plant guides) | Public domain (US Gov) | https://www.usda.gov/policies-and-links | 2026-10-20 | (government; no check needed) |
| University of Minnesota Extension | Facts cited; © Regents of the University of Minnesota | https://extension.umn.edu/about/terms-use | 2026-10-20 | terms page unreachable 2026-11-02 (HTTP 403 live and not archived) |
| University of Maine Cooperative Extension | Facts cited; © University of Maine | https://extension.umaine.edu/ | 2026-11-02 | facts OK: no explicit data-reuse ban (read https://extension.umaine.edu/about/copyright/) |
| University of Missouri Extension | Facts cited; © Curators of the University of Missouri | https://extension.missouri.edu/ | 2026-11-02 | facts OK: generic content clause, no data-reuse ban (read https://web.archive.org/web/2026/https://extension.missouri.edu/terms-and-conditions: "All content on the University of Missouri websites is copyrighted by the Curators of the University of Missouri ... To request permission to redistribute any material found on this website, please contact the Extension Web Coordinator") |
| Colorado State University Extension | Facts cited; © Colorado State University | https://extension.colostate.edu/ | 2026-11-02 | facts OK: no explicit data-reuse ban (read https://www.colostate.edu/disclaimer/) |
| Oregon State University Extension | Facts cited; © Oregon State University | https://extension.oregonstate.edu/ | 2026-11-02 | facts OK: no explicit data-reuse ban (read https://oregonstate.edu/copyright) |
| North Dakota State University | Facts cited; © North Dakota State University | https://www.ndsu.edu/ | 2026-11-02 | facts OK: no site terms page found (footer lists only a privacy notice); no data-reuse ban seen |
| University of Wisconsin Extension Horticulture and Uncommon Fruit (uncommonfruit.cias.wisc.edu) | Facts cited; © Board of Regents of the University of Wisconsin System | https://hort.extension.wisc.edu/ | 2026-11-02 | facts OK: no explicit data-reuse ban (read https://legal.wisc.edu/copyright-law/) |
| University of Maryland Extension | Facts cited; © University of Maryland | https://extension.umd.edu/ | 2026-11-02 | facts OK: no site terms page found (footer lists only a privacy notice); no data-reuse ban seen |
| UMass Amherst CAFE | Facts cited; © University of Massachusetts Amherst | https://ag.umass.edu/ | 2026-11-02 | facts OK: generic content clause, no data-reuse ban (read https://web.archive.org/web/2026/https://www.umass.edu/gateway/site-policies: text and images "may not be used or reproduced without permission") |
| Penn State Extension | Facts cited; © The Pennsylvania State University | https://extension.psu.edu/ | 2026-11-02 | facts OK: no explicit data-reuse ban (read https://www.psu.edu/copyright-information) |
| University of Georgia (CAES) | Facts cited; © University of Georgia | https://fieldreport.caes.uga.edu/ | 2026-11-02 | facts OK: no site terms page found (footer lists only a privacy notice); no data-reuse ban seen |
| University of New Hampshire Extension | Facts cited; © University of New Hampshire | https://extension.unh.edu/ | 2026-11-02 | facts OK: no explicit data-reuse ban (read https://www.usnh.edu/terms) |
| Cornell Small Farms | Facts cited; © Cornell University | https://smallfarms.cornell.edu/ | 2026-11-02 | facts OK: no site terms page found (footer lists only a privacy notice); no data-reuse ban seen |
| North Carolina State University Extension (Plant Toolbox) | Facts cited; © North Carolina State University | https://plants.ces.ncsu.edu/ | 2026-11-02 | facts OK: no explicit data-reuse ban (read https://www.ncsu.edu/copyright/) |
| Kentucky State University (College of Agriculture) | Facts cited; © Kentucky State University | https://www.kysu.edu/ | 2026-11-02 | facts OK: no site terms page found (footer lists only a privacy notice); no data-reuse ban seen |
| Michigan State University Extension | Facts cited; © Michigan State University | https://www.canr.msu.edu/ | 2026-10-21 | terms page unreachable 2026-11-02 (HTTP 403 live; archived pages show only a privacy statement) |
| Utah State University Extension | Facts cited; © Utah State University | https://extension.usu.edu/ | 2026-11-02 | facts OK: generic content clause, no data-reuse ban (read https://www.usu.edu/copyright/: "Any redistribution or reproduction of part or all of the contents in any form is prohibited.") |
| Oklahoma State University Extension | Facts cited; © Oklahoma State University | https://extension.okstate.edu/ | 2026-11-02 | facts OK: generic content clause, no data-reuse ban (read https://web.archive.org/web/2026/https://go.okstate.edu/tos/: the website "may not be reproduced, modified, distributed, displayed, performed, or used in any way without the prior written permission of OSU") |
| New Mexico State University | Facts cited; © New Mexico State University | https://pubs.nmsu.edu/ | 2026-11-02 | facts OK: no site terms page found (footer lists only a privacy notice); no data-reuse ban seen |
| Virginia Tech Cooperative Extension | Facts cited; © Virginia Polytechnic Institute and State University | https://www.pubs.ext.vt.edu/ | 2026-11-02 | facts OK: no site terms page found (footer lists only a privacy notice); no data-reuse ban seen |
| Arnold Arboretum of Harvard University | Facts cited; © President and Fellows of Harvard College | https://arboretum.harvard.edu/ | 2026-10-21 | terms page unreachable 2026-11-02 (HTTP 403 live and archived) |
| Royal Horticultural Society (plant profiles) | Facts cited; © Royal Horticultural Society | https://www.rhs.org.uk/about-the-rhs/terms-conditions | 2026-11-02 | facts OK: no explicit data-reuse ban on plant pages; the bans found cover only the Heritage Catalogue and Digital Collections sub-sites (gardener ruling 2026-11-02). The cited terms URL is dead (404). Heritage Catalogue clause, verbatim: "You must not permit any text or data-mining or web-scraping in relation to the RHS Heritage Catalogue." (read https://www.rhs.org.uk/about-us/what-we-do/policies/heritage-interpretation/terms-and-conditions) |
| Government of Alberta (Agriculture) | Facts cited; © Government of Alberta | https://www.alberta.ca/copyright-and-disclaimer | 2026-11-02 | facts OK: no explicit data-reuse ban (read https://www.alberta.ca/disclaimer: non-commercial copying allowed with credit) |
| USDA Forest Service (Fire Effects Information System) | Public domain (US Gov) | https://www.usda.gov/policies-and-links | 2026-10-21 | (government; no check needed) |
| Mississippi State University Extension | Facts cited; © Mississippi State University | https://extension.msstate.edu/ | 2026-11-02 | facts OK: no explicit data-reuse ban (read https://extension.msstate.edu/about-extension/disclaimer-notice) |
| Native Plant Trust | Facts cited; © Native Plant Trust | https://www.nativeplanttrust.org/ | 2026-11-02 | facts OK: no site terms page found (footer lists only a privacy notice); no data-reuse ban seen |
| Piedmont Master Gardeners (Virginia Cooperative Extension content) | Facts cited; © Piedmont Master Gardeners | https://www.piedmontmastergardeners.org/ | 2026-11-02 | facts OK: no site terms page found (footer lists only a privacy notice); no data-reuse ban seen |
| Master Gardeners of Northern Virginia | Facts cited; © Master Gardeners of Northern Virginia | https://mgnv.org/ | 2026-10-21 | terms page unreachable 2026-11-02 (HTTP 403 live and archived) |
| Ontario Ministry of Agriculture, Food and Agribusiness (ontario.ca, omafra.gov.on.ca) | Facts cited; © King's Printer for Ontario | https://www.ontario.ca/page/copyright-information-c-queens-printer-ontario | 2026-11-02 | facts OK: no explicit data-reuse ban (read https://www.ontario.ca/page/copyright-information: non-commercial reproduction allowed with credit) |
| University of Arizona Cooperative Extension (Yavapai County) | Facts cited; © The University of Arizona | https://extension.arizona.edu/ | 2026-11-02 | facts OK: no site terms page found (footer lists only a privacy notice); no data-reuse ban seen |
| New York Restoration Project | Facts cited; © New York Restoration Project | https://www.nyrp.org/ | 2026-11-02 | facts OK: generic content clause, no data-reuse ban (read https://web.archive.org/web/2026/https://www.nyrp.org/terms-of-use: the Content "may not be used, reproduced, duplicated, copied ... or otherwise exploited ... without NYRP's prior written consent") |
| Iowa State University Extension (yardandgarden.extension.iastate.edu) | Facts cited; © Iowa State University | https://www.extension.iastate.edu/ | 2026-11-02 | facts OK: no site content terms found (read https://web.archive.org/web/2026/https://www.iastate.edu/disclaimers-and-terms: lists only a privacy policy and mobile-text terms); no data-reuse ban seen |
| University of Illinois Extension | Facts cited; © University of Illinois | https://extension.illinois.edu/ | 2026-11-02 | facts OK: no site terms page found (footer lists only a privacy notice); no data-reuse ban seen |
| NC State Extension Publications (content.ces.ncsu.edu) | Facts cited; © North Carolina State University | https://content.ces.ncsu.edu/ | 2026-11-02 | facts OK: no explicit data-reuse ban (read https://www.ncsu.edu/copyright/) |
| Chicago Botanic Garden (Plant Finder) | Facts cited; © Chicago Botanic Garden | https://www.chicagobotanic.org/ | 2026-11-02 | facts OK: no site terms page found (footer lists only a privacy notice); no data-reuse ban seen; footer says "All rights reserved" |
| University of Wisconsin Extension Horticulture (hort.extension.wisc.edu) | Facts cited; © Board of Regents of the University of Wisconsin System | https://hort.extension.wisc.edu/ | 2026-11-02 | facts OK: no explicit data-reuse ban (read https://legal.wisc.edu/copyright-law/) |
| University of Florida IFAS (Gardening Solutions, gardeningsolutions.ifas.ufl.edu) | Facts cited; © University of Florida / IFAS | https://gardeningsolutions.ifas.ufl.edu/ | 2026-11-02 | facts OK: no explicit data-reuse ban (read https://ics.ifas.ufl.edu/uf-ifas-legal-statements/) |
| University of California Agriculture and Natural Resources (ucanr.edu, UC Cooperative Extension) | Facts cited; © Regents of the University of California | https://ucanr.edu/about/Terms_of_Use | 2026-11-02 | facts OK: generic content clause, no data-reuse ban (read https://ucanr.edu/copyright: "no part of the materials ... may be copied, downloaded, stored in a retrieval system ... except as permitted herein"; reproduction for educational purposes is granted) |
| Missouri Botanical Garden (Plant Finder) | Facts cited; © Missouri Botanical Garden | https://www.missouribotanicalgarden.org/ | 2026-11-02 | facts OK: no explicit data-reuse ban (read https://web.archive.org/web/2026/https://www.missouribotanicalgarden.org/terms-of-use: "All contents of the Missouri Botanical Garden Web Site are: Copyright ... All rights reserved") |
| Oregon State University Landscape Plants (landscapeplants.oregonstate.edu) | Facts cited; © Oregon State University | https://landscapeplants.oregonstate.edu/ | 2026-11-02 | facts OK: no explicit data-reuse ban (read https://oregonstate.edu/copyright) |
| University of Florida IFAS EDIS (edis.ifas.ufl.edu) | Facts cited; © University of Florida / IFAS | https://edis.ifas.ufl.edu/ | 2026-11-02 | facts OK: no explicit data-reuse ban (read https://edis.ifas.ufl.edu/copyright: documents licensed CC BY-NC-ND 4.0) |
| Missouri Department of Conservation (field guide) | Facts cited; © Conservation Commission of Missouri | https://mdc.mo.gov/terms-use | 2026-11-02 | facts OK: generic content clause, no data-reuse ban (read https://mdc.mo.gov/terms-use: "You may not reproduce this site's text, images, or videos without the Department's written permission.") |
| Hungarian Wikipedia (hu.wikipedia.org) | Facts cited; name only, no text copied; Wikipedia text is CC BY-SA 4.0 | https://hu.wikipedia.org/wiki/Wikipédia:Licenc | 2026-11-02 | facts OK: no explicit data-reuse ban (CC BY-SA 4.0 text licence) |
| West Virginia University Extension (companion planting page) | Facts cited; © West Virginia University | https://www.wvu.edu/privacy | 2026-11-02 | facts OK: no site terms page found (wvu.edu footer lists only a Privacy Notice; /terms-of-use and /terms-conditions return 404); no data-reuse ban seen |

"Date checked" is the date the terms were last looked at. Rows dated 2026-11-02 have a verdict in "Terms check";
four rows (University of Minnesota, Michigan State, Arnold Arboretum, Master Gardeners of Northern Virginia) could not
be read live or from the Wayback Machine on 2026-11-02, so they keep their earlier date and say `terms page
unreachable`. The standard: plant records cite single facts (sizes, pH, hardiness, seasons), which a general copyright
notice or "all rights reserved" does not prevent. A source is replaced only when its terms explicitly forbid
extracting, scraping or reusing data from the site; none currently does. "Terms check" is `facts OK` with a reason: a
page was read and has no such ban, a generic content clause (Utah State, Missouri Extension, UMass, Oklahoma State,
UC ANR, Missouri Dept of Conservation, NYRP) does not name data reuse, or no site terms page exists beyond a privacy
notice. RHS: the old terms URL is dead and its plant pages carry no such ban; the Heritage Catalogue and Digital
Collections sub-sites do, and are not used. Where a page was read from the Wayback Machine, the row says so.
Companion-pair sources below fall under the publishers in this table.

## Conventions

- `minWinterC`: the USDA zone low edge from a university/government zone source (NC State, extension services, USDA):
  zone N low edge = -51.1 + (N - 1) x 5.56 C, rounded to 0.1. For trees the zone of the cultivated form is used where
  a source gives it (English walnut: Oregon State zone 5; sweet cherry: Penn State zone 5; Chinese chestnut: Arnold
  Arboretum, commonly zone 5, -20 F). Where a source gives a direct temperature, that temperature is used (grape
  hardiness class -15 F; black mulberry: University of Wisconsin, not below 0 F = -17.8 C). The RHS hardiness rating is
  only a fallback when no zone source exists, using the band's lower bound: H4 -10 to -5 C -> -10; H5 -15 to -10 C ->
  -15; H6 -20 to -15 C -> -20; H7 below -20 C -> -20. No plant currently relies on the fallback. Commercial single
  sources are not used for hardiness.
- Chives width and minimum spacing are 0.3 m (12 in), taken from extension spacing guidance (UMD: 12 in
  apart; UW: clumps 12-20 in apart; UMN: 6-12 in). No source gives a true clump spread; RHS lists 0-0.1 m.
- Calendar rules are written for the northern hemisphere; conversion happens in code.
- Spring = Mar-May, summer = Jun-Aug, autumn = Sep-Nov, winter = Dec-Feb; early/mid/late = first/second/third month.
- Years to maturity (`yearsToMaturity`): where the RHS plant profile gives a "time to ultimate height" range, the
  midpoint is used (chives, comfrey, white clover 2-5 yr -> 3.5; grape 5-10 yr -> 7.5, cultivar profile). Apple has no
  per-rootstock figure from RHS (cultivar profiles give 5-10 yr, rootstock-dependent), so dwarf uses the low end (5),
  semi-dwarf the midpoint (7.5) and standard the high end (10), in line with University of Maine's bearing ages
  (dwarf 2-3 yr, semi-dwarf 4-5 yr, standard 7-10 yr). These apple values are an interpretation, not a quoted figure.

## Conventions added with trees-temperate.json

- Where a source gives a size range (NC State height/width), the midpoint is used and converted to metres. Rootstock
  variants of pear, cherries, apricot and peach use the Colorado State pruned-tree figures (ft to m); plum uses the
  NC State 'Stanley' dwarf / semi-dwarf / standard figures (range midpoints).
- `yearsToMaturity` is the RHS "time to ultimate height / maturity" midpoint only where the RHS-described tree matches
  the variant size (apricot, peach, quince, medlar, black mulberry, plum semi-dwarf 5-10 yr); otherwise null. Years to
  first bearing (grafted trees) go in `firstHarvestYears`, not `yearsToMaturity`.
- `sunNeed` is the light needed for a good crop, not mere tolerance: "full" where a source says the plant fruits or nuts
  best in full sun (even if it tolerates part shade), "part" where sources say part shade is genuinely suitable.
- `phMin`/`phMax` are set only where a source lists them; "neutral" is 6.0-8.0 (NC State), and "acid or neutral" gives
  only a maximum of 8.0. Drainage "good" maps to fast + normal; occasionally wet/flooded adds wet.
- Values for some species came from search-result summaries of the cited page (see task report).

## Conventions added with shrubs.json

- Sizes: where a source gives a range (NC State Dimensions), the midpoint is used (ft to m, 0.1 m). Where a source gives
  only a planting spacing, that is used as the width proxy (red raspberry 3 ft, Virginia Cooperative Extension via
  Piedmont Master Gardeners; red currant 3-5 ft, UW-Madison; haskap 1.3 m, OMAFRA). Blackberry height and width are
  the erect-cane topping height and hedgerow width (Mississippi State, 3-4 ft).
- `minWinterC`: USDA zone low edge from the lowest zone listed by NC State / UW / USU / OMAFRA / NRCS where a zone
  source exists. Direct temperatures: red raspberry -10 F (Penn State), erect blackberry not below 10 F (NC State),
  jostaberry tolerates -30 F (UW-Madison). Goji uses zones 4-7 from the University of Arizona Yavapai extension page
  (value from a search summary; page not re-fetched). Beach plum zone 4-8 is from Native Plant Trust (search summary).
  No shrub here relies on the RHS H-band fallback.
- `sunNeed`: "full" only where a source says the plant prefers or fruits best in full sun, or lists only full sun;
  sources that say "full sun to partial shade" without a preference give "part".
- Nitrogen fixer role: only where a source states nitrogen fixing for the species or genus (sea buckthorn UW; northern
  bayberry NC State/USDA; silver buffaloberry NC State; leadplant USDA NRCS; New Jersey tea FEIS genus-level plus
  Northern Virginia Master Gardeners, both from search summaries). USDA notes bayberry may spread aggressively by
  rhizomes in some habitats. Autumn olive, Russian olive and other invasive Elaeagnus were skipped.
- Calendar rules are only those stated on a cited page ("Fall", "Summer", "Aug.-Sept.", "prune in the spring",
  "late winter"). Season words map as: Fall = early-autumn to late-autumn, Summer = early-summer to late-summer.
- `yearsToMaturity` from RHS "time to maturity" midpoint (jostaberry 2-5 -> 3.5, goji 5-10 -> 7.5, lowbush 10-20 -> 15)
  and UMN "full size in 8 to 10 years" (highbush blueberry 9, search summary of the page).

## Conventions added with herbs.json

- Every page cited here was fetched and read directly (no value rests on a search summary alone).
- Sizes are NC State Plant Toolbox height/width range midpoints (ft to m, 0.1 m). Rhubarb uses Oregon State EC 797
  ("2 1/2 to 3 feet high and 3 to 3 1/2 feet wide", midpoints).
- Rhubarb `minWinterC` (zone 3, -40.0) comes from the Chicago Botanic Garden page for the species cultivar
  'Victoria' (zones 3-9; archived page), because NC State, Wisconsin, Oregon State and Penn State pages give no zone.
- Borage is an annual that self-seeds; the NC State zone range (2a-11b) is used as given. Sweet marjoram is listed by NC
  State for zones 9-10 only.
- Division/replanting timing stated by a source ("divide in early spring", "spring or early fall") is used as the
  planting window (`plant` rule) for lemon balm, bee balm and anise hyssop; it is the stated divide/transplant window,
  not a sourced planting date, because the sources give no separate planting dates.
- "Early July" / "September" (Iowa State, oregano and tarragon harvest) map to mid-summer / early-autumn; "May" to
  late-spring; "June" to early-summer. Rhubarb `plant` rule: Wisconsin "4 to 6 weeks before the average last frost" ->
  5 weeks before last frost (midpoint). Borage `plant`: Illinois "directly sown in the garden after frost is past".
- Borage `minWinterC` (zone 2a) is from the NC State zone listing; borage is an annual that self-seeds, so the figure
  is not perennial survival.
- `sunNeed` 'part' only where the page says shade is wanted (hyssop: NC State "performs best ... with some shade from the
  hot afternoon sun"); anise hyssop "full or partial sun" with no preference is 'full'.
- `pollinator` role only where the NC State (or cited) page says the plant attracts bees/pollinators.
- Skipped as invasive or aggressively weedy per sources: lovage (NC State: invasive in New England), cardoon/artichoke
  (invasive in NC and California), fennel (escapes and naturalizes), common tansy, mints (aggressive, weedy).

## Conventions added with ground-roots.json

- Every page cited was fetched and read directly, except the MSU crimson clover page (see below). Sizes are NC State Plant Toolbox
  range midpoints (ft to m; 0.1 m, or 0.01 m below 0.3 m). Nasturtium uses the dwarf/bush type (12 in x 2 ft) stated in the
  NC State description, not the 1-10 ft climbing range.
- `minWinterC` is the NC State zone low edge (annual vegetables and nasturtium use the low end of the listed range, per
  the annual convention above; this is not frost survival of the tender crop). Ramps (zones 3-8) and Egyptian walking
  onion (zones 3a-9b) use University of Wisconsin Extension.
- `sunNeed` 'full' where the page says full sun, or lists full sun to part shade with no stated preference; ramps 'shade'
  (NC State: best grown in shady areas; UW: full to partial shade tolerated).
- `nitrogen-fixer` role: red clover (NC State, Penn State nodules) and crimson clover (NC State) only.
- `pollinator` role only where the NC State page lists "Attracts: Pollinators".
- Calendar rules are only those stated on a cited page. Sown or planted frost-driven crops use frost-relative rules
  (`offsetWeeks` negative = before the frost date), because season rules map to fixed months: radish and onion sets
  -6 weeks from last frost (UMD "hardy vegetables ... plant 6 weeks before the average last spring frost"), carrot and
  potato -3 weeks (UMD "semi-hardy ... 2 to 4 weeks before", midpoint), crimson clover -7 weeks from first frost (MSU
  "six to eight weeks before the average first frost", midpoint; page blocks automated fetch, value is from a search
  summary of that page). Regional calendar dates (NC State radish, carrot, potato) are not used. Season rules remain only
  for hardy perennials and sets where no page states a frost relation (Jerusalem artichoke, ramps, walking onion) and
  dormant-season tasks. "Display/Harvest Time: Summer" gives strawberry and wild strawberry harvest early- to
  late-summer. Cranberry berries "mature in August-November" gives late-summer to late-autumn. Garlic: Illinois "within
  one to two weeks after the first killing frost" -> 1.5 weeks after first frost. Red clover: Penn State "April to early
  May" -> mid- to late-spring. Ramps: UW "transplanted in early spring" and "in the fall". Walking onion: UW "division is
  best done in spring". Creeping thyme prune (early spring) is from the Illinois genus-level thyme page ("renewed ... by
  cutting it back severely in the spring"); it is not species-specific.
- Ramps `firstHarvestYears` 2.5: "harvestable ramp bulbs within 2 to 3 years" (NC State publication, UW).
- Skipped: alsike clover (NC State: listed invasive in some states), hairy vetch and chicory (invasive/weedy), orange
  daylily (naturalizes aggressively), crown vetch.

## Conventions added with climbers-fixers.json

- Every page cited was fetched and read directly (no value rests on a search summary alone).
- Sizes are NC State Plant Toolbox range midpoints (ft to m, 0.1 m; pea 0.01 m). Maypop height and spread are Missouri
  Department of Conservation midpoints ("vine climbing 6-8 feet; spread: 3-6 feet" -> 2.1 m x 1.4 m; the RHS cultivar
  profile's 1.5 m was replaced after spot-check review), with RHS "time to maturity 2-5 years" -> 3.5; the NC State page
  gives no dimensions.
- `minWinterC`: kiwifruit is the University of Wisconsin direct figure ("cannot tolerate winter temperatures below 10 F"
  -> -12.2); hardy kiwi UW "-25 F (Zone 4)" -> -31.7; arctic kiwi UW "-35 or -40 F (Zone 3)" -> -37.2 (the warmer
  figure). Hops: Illinois Extension "hardy perennial (zone 3 to 8)" -> zone 3 low edge -40.0. Maypop, red alder: NC State
  lowest listed zone 5a -> -28.9. Runner bean, hyacinth bean and pea are annuals: the low end of the NC State zone list
  is used (7a, 10a, 2a), per the annual convention above; it is not frost survival.
- Frost-tender sowings are frost-relative: runner bean (RHS: wait until all risk of frost has passed; UMD: snap beans
  "plant after the threat of frost is past"), hyacinth bean (NC State "plant after danger of frost has passed"), hops
  rhizomes (USU "planted in the spring after the danger of frost has past") -> last frost, 0 weeks; garden pea (UMD hardy
  vegetables "plant 6 weeks before the average last spring frost") -> -6 weeks. No regional calendar dates are used.
- Season rules: pruning of kiwis in winter (UW "Winter pruning is necessary"; NC State hardy kiwi "prune each stem in
  winter"; NC State arctic kiwi "when the vine is dormant in winter and early spring"). Harvest windows: NC State
  "Display/Harvest Time: Fall" -> early- to late-autumn; kiwifruit "ripens in the early fall" -> early-autumn only;
  maypop "Summer, Fall" -> early-summer to late-autumn. Red alder `plant`: USDA plant guide says nursery seedlings go to
  permanent positions "in the summer, if not ... the following spring" -> early-spring to late-summer.
- `nitrogen-fixer` role only where a cited page states fixing for the species: pea (NC State), hyacinth bean (NC State
  "used to fix nitrogen in fallow land"), red alder (NC State, USDA NRCS Frankia nodules). Runner bean is not tagged (the
  NC State runner bean page does not say it).
- Skipped: black locust and Russian/autumn olive (invasive), black alder (Alnus glutinosa; listed invasive in parts of
  North America), honey locust (USDA NRCS plant guide: "not a nitrogen fixer"; no calendar source), Kentucky coffeetree
  (not a fixer), pole bean (NC State gives no dimensions), cucumber (NC State height 0.2-0.5 m not a climbing size),
  schisandra, muscadine, groundnut, thinleaf and hazel alder, wax myrtle, lupine (no calendar rule or no nitrogen-fixing
  statement on a fetched page).

## Conventions added with warm-climate.json

- Every page cited was fetched and read directly (NC State Plant Toolbox pages and UF/IFAS Gardening Solutions pages via
  curl; no value rests on a search summary). Sizes are NC State height/width range midpoints (ft to m, 0.1 m); mango
  (30-60 ft x 30-50 ft) and lychee (30-50 ft tall and wide) use the UF/IFAS Gardening Solutions figures the same way.
  No `yearsToMaturity` is given (no sourced figure); lychee `firstHarvestYears` 3 is UF "after three years or so".
- `minWinterC` (frost-tender woody perennials: citrus, avocado, banana): a cold-damage temperature stated on a
  university page, never the low edge of NC State's zone list (which lists only North Carolina-suited zones and
  overstates how cold these plants survive). Where a page distinguishes, the tree/wood figure is used, not fruit or leaf
  damage. If a page gives a range, the warmer end is used (only avocado has a range). Values: Meyer lemon 22 F (-5.6 C),
  sweet orange 24 F (-4.4 C), grapefruit 26 F (-3.3 C), lemon 28 F (-2.2 C), lime 30 F (-1.1 C; used for key lime and
  Persian lime) from the UC "cold hardiness" ranking for the species (UC Cooperative Extension Placer & Nevada Counties
  31-018C; UC "Avoiding Cold Damage to Home Citrus"); UC says fruit is much less cold hardy than the woody parts, so these
  are tree figures; calamondin 22 F ("Calamondins are cold hardy to 22F", UF/IFAS Gardening Solutions, fruit or wood not
  distinguished); banana 28 F ("Temperatures below 28F may kill plants to the ground", UF/IFAS EDIS MG040, top-kill, the
  rhizome usually resprouts); avocado 30 F (UF/IFAS EDIS MG213 Table 1, mature trees: West Indian 25-30 F, Guatemalan
  24-28 F, Mexican 18-26 F; the warmer end of the most tender race is used, so hardier Mexican types are understated).
  The UC citrus figures are California guidance used as the only stated per-species temperatures found. The remaining
  records use the lowest NC State zone low edge ('b' half-zones +2.78 C): fig, strawberry tree 7a; olive, pomegranate,
  feijoa (also UF "Zones 8-11"), loquat, lemon verbena, myrtle 8a; mango and lychee 10a (UF/IFAS "USDA Hardiness Zones
  10A through 11"). Sweet potato, ginger and Malabar spinach (9a, NC State) follow the annual convention above: their
  frost-relative `plant` rule is what protects the gardener, not `minWinterC`.
- Harvest windows come from NC State "Display/Harvest Time" (seasons mapped as above; several seasons listed are joined
  into one contiguous range: lemon lists all four seasons -> early-spring to late-winter, i.e. year-round) or, where
  stated, a UF/IFAS month range (mango "between May and September" -> late-spring to early-autumn; lychee "between May
  and July" -> late-spring to mid-summer; feijoa "September through November" -> early- to late-autumn, used instead of
  NC State's "Summer" because the UF/IFAS page gives the months). These windows are for the cited region (North
  Carolina / Florida) and may differ elsewhere. Sweet potato `plant`: NC State "planted after the last frost" and UF
  "anytime after the threat of frost" -> last frost, 0 weeks; ginger: UF "once the danger of frost is past" -> last frost, 0
  weeks; Malabar spinach: NC State "In Zone 7 and warmer, direct seed 2 to 3 weeks after last frost date" -> +2.5
  weeks. Fig `prune`: NC State "Light pruning each winter". Lemon verbena `prune`: NC State "Pruning ... in early spring".
- `sunNeed`: all 'full' except ginger ('part': UF "does best in partial shade"); where NC State lists full sun to partial
  shade without a stated preference the plant is 'full' (crop ruling).
- `pollinator` role only where the NC State page lists "Attracts: Pollinators" (loquat, banana, calamondin,
  sweet potato, strawberry tree).
- Layers: tall trees (mid height over about 12 m) canopy; other trees sub-canopy; bush-sized (under about 4 m) citrus,
  pomegranate, feijoa, myrtle, lemon verbena and the banana (a giant herb) shrub; sweet potato and ginger root; Malabar
  spinach climber.
- Fig and olive are included although NC State notes local invasiveness (fig "In Florida and California, it has become
  invasive"; olive "reported to have become invasive in Australia, New Zealand, Hawaii, and southern California"): both
  are long-established food crops that are not on the major US federal or state noxious lists the controller applies, and
  the batch brief names them. Flag for the human review. Spreading is not modelled; check local invasive-species rules
  before planting fig or olive.
- Skipped: common guava (Psidium guajava; UF/IFAS itself warns it must be managed "to ensure it does not escape" and it is
  invasive in Hawaii/Galapagos/Florida), strawberry guava, taro (Colocasia; invasive in the southeast US), edible canna
  (NC State page lists Canna indica; naturalising), trifoliate orange (NC State: invasive in some states), pigeon pea and
  moringa (no institutional page found stating size, cold limit and a calendar rule), papaya (UF gives no spread),
  kumquat (no spread), chayote (Texas A&M plant-after-frost only; no size or cold limit), lemongrass, turmeric, pineapple,
  macadamia (no stated cold-damage temperature or zone in a growing-region page: CTAHR says only that it "tolerate[s]
  and survive[s] mild frosts"; its NC State harvest "Summer" also conflicts with CTAHR August-January nut drop),
  cassava (no frost-relative or stated calendar rule), carob (no height), star fruit and jaboticaba (no zone or cold
  figure). Regional dates such as UF "plant in March" for turmeric/ginger are not used.

## Conventions added with europe.json

- RHS (plant profiles, Grow Your Own pages, hedgerow and weeds advice pages) is the primary publisher. Every cited page
  was fetched directly (curl) and the value read on that page; no value rests on a search summary. Search was used only
  to find RHS page URLs.
- Sizes: RHS profile "Max height" / "Max spread" bands, midpoint used (e.g. 2.5-4 m -> 3.25 m). Plants whose band is
  open-ended ("wider than 8 metres": bay laurel, wild cherry, cherry plum) were dropped, never guessed.
  `yearsToMaturity` is the RHS "Time to Maturity" midpoint (2-5 -> 3.5, 5-10 -> 7.5, 10-20 -> 15, 20-50 -> 35).
- `minWinterC` (fix round 1): RHS H5-H7 bands are floors, not limits, so the USDA zone low edge from a university or
  botanic-garden page replaces them where one exists (zone 3 -40.0, zone 4 -34.4, zone 5 -28.9): sorrel, lingonberry
  (MBG zone 3); sea kale, wild garlic, sweet cicely (MBG zone 5); chamomile, lovage, crab apple (NC State zone 4a);
  hawthorn (Oregon State "Hardy to USDA Zone 4"); damson (NC State 'Shropshire Prune' damson cultivar, 5a); dog rose
  (Chicago Botanic Garden 5-9). "RHS floor; likely hardier": blackthorn (H7, -20) and Daubenton's kale (H6, -20) - no
  university or botanic-garden zone page was found. For Daubenton's, non-institutional reports say it is not reliably
  hardy below zone 6-8, so -20 may be optimistic. Rosemary, where the RHS Grow Your Own
  page states a temperature ("well-established plants surviving temperatures as low as -8 C"), used as given.
- `textures` from the RHS "Soil types" list (clay/loam/sand; chalk has no equivalent and is omitted); `drainage` fast +
  normal for every "well-drained" or "moist but well-drained" moisture entry (same as trees-temperate). `phMin`/`phMax`
  are left null: RHS gives only acid/neutral/alkaline categories.
- `sunNeed`: 'full' where the page says sun or sun-or-partial-shade with no stated preference; 'part' only where the page
  states a shade preference (lovage RHS GYO "choose a planting site in light shade if available"; sweet cicely RHS profile
  position "partial shade" only (MBG: "part shade to full shade")). Fix round 1: wild garlic is 'full' (RHS profile sun or
  partial shade; MBG "full sun to part shade ... more tolerant of part shade conditions than most members of the genus"
  is tolerance, not a stated preference); lingonberry is 'full' (MBG "Plant in full sun for best fruiting", overriding
  the RHS "partial shade, such as a woodland edge" cultivation note).
- Calendar months are UK months mapped to seasons (Mar-May spring ... Dec-Feb winter; July and August -> mid- to
  late-summer; "October to February" -> mid-autumn to late-winter; "November and March" -> late-autumn to early-spring).
  Only hardy perennials and trees have planting rules, all as seasons; no frost-tender sowing is included (salsify, oca
  were dropped: the RHS page gives no frost relation, only "once the soil warms up in spring" / UK months). Damson prune
  is "established trees in summer" (young trees: early spring, not used). Damson harvest "late summer" is from the RHS
  growing guide; the RHS hedgerow page says autumn for wild damson/bullace.
- Hedgerow-page harvest seasons (crab apple, sloe, haws, rose hips: "Autumn") map to early- to late-autumn.
- `origin`/`grownIn`: `origin` only where the RHS profile "Plant range"/"Native to GB/Ireland" states it: Europe (sorrel,
  sea kale, wild garlic, sweet cicely, lingonberry, blackthorn, crab apple, "native to GB/Ireland" or "Europe" given);
  chamomile "W Europe, NW Africa" -> europe, africa; damson "C & S Europe N Africa" -> europe, africa; hawthorn and dog
  rose (Europe, N Africa, SW Asia) -> europe, africa, asia. Not set where the range is only "Mediterranean" / "E
  Mediterranean" (rosemary, lovage) or missing (Daubenton's kale). `grownIn` europe for all (RHS profile/guide).
- Invasiveness: judged first against GB Wildlife and Countryside Act 1981 Schedule 9 (fetched from legislation.gov.uk; none
  of these species appear) and the EU Union list (page could not be fetched; none of these species is on it to the
  author's knowledge). Notes: wild garlic spreads rapidly by seed and bulbils (RHS says it is best kept out of cultivated
  areas); lovage is listed invasive in New England by NC State (see herbs.json), kept as a US-state-only concern;
  common hawthorn is weedy in parts of the US Pacific Northwest; blackthorn suckers (RHS). Check local rules.
- Dog rose: the RHS profile marks hips ornamental / not to be eaten, while the RHS hedgerow page says cooked hips are
  edible (syrup or jelly); with conflicting sources `edibleParts` is null (fix round 1). Hawthorn: Oregon State lists
  Crataegus monogyna as a potential "B" noxious weed in Oregon.

## Conventions added with the origin / grownIn backfill

- `origin` lists the continents where the plant is native, exactly as a cited page states it: NC State Plant Toolbox
  "Country Or Region Of Origin" (and its Distribution country list), RHS "Plant Range", or a named extension page
  (haskap: USU "northern Eurasia and Canada"; mango, lychee: UF/IFAS). Mapping: Mexico, Central America, Caribbean,
  US states, Canada -> north-america; "Eurasia" -> europe + asia; Siberia, Central Asia, China, Japan, Iran, Afghanistan
  -> asia; "Mediterranean" is mapped only when the page lists countries or continents (garden sage, lemon balm, olive,
  English lavender); a bare "Mediterranean" (radish, borage, fig) is left null. Hybrid or "garden origin" with no
  stated range, and ranges that name only transcontinental countries or a botanical region (Turkey, Cyprus, Malesia,
  Transcaucasus) are null. Where two cited pages disagree (sweet potato: NC State Mexico vs RHS Indonesia) origin is
  null. Crimson clover "Europe and the Middle East" records europe only. Jerusalem artichoke: NC State gives only US
  states ("West of TX, AR, and OH"); RHS Plant Range "N America" is cited with it. Malabar spinach: NC State says
  "Tropical Asia or, possibly, Africa", recorded as asia + africa. Some cultivated forms inherit the species range
  (strawberry, NC State "Europe").
- `grownIn: ['europe']` is set only where an RHS Grow Your Own growing guide for the species is cited (rhs.org.uk/fruit,
  /vegetables, /herbs "How to grow ..." guides, plus the RHS cobnut/filbert growing guide under /nuts). An RHS plant
  profile alone does not count: RHS profiles exist for ornamentals and American natives alike, so a profile does not show
  the plant is grown as a food plant in Europe. A guide must cover the species (potato, runner bean, Jerusalem
  artichoke and highbush blueberry yes; the grape guide covers Vitis vinifera only, the walnut guide covers Juglans
  regia, the mulberry guide black mulberry, the strawberry guide the garden strawberry: none of these cover
  Vitis labrusca, black walnut, red mulberry or wild strawberry). Close calls (decided 2026-10-21): an RHS page with
  how-to-grow advice for the species counts wherever it sits on the site, so the avocado growing guide
  (/plants/avocado/growing-guide), "How to grow annual nasturtiums" (names Tropaeolum majus) and the Grow Your Own
  cranberry feature (soil, site and fruiting advice for Vaccinium macrocarpon) count. Feijoa (profile only; RHS says it
  fruits only occasionally in the UK) and lowbush blueberry (the blueberry guide never names it) stay hidden in Europe.
  Only relevant for plants native only to the Americas;
  set on other plants where a guide is already cited or trivially found.

## Life cycle (`annual`)

- `annual: true` only where the cited NC State Plant Toolbox page lists "Annual" under Life Cycle (checked 2026-10-22):
  borage, carrot, crimson clover, hyacinth bean, Malabar spinach, nasturtium, pea, potato, radish, runner bean, sweet
  marjoram, sweet potato. Some of these pages also list Biennial or Perennial; the app treats them as annuals where the
  garden has winter frost ("Grown as an annual here") and skips the winter-cold check for them, since their `minWinterC`
  follows the annual convention above and is not frost survival. Ginger (NC State: Perennial), garlic and onion (Bulb)
  are not marked.


## Water need (`water`)

- `water` is `{ minRainMm }` (a number), `{ level: 'low' | 'medium' | 'high' }` (wording), or null (unknown). Every non-null value has `fieldSources.water`. 101 of 131 plants have a value (checked 2026-10-22): 40 numbers, 61 wording-based (31 low, 16 medium, 14 high); 30 are unknown.
- Precedence: a USDA number beats wording. `scripts/water/usda_water.py` looks each species up in the USDA PLANTS Database (PlantSearch, first accepted species-rank match by scientific name, then PlantCharacteristics) and converts "Precipitation, Minimum" with `minRainMm = round(inches x 25.4)`. It adds the source `usda-plants-<symbol>` (licence "Public domain (US Gov)"), is idempotent, and never changes a wording-based value. 40 plants have a number, mostly North American natives, nut trees and shrubs; apple, peach, plum, cherry, citrus and nearly all herbs and vegetables have none.
- Wording (`scripts/water/wording.json`, applied by `apply_wording.py`) was read only on pages the plant already cites; no new source was added, so no new publisher is introduced. The relied-on phrase is stored next to each value. Mapping:
  - `low`: "drought tolerant / resistant", "tolerates drought", "dry soils", "medium to dry" (a listed NC State "Resistance To Challenges: Drought" counts). "Drought tolerant once established" counts as `low`.
  - `high`: "keep (consistently|evenly) moist", "needs regular/plenty of water", "constant moisture", "intolerant of drought", "irrigation required".
  - `medium`: only a soil descriptor such as "moist but well-drained" or "medium moisture", with no drought or watering wording anywhere on the plant's pages.
  - Container-only or seedling/young-tree-only advice is ignored ("water newly planted trees", "pots need regular watering", "keep seedlings moist"). "Well-drained" alone says nothing about need and is not used. RHS "once established shouldn't need additional watering" is a UK-rainfall remark, not drought wording: it is ignored unless a page elsewhere says the opposite, in which case it is a conflict (kiwifruit).
  - Pages that block automated fetches (HTTP 403 or no response: UMN, Missouri Extension, Oregon State pruning page, Missouri Botanical Garden, CSU PDFs, MSU elderberry, Arizona goji) could not be read; those values rest on the other cited pages. The values with such a cited-but-unread page are apple, black-currant, chives, comfrey, elder, goji, grape, hazel, plum, japanese-plum, sour-cherry, common-sorrel, sea-kale, wild-garlic, sweet-cicely.
- Conflicts, left `null`: kiwifruit and hardy kiwi (UW "constant moisture" vs RHS kiwi guide "shouldn't need regular watering" once established); carrot (NC State "keep the soil moist" vs RHS "drought resistant, so rarely need watering"); rhubarb (Oregon State "high water requirement" and "can withstand drought" vs RHS "rarely needs watering"); gooseberry (USU "keep the soil moist ... watered all season" vs RHS "watering is seldom required"); blackberry (NC State "irrigate on a regular basis" vs RHS drought-tolerant, no extra watering); feijoa (NC State "water deeply and regularly" vs UF/IFAS "won't require much irrigation beyond normal rainfall"); sweet potato (NC State "resistant to drought and dry soil" vs RHS "regular watering"). Mixed wording on one page, left `null`: Meyer lemon ("consistently moist" and "prefers drying out"), sweet orange ("drought tolerant but flourishes when kept moist"), avocado ("evenly moist" and NC State drought resistance), ramps ("medium-wet to medium-dry" and "adequate moisture must be maintained"), comfrey (moist soil vs "Drought Tolerant Garden"), lovage (moist soil vs "Dry Soil" resistance and "may need watering in hot weather").
- Left unknown (30), no usable wording: apple, apricot, black-currant, black-mulberry, common-sorrel, dog-rose, grape, japanese-plum, lychee, medlar, nasturtium, potato, sea-kale, sour-cherry, sweet-cherry, wild-garlic (16). Reasons: only "well-drained" or the ambiguous RHS "moist but well-drained or well-drained" (sea-kale, wild-garlic, dog-rose, common-sorrel, apple, medlar, black-mulberry); watering advice only for young trees, seedlings or pots (apple, apricot, grape, sweet cherry, sour cherry, japanese-plum, nasturtium, potato); wording that does not map ("moisture-retentive" for apricot and sweet cherry; "not drought" for black-currant; "moderately tolerant of drought" for lychee). The other 14 are the conflicting or mixed-wording plants above.

## Veggie beds (2026-10-23)

23 veggie-bed crops and annual herbs in `vegetables.json` (tomato, sweet-pepper, aubergine, lettuce, spinach, chard, beetroot, parsnip, leek, cabbage, kale, broccoli, cauliflower, bush-bean, broad-bean, courgette, winter-squash, cucumber, sweetcorn, basil, parsley, dill, coriander), and `rotationGroup` on 26 plants (18 new, 8 existing). Every page was fetched and read directly (curl with a browser user-agent). No new publisher: NC State Plant Toolbox, RHS (Grow Your Own guides, plant profiles, Advice), University of Maryland, USDA NRCS and USDA PLANTS are all in the table above.

- **Rotation (`rotationGroup`).** Source id `rhs-crop-rotation` (https://www.rhs.org.uk/vegetables/crop-rotation), read 2026-10-23. Groups follow the page exactly: brassicas (cabbage, cauliflower, kale, radish and so on; broccoli is the same species group); legumes (peas, broad beans, French and runner beans); onions (onion, garlic, shallot, leek) and roots (beetroot, carrot, parsley, parsnip, ...) share one `roots` step; potato family (potato, tomato). The page says "pepper and aubergine ... can be grown anywhere in the rotation" and that cucurbits, salads (lettuce) and sweetcorn "can be grown wherever convenient": all `any`. The RHS order is "brassicas follow legumes, onions and roots, legumes, onions and roots follow potatoes and potatoes follow brassicas", and its four-year plan returns a group after four years: `ROTATION_CYCLE` = legumes, brassicas, potatoes, roots and `ROTATION_GAP_YEARS` = 3 (controller ruling 9). Crops the page does not mention are left null (no check): spinach, chard, basil, dill, coriander, and the existing sweet potato. Walking onion is `roots` (an onion, ruling 10).
- **Annuals.** `annual: true` and `yearsToMaturity: 0` (full size in its year; `sizeAt` returns mature size when it is 0) on all 23. Source of `annual`: NC State Life Cycle lists "Annual" (tomato, pepper, aubergine, lettuce, spinach, chard, beetroot, cauliflower and broccoli, both bean species, courgette, winter squash, cucumber, sweetcorn, basil, dill, coriander); RHS plant profile life-cycle tag "Annual Biennial" (parsnip, parsley, kale; the parsley profile adds "Normally grown as an annual"); RHS cabbage 'Hispi' profile ("a compact, leafy biennial grown as an annual vegetable"; no RHS page for the Capitata Group itself was found); RHS leek profile ("herbaceous perennials usually grown as annual vegetables", no Annual tag; recorded as annual because that is how it is grown). NC State lists only Biennial for parsnip, kale, cabbage and leek.
- **Sizes** (m; 0.1 m, or 0.01 m below 0.3 m): NC State Height/Width range midpoints (ft to m), as in the earlier files. Exceptions: bush bean height 45 cm and width 15 cm (RHS French beans guide: dwarf beans "up to 45cm tall", spaced 15 cm); broad bean height 1.4 m (USDA NRCS: determinate cultivars 2 to 7 ft) and width 0.2 m (RHS spacing 15-23 cm); courgette and winter squash width is the RHS planting spacing (courgette "at least 90cm", trailing squash 1.5 m) because the NC State width ranges reach 25 ft; courgette height is the NC State midpoint; parsnip 0.3 x 0.3 is the RHS profile height/spread band 0.1-0.5 m (NC State gives no dimensions); leek height 0.4 m is the RHS profile leaf length 30-50 cm and width 0.18 m the RHS spacing 15-20 cm (the NC State Allium ampeloprasum page is wild leek and is not used). Cucumber is the NC State ground-trailing range (0.3 m high, 1.7 m wide), although the RHS advises outdoor cucumbers on supports.
- **`minSpacingM`** is the low end of the RHS planting spacing where the guide gives one (tomato 45, pepper 38, aubergine 60, lettuce and spinach 15, chard 30, beetroot 10, leek 15, cabbage 30, kale 30, broccoli 60, bush bean 15, broad bean 15, courgette and squash 90, cucumber 30, sweetcorn 34, basil 10, parsley 15, dill 20, coriander 10 cm); otherwise null (parsnip, cauliflower).
- **`minWinterC`** follows the annual convention above (low end of the NC State zone list; not frost survival): pepper 4a, aubergine 9a, lettuce, spinach, chard, beetroot, bush bean, cucumber, sweetcorn and dill 2a, courgette and winter squash 3a, basil 10a. Where the NC State page lists no zone: cabbage, kale, broccoli and cauliflower use the NC State species page Brassica oleracea (zone 6a); parsnip (H5, -15), parsley (H6, -20), coriander (H5, -15) and leek (H4, -10) use the RHS plant profile rating at the band's lower bound; tomato (H1C, 5 to 10 C) uses the same rule at 5.0, which extends the old H4-H7 fallback table to the tender band (an interpretation); broad bean uses the USDA NRCS guide ("hardier cultivars from the Mediterranean can tolerate winter temperatures as low as 14 F", -10.0), because RHS cultivar pages disagree (H3 to H5).
- **Calendar** (`plant`): frost-relative from the University of Maryland list. Hardy crops (6 weeks before last frost): spinach, leek, cabbage, kale, broccoli, parsley. Semi-hardy (midpoint of 2-4 weeks, -3): lettuce, chard, beetroot, cauliflower. "Plant after the threat of frost is past" (0): tomato, pepper, aubergine, bush bean (snap), courgette (summer squash), winter squash, cucumber, sweetcorn. Without a UMD entry the RHS guide's stated season is used: parsnip "wait until the soil has warmed up in mid-spring" (mid-spring); broad bean "March, April and even early May" (early- to late-spring); basil "wait until early summer" (early-summer); dill "from mid-spring to mid-summer"; coriander "in succession throughout spring and summer" (early-spring to late-summer).
- **Water** (`water`, same mapping as above): USDA PLANTS "Precipitation, Minimum" gives aubergine 60 in (1524 mm) and sweetcorn 20 in (508 mm) (sources `usda-plants-some`, `usda-plants-zema`); wording gives `high` for lettuce ("keep the soil consistently moist"), spinach ("Keeping the soil moist"), courgette ("consistently moist", "need regular watering") and tomato ("Water tomato plants regularly"); `low` for chard (NC State Resistance To Challenges: Drought, RHS "fairly drought tolerant") and broad bean (NC State Drought). Left null: pepper (NC State Drought vs RHS "evenly moist"), parsnip (NC State Drought vs RHS "keep the soil evenly moist"), and every crop whose pages only say "water during dry spells" or "steady supply of moisture" (beetroot, leek, cabbage, kale, broccoli, cauliflower, bush bean, winter squash, cucumber, basil, parsley, dill, coriander).
- **Other fields.** `sunNeed` 'full' for all (NC State or RHS "Full sun", including pages that add partial shade with no preference). `phMin`/`phMax`: "Neutral" gives 6.0-8.0, "Acid or Neutral" gives a maximum of 8.0 only (as for trees); pages listing acid, neutral and alkaline together (pepper, broad bean) or a lone "Acid (<6.0)" (aubergine, which looks unreliable) leave both null. `drainage` "Good Drainage" gives fast + normal; parsnip adds wet ("Occasionally Wet"). `origin` follows the origin convention (bare "Mediterranean" ignored; parsley null because NC State "Europe" and the RHS profile "NW Africa and the Balkan Peninsula" disagree; bush bean "Tropical America" and broad bean "Middle East" null). `roles`: nitrogen-fixer for bush bean (NC State "add much needed nitrogen back into the soil") and broad bean (NC State, USDA NRCS); pollinator only where NC State lists "Attracts: ... Pollinators" (tomato, broad bean, dill). `edibleParts` only where a cited page states them (NC State Edibility text, or the RHS harvest text for kale, bush bean, courgette, winter squash and sweetcorn); null for leek, where no page states them. `family`, `textures` (no RHS soil-type list), `leafHabit` and `canopyDensity` are null; `grownIn: ['europe']` everywhere (an RHS Grow Your Own guide is cited).
- The Capitata Group, Italica Group and Botrytis Group names follow NC State/RHS group naming; cauliflower shares the NC State "Cauliflower & Broccoli Group" page with broccoli, so their sizes, pH, drainage and edible parts are identical.

## Companion pairs (2026-10-23)

24 pairs in `data/companions.json` (16 good, 8 bad). Every page was fetched and read directly (curl with a browser user-agent; PDFs via pdftotext). A pair is included only when a page states the effect as a fact or a finding. Pairs a page calls a tradition, a claim, a belief or unproven are left out. A claim about a group becomes one entry per plant id with the same source.

**Sources used** (no new licence terms: each is a university extension or the RHS, recorded as "Facts cited; © publisher"):

| Source id | Page | Licence string | Date checked |
| --- | --- | --- | --- |
| `rhs-companion-planting` | Three ways to use companion planting (RHS Grow Your Own), https://www.rhs.org.uk/advice/grow-your-own/features/companion-planting | Facts cited; © Royal Horticultural Society | 2026-10-23 |
| `wvu-companion-planting` | Companion Planting (West Virginia University Extension), https://extension.wvu.edu/lawn-gardening-pests/gardening/garden-management/companion-planting. New publisher. | Facts cited; © West Virginia University | 2026-10-23 |
| `uw-kenosha-companion-plants` | Companion Plants for the Vegetable Garden (University of Wisconsin Extension, Kenosha County), https://kenosha.extension.wisc.edu/files/2020/05/Companion-plants-article.pdf. Reproduces the North Dakota State Extension (Weinmann) list. | Facts cited; © Board of Regents of the University of Wisconsin System | 2026-10-23 |
| `arizona-art-of-companion-planting` | The Art of Companion Planting (University of Arizona Cooperative Extension, Yavapai County), https://extension.arizona.edu/sites/extension.arizona.edu/files/attachment/CompanionPlantingApr2023.pdf | Facts cited; © The University of Arizona | 2026-10-23 |
| `ucanr-companion-planting-chart` | Companion planting in the vegetable garden (UC Master Gardener Program, UC ANR), https://ucanr.edu/sites/default/files/2023-09/388577.pdf. Used only as a second source where it agrees. | Facts cited; © Regents of the University of California | 2026-10-23 |

**Included, and the wording relied on**
- Onion and garlic with bush and runner beans (bad): WVU "onions and beans should not be interplanted since onion plants stunt the growth of beans" (its chart also lists garlic); UW/ND "Garlic, onion, and shallot stunt the growth of beans". Onion with pea (bad): UW/ND "Onions stunt bean, pea". Caveat: a Cornell Cooperative Extension (Chemung) sheet says most "plants harming" claims have almost no scientific proof, though it lists the same onion and bean dislike; kept because two extension services state the effect directly.
- Tomato with potato, tomato with sweetcorn (bad): UW/ND "Corn and tomato are attacked by the same worm. Potatoes and tomatoes are attacked by the same blight."; the UC ANR chart lists both as incompatible.
- Tomato with bush bean (bad): Arizona "The tomatoes will very likely shade out the beans which need full sun."
- Sweetcorn with runner bean, sweetcorn with winter squash (good): RHS "The maize (sweetcorn) supports the beans, while the squash uses the space between the plants, shading the soil and suppressing weeds" (the three sisters system, which also names pumpkins; winter squash stands in for them). WVU says the same.
- Lettuce and radish with sweetcorn (good): RHS intercropping "fast-maturing plants such as lettuce and radish between bigger, slower-maturing plants ... sweetcorn", harvested before they are overshadowed.
- White clover with cabbage, cauliflower, kale, broccoli (good): RHS "covering the soil by growing a layer of low-growing clover and trefoil makes the plants less visible to the cabbage root fly" (for cabbage family plants such as cabbages and cauliflower). White clover only: red and crimson clover are tall.
- Coriander with basil and parsley (good): RHS "coriander has been found to sometimes deter unwanted insects in crops of basil and parsley".
- Lettuce, spinach, beetroot with tomato and sweet pepper (good): WVU "Interplant smaller cool season plants, such as spinach, beets, or lettuce, in between larger, slow-growing vegetables such as tomatoes or peppers ... the larger plants canopy will offer shade". A space and shade benefit, not pest control.

**Left out, and why**
- Dill and coriander with aubergine: the only source (Arizona slides summarising an Iowa State study) calls the results "indicative" not "conclusive", i.e. unproven. Dropped by controller ruling 11.
- Basil with tomato: Arizona and Kenosha state pest and flavour benefits, but Illinois Extension and Cornell call such pairings anecdotal. The University of Minnesota page (reported to mention thrips) returned HTTP 403 and could not be read, so nothing was taken from memory.
- Onion with carrot (carrot fly): RHS "has been claimed"; Arizona and Cornell are anecdotal.
- Garlic with strawberry/roses and alyssum with lettuce: RHS "proposed" (garlic); alyssum and marigold are not in the plant library.
- French marigold with tomato: RHS says tagetes deter whitefly and thrips, but "mixing tomatoes with other plants, without Tagetes, had a similar effect"; no marigold in the library either.
- Calendula and nasturtium with beans or tomatoes: RHS "in the hope of similar effects".
- Mature dill with tomato (bad), sage with cucumber (bad): North Dakota list only; Cornell Chemung lists them as unproven claims.
- Tomato with cabbage family (bad): UC ANR chart, WVU chart and Cornell list them as incompatible, but none states an effect or reason (ND names only kohlrabi, not in the library).
- Carrot, tomato, onion, chives, parsley, lettuce, radish and similar "compatible" chart lists (WVU, UC ANR, Cornell): charts without a stated effect. Cornell says the science "is often anecdotal" and Arizona says "companion planting is not a proven science"; a chart listing alone is not enough.
- Beans fixing nitrogen for corn and squash: said by WVU and Illinois, but RHS says it "is not clear" the three sisters system yields more; only the support and shade claims were kept. Broad bean and onion/garlic: pages say "beans" without naming broad bean, so it is not paired.

**Conflicts:** none between included sources. Where sources disagreed on whether an effect is real (basil with tomato; marigold with tomato), the pair was left out, as above.

## Hungarian names (2026-10-23)

`commonNamesHu` for all 154 plants (136 after the Wikipedia pass, 140 after the institutional pass, the last 14 by gardener decision; both below). The first name is the display name and the rest are search names, most common first. Each name was read directly from a Hungarian Wikipedia page (API and page HTML fetched with a browser user-agent) and cited as source id `huwiki-<page>` with `fieldSources.commonNamesHu`. Only the name is taken, no text; the licence string records that Wikipedia text is CC BY-SA 4.0.

- **Why Wikipedia.** It was the only Hungarian source that could be matched to a Latin binomial for most of the plants in a systematic way. The institutional sources named in the brief (ELTE Fuveszkert, Soroksar, Vacratot, MATE, NEBIH variety lists, termeszetvedelem.hu) were not searched plant by plant, so none is cited. This is the fallback the brief allows; the institutional pass (2026-10-25, below) added NÉBIH and AGROVOC afterwards.
- **Matching.** A page counts only when it shows the plant's Latin binomial next to the Hungarian name (lead sentence, taxobox or a species list on a genus page). For 122 plants the binomial redirects to the page (or the search found a dedicated page showing it). For 14 plants the name comes from a genus or list page that prints the binomial beside the name: kiwifruit and arctic kiwi (Küllőfolyondár), nanking cherry and beach plum (Prunus), highbush and lowbush blueberry (Áfonya), highbush cranberry (Bangita), saskatoon (Fanyarka), Japanese quince (Japánbirs), crimson clover (Here), wild strawberry (Eper nemzetség), runner bean and Siberian pea shrub (Mérgező növények listája), grape (Othello page: "Vitis labrusca (rókaszőlő)").
- **Pitfalls checked.** Kale is "Fodros kel" / "Leveles kel" (page: Brassica oleracea convar. acephala var. sabellica); "Kelkáposzta" (Savoy cabbage, var. sabauda) is not used. Runner bean is "Tűzbab" / "Török paszuly" (Phaseolus coccineus). Bush bean is "Zöldbab" / "Veteménybab" (Phaseolus vulgaris; "bokorbab" has no page, so it is not used). Courgette is "Cukkini" (Cucurbita pepo convar. giromontiina), not the species page "Termesztett tök". Sweet cherry carries "Cseresznyefa" first, because the page title "Vadcseresznye" is the wild name for the same species (Prunus avium).
- **Judgement calls.** Rhubarb ("Rebarbara") and parsley ("Petrezselyem") are genus pages whose taxobox shows Rheum rhabarbarum and Petroselinum crispum. Plum ("Nemes szilva") is reached by redirect from Prunus domestica but its lead does not print the binomial. Calamondin is on the page as × Citrofortunella microcarpa, a synonym of Citrus × microcarpa. Banana ("Étkezési banán") is Musa x paradisiaca on the Banán genus page.
- **Left without a name (18 at the time; 14 after the institutional pass)** because no Hungarian page showed the binomial with a name: american-hazelnut (a list gives only "floridai mogyoró", not used), american-persimmon (named since, AGROVOC), damson (Prunus insititia is only named in a poor list page; "Ringló" redirects to Prunus domestica; named since, NÉBIH and AGROVOC), daubentons-kale, feijoa, hyacinth-bean (named since, AGROVOC), leadplant, malabar-spinach (named since, AGROVOC), meyer-lemon, new-jersey-tea, northern-bayberry, persian-lime, ramps, red-mulberry, silver-buffaloberry, spicebush, sweet-cicely, walking-onion.

### Display-name order (final review, 2026-10-23)

Where the first name was a formal botanical form ("Közönséges ...", "Nemes ...", "Kerti ...", "Mezei ..."), the everyday name that the same cited Hungarian Wikipedia page gives (lead sentence or its listed alternative names) was moved to the front. No name was added from outside the cited page. Changed (old first name -> new): Mezei sóska -> Sóska ("vagy egyszerűen sóska"), Kerti eper -> Eper (lead: "az eper vagy kerti eper"; "Eper" added from the same page), Kerti sarkantyúka -> Kapucinusvirág, Nemes alma -> Házi alma ("nemes alma vagy házi alma"), Közönséges ördögcérna -> Goji bogyó ("goji bogyó néven is ismert"), Fekete törpeberkenye -> Arónia, Közönséges naspolya -> Naspolya, Kerti saláta -> Saláta ("vagy egyszerűen saláta").

Formal names left as they are because the cited page gives no everyday alternative: Közönséges komló, Közönséges spárga, Közönséges cickafark, Közönséges levendula, Közönséges mirtusz, Közönséges dió, Nemes körte, Nemes szilva, Közönséges paprika, Európai mogyoró, Kerti kakukkfű, Kerti izsóp, Mezei kakukkfű. Eight of these, and Házi alma, took NÉBIH's everyday name as display name on 2026-10-25 (below).

### Institutional sources (2026-10-25)

Two institutional sources were searched plant by plant against the Latin binomial. A name counts only where the source prints it beside the binomial. Only names are taken, no text.

- **NÉBIH Nemzeti Fajtajegyzék** (National List of Varieties, Hungary's food chain safety office): the 2019 fruit and grape list (`nebih-nfj-2019-fruit`) and the 2016 vegetable and herb list (`nebih-nfj-2016-veg`). Each species heading prints the Hungarian name, the binomial and the English name. Rootstock rows ("alany") and rows whose binomial covers several crops (Brassica oleracea, Beta vulgaris, Cucurbita pepo, Phaseolus vulgaris) were matched only where the row names the same crop group, so kale, chard, courgette and bush bean are not cited.
  - Cited for an existing name (36 plants): apricot, asian-pear, black-currant, gooseberry, jostaberry, medlar, peach, quince, red-raspberry, sea-buckthorn, sour-cherry, strawberry; aubergine, basil, beetroot, broad-bean, broccoli, cabbage, carrot, cauliflower, coriander, cucumber, dill, garlic, horseradish, leek, lemon-balm, lovage, onion, parsley, parsnip, radish, runner-bean, spinach, tarragon, thyme.
  - New display name (formal name kept as a search name; gardener decision 2026-10-25): Közönséges dió -> Dió, Európai mogyoró -> Mogyoró, Nemes körte -> Körte, Nemes szilva -> Szilva, Közönséges spárga -> Spárga, Közönséges paprika -> Paprika, Közönséges levendula -> Levendula, Házi alma -> Alma, Kerti izsóp -> Izsóp.
  - New search name only: Fekete berkenye (aronia), Feketebodza (elder), Kerti áfonya (highbush blueberry), Cseresznye (sweet cherry), Gesztenye (sweet chestnut), Fejes saláta (lettuce), Zöldborsó (pea), Csemegekukorica (sweetcorn), Majoranna (sweet marjoram), Muskotálytök (winter squash).
  - New name: Kökényszilva (damson; printed for both Prunus insititia and P. domestica subsp. insititia).
- **AGROVOC** (FAO's multilingual agricultural thesaurus; `agrovoc-<concept>`): Hungarian labels on the species concept. Hungarian is not one of FAO's six languages, so the labels are © the contributing institution, not CC BY. New names: damson (Kökényszilva, c_6286), hyacinth bean (Jácintbab, Sisakbab, c_4125), american persimmon (Amerikai datolyaszilva, c_2306), malabar spinach (Malabári spenót, Fehér bazella, c_834). AGROVOC has red mulberry and feijoa but no Hungarian label.
- **Searched, nothing usable:** ELTE Füvészkert (only a herbarium specimen dataset), Vácrátót botanical garden (no public plant list), Priszter: Növényneveink (1986; print only). The 14 plants still without a name (american-hazelnut, daubentons-kale, feijoa, leadplant, meyer-lemon, new-jersey-tea, northern-bayberry, persian-lime, ramps, red-mulberry, silver-buffaloberry, spicebush, sweet-cicely, walking-onion) gave English-only results and probably have no established Hungarian name. The gardener named them on 2026-10-27 (below).

### Gardener Hungarian names (2026-10-27)

The 14 plants left without a name after the institutional pass were named by the gardener, without a published citation. Each gets one display name and no search names, cited as source `gardener-hu-2026-10-27` (which links back to this section) in `fieldSources.commonNamesHu`. Treat these as project names, not established Hungarian usage; replace any of them if a source that prints a name beside the binomial turns up.

| Plant | Latin | Hungarian name |
|---|---|---|
| american-hazelnut | Corylus americana | Amerikai mogyoró |
| daubentons-kale | Brassica oleracea 'Daubenton's' | Zöld évelő káposzta |
| feijoa | Acca sellowiana | Mirtuszdió |
| leadplant | Amorpha canescens | Molyhos gyalogakác |
| meyer-lemon | Citrus x limon 'Meyer' | Meyer-citrom |
| new-jersey-tea | Ceanothus americanus | Fehér táskavirág |
| northern-bayberry | Morella pensylvanica | Északi viaszbogyó |
| persian-lime | Citrus x latifolia | Perzsa lime |
| ramps | Allium tricoccum | Amerikai medvehagyma |
| red-mulberry | Morus rubra | Vörös eperfa |
| silver-buffaloberry | Shepherdia argentea | Szirtiezüstfa |
| spicebush | Lindera benzoin | Vad szegfűszeg |
| sweet-cicely | Myrrhis odorata | Illatos mirhafű |
| walking-onion | Allium x proliferum | Fahagyma |
