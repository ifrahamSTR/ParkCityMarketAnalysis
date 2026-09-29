# Park City, UT STR buy-box presentation webpage

**Live:** https://ifrahamstr.github.io/ParkCityMarketAnalysis/ (repo `ifrahamSTR/ParkCityMarketAnalysis`, GitHub Pages from `main`, root).

Plain HTML/CSS/JS with no build step and no framework. To run it locally, start any static server in this directory (for example `python3 -m http.server 8000`) and open `index.html`.

This is the same template as the Charlotte, NC site (`../../../Charlotte/webpage`, live at ifrahamstr.github.io/CharlotteMarketAnalysis). It keeps the same section order, the same `data.js` → `render.js`/`charts.js` → `main.js` flow, and the same CSS tokens and components. The analysis is Park City's own.

## Status

- **Two unranked product buy boxes; the seven clusters are reference geography only.** Ranking waits for the Section 6 deep dives (price, inventory, margins, regulation).
  - **Buy Box 1 · Large Group Home:** 5BR+ sleeping 14+, anywhere legal (product-first). 11 of 26 reach the Top 10%, and 10 of those 11 are more than 2 km from a lift.
  - **Buy Box 2 · Ski-Access Home:** 3BR+ within 2 km of a lift base (location-first). 5 of 17 reach the Top 10%.
  - The boxes overlap on 1 listing and together hold all 15 Top 10% listings.
- **The Ski-Access definition was tested on 2026-09-29** and changed from 3–4BR to **3BR+** (notebook: "Validating the Ski-Access definition"):
  - Every bedroom bucket was compared near vs. away from the lifts, with a size-adjusted index and Fisher / Mann-Whitney tests.
  - A log-revenue OLS gives the near-lift effect as ×1.84 (p < 0.001) after controlling for bedrooms. The extra effect at 5BR+ is ×1.16 (p = 0.67), indistinguishable from zero.
  - Distance thresholds from 1 to 5 km were tested, along with within-size Spearman gradients: 3–4BR ρ = −0.52 (p < 0.001); 5BR+ ρ = −0.20 (p = 0.29).
  - **3BR floor:** 1–2BR homes gain from ski access but never reach target level.
  - **No cap:** there is no evidence the premium stops at 5BR+, only N=2 to measure it with. Capping at 4BR would drop a Top 25% 6BR (sleeps 10) near a lift that fits neither box.
- **Section 7 (Coverage) is removed from the page**, because it repeated Section 1. The segment stats remain in `region_data.js`.
- **Section 6 has two pre-comp-set deep dives (built 2026-09-29).** See "Section 6" below. Comp sets are pending analyst input.
- **Regulatory hold:** Summit County's proposed nightly-rental bans (June 2026) in Summit Park and Tollgate Canyon (Pine Meadow) affect 3 of the 11 Top 10% group homes.

## Page structure

1. **Preliminary direction:** two unranked product cards, an overlap note, and a "not a target" line.
2. **Market:** hero, visitor stats, watch-outs, revenue distribution, and the drivers table. Drivers are labeled as **screening signals (association), not proven uplift**, and amenity rows are compared inside 4BR+.
3. **Location:**
   - the map: click an area outline for a popup with its generated stats and a small-N warning; 2 km ski-access rings;
   - **the centerpiece:** a bedrooms × ski-access table (1–2 / 3 / 4 / 3–4 / 5+ / 3BR+) with a size-adjusted index and a one-line read;
   - the definition-test bullets beside a revenue vs. lift-distance scatter, colored by size;
   - a collapsed reference-area table;
   - a three-bullet acquisition conclusion.
4. **Demographics:** market-wide and by bedroom count.
5. **Regulations:** one jurisdiction table.

Removed from the page but kept in the notebook: the cluster methodology, the full scorecards, the region × bedroom grid, lift-band detail, region profiles, the Top 10% roster and region demographics. Anything resting on fewer than 15 listings is greyed and tagged "directional" (`SMALL_N` in `js/research.js`).

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

## Section 6 — Buy-box deep dives (pre-comp-set)

Pipeline: `../notebooks/build_deepdive_notebook.py` writes and executes `parkcity_buybox_deepdive.ipynb`, which produces two outputs:

- `deepdive_stats.json`, which `scripts/generate_webpage_data.py` turns into `js/deepdive_data.js` (generated);
- `assets/deepdive/<box>/*.jpg`, resized copies of the hand-picked reference photos.

Sources:

- `../parkcity_market_enriched.parquet` (the same data as the enriched `.xlsx`) — STR data plus visual features;
- the `Base_Table` description text — keyword flags, labelled "(listing text)" on the page;
- the per-photo feature parquet and the already-downloaded photos in `Tools/airbnb_visual_market/data/raw_photos/parkcity/`. Nothing was re-downloaded.

Rendering:

- `js/deepdive_content.js` attaches `overview` and `pendingSections` to each `BUY_BOXES` entry. It reads every number from `DEEPDIVE` at render time.
- `js/deepdive.js` holds the table and photo helpers.
- `render.js`'s pending-section renderer gained an `html` field for generated tables, and `pairLabels` so the paired-comparison components (originally Charlotte's Lakefront vs. Castaway) work for any two listings.

Structure and method:

- **Structure:** follows Charlotte Lake (hero → grouped sections → recap), with Clearwater's "buy the space vs. add the equipment" and Must-Have / Nice-to-Have / Auto-Add logic. The two boxes deliberately differ:
  - Large Group Home: a product and execution spec, with capacity, group usability, architecture, outdoor program and a deeper execution section;
  - Ski-Access Home: a location spec, covering walkability, the ski areas and a minimum product.
- **Comparisons:** all are within the product population. Anything with fewer than 5 listings on a side is tagged "directional".
- **Visual concepts:** tested after adjusting for bedrooms, and then again after also adjusting for bathrooms, entertainment count and hot tub. Result:
  - in the group home, only "resort-like" survives full adjustment;
  - in the ski-access home, only "luxury interior" is near significance;
  - the overall Visual Score survives in neither, so it is explicitly not a filter.
- **Photos:** picked by hand (`PHOTO_PICKS`) after viewing every gallery in both populations. They are reference examples, never comps. Two paired case studies hold the product fixed:
  - Group: *Luxury Home, Family Friendly, Sleeps 16* vs. *Luxury family gathering retreat*;
  - Ski: *Chic Park City Retreat* vs. *Walk to Ski Lifts*.
- **Comp Set Analysis** is a visible pending section in each tab. When the analyst comp set arrives, replace that section with Charlotte-style `compSetComparison` / Alexandria / revenue-range content. Purchase price is marked pending.

## Cluster method (reference geography)

The areas come from Ward agglomerative clustering on km-projected lat/long (k = 7), named by centroid (`pc_common._name_cluster`). k = 4–10 were tested, and higher k only split off 3–5-listing pockets. On the page this is a one-line note under the map; the full method stays in the notebook. Hit rates use the market-wide thresholds (P90 = $120,568, P75 = $72,247). Lift distance is measured to the nearest of six lift bases (`../notebooks/landmarks.json`), and the ski-access zone is set at 2 km (`ACCESS_KM` in the notebook). Regulations were researched 2026-09-28; see `STR_REGULATIONS` in `js/data.js` for the sourced detail.

## Code changes from the Charlotte template

- `renderDeclarations()` renders the two product cards from `BUY_BOXES` (with a `spec` list) and `REGION_RESEARCH.segments`, and `NOT_TARGETS` below them.
- `renderMarketOverview()` puts the photo beside the identity and demand drivers; stats and watch-outs run full width underneath.
- `renderRegulationsSection()` renders `STR_REGULATIONS.rows` as one table. Section 7 and `renderPendingBuyBoxes()` were removed.
- `main.js` calls `renderDeepDiveTabs()` / `renderDeepDive()` again for Section 6. `compStatsTable` / `compPhotoRow` take `labels`.
- `js/research.js` holds the drivers table, the bedrooms × ski-access table (from `REGION_RESEARCH.defTest`), the definition test, the collapsed area table and the location conclusion. The area popups are built in the notebook's map cell from the same computed stats.
- Charlotte's `map.js` was dropped; the folium map is embedded instead.

## Not yet done

- Section 6 comp sets (analyst-provided), comp-set revenue range, and purchase-price underwriting.
- Address-level regulatory checks for any candidate property.
