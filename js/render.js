/**
 * Presentation logic. Builds every DOM component from data.js; never hardcodes
 * buy-box content. Mirrors the reference site's ddBlock/photoFigure pattern.
 */

// ---------------------------------------------------------------------------
// Formatting / DOM helpers
// ---------------------------------------------------------------------------
function fmtCurrency(n) {
  if (n == null || isNaN(n)) return "—";
  return "$" + Math.round(n).toLocaleString("en-US");
}
function fmtPct(n) {
  if (n == null || isNaN(n)) return "—";
  return (n * 100).toFixed(1) + "%";
}
function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html != null) node.innerHTML = html;
  return node;
}
function listHtml(items) {
  return "<ul>" + items.map((i) => "<li>" + i + "</li>").join("") + "</ul>";
}

// ---------------------------------------------------------------------------
// Image system: photo(...) objects render a real <img>; pendingPhoto(...)
// objects render a "photo pending — view on Airbnb" link card.
// ---------------------------------------------------------------------------
function pendingImageCard(ref, opts) {
  opts = opts || {};
  const a = el("a", "img-placeholder" + (opts.small ? " img-placeholder--small" : ""));
  a.href = ref.url || "#";
  a.target = "_blank";
  a.rel = "noopener";
  a.innerHTML =
    '<span class="img-placeholder__label">' + (ref.label || "Photo pending") + "</span>" +
    '<span class="img-placeholder__cta">Photo pending — view on Airbnb ↗</span>';
  return a;
}

function photoFigure(p, opts) {
  opts = opts || {};
  // opts.wide: for analysis charts (wide multi-panel figures) rather than
  // property photos -- the default photo-figure crops every image to a 4:3
  // aspect ratio via object-fit:cover, which badly clips a wide chart.
  const figure = el("figure", "photo-figure" + (opts.small ? " photo-figure--small" : "") + (opts.wide ? " photo-figure--wide" : ""));
  const button = el("button", "photo-figure__trigger");
  button.type = "button";
  const img = el("img");
  img.src = p.file;
  img.alt = p.alt || "";
  img.loading = "lazy";
  img.decoding = "async";
  button.appendChild(img);
  button.addEventListener("click", () => openLightbox(p.file, p.alt, p.caption));
  figure.appendChild(button);
  if (p.caption && !opts.noCaption) {
    figure.appendChild(el("figcaption", null, p.caption));
  }
  return figure;
}

function renderImage(ref, opts) {
  if (!ref) return el("div", null, "");
  if (ref.pending) return pendingImageCard(ref, opts);
  return photoFigure(ref, opts);
}

// Full-width, uncropped figures -- for wide analysis charts (multi-panel
// figures), which the 4:3-cropped photo grid below badly clips. One figure
// per row, not a grid, so a wide chart gets its natural aspect ratio back.
function renderWideImageBlock(images, opts) {
  opts = Object.assign({}, opts, { wide: true });
  const wrap = el("div", "dd-block__wide-images");
  (images || []).forEach((img) => wrap.appendChild(renderImage(img, opts)));
  return wrap;
}

function renderImageGrid(images, opts) {
  opts = opts || {};
  const grid = el("div", "dd-block__images" + (opts.className ? " " + opts.className : ""));
  (images || []).forEach((img) => grid.appendChild(renderImage(img, opts)));
  return grid;
}

// ---------------------------------------------------------------------------
// Lightbox
// ---------------------------------------------------------------------------
function openLightbox(src, alt, caption) {
  const lightbox = document.getElementById("lightbox");
  document.getElementById("lightbox-image").src = src;
  document.getElementById("lightbox-image").alt = alt || "";
  document.getElementById("lightbox-caption").textContent = caption || "";
  lightbox.classList.add("lightbox--open");
  lightbox.setAttribute("aria-hidden", "false");
}
function closeLightbox() {
  const lightbox = document.getElementById("lightbox");
  lightbox.classList.remove("lightbox--open");
  lightbox.setAttribute("aria-hidden", "true");
  document.getElementById("lightbox-image").src = "";
}

// ---------------------------------------------------------------------------
// Small UI atoms
// ---------------------------------------------------------------------------
function pendingBadge(text) {
  return '<span class="badge badge--pending">' + (text || "Pending verification") + "</span>";
}

/**
 * Inline map embed — used where a source map should live inside the page
 * itself rather than behind an external link (e.g. 3BR Location Guidance,
 * 3BR Comp Set Analysis).
 */
function renderEmbeddedMap(url, opts) {
  opts = opts || {};
  const frame = el("iframe", "embedded-map" + (opts.className ? " " + opts.className : ""));
  frame.src = url;
  frame.loading = "lazy";
  frame.title = opts.title || "Interactive map";
  return frame;
}

/**
 * Styled link button for the two real Alexandria compset links (currently
 * only supplied for the 1-2BR buy box). Renders a disabled "(pending)" state
 * if `url` is falsy, matching the reference site's convention.
 */
function alexandriaButton(label, url) {
  const a = el("a", "btn btn--alexandria" + (url ? "" : " btn--pending"));
  a.textContent = url ? label : label + " (pending)";
  a.href = url || "#";
  if (url) {
    a.target = "_blank";
    a.rel = "noopener";
  } else {
    a.setAttribute("aria-disabled", "true");
  }
  return a;
}

/**
 * Generic labeled-row + image-grid block builder used everywhere. `rows` is an
 * array of [label, value] pairs; rows with a null/empty value are silently
 * skipped so a partial source field renders as absent, not broken.
 */
function ddBlock(title, rows, images, variant) {
  const wrap = el("div", "dd-block" + (variant ? " dd-block--" + variant : ""));
  if (title) wrap.appendChild(el("h3", "dd-block__title", title));
  const rowsWrap = el("div", "dd-rows");
  (rows || []).forEach(([label, value]) => {
    if (value == null || value === "") return;
    const row = el("div", "dd-row");
    row.appendChild(el("div", "dd-row__label", label));
    row.appendChild(el("div", "dd-row__value", value));
    rowsWrap.appendChild(row);
  });
  if (rowsWrap.children.length) wrap.appendChild(rowsWrap);
  if (images && images.length) wrap.appendChild(renderImageGrid(images));
  return wrap;
}

// ---------------------------------------------------------------------------
// Section 1 — Buy-box declarations
// ---------------------------------------------------------------------------
function fmtK(n) {
  return "$" + Math.round(n / 1000) + "k";
}

function renderDeclarations() {
  const host = document.getElementById("buybox-declarations");
  if (!host) return;
  host.innerHTML = "";
  host.classList.add("declarations-grid--2");
  BUY_BOXES.forEach((box) => {
    // Stats come from the generated REGION_RESEARCH.segments
    // (parkcity_overview.ipynb "Buy-box segments"), never hand-copied.
    const seg = REGION_RESEARCH.segments[box.segmentKey];
    // Unranked on purpose: which box is the better acquisition strategy
    // depends on price, inventory, margins and regulation (Section 6).
    const card = el("div", "declaration-card declaration-card--lead");
    card.appendChild(el("p", "declaration-card__eyebrow", box.label));
    card.appendChild(el("h2", null, box.name));
    const stats = el("div", "bb2-stat-row bb2-stat-row--4 decl-stats");
    [
      [fmtK(seg.p25) + "–" + fmtK(seg.p75), "Revenue (P25–P75)"],
      [fmtK(seg.median), "Median revenue"],
      [Math.round(seg.top10_rate) + "%", "Reach the Top 10% (" + seg.top10_n + " of " + seg.N + ")"],
      [Math.round(seg.top25_rate) + "%", "Reach the Top 25%"],
    ].forEach(([v, l]) => {
      const c = el("div", "bb2-stat");
      c.appendChild(el("div", "bb2-stat__value", v));
      c.appendChild(el("div", "bb2-stat__label", l));
      stats.appendChild(c);
    });
    card.appendChild(stats);
    card.appendChild(el("p", "declaration-card__thesis", box.thesis));
    const dl = el("dl", "declaration-card__specs");
    box.spec.forEach(([k, v]) => {
      dl.appendChild(el("dt", null, k));
      dl.appendChild(el("dd", null, v));
    });
    card.appendChild(dl);
    host.appendChild(card);
  });
  const note = document.getElementById("not-targets");
  if (note) note.innerHTML = OVERLAP_NOTE + " " + NOT_TARGETS;
}

// ---------------------------------------------------------------------------
// Section 2 — Market context
// ---------------------------------------------------------------------------
function renderMarketOverview() {
  const host = document.getElementById("market-overview-body");
  if (!host) return;
  host.innerHTML = "";
  // Photo + identity/attractions side by side; visitor stats and demand
  // watch-outs run full width underneath so the photo column isn't left
  // with a tall blank panel next to a long text column.
  const hero = el("div", "bb2-hero");
  if (MARKET_OVERVIEW.heroImage) {
    const media = el("div", "bb2-hero__media");
    media.appendChild(renderImage(MARKET_OVERVIEW.heroImage));
    hero.appendChild(media);
  } else {
    hero.classList.add("bb2-hero--no-media");
  }
  const body = el("div", "bb2-hero__body");
  body.appendChild(el("h3", null, MARKET_NAME));
  const chipRow = el("div", "bb2-chip-row");
  MARKET_OVERVIEW.chips.forEach((c) => chipRow.appendChild(el("span", "bb2-chip", c.label)));
  body.appendChild(chipRow);
  body.appendChild(el("h3", "subsection-title", "Demand Drivers"));
  body.appendChild(el("div", null, listHtml(MARKET_OVERVIEW.attractions)));
  hero.appendChild(body);
  host.appendChild(hero);

  const below = el("div", "market-below");
  const stats = el("div");
  stats.appendChild(el("p", "market-below__head", "<strong>" + MARKET_OVERVIEW.visitorStats.headline + "</strong>"));
  const statRow = el("div", "bb2-stat-row");
  MARKET_OVERVIEW.visitorStats.breakdown.forEach((s) => {
    const card = el("div", "bb2-stat");
    card.appendChild(el("div", "bb2-stat__value", s.value));
    card.appendChild(el("div", "bb2-stat__label", s.label));
    statRow.appendChild(card);
  });
  stats.appendChild(statRow);
  below.appendChild(stats);
  const watch = el("div");
  watch.appendChild(el("p", "market-below__head", "<strong>Demand watch-outs</strong>"));
  watch.appendChild(el("div", "watch-outs", listHtml(MARKET_OVERVIEW.watchOuts)));
  below.appendChild(watch);
  host.appendChild(below);
  const sources = el("p", "market-sources");
  sources.innerHTML = "Sources: " + MARKET_OVERVIEW.sources.map((s) => '<a href="' + s.url + '" target="_blank" rel="noopener">' + s.label + "</a>").join(" · ");
  host.appendChild(sources);
}

// ---------------------------------------------------------------------------
// Section 3 — Location analysis interpretation. The map itself is now the
// embedded, self-contained cluster+landmark map built in
// charlotte_overview.ipynb (assets/overview/charlotte_overview_map.html,
// via the <iframe> in index.html) rather than a native Leaflet map driven by
// map.js/data/listings.json -- that map already carries its own legend and
// layer-toggle controls, so this just prints the market-wide takeaway
// sentence plus a compact one-line-per-cluster bullet list underneath.
// ---------------------------------------------------------------------------
function renderLocationInterpretation() {
  const host = document.getElementById("map-interpretation");
  if (host) host.innerHTML = MAP_CONFIG.marketInterpretation;
}

// ---------------------------------------------------------------------------
// Section 4 — Traveller Demographics prose (charts themselves live in charts.js)
// ---------------------------------------------------------------------------
function renderDemographics() {
  const host = document.getElementById("demographics-intro-body");
  if (!host) return;
  host.innerHTML = "";
  host.appendChild(el("p", null, DEMOGRAPHICS_NOTE));
}

// ---------------------------------------------------------------------------
// Section 5 — Pending buy boxes
// ---------------------------------------------------------------------------
// Section 7 (Buy-Box Coverage) is removed from this page for now: it only
// repeated Section 1. The segment stats remain in region_data.js.

// ---------------------------------------------------------------------------
// Section 4 — Deep dive tabs + content
// ---------------------------------------------------------------------------
function renderDeepDiveTabs() {
  const host = document.getElementById("deep-dive-tabs");
  if (!host) return;
  host.innerHTML = "";
  // The initially-shown deep dive is the first "developed" box (see main.js),
  // not necessarily BUY_BOXES[0] -- a market can have pending boxes earlier
  // in bedroom-count order than its one developed box, so the default-active
  // tab has to match that same box, not just index 0.
  const defaultBox = BUY_BOXES.find((b) => b.status === "developed") || BUY_BOXES[0];
  BUY_BOXES.forEach((box) => {
    const btn = el("button", "tab" + (box === defaultBox ? " tab--active" : ""), box.label);
    btn.type = "button";
    btn.addEventListener("click", () => {
      host.querySelectorAll(".tab").forEach((t) => t.classList.remove("tab--active"));
      btn.classList.add("tab--active");
      renderDeepDive(box);
    });
    host.appendChild(btn);
  });
}

// --- Block builders, one per deep-dive subsection ---

function overviewBlock(box) {
  const o = box.overview;
  // A pending box's overview (Downtown/Uptown especially) may not have a
  // hero photo yet -- skip the whole media panel rather than rendering an
  // empty <div> into it, and drop the grid down to a single column so the
  // body doesn't leave a blank column-width gap next to it.
  const hero = el("div", "bb2-hero" + (o.heroImage ? "" : " bb2-hero--no-media"));
  if (o.heroImage) {
    const media = el("div", "bb2-hero__media");
    media.appendChild(renderImage(o.heroImage));
    hero.appendChild(media);
  }
  const body = el("div", "bb2-hero__body");
  if (o.statusBadge) body.appendChild(el("p", "bb2-hero__status", o.statusBadge));
  body.appendChild(el("h3", "bb2-hero__title", box.name));
  body.appendChild(el("p", "bb2-hero__thesis", o.thesis));
  if (o.whyItWorks) body.appendChild(el("p", "bb2-hero__why", "<strong>Why this works:</strong> " + o.whyItWorks));
  if (o.chips && o.chips.length) {
    const chipRow = el("div", "bb2-chip-row");
    o.chips.forEach((c) => chipRow.appendChild(el("span", "bb2-chip", c.label)));
    body.appendChild(chipRow);
  }
  if (o.revenueChips && o.revenueChips.length) {
    const revRow = el("div", "bb2-chip-row");
    o.revenueChips.forEach((c) =>
      revRow.appendChild(el("span", "bb2-chip bb2-chip--revenue", c.label + ": " + c.value))
    );
    body.appendChild(revRow);
  }
  // Acquisition screening chips (Park City): max purchase price by location.
  if (o.acquisitionChips && o.acquisitionChips.length) {
    const acqRow = el("div", "bb2-chip-row");
    o.acquisitionChips.forEach((c) => acqRow.appendChild(el("span", "bb2-chip bb2-chip--acq" + (c.flag ? " bb2-chip--hold" : ""), c.label + ": " + c.value)));
    body.appendChild(acqRow);
  }
  hero.appendChild(body);
  return hero;
}

function acquisitionSpecBlock(box) {
  const a = box.acquisitionSpec;
  const wrap = el("div", "dd-block");
  wrap.appendChild(el("h3", "dd-block__title", "Acquisition Spec"));
  const grid = el("div", "bb2-grid-2");
  grid.appendChild(el("div", null, "<h4>Required</h4>" + listHtml(a.required)));
  grid.appendChild(el("div", null, "<h4>Preferred</h4>" + listHtml(a.preferred)));
  wrap.appendChild(grid);
  if (a.images && a.images.length) wrap.appendChild(renderImageGrid(a.images));
  return wrap;
}

function finishedSpecBlock(box) {
  const f = box.finishedSpec;
  return ddBlock(
    "Finished STR Spec",
    [
      ["Sleep count", f.sleepCount],
      ["Backyard / outdoor program", f.backyard],
    ],
    f.images
  );
}

function locationGuidanceDeepDiveBlock(box) {
  const g = box.locationGuidance;
  const wrap = ddBlock("Location Guidance", [
    ["Recommended", g.recommended],
    ["Use with caution", g.caution],
    ["Diligence", g.diligence],
  ]);
  if (g.interactiveMapUrl) {
    wrap.appendChild(renderEmbeddedMap(g.interactiveMapUrl, { title: box.label + " location map" }));
  }
  return wrap;
}

function fourBrCompMapBlock() {
  const wrap = el("div", "dd-block dd-block--map");
  wrap.appendChild(el("h3", "dd-block__title", "4BR Comp Map"));
  wrap.appendChild(
    el(
      "p",
      "dd-note",
      "Named 4BR core comps, ceiling/reference comps, and counterexamples mapped separately from the market-wide location map above."
    )
  );
  const layout = el("div", "map-layout map-layout--embedded");
  layout.appendChild(
    el(
      "div",
      "map-canvas map-canvas--embedded",
      ""
    )
  );
  layout.firstChild.id = "fourbr-comp-map";
  layout.firstChild.setAttribute("role", "img");
  layout.firstChild.setAttribute("aria-label", "Interactive map of 4BR Shenandoah Valley comp set listings");
  const sidebar = el("aside", "map-sidebar");
  sidebar.appendChild(el("div", "map-legend", ""));
  sidebar.lastChild.id = "fourbr-comp-map-legend";
  sidebar.appendChild(el("div", "map-filters", ""));
  sidebar.lastChild.id = "fourbr-comp-map-filters";
  layout.appendChild(sidebar);
  wrap.appendChild(layout);
  wrap.appendChild(el("div", "section-interpretation", '<p>Use this map to compare where the 4BR underwriting comps and caution cases sit geographically, without mixing those comp markers into the common market map.</p>'));
  wrap.lastChild.id = "fourbr-comp-map-note";
  return wrap;
}

// ---------------------------------------------------------------------------
// 1-2BR interactive comp map (Section 5) — only 1-2BR listings, filterable by
// this segment's own revenue tier (top10/top25/bottom75, computed
// client-side against the 1-2BR-only population), with the 9-listing named
// revenue comp set from locationGuidance.revenueComps marked distinctly.
// Mirrors the 4BR comp map's container/legend/filter pattern above.
// ---------------------------------------------------------------------------
function oneTwoBrCompMapBlock() {
  const wrap = el("div", "dd-block dd-block--map");
  wrap.appendChild(el("h3", "dd-block__title", "1-2BR Interactive Map"));
  wrap.appendChild(
    el(
      "p",
      "dd-note",
      "Only 1-2 bedroom listings, colored by this segment's own revenue tier (not the market-wide tiers used in Section 3). The 9 chosen revenue comps are outlined and colored distinctly."
    )
  );
  const layout = el("div", "map-layout map-layout--embedded");
  layout.appendChild(el("div", "map-canvas map-canvas--embedded", ""));
  layout.firstChild.id = "onetwobr-comp-map";
  layout.firstChild.setAttribute("role", "img");
  layout.firstChild.setAttribute("aria-label", "Interactive map of 1-2BR Shenandoah Valley listings by revenue tier and chosen revenue comp set");
  const sidebar = el("aside", "map-sidebar");
  sidebar.appendChild(el("div", "map-legend", ""));
  sidebar.lastChild.id = "onetwobr-comp-map-legend";
  sidebar.appendChild(el("div", "map-filters", ""));
  sidebar.lastChild.id = "onetwobr-comp-map-filters";
  layout.appendChild(sidebar);
  wrap.appendChild(layout);
  wrap.appendChild(el("div", "section-interpretation", "<p>Filter by revenue tier to see where top-performing 1-2BR listings cluster, and compare against the named revenue comp set.</p>"));
  wrap.lastChild.id = "onetwobr-comp-map-note";
  return wrap;
}

function travelerICPBlock(box) {
  const t = box.travelerICP;
  const wrap = ddBlock("Guest Profile & Capacity", [
    ["Primary", t.primary],
    ["Secondary", t.secondary],
  ]);
  if (t.stats && t.stats.length) {
    const statRow = el("div", "bb2-stat-row bb2-stat-row--3");
    t.stats.forEach((s) => {
      const stat = el("div", "bb2-stat");
      stat.appendChild(el("div", "bb2-stat__value", s.value));
      stat.appendChild(el("div", "bb2-stat__label", s.label + (s.compare ? " (" + s.compare + ")" : "")));
      statRow.appendChild(stat);
    });
    wrap.appendChild(statRow);
  }
  if (t.note) wrap.appendChild(el("p", "dd-note", t.note));
  return wrap;
}

// ---------------------------------------------------------------------------
// Market-wide performance context (3BR) — descriptive stats, explicitly NOT a
// validated buy-box revenue target (the source material forbids inventing one
// until its comp-set review is done).
// ---------------------------------------------------------------------------
function performanceContextBlock(box) {
  const p = box.performanceContext;
  const wrap = el("div", "dd-block dd-block--compact");
  wrap.appendChild(el("h3", "dd-block__title", "Performance Context"));
  const statRow = el("div", "bb2-stat-row bb2-stat-row--3");
  p.stats.forEach((s) => {
    const stat = el("div", "bb2-stat");
    stat.appendChild(el("div", "bb2-stat__value", s.value));
    stat.appendChild(el("div", "bb2-stat__label", s.label + (s.compare ? " (" + s.compare + ")" : "")));
    statRow.appendChild(stat);
  });
  wrap.appendChild(statRow);
  if (p.note) wrap.appendChild(el("p", "dd-note", p.note));
  return wrap;
}

// ---------------------------------------------------------------------------
// Auto Add (3BR) — a third amenity category distinct from must-have/nice-to-
// have: cheap to add post-acquisition, shouldn't drive the purchase decision.
// ---------------------------------------------------------------------------
function autoAddBlock(box) {
  const a = box.autoAdd;
  const wrap = el("div", "dd-block");
  wrap.appendChild(el("h3", "dd-block__title", "Auto Add"));
  if (a.intro) wrap.appendChild(el("p", null, a.intro));
  wrap.appendChild(el("ul", "bb2-checklist bb2-checklist--check", a.items.map((i) => "<li>" + i + "</li>").join("")));
  wrap.appendChild(renderImageGrid(a.images));
  return wrap;
}

// ---------------------------------------------------------------------------
// Geo Considerations (3BR) — one row per geographic factor, each with its own
// prevalence stat, note, and image group (generalized version of 1-2BR's
// fixed "seclusion first" viewsSeclusionBlock).
// ---------------------------------------------------------------------------
function geoConsiderationsBlock(box) {
  const g = box.geoConsiderations;
  const imageGridOpts = box.id === "4br" ? { className: "dd-block__images--geo-compact" } : null;
  const wrap = el("div", "dd-block");
  wrap.appendChild(el("h3", "dd-block__title", "Geo Considerations"));
  if (g.intro) wrap.appendChild(el("p", null, g.intro));
  g.factors.forEach((f) => {
    wrap.appendChild(el("h4", "comp-tier-label", f.label));
    if (f.stat) wrap.appendChild(el("p", null, "<strong>" + f.stat + "</strong>"));
    if (f.note) wrap.appendChild(el("p", "dd-note", f.note));
    if (f.images) wrap.appendChild(renderImageGrid(f.images, imageGridOpts));
  });
  return wrap;
}

// ---------------------------------------------------------------------------
// Design Direction (3BR)
// ---------------------------------------------------------------------------
function designDirectionBlock(box) {
  const d = box.designDirection;
  const wrap = el("div", "dd-block dd-block--compact");
  wrap.appendChild(el("h3", "dd-block__title", "Design Direction"));
  wrap.appendChild(el("p", null, d.thesis));
  if (d.notes && d.notes.length) wrap.appendChild(el("ul", "bb2-notes-list", d.notes.map((n) => "<li>" + n + "</li>").join("")));
  return wrap;
}

// ---------------------------------------------------------------------------
// Beds & Baths (3BR) — visual-first, no explanatory text: bedroom photos +
// the capacity/bedroom/bathroom evidence charts.
// ---------------------------------------------------------------------------
function bedsAndBathsBlock(box) {
  const b = box.bedsAndBaths;
  const wrap = el("div", "dd-block");
  wrap.appendChild(el("h3", "dd-block__title", "Beds & Baths"));
  wrap.appendChild(renderImageGrid(b.roomImages));
  wrap.appendChild(renderImageGrid(b.chartImages));
  return wrap;
}

// ---------------------------------------------------------------------------
// Comp Set Analysis (3BR) — the analyst-curated 6-comp High/Mid/Low tiered
// comp set, its own charts, an embedded interactive comp-set map, and the
// Alexandria Design Comp Set link. Distinct from Performance Context above
// (market-wide 3BR stats) and from revenueTiersBlock (4BR's named-comp mode).
// ---------------------------------------------------------------------------
function compSetAnalysisBlock(box) {
  const c = box.compSetAnalysis;
  const wrap = el("div", "dd-block");
  wrap.appendChild(el("h3", "dd-block__title", "Comp Set Analysis"));
  if (c.intro) wrap.appendChild(el("p", null, c.intro));

  const tierLabels = { high: "High", mid: "Mid", low: "Low" };
  ["high", "mid", "low"].forEach((tierKey) => {
    const tier = c.tiers[tierKey];
    if (!tier) return;
    wrap.appendChild(el("h4", "comp-tier-label", tierLabels[tierKey]));
    const grid = el("div", "comp-grid");
    tier.comps.forEach((comp) => grid.appendChild(compCard(comp)));
    wrap.appendChild(grid);
    if (tier.images && tier.images.length) wrap.appendChild(renderImageGrid(tier.images));
  });

  if (c.charts && c.charts.length) {
    wrap.appendChild(el("h4", "comp-tier-label", "Evidence"));
    wrap.appendChild(renderImageGrid(c.charts));
  }

  if (c.analystNotes && c.analystNotes.length) {
    wrap.appendChild(el("h4", "comp-tier-label", "Analyst Notes"));
    wrap.appendChild(el("ul", "bb2-notes-list", c.analystNotes.map((n) => "<li>" + n + "</li>").join("")));
  }

  if (c.interactiveMapUrl) {
    wrap.appendChild(el("h4", "comp-tier-label", "Comp Set Map"));
    wrap.appendChild(renderEmbeddedMap(c.interactiveMapUrl, { title: "3BR comp set map" }));
  }

  if (c.alexandriaDesignCompSetUrl) {
    wrap.appendChild(alexandriaButton("Open Design Comp Set in Alexandria", c.alexandriaDesignCompSetUrl));
  }

  return wrap;
}

// ---------------------------------------------------------------------------
// Acquisition Candidates (3BR) — clean property cards for specific screened
// Zillow listings, each compared against the finalized buy-box criteria.
// ---------------------------------------------------------------------------
function acquisitionCandidateCard(cand) {
  const card = el("div", "candidate-card");
  if (cand.image) card.appendChild(renderImage(cand.image));
  const body = el("div", "candidate-card__body");
  body.appendChild(el("div", "candidate-card__title", cand.address));
  const metaBits = [cand.price, cand.bedsBaths, cand.sqft, cand.lot].filter(Boolean);
  if (metaBits.length) body.appendChild(el("div", "candidate-card__meta", metaBits.join(" · ")));
  const link = el("a", "comp-card__link", "View on Zillow ↗");
  link.href = cand.zillowUrl;
  link.target = "_blank";
  link.rel = "noopener";
  body.appendChild(link);
  if (cand.fit && cand.fit.length) {
    body.appendChild(el("p", null, "<strong>Fit vs. buy box</strong>"));
    body.appendChild(el("ul", "bb2-notes-list", cand.fit.map((f) => "<li>" + f + "</li>").join("")));
  }
  card.appendChild(body);
  return card;
}

function acquisitionCandidatesBlock(box) {
  const wrap = el("div", "dd-block");
  wrap.appendChild(el("h3", "dd-block__title", "Acquisition Candidates"));
  const grid = el("div", "comp-grid");
  (box.acquisitionCandidates || []).forEach((cand) => grid.appendChild(acquisitionCandidateCard(cand)));
  wrap.appendChild(grid);
  return wrap;
}

// Per-amenity High/Mid/Low execution tiers — a different lens than
// amenityStackBlock's flat evidence gallery: shows what separates high,
// minimum-acceptable, and weak execution for each must-have individually.
// Reuses the same bb2-tier-compare__grid CSS as executionComparisonBlock's
// whole-property tier compare, just looped once per amenity.
function amenityExecutionTiersBlock(box) {
  const wrap = el("div", "dd-block");
  wrap.appendChild(el("h3", "dd-block__title", "Must-Have Execution: High / Mid / Low"));
  (box.mustHaveExecutionTiers || []).forEach((item) => {
    wrap.appendChild(el("h4", "comp-tier-label", item.name + (item.tag ? " · " + item.tag : "")));
    const grid = el("div", "bb2-tier-compare__grid");
    [["High", "high", item.high], ["Mid", "mid", item.mid], ["Low", "low", item.low]].forEach(([label, tierKey, img]) => {
      const col = el("div", "bb2-tier-compare__col bb2-tier-compare__col--" + tierKey);
      col.appendChild(el("div", "bb2-tier-compare__col-label", label));
      col.appendChild(renderImage(img, { small: true }));
      grid.appendChild(col);
    });
    wrap.appendChild(grid);
    if (item.diligence) wrap.appendChild(el("p", "dd-note", "Diligence: " + item.diligence));
  });
  return wrap;
}

// Renders a checklist where each item can be a plain string or a
// {text, image} pair — used by 3BR so must-have/nice-to-have lines show
// their own photo beside them, not just a shared gallery underneath.
function amenityChecklist(items, listClass) {
  const list = el("ul", listClass);
  items.forEach((item) => {
    const li = el("li", "bb2-checklist__item");
    const text = typeof item === "string" ? item : item.text;
    const image = typeof item === "string" ? null : item.image;
    li.appendChild(el("span", "bb2-checklist__text", text));
    if (image) li.appendChild(renderImage(image, { small: true }));
    list.appendChild(li);
  });
  return list;
}

function amenityStackBlock(box) {
  const must = box.mustHaveAmenities;
  const nice = box.niceToHaveAmenities;
  const wrap = el("div", "dd-block");
  wrap.appendChild(el("h3", "dd-block__title", "Amenity Stack"));

  // 3BR supplies its must-have gallery as `leadImages`; 1-2BR and 4BR supply
  // it as a plain `images` list — support both so neither goes undisplayed.
  const mustImages = must.leadImages || must.images;
  if (mustImages && mustImages.length) {
    wrap.appendChild(renderImageGrid(mustImages));
  }

  const panels = el("div", "bb2-amenity-panels");

  const mustPanel = el("div", "bb2-amenity-panel");
  mustPanel.appendChild(el("h4", "bb2-amenity-panel__title", "Must-Have"));
  mustPanel.appendChild(amenityChecklist(must.items, "bb2-checklist bb2-checklist--check bb2-checklist--photo"));
  panels.appendChild(mustPanel);

  const nicePanel = el("div", "bb2-amenity-panel");
  nicePanel.appendChild(el("h4", "bb2-amenity-panel__title", "Nice-to-Have"));
  nicePanel.appendChild(el("p", null, "<strong>Strongly preferred</strong>"));
  nicePanel.appendChild(amenityChecklist(nice.stronglyPreferred, "bb2-checklist bb2-checklist--star bb2-checklist--photo"));
  if (nice.optional && nice.optional.length) {
    nicePanel.appendChild(el("p", null, "<strong>Optional differentiators</strong>"));
    const chipRow = el("div", "bb2-chip-row");
    nice.optional.forEach((o) => chipRow.appendChild(el("span", "bb2-chip bb2-chip--optional", o)));
    nicePanel.appendChild(chipRow);
  }
  if (nice.optionalNote) nicePanel.appendChild(el("p", "dd-note", nice.optionalNote));
  panels.appendChild(nicePanel);

  wrap.appendChild(panels);

  const niceImages = nice.leadImages || nice.images;
  if (niceImages && niceImages.length) {
    wrap.appendChild(renderImageGrid(niceImages));
  }

  if (must.evidenceNote) {
    const strip = el("div", "bb2-evidence-strip");
    strip.innerHTML =
      '<span class="bb2-chip bb2-chip--metric">' + must.evidenceNote.label + "</span> " +
      "<span>" + must.evidenceNote.stats + "</span>" +
      (must.evidenceNote.caveat ? '<span class="dd-note"> ' + must.evidenceNote.caveat + "</span>" : "");
    wrap.appendChild(strip);
  }

  if (box.niceToHaveRanked) wrap.appendChild(niceToHaveRankedBlock(box.niceToHaveRanked));

  return wrap;
}

// ---------------------------------------------------------------------------
// Nice-to-Have, Ranked (Clearwater's 5BR structure): a scored, ordered list --
// name, score, revenue uplift, Top-10%-hit-rate uplift, N, a note, and
// optional reference photos per item. Thin-data items (N too small to rank)
// are flagged, not dropped. Standalone/reusable so a still-"pending" box
// (e.g. Lake) can show this via renderDeepDive's pending branch too, not
// just a fully "developed" one via amenityStackBlock above.
// ---------------------------------------------------------------------------
function niceToHaveRankedItem(item, rank) {
  // Thin-data items collapse to one dense line (name + note inline) rather
  // than a full card -- there's no score/uplift to show anyway, and a full
  // card per thin item was most of what made an early version of this list
  // take up far more space than Clearwater's own compact treatment of its
  // own thin amenities (Movie Theater, Sauna, Golf Simulator).
  if (item.thinData) {
    const wrap = el("div", "nice-ranked__item nice-ranked__item--thin");
    wrap.innerHTML =
      '<span class="nice-ranked__rank">—</span>' +
      '<span class="nice-ranked__name">' + item.name + "</span>" +
      (item.note ? '<span class="nice-ranked__thin-note">' + item.note + "</span>" : "");
    // A tiny inline thumbnail per image (not the geo-compact grid used
    // elsewhere) -- a thin-data row is one dense line of text; a 220-360px
    // grid figure below it would dwarf the line it's illustrating.
    (item.images || []).forEach((img) => {
      const thumb = el("span", "nice-ranked__thin-thumb");
      thumb.appendChild(renderImage(img, { small: true, noCaption: true }));
      wrap.appendChild(thumb);
    });
    return wrap;
  }
  const wrap = el("div", "nice-ranked__item");
  const head = el("div", "nice-ranked__head");
  head.appendChild(el("span", "nice-ranked__rank", "#" + rank));
  head.appendChild(el("span", "nice-ranked__name", item.name));
  // Score is our own composite metric (see Lake's amenity-scoring note) --
  // not every source has one. A source that only supplies a bare revenue
  // uplift % (e.g. Outskirts, from Walid's own analysis) still gets a full
  // card, just without a score badge or the stats this item's source never
  // computed, rather than crashing on `.toFixed()` of an undefined score or
  // printing a literal "undefined" into a stat the source never gave.
  if (item.score != null) {
    head.appendChild(el("span", "nice-ranked__score", "Score " + item.score.toFixed(2)));
  }
  wrap.appendChild(head);
  const statParts = [];
  if (item.revenueUplift != null) statParts.push("<span>Revenue uplift: <strong>" + item.revenueUplift + "</strong></span>");
  if (item.p90Uplift != null) statParts.push("<span>Top 10% hit-rate uplift: <strong>" + item.p90Uplift + "</strong></span>");
  if (item.n != null) statParts.push("<span>N=" + item.n + "</span>");
  if (statParts.length) {
    const stats = el("div", "nice-ranked__stats");
    stats.innerHTML = statParts.join("");
    wrap.appendChild(stats);
  }
  if (item.note) wrap.appendChild(el("p", null, item.note));
  if (item.images && item.images.length) wrap.appendChild(renderImageGrid(item.images, { small: true, className: "dd-block__images--geo-compact" }));
  return wrap;
}

function niceToHaveRankedBlock(data) {
  const wrap = el("div", "dd-block nice-ranked");
  wrap.appendChild(el("h4", "dd-block__title", "Nice-to-Have, Ranked"));
  if (data.note) wrap.appendChild(el("p", "dd-note", data.note));
  let rank = 0;
  (data.items || []).forEach((item) => {
    if (!item.thinData) rank += 1;
    wrap.appendChild(niceToHaveRankedItem(item, rank));
  });
  return wrap;
}

// Renders a plain {label, value} list as a two-column table (reuses the
// One-Page Recap summary sheet's own styling) -- used for a note that's
// really a reference table (e.g. an acquisition target profile) rather
// than a bulleted point.
function attributeTable(rows) {
  const table = el("table", "summary-sheet-table");
  table.innerHTML = (rows || []).map((r) => "<tr><td>" + r.label + "</td><td>" + r.value + "</td></tr>").join("");
  return table;
}

// Analyst Notes -- each note paired with its own image(s) directly beside
// it (two-column row, reusing .bb2-grid-2), instead of one bulleted list
// followed by a disconnected photo gallery at the bottom of the section.
// A note with no images of its own renders as plain text, full width.
// A note with a `table` (array of {label, value}) renders that table
// beneath its text instead of/alongside images.
function analystNotePairItem(note) {
  if (note.table) {
    const wrap = el("div", "analyst-note__text-only");
    wrap.appendChild(el("p", null, note.text));
    wrap.appendChild(attributeTable(note.table));
    return wrap;
  }
  if (!note.images || !note.images.length) {
    return el("p", "analyst-note__text-only", note.text);
  }
  const wrap = el("div", "bb2-grid-2 analyst-note");
  wrap.appendChild(el("p", "analyst-note__text", note.text));
  wrap.appendChild(renderImageGrid(note.images, { small: true, className: "dd-block__images--geo-compact analyst-note__images" }));
  return wrap;
}

function analystNotePairsBlock(notes) {
  const wrap = el("div", "analyst-notes");
  (notes || []).forEach((note) => wrap.appendChild(analystNotePairItem(note)));
  return wrap;
}

// Lakefront vs. Castaway comp-set comparison -- a plain HTML stats table
// (verified against Compset.csv, not re-derived here) plus a photo row per
// point: the same real point illustrated with one photo from each listing,
// side by side, captioned with the actual visual difference rather than a
// generic "reference example" line.
// Paired comparison components. Originally Charlotte's Lakefront-vs-
// Castaway pair; generalized with `labels` + left/right keys so any two
// listings can be compared (the old lakefront/castaway keys still work).
function compStatsTable(rows, labels) {
  labels = labels || ["Lakefront Estate", "Castaway Cove"];
  const table = el("table", "comp-stats-table");
  let html = "<thead><tr><th></th><th>" + labels[0] + "</th><th>" + labels[1] + "</th></tr></thead><tbody>";
  rows.forEach((r) => {
    html += "<tr><td>" + r.label + "</td><td>" + (r.left != null ? r.left : r.lakefront) + "</td><td>" + (r.right != null ? r.right : r.castaway) + "</td></tr>";
  });
  html += "</tbody>";
  table.innerHTML = html;
  // Scroll wrapper so a wide pair table never widens the page on a phone.
  const wrap = el("div", "table-scroll");
  wrap.appendChild(table);
  return wrap;
}

function compPhotoRow(row, labels) {
  labels = labels || ["Lakefront Estate", "Castaway Cove"];
  const wrap = el("div", "comp-photo-row");
  wrap.appendChild(el("p", "comp-photo-row__note", row.note));
  if (row.quote) wrap.appendChild(el("p", "comp-photo-row__quote", row.quote));
  const grid = el("div", "bb2-grid-2");
  [[row.left || row.lakefront, labels[0]], [row.right || row.castaway, labels[1]]].forEach(([img, label]) => {
    const col = el("div", "comp-photo-row__col");
    col.appendChild(el("p", "comp-photo-row__label", label));
    if (img) col.appendChild(renderImage(img, { wide: true }));
    else col.appendChild(el("p", "dd-note", "No equivalent space in this listing's gallery."));
    grid.appendChild(col);
  });
  wrap.appendChild(grid);
  return wrap;
}

function compPhotoRowsBlock(rows, labels) {
  const wrap = el("div", "comp-photo-rows");
  (rows || []).forEach((row) => wrap.appendChild(compPhotoRow(row, labels)));
  return wrap;
}

function executionStandardsBlock(box) {
  const e = box.executionStandards;
  const wrap = el("div", "dd-block");
  wrap.appendChild(el("h3", "dd-block__title", "Execution & Photo Standards"));
  wrap.appendChild(el("p", null, e.summary));
  if (e.photoStandards && e.photoStandards.length) {
    const grid = el("div", "bb2-grid-2");
    grid.appendChild(el("div", null, "<h4>Required execution</h4>" + listHtml(e.required)));
    grid.appendChild(el("div", null, "<h4>Photo standards</h4>" + listHtml(e.photoStandards)));
    wrap.appendChild(grid);
  } else {
    wrap.appendChild(el("div", null, "<h4>Required execution</h4>" + listHtml(e.required)));
  }
  if (e.cheapMoves && e.cheapMoves.length) {
    const chipRow = el("div", "bb2-chip-row");
    chipRow.appendChild(el("span", null, "<strong>Cheap, copyable moves:</strong>"));
    e.cheapMoves.forEach((m) => chipRow.appendChild(el("span", "bb2-chip", m)));
    wrap.appendChild(chipRow);
  }
  wrap.appendChild(renderImageGrid(e.images));
  if (box.alexandria && box.alexandria.designCompSetUrl) {
    wrap.appendChild(alexandriaButton("Open Design Comp Set in Alexandria", box.alexandria.designCompSetUrl));
  }

  if (e.designComps) {
    const d = e.designComps;
    wrap.appendChild(el("h4", "comp-tier-label", "Design / Top Designs"));
    if (d.intro) wrap.appendChild(el("p", null, d.intro));
    if (d.namedComps && d.namedComps.length) {
      const grid2 = el("div", "comp-grid");
      d.namedComps.forEach((c) => grid2.appendChild(compCard(c)));
      wrap.appendChild(grid2);
    }
    if (d.images && d.images.length) wrap.appendChild(renderImageGrid(d.images));
    if (d.alexandriaDesignUrl !== undefined) {
      wrap.appendChild(alexandriaButton("Open Design Comp Set in Alexandria", d.alexandriaDesignUrl));
    }
  }
  return wrap;
}

// ---------------------------------------------------------------------------
// Views & Seclusion (1-2BR only) — surfaces the source material's single
// strongest normative point: seclusion ranks above view quality.
// ---------------------------------------------------------------------------
function viewsSeclusionBlock(box) {
  const v = box.viewsSeclusion;
  const wrap = el("div", "dd-block dd-block--priority");
  wrap.appendChild(el("h3", "dd-block__title", "Views & Seclusion"));
  wrap.appendChild(el("p", null, "<strong>Seclusion, first:</strong> " + v.privacySeclusion));
  wrap.appendChild(renderImageGrid(v.seclusionImages));
  const rows = el("div", "dd-rows");
  [["Views", v.views], ["Waterfront", v.waterfront]].forEach(([label, value]) => {
    if (!value) return;
    const row = el("div", "dd-row");
    row.appendChild(el("div", "dd-row__label", label));
    row.appendChild(el("div", "dd-row__value", value));
    rows.appendChild(row);
  });
  wrap.appendChild(rows);
  (v.viewGroups || []).forEach((g) => {
    wrap.appendChild(el("h4", "comp-tier-label", g.label));
    wrap.appendChild(renderImageGrid(g.images));
  });
  return wrap;
}

function compCard(c) {
  const card = el("div", "comp-card");
  card.appendChild(renderImage(c.image));
  const body = el("div", "comp-card__body");
  body.appendChild(el("div", "comp-card__title", c.name));
  body.appendChild(el("div", "comp-card__location", c.city + ", " + MAP_CONFIG.stateAbbr + " " + c.zip));
  const link = el("a", "comp-card__link", "View on Airbnb ↗");
  link.href = c.url;
  link.target = "_blank";
  link.rel = "noopener";
  body.appendChild(link);
  const metrics = el(
    "div",
    "comp-card__metrics",
    "<span>Revenue: " + fmtCurrency(c.revenue) + "</span>" +
      "<span>ADR: " + fmtCurrency(c.adr) + "</span>" +
      "<span>Occupancy: " + fmtPct(c.occupancy) + "</span>" +
      (c.sleeps ? "<span>Sleeps " + c.sleeps + "</span>" : "")
  );
  body.appendChild(metrics);
  if (c.why) body.appendChild(el("p", "comp-card__why", c.why));
  if (c.flag) body.appendChild(el("p", "comp-card__limitation", c.flag));
  card.appendChild(body);
  return card;
}

function revenueTiersBlock(box) {
  const r = box.revenueTiers;
  const wrap = el("div", "dd-block");
  wrap.appendChild(el("h3", "dd-block__title", "Revenue Tiers" + (r.mode === "namedComps" ? " & Core Comps" : "")));
  const bandRow = el("div", "bb2-stat-row bb2-stat-row--3");
  r.bands.forEach((b) => {
    const stat = el("div", "bb2-stat");
    stat.appendChild(el("div", "bb2-stat__value", b.range));
    stat.appendChild(el("div", "bb2-stat__label", b.label));
    stat.appendChild(el("div", "dd-note", b.note));
    bandRow.appendChild(stat);
  });
  wrap.appendChild(bandRow);
  if (r.caution) wrap.appendChild(el("p", "dd-block--contrast dd-note-block", r.caution));

  if (r.mode === "photoEvidence") {
    const tierLabels = { high: "High", mid: "Mid", low: "Low" };
    ["high", "mid", "low"].forEach((tierKey) => {
      const images = r.photoTiers[tierKey];
      if (!images || !images.length) return;
      wrap.appendChild(el("h4", "comp-tier-label", tierLabels[tierKey]));
      wrap.appendChild(renderImageGrid(images));
    });
    if (r.alexandriaRevenueUrl !== undefined) {
      wrap.appendChild(alexandriaButton("Open Revenue Comp Set in Alexandria", r.alexandriaRevenueUrl));
    }
    return wrap;
  }

  // mode === "namedComps" (4BR's original behavior)
  const byTier = { strong: [], target: [], low: [] };
  r.comps.forEach((c) => byTier[c.tier].push(c));
  const tierLabels = { strong: "Strong execution / upside", target: "Target", low: "Low acceptable" };
  ["strong", "target", "low"].forEach((tierKey) => {
    if (!byTier[tierKey].length) return;
    wrap.appendChild(el("h4", "comp-tier-label", tierLabels[tierKey]));
    const grid = el("div", "comp-grid");
    byTier[tierKey].forEach((c) => grid.appendChild(compCard(c)));
    wrap.appendChild(grid);
  });

  if (r.ceilingComps && r.ceilingComps.length) {
    wrap.appendChild(el("h4", "comp-tier-label", "Ceiling / Reference Comps (not underwritten)"));
    const ceilGrid = el("div", "comp-grid");
    r.ceilingComps.forEach((c) => {
      const card = el("div", "comp-card comp-card--pending");
      if (c.image) card.appendChild(renderImage(c.image));
      const body = el("div", "comp-card__body");
      body.appendChild(el("div", "comp-card__title", c.name));
      body.appendChild(el("div", "comp-card__location", c.city + ", " + MAP_CONFIG.stateAbbr + " " + c.zip));
      const link = el("a", "comp-card__link", "View on Airbnb ↗");
      link.href = c.url;
      link.target = "_blank";
      link.rel = "noopener";
      body.appendChild(link);
      body.appendChild(
        el(
          "div",
          "comp-card__metrics",
          "<span>Revenue: " + fmtCurrency(c.revenue) + "</span><span>ADR: " + fmtCurrency(c.adr) + "</span><span>Occupancy: " + fmtPct(c.occupancy) + "</span>"
        )
      );
      body.appendChild(el("p", "comp-card__limitation", c.why));
      card.appendChild(body);
      ceilGrid.appendChild(card);
    });
    wrap.appendChild(ceilGrid);
  }
  if (r.note) wrap.appendChild(el("p", "dd-note", r.note));
  if (box.alexandria && box.alexandria.revenueCompSetUrl) {
    wrap.appendChild(alexandriaButton("Open Revenue Comp Set in Alexandria", box.alexandria.revenueCompSetUrl));
  }
  return wrap;
}

function executionComparisonBlock(box) {
  const e = box.executionComparison;
  const wrap = el("div", "dd-block");
  wrap.appendChild(el("h3", "dd-block__title", "High / Mid / Low Execution Comparison"));
  wrap.appendChild(el("p", null, e.intro));
  const grid = el("div", "bb2-tier-compare__grid");
  [["high", e.high], ["mid", e.mid], ["low", e.low]].forEach(([tierKey, tier]) => {
    const col = el("div", "bb2-tier-compare__col bb2-tier-compare__col--" + tierKey);
    col.appendChild(el("div", "bb2-tier-compare__col-label", tier.label));
    col.appendChild(el("p", null, tier.description));
    if (tier.images) col.appendChild(renderImageGrid(tier.images, { small: true }));
    col.appendChild(el("p", "bb2-tier-compare__property", tier.examples));
    grid.appendChild(col);
  });
  wrap.appendChild(grid);
  return wrap;
}

function counterexamplesBlock(box) {
  const wrap = el("div", "dd-block dd-block--contrast");
  wrap.appendChild(el("h3", "dd-block__title", "Counterexample Boundaries"));
  box.counterexamples.forEach((c) => {
    const card = el("div", "counterexample-card");
    card.appendChild(el("h4", null, c.name + " — " + c.role));
    const link = el("a", "comp-card__link", "View on Airbnb ↗");
    link.href = c.url;
    link.target = "_blank";
    link.rel = "noopener";
    const meta = el(
      "p",
      "comp-card__metrics",
      "<span>Revenue: " + fmtCurrency(c.revenue) + "</span><span>" + c.city + ", " + MAP_CONFIG.stateAbbr + " " + c.zip + "</span>"
    );
    card.appendChild(meta);
    card.appendChild(link);
    card.appendChild(el("p", null, c.explanation));
    if (c.images) card.appendChild(renderImageGrid(c.images, { small: true }));
    wrap.appendChild(card);
  });
  return wrap;
}

function analystNotesBlock(box) {
  const wrap = el("div", "dd-block");
  wrap.appendChild(el("h3", "dd-block__title", "Analyst Notes"));
  wrap.appendChild(el("ul", "bb2-notes-list", box.analystNotes.map((n) => "<li>" + n + "</li>").join("")));
  return wrap;
}

function acquisitionStatusBlock(box) {
  const wrap = el("div", "dd-block dd-block--compact");
  wrap.appendChild(el("h3", "dd-block__title", "Purchase Price"));
  wrap.appendChild(el("p", null, pendingBadge(box.acquisition.status)));
  wrap.appendChild(el("p", null, box.acquisition.note));
  wrap.appendChild(el("p", "dd-note", REGULATION_NOTE));
  return wrap;
}

// Dispatch table: section key -> builder function. Each BUY_BOXES entry
// declares its own ordered `buyBoxSections` array of these keys (see
// data.js) — renderDeepDive walks that array, so two structurally different
// buy boxes (e.g. 4BR's named-comp revenue tiers + execution comparison vs.
// 1-2BR's photo-evidence revenue tiers + views/seclusion section) can share
// this one dispatch table without any box-specific conditionals here.
const NARRATIVE_BLOCKS = {
  overview: overviewBlock,
  acquisitionSpec: acquisitionSpecBlock,
  finishedSpec: finishedSpecBlock,
  viewsSeclusion: viewsSeclusionBlock,
  locationGuidance: locationGuidanceDeepDiveBlock,
  fourBrCompMap: fourBrCompMapBlock,
  oneTwoBrCompMap: oneTwoBrCompMapBlock,
  travelerICP: travelerICPBlock,
  mustHaveAmenities: amenityStackBlock,
  mustHaveExecutionTiers: amenityExecutionTiersBlock,
  executionStandards: executionStandardsBlock,
  revenueTiers: revenueTiersBlock,
  executionComparison: executionComparisonBlock,
  counterexamples: counterexamplesBlock,
  analystNotes: analystNotesBlock,
  acquisition: acquisitionStatusBlock,
  performanceContext: performanceContextBlock,
  autoAdd: autoAddBlock,
  geoConsiderations: geoConsiderationsBlock,
  designDirection: designDirectionBlock,
  bedsAndBaths: bedsAndBathsBlock,
  compSetAnalysis: compSetAnalysisBlock,
  acquisitionCandidates: acquisitionCandidatesBlock,
};

// ---------------------------------------------------------------------------
// One named, titled section inside a still-"pending" box's deep dive (see
// pendingSections in renderDeepDive below) -- gives a pending box the same
// section-by-section presentation flow a developed box's NARRATIVE_BLOCKS
// give it, without requiring the box to declare itself fully developed.
// A section with no content yet (e.g. Lake's Architectural Style / Backyard,
// left empty per an explicit "leave this area empty for now") just shows its
// title and a short pending note -- never invented placeholder content.
// ---------------------------------------------------------------------------
function renderPendingSection(section) {
  // A groupTitle-only entry is a bare divider heading (e.g. "Property
  // Profile", "Amenities", "Geo Considerations") grouping the ordinary
  // titled sections that follow it -- <h2>, one level up from a regular
  // section's <h3>, so the page reads in two tiers instead of one flat list.
  if (section.groupTitle) {
    const group = el("div", "pending-section pending-section--group");
    group.appendChild(el("h2", "dd-block__title", section.groupTitle));
    return group;
  }
  const wrap = el("div", "dd-block pending-section");
  if (section.title) wrap.appendChild(el("h3", "dd-block__title", section.title));
  if (section.pendingLabel) {
    wrap.appendChild(el("p", "dd-note pending-section__empty", section.pendingLabel));
    return wrap;
  }
  if (section.body) wrap.appendChild(el("div", "dd-block__body", section.body));
  // Generated HTML (Park City Section 6): tables built at render time from
  // DEEPDIVE (deepdive_data.js), so no derived number is hand-typed.
  if (section.html) wrap.appendChild(el("div", "dd-block__body dd-generated", typeof section.html === "function" ? section.html() : section.html));
  if (section.items && section.items.length) {
    wrap.appendChild(amenityChecklist(section.items, "bb2-checklist bb2-checklist--check"));
  }
  // "geo-compact" throughout -- a page whose photos aren't curated yet
  // shouldn't have the ones that do exist blow up to fill the full width;
  // capped at 360px so a 2-3 photo row stays modestly sized.
  if (section.images && section.images.length) {
    wrap.appendChild(renderImageGrid(section.images, { className: "dd-block__images--geo-compact" }));
  }
  if (section.charts && section.charts.length) wrap.appendChild(renderWideImageBlock(section.charts));
  // Two analysis charts side by side (e.g. amenity prevalence + amenity
  // presence heatmap, right before Must-Have's) -- same uncropped/natural-
  // aspect-ratio treatment as renderWideImageBlock's single-column charts,
  // but in a 2-up row so a compact chart doesn't sprawl full-width alone.
  if (section.chartsRow && section.chartsRow.length) {
    const row = el("div", "chart-row");
    section.chartsRow.forEach((img) => row.appendChild(renderImage(img, { wide: true })));
    wrap.appendChild(row);
  }
  if (section.ranked) wrap.appendChild(niceToHaveRankedBlock(section.ranked));
  if (section.notes) wrap.appendChild(analystNotePairsBlock(section.notes));
  if (section.compStats) wrap.appendChild(compStatsTable(section.compStats, section.pairLabels));
  if (section.compPhotoRows) wrap.appendChild(compPhotoRowsBlock(section.compPhotoRows, section.pairLabels));
  // Inline map embed -- replaces prose in Geo Considerations / Property
  // Locations with the same interactive map from Section 3 (already marks
  // landmarks, properties, and is region/tier filterable) per explicit
  // "why not use the map... too many words" feedback.
  if (section.mapEmbed) {
    wrap.appendChild(
      renderEmbeddedMap(section.mapEmbed.url, {
        className: section.mapEmbed.className || "embedded-map--tall",
        title: section.mapEmbed.title,
      })
    );
  }
  // Comp-Set Visual Comparison (Clearwater's 5BR structure): one or more
  // named photo categories, each split into Top (High) / Mid / Low tier
  // columns side by side -- see compSetComparisonBlock() below.
  if (section.compSetComparison) {
    wrap.appendChild(compSetComparisonBlock(section.compSetComparison));
  }
  return wrap;
}

// A single comp property inside one tier column: its photo(s) (or a
// pendingPhoto() placeholder card if that property's photo hasn't been
// supplied yet), title (linked to the real listing when a url is given),
// one-line stats, and an optional analyst note.
function compSetPropertyCard(prop) {
  const card = el("div", "bb2-tier-compare__property");
  if (prop.images && prop.images.length) {
    card.appendChild(renderImageGrid(prop.images, { small: true, className: "dd-block__images--geo-compact" }));
  }
  const label = el("div", "comp-tier-property__label");
  label.innerHTML =
    "<strong>" + (prop.url ? '<a href="' + prop.url + '" target="_blank" rel="noopener">' + prop.title + "</a>" : prop.title) + "</strong>" +
    (prop.stats ? "<br>" + prop.stats : "");
  card.appendChild(label);
  if (prop.note) card.appendChild(el("p", "dd-note comp-tier-property__note", prop.note));
  return card;
}
function compSetTierColumn(tierKey, tierLabel, properties) {
  const col = el("div", "bb2-tier-compare__col bb2-tier-compare__col--" + tierKey);
  col.appendChild(el("div", "bb2-tier-compare__col-label", tierLabel));
  (properties || []).forEach((prop) => col.appendChild(compSetPropertyCard(prop)));
  return col;
}
function compSetComparisonBlock(data) {
  const wrap = el("div", "comp-set-comparison");
  const lab = data.labels || { high: "Top (High Tier)", mid: "Mid Tier", low: "Low Tier" };
  if (data.intro) wrap.appendChild(el("div", "dd-block__body", data.intro));
  (data.categories || []).forEach((cat) => {
    const catWrap = el("div", "bb2-tier-compare__category");
    catWrap.appendChild(el("h4", "dd-block__title", cat.title));
    if (cat.interpretation) catWrap.appendChild(el("div", "dd-note comp-tier-category__note", cat.interpretation));
    const grid = el("div", "bb2-tier-compare__grid");
    grid.appendChild(compSetTierColumn("high", lab.high, cat.tiers.high));
    grid.appendChild(compSetTierColumn("mid", lab.mid, cat.tiers.mid));
    grid.appendChild(compSetTierColumn("low", lab.low, cat.tiers.low));
    catWrap.appendChild(grid);
    wrap.appendChild(catWrap);
  });
  return wrap;
}

// STR Regulations (Section 5): one overview line plus a compact
// jurisdiction table (STR_REGULATIONS in data.js). The market spans six
// jurisdiction groups, so a table carries the same facts Charlotte's single
// card did in far less space than one card per jurisdiction.
function renderRegulationsSection() {
  const host = document.getElementById("regulations-body");
  if (!host || !STR_REGULATIONS) return;
  const R = STR_REGULATIONS;
  let html = '<div class="regs-card__tier regs-card__tier--moderate"><span class="regs-card__tier-dot"></span>' + R.tier + "</div>";
  html += '<p class="regs-card__summary">' + R.summary + "</p>";
  html += '<div class="table-scroll"><table class="data-table data-table--wrap regs-table"><thead><tr><th>Jurisdiction</th><th>Tier</th><th>Key rules</th><th>Affects</th></tr></thead><tbody>';
  R.rows.forEach((r) => {
    html += '<tr><th scope="row">' + r.j + '<span class="cell-sub">' + r.areas + '</span></th><td><span class="tier-pill tier-pill--' + r.tierKey + '">' + r.tier +
      '</span></td><td class="cell-note">' + r.rules + "</td><td>" + r.affects + "</td></tr>";
  });
  html += "</tbody></table></div>";
  html += '<p class="dd-note regs-verified"><strong>Sources:</strong> ' +
    R.sources.map((x) => '<a href="' + x.url + '" target="_blank" rel="noopener">' + x.label + "</a>").join(" · ") + ". " + R.verifiedNote + "</p>";
  host.innerHTML = html;
}

// Queue of chart-instantiation callbacks collected while building a pending
// box's sections (for any Chart.js canvas that needs to be attached to the
// live document before it can size/draw itself), drained by renderDeepDive
// right after the whole section tree is attached to the live document.
let pendingChartJobs = [];

function renderDeepDive(box) {
  const host = document.getElementById("deep-dive-content");
  if (!host) return;
  if (typeof cleanupFourBrCompMap === "function") cleanupFourBrCompMap();
  if (typeof cleanupOneTwoBrCompMap === "function") cleanupOneTwoBrCompMap();
  host.innerHTML = "";
  if (box.status !== "developed") {
    // A pending box can still show real, finished evidence for the piece(s)
    // of its analysis that ARE done, without the box as a whole claiming to
    // be a full deep dive. Two shapes, in order of preference:
    // 1. `pendingSections` -- an ordered array of named, titled sections
    //    (e.g. Lake's Architectural Style / Bedrooms & Bathrooms / Sleep
    //    Count / Backyard / Must-Have / Nice-to-Have, Ranked), each with its
    //    own <h3> -- this is what gives a pending box real presentation
    //    "flow" instead of one undifferentiated blob of images/text.
    // 2. The older flat fields (pendingIntro/pendingImages/pendingCharts/
    //    niceToHaveRanked) -- still supported for a box that hasn't been
    //    reorganized into sections yet (Downtown/Uptown, Outskirts, which
    //    only set pendingNote today, render exactly as before).
    const wrap = el("div", "deep-dive deep-dive--pending");
    pendingChartJobs = [];
    // Clearwater's "1. Buy-Box Summary" hero card (status badge, thesis,
    // why-it-works, spec/revenue chips) -- reuses the same overviewBlock()
    // a developed box's NARRATIVE_BLOCKS.overview renders, so a pending box
    // gets the same at-a-glance opening card instead of starting cold on
    // "Property Profile". Purely additive: a box with no `overview` set
    // renders exactly as before.
    if (box.overview) wrap.appendChild(overviewBlock(box));
    if (box.pendingSections && box.pendingSections.length) {
      box.pendingSections.forEach((section) => wrap.appendChild(renderPendingSection(section)));
    } else {
      if (box.pendingIntro) wrap.appendChild(el("div", "dd-block__body", box.pendingIntro));
      if (box.pendingImages && box.pendingImages.length) {
        wrap.appendChild(renderImageGrid(box.pendingImages));
      }
      if (box.pendingCharts && box.pendingCharts.length) {
        wrap.appendChild(renderWideImageBlock(box.pendingCharts));
      }
      if (box.niceToHaveRanked) wrap.appendChild(niceToHaveRankedBlock(box.niceToHaveRanked));
    }
    wrap.appendChild(el("div", "dd-block__body", box.pendingNote || "This buy box has not been developed yet."));
    host.appendChild(wrap);
    pendingChartJobs.forEach(function (job) { job(); });
    pendingChartJobs = [];
    return;
  }
  const wrap = el("div", "deep-dive bb2");
  (box.buyBoxSections || []).forEach((key) => {
    const build = NARRATIVE_BLOCKS[key];
    if (!build) return; // unknown key: skip silently, same tolerance as ddBlock's null-row skipping
    wrap.appendChild(build(box));
  });
  host.appendChild(wrap);
  if (box.id === "4br" && typeof initFourBrCompMap === "function") initFourBrCompMap(box);
  if (box.id === "1-2br" && typeof initOneTwoBrCompMap === "function") initOneTwoBrCompMap(box);
}
