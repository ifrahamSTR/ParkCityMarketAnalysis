# Park City, UT STR buy-box presentation webpage

**Live:** https://ifrahamstr.github.io/ParkCityMarketAnalysis/ (repo `ifrahamSTR/ParkCityMarketAnalysis`, GitHub Pages from `main`, root).

Plain HTML/CSS/JS with no build step and no framework. To run it locally, start any static server in this directory (for example `python3 -m http.server 8000`) and open `index.html`.

This is the same template as the Charlotte, NC site (`../../../Charlotte/webpage`, live at ifrahamstr.github.io/CharlotteMarketAnalysis). It keeps the same section order, the same `data.js` → `render.js`/`charts.js` → `main.js` flow, and the same CSS tokens and components. The analysis is Park City's own.

## Status

- **Revised 2026-09-29: distilled from seven region-first boxes to two product boxes.** The seven clusters are now reference geography only; the page no longer treats them as acquisition strategies. The notebook's "Distilling the structure" cells hold the evidence (Fisher exact tests):
  - **Large Group Home (primary): 5BR+, sleeps 14+, location-flexible.** 11 of 26 reach the Top 10%, and 10 of those 11 are more than 2 km from a lift.
  - **Ski-Access Home (secondary): 3–4BR within 2 km of a lift base.** 4 of 15 reach the Top 10%, against 0 of 46 for 3–4BR homes farther out (p = 0.003). 73% reach the Top 25%, against 15% (p < 0.001).
  - Together the two boxes hold **all 15** Top 10% listings.
  - **Excluded:** 1–2BR anywhere, and 3–4BR beyond 2 km of a lift.
- **Section 6 (Buy-Box Deep Dive) is intentionally blank**, per the original request.
- **Regulatory hold:** Summit County proposed nightly-rental bans in Summit Park and Tollgate Canyon (Pine Meadow) in June 2026. They affect 3 of the 11 Top 10% group homes. No final vote had been found as of 2026-09-28.

## Page structure (after the distillation)

1. **Preliminary direction:** two product cards (spec, must-haves, where) plus one "not a target" line.
2. **Market:** hero, visitor stats, watch-outs, revenue distribution, and one **performance-drivers table**. Amenity rows are compared inside 4BR+ so size isn't credited to amenities.
3. **Location:** the map (tier × area filter, plus a 2 km ski-access ring layer), a **size × ski-access matrix**, a lift-distance scatter, one **seven-area reference table** with a size-adjusted index, and a three-bullet conclusion.
4. **Demographics:** market-wide and by bedroom count. The by-region chart was removed.
5. **Regulations:** a one-line overview plus one jurisdiction table (previously seven cards).
7. **Coverage:** one table.

Removed from the page but kept in the notebook: the cluster methodology, the full region scorecard, the region × bedroom heat grid, lift-band table detail, seven region profiles, the Top 10% roster and region demographics. Any comparison resting on fewer than 15 listings is greyed and tagged "directional" (`SMALL_N` in `js/research.js`).

## Where the numbers come from

```
Park City - UT.xlsx (Cleaned_Data, 145 listings, 2026-07-29 snapshot)
  └─ ../notebooks/pc_common.py              load + Ward k=7 region assignment + tiers
  └─ ../notebooks/build_overview_notebook.py  writes parkcity_overview.ipynb
       (execute with nbconvert)             → parkcity_overview_map.html, region_stats.json
  └─ scripts/generate_webpage_data.py       → js/region_data.js (generated, do not hand-edit)
                                            → assets/overview/parkcity_overview_map.html
                                            → data/listings.json
```

Regenerate everything with:

```bash
cd ../notebooks && python build_overview_notebook.py && jupyter nbconvert --to notebook --execute --inplace parkcity_overview.ipynb
cd ../webpage && python scripts/generate_webpage_data.py
```

These commands used the `airbnb_visual_tier` conda env, which has pandas, scikit-learn, folium, scipy and nbconvert.

`js/data.js` holds prose and config only. Where a sentence there quotes a number, it was checked against the notebook output. If the workbook changes, re-read the prose, because the generated numbers will update but the sentences will not.

## Cluster method (reference geography)

The areas come from Ward agglomerative clustering on km-projected lat/long (k = 7), named by centroid (`pc_common._name_cluster`). k = 4–10 were tested, and higher k only split off 3–5-listing pockets. On the page this is a one-line note under the map; the full method stays in the notebook. Hit rates use the market-wide thresholds (P90 = $120,568, P75 = $72,247). Lift distance is measured to the nearest of six lift bases (`../notebooks/landmarks.json`), and the ski-access zone is set at 2 km (`ACCESS_KM` in the notebook). Regulations were researched 2026-09-28; see `STR_REGULATIONS` in `js/data.js` for the sourced detail.

## Code changes from the Charlotte template

- `renderDeclarations()` renders the two product cards from `BUY_BOXES` (with a `spec` list) and `REGION_RESEARCH.segments`, and `NOT_TARGETS` below them.
- `renderMarketOverview()` puts the photo beside the identity and demand drivers; stats and watch-outs run full width underneath.
- `renderRegulationsSection()` renders `STR_REGULATIONS.rows` as one table, and `renderPendingBuyBoxes()` renders `COVERAGE_ROWS` as one table.
- `js/research.js` holds the drivers table, the size × ski-access matrix, the area table and the location conclusion.
- Charlotte's `map.js` was dropped; the folium map is embedded instead.

## Not yet done

- Section 6 deep dives: comp sets, revenue tiering, amenity and photo evidence.
- Address-level regulatory checks for any candidate property.
