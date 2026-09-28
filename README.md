# Park City, UT STR buy-box presentation webpage

Plain HTML/CSS/JS with no build step and no framework. To run it locally, start any static server in this directory (for example `python3 -m http.server 8000`) and open `index.html`.

This is the same template as the Charlotte, NC site (`../../../Charlotte/webpage`, live at ifrahamstr.github.io/CharlotteMarketAnalysis). It keeps the same section order, the same `data.js` → `render.js`/`charts.js` → `main.js` flow, and the same CSS tokens and components. The analysis is Park City's own.

## Status

- **Sections 1–5 and 7 are built. Section 6 (Buy-Box Deep Dive) is intentionally blank**, per the request that created this page. It shows only its kicker and heading. `main.js` does not call `renderDeepDiveTabs()`/`renderDeepDive()`, but `render.js` still carries the full deep-dive code from Charlotte for when a deep dive is built.
- **Three buy boxes are named and scoped from the cluster research.** Each one is a region paired with the product that wins there, because the size-controlled table shows region alone isn't enough:
  - Mountain Cabins: Summit Park, Pinebrook and Pine Meadow, 4BR+.
  - Heber Valley Group Homes: 5BR+, sleeps 14+.
  - Old Town and Deer Valley Ski Access: 3BR+.
- **The Mountain Cabin box is flagged "regulatory hold".** Summit County, UT proposed nightly-rental bans in Summit Park and Tollgate Canyon (Pine Meadow) in June 2026. No final vote had been found as of 2026-09-28. Re-check before building its deep dive.
- **One watch-list segment and two exclusions** appear in Section 7:
  - Watch list: Jordanelle and Hideout 4BR+.
  - Excluded: all 1–2BR, and Snyderville Basin plus Midway.

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

## Cluster method (Section 3)

Charlotte's regions came from a teammate's hand classification. No equivalent exists for Park City, so here the regions are **data-derived, then named**:

- **Clustering:** Ward agglomerative clustering on km-projected lat/long, with **k = 7**.
- **Choosing k:** k = 4–10 were tested with KMeans and Ward. Their silhouette scores are near-identical at every k. k = 7 is the first k where every cluster is one real place. Higher k values only split off 3–5-listing sub-pockets, which are documented inside the region profiles:
  - Timber Lakes.
  - Canyons/Kimball versus Silver Creek.
  - Rural Coalville.
- **Naming:** clusters are named by their centroid (`pc_common._name_cluster`), so re-runs label them stably.
- **Hit rates:** these are **market-wide** (P90 = $120,568, P75 = $72,247), the same convention as Charlotte, Shenandoah and Clearwater.
- **Lift distance:** measured to the nearest of six lift bases (coordinates in `../notebooks/landmarks.json`).

Section 3 goes further than Charlotte's map and bullets. It adds:

- the method notes;
- a region scorecard;
- a size-controlled heat table (region × bedroom count against the market median);
- a scatter of revenue per bedroom against lift distance, with a banded table;
- seven region profile cards;
- the Top 10% roster.

This code lives in `js/research.js` and the new charts in `js/charts.js`.

The map is a folium map built in the notebook. It uses the same combined **AND** tier × region filter as Charlotte's. It also has:

- dashed region outlines (buffered convex hulls, with the scorecard on hover);
- region labels;
- small badge landmarks, so they don't cover listings: ski bases, towns, lakes and parks, attractions, airports;
- an optional terrain basemap.

## Regulations (Section 5)

The market spans several jurisdictions, so `STR_REGULATIONS` is structured as one overview card plus six jurisdiction cards:

- Park City;
- unincorporated Summit County;
- Heber City;
- Wasatch County, MIDA and Hideout;
- Midway;
- Kamas and Coalville.

Each card keeps Charlotte's categories: tier, permit and residency, operating limits, investor notes. Items marked "unverified" came only from secondary sources or from official pages that could not be loaded.

Beware of search results about **Summit County, Colorado**. Its caps and waitlists don't apply here.

## Code changes from the Charlotte template

- The Section 2 heading uses `MARKET_NAME`. Section 2 also renders `MARKET_OVERVIEW.watchOuts`: the 2025/26 record-low snow year, and Sundance moving to Boulder from 2027.
- `renderDeclarations()` pulls each box's stats from `REGION_RESEARCH.segments[box.segmentKey]` (P25–P75 revenue chip, N, median, hit rates) and adds a "Regulatory status" row. Its CTA points at `#region-profiles`, because Section 6 is blank.
- `renderPendingBuyBoxes()` supports "Pending", "Pending · regulatory hold", "Watch list" and "Excluded" eyebrows, and shows segment stats when a segment is attached.
- `renderRegulationsSection()` renders an overview card, a region-to-jurisdiction note, and a grid of jurisdiction cards. Sources are linked.
- Charlotte's `map.js` (native Leaflet map) was dropped, because Section 3 uses the embedded folium map. `research.js` defines its own `escapeHtml`.

## Not yet done

- Section 6 deep dives: comp sets, revenue tiering, amenity and photo evidence.
- Address-level regulatory checks for any candidate property.
- Deployment. No GitHub repo or Pages site has been created for this market yet.
