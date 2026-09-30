/**
 * Section 6: helpers for the analyst-approved REVENUE COMP SETS, one kit per
 * comp set so both tabs share the same components:
 *   COMPSET_5BR (compset_data.js, parkcity_5br_compset.ipynb)     -> Group Home tab
 *   COMPSET_SKI (compset_ski_data.js, parkcity_ski_compset.ipynb) -> Ski-Access tab
 * Every figure is read from the generated data at render time; nothing here
 * is hand-typed data.
 *
 * Comp images (assets/compset5br/, assets/compsetski/) come from each comp's
 * own Airbnb gallery and are labelled "Approved comp"; photos elsewhere in a
 * tab are labelled by ddPhoto (deepdive.js).
 */

const CS_TIERS = ["High", "Medium", "Low"];
const csRange = (a, b) => ddK(a) + "–" + ddK(b);
const csTierPill = (t) => '<span class="cs-tier cs-tier--' + t.toLowerCase() + '">' + t + "</span>";
const csUsd = (n) => (n == null ? "—" : "$" + Math.round(n).toLocaleString("en-US"));
const csRho = (r) => (r.rho == null ? "—" : "ρ " + (r.rho >= 0 ? "+" : "") + r.rho.toFixed(2));
const csEsc = (s) => String(s).replace(/"/g, "&quot;");
const CS_READ = { separates: "Separates", directional: "Directional", no: "Doesn't separate" };
const csRead = (r) => '<span class="read-pill read-pill--' + r.read + '">' + CS_READ[r.read] + (r.read !== "no" && r.rho < 0 ? " (inverse)" : "") + "</span>";

// cfg: { bands: {High, Medium, Low}, locLine(c), flags(c), fullColumns: [[header, fn(c)]], label }
function compsetKit(D, cfg) {
  const comp = (short) => D.comps.find((c) => c.short === short);
  const driver = (key) => D.drivers.find((d) => d.key === key);
  const concept = (name) => D.concepts.find((c) => c.concept === name);
  const amen = (name) => D.amenity_prevalence.find((a) => a.amenity === name);
  const band = (t) => cfg.bands[t];
  const n = (t) => D.tiers[t].n;

  function fmt(v, f, t, r) {
    if (v == null) return "—";
    if (f === "bool") return r[t].n_true + " of " + n(t);
    if (f === "usd") return csUsd(v);
    if (f === "pct") return Math.round(v) + "%";
    if (f === "pctl") return Math.round(v) + "th";
    if (f === "num1") return v.toFixed(1);
    return Number.isInteger(v) ? String(v) : v.toFixed(1);
  }

  // Three tier tiles: band, range, N, median ADR / occupancy.
  function tierBands() {
    return '<div class="cs-bands">' + CS_TIERS.map((t) => {
      const s = D.tiers[t];
      return '<div class="cs-band cs-band--' + t.toLowerCase() + '"><div class="cs-band__label">' + t + " · " + band(t) + "</div>" +
        '<div class="cs-band__value">' + (s.n === 1 ? ddK(s.rev_min) : csRange(s.rev_min, s.rev_max)) + "</div>" +
        '<div class="cs-band__meta">' + s.n + (s.n === 1 ? " comp" : " comps · median " + ddK(s.rev_median)) + "<br>" + (s.n === 1 ? "" : "median ") + "ADR " + csUsd(s.adr_median) + " · " + Math.round(s.occ_median) + "% occupancy</div></div>";
    }).join("") + "</div>";
  }

  // Compact tier profile: the variables that matter, as tier medians.
  function tierTable(keys) {
    let h = '<div class="table-scroll"><table class="data-table dd-mini cs-table"><thead><tr><th>Tier median</th>' + CS_TIERS.map((t) => "<th>" + csTierPill(t) + "</th>").join("") + "</tr></thead><tbody>";
    keys.map(driver).forEach((r) => {
      h += '<tr><th scope="row">' + r.label + "</th>" + CS_TIERS.map((t) => "<td>" + fmt(r[t].median, r.fmt, t, r) + "</td>").join("") + "</tr>";
    });
    return h + "</tbody></table></div>";
  }

  // Driver table: tier medians (ranges when N>1), rank correlation across the
  // set (and the core subset when the notebook computed one), data-derived read.
  function driversTable(keys, coreLabel) {
    let h = '<div class="table-scroll"><table class="data-table dd-feature cs-table"><thead><tr><th>Variable</th>' + CS_TIERS.map((t) => "<th>" + csTierPill(t) + "</th>").join("") +
      "<th>Rank correlation with revenue (N=" + D.comps.length + ")</th>" + (coreLabel ? "<th>" + coreLabel + "</th>" : "") + "<th>Read</th></tr></thead><tbody>";
    keys.map(driver).forEach((r) => {
      h += '<tr><th scope="row">' + r.label + "</th>" +
        CS_TIERS.map((t) => "<td><strong>" + fmt(r[t].median, r.fmt, t, r) + "</strong>" + (r.fmt !== "bool" && n(t) > 1 ? '<br><span class="muted">' + fmt(r[t].min, r.fmt, t, r) + "–" + fmt(r[t].max, r.fmt, t, r) + "</span>" : "") + "</td>").join("") +
        "<td>" + csRho(r) + ' <span class="muted">' + ddP(r.p) + "</span></td>" +
        (coreLabel ? "<td>" + csRho({ rho: r.rho_core }) + ' <span class="muted">' + ddP(r.p_core) + "</span></td>" : "") + "<td>" + csRead(r) + "</td></tr>";
    });
    return h + "</tbody></table></div>";
  }

  // Visual concepts: tier medians of each comp's market percentile; `extra`
  // optionally adds [header, fn(row)] columns (e.g. walkable upper vs low).
  function conceptTable(names, extra) {
    extra = extra || [];
    let h = '<div class="table-scroll"><table class="data-table dd-feature cs-table"><thead><tr><th>Visual signal <span class="muted">(market percentile)</span></th>' +
      CS_TIERS.map((t) => "<th>" + csTierPill(t) + "</th>").join("") + extra.map((e) => "<th>" + e[0] + "</th>").join("") + "<th>Rank correlation (N=" + D.comps.length + ")</th><th>Read</th></tr></thead><tbody>";
    names.map(concept).forEach((r) => {
      h += '<tr><th scope="row">' + r.concept + "</th>" + CS_TIERS.map((t) => "<td>" + Math.round(r[t]) + "</td>").join("") + extra.map((e) => "<td>" + e[1](r) + "</td>").join("") +
        "<td>" + csRho(r) + ' <span class="muted">' + ddP(r.p) + "</span></td><td>" + csRead(r) + "</td></tr>";
    });
    return h + "</tbody></table></div>";
  }

  // One compact card per comp, grouped High -> Medium -> Low; `roles` maps a
  // comp's short name to its analytical role (prose, set in deepdive_content.js).
  function cards(roles) {
    return CS_TIERS.map((t) => {
      const comps = D.comps.filter((c) => c.tier === t);
      const s = D.tiers[t];
      return '<div class="cs-card-group"><h4 class="comp-tier-label">' + csTierPill(t) + " " + band(t) + ' <span class="muted">· ' + comps.length + (comps.length === 1 ? " comp" : " comps · " + csRange(s.rev_min, s.rev_max)) +
        '</span></h4><div class="cs-cards">' + comps.map((c) => {
          const flags = cfg.flags(c);
          return '<article class="cs-card">' +
            '<button type="button" class="cs-card__img" data-lightbox="assets/' + c.cover + '" data-caption="' + csEsc(c.title) + " (approved " + cfg.label + " comp, " + c.tier + ')">' +
            '<img src="assets/' + c.cover + '" alt="' + csEsc(c.title) + '" loading="lazy" decoding="async"></button>' +
            '<div class="cs-card__body"><a class="cs-card__title" href="' + c.url + '" target="_blank" rel="noopener">' + c.short + " ↗</a>" +
            '<div class="cs-card__rev">' + ddK(c.revenue) + ' <span class="muted">· ADR ' + csUsd(c.adr) + " · " + Math.round(c.occ) + "%</span></div>" +
            '<div class="cs-card__line">' + c.bedrooms + "BR / " + c.baths + "BA · sleeps " + c.sleeps + " · " + c.guests_per_bath.toFixed(1) + " guests/bath</div>" +
            '<div class="cs-card__line muted">' + cfg.locLine(c) + "</div>" +
            (roles && roles[c.short] ? '<div class="cs-card__role">' + roles[c.short] + "</div>" : "") +
            (flags.length ? '<div class="cs-card__flag">' + flags.join(" · ") + "</div>" : "") +
            "</div></article>";
        }).join("") + "</div></div>";
    }).join("");
  }

  // Full metrics for every comp (inside a <details>).
  function fullTable() {
    let h = '<div class="table-scroll"><table class="data-table dd-mini cs-table cs-table--full"><thead><tr><th>Comp</th><th>Tier</th>' + cfg.fullColumns.map((col) => "<th>" + col[0] + "</th>").join("") + "</tr></thead><tbody>";
    D.comps.forEach((c) => {
      h += '<tr><th scope="row"><a href="' + c.url + '" target="_blank" rel="noopener">' + c.short + "</a></th><td>" + csTierPill(c.tier) + "</td>" + cfg.fullColumns.map((col) => "<td>" + col[1](c) + "</td>").join("") + "</tr>";
    });
    return h + "</tbody></table></div>";
  }

  // Grouped rows (acquisition routes, walkability bands, ski areas):
  // rows carry n, High/Medium/Low counts, revenue range/median, median ADR.
  function groupTable(rows, keyField, header, status, extraCols) {
    extraCols = extraCols || [];
    let h = '<div class="table-scroll"><table class="data-table dd-feature cs-table"><thead><tr><th>' + header + "</th><th>Comps</th><th>High · Medium · Low</th><th>Revenue range</th><th>Median</th><th>Median ADR</th>" +
      extraCols.map((e) => "<th>" + e[0] + "</th>").join("") + (status ? "<th>Status</th>" : "") + "</tr></thead><tbody>";
    rows.forEach((r) => {
      h += '<tr><th scope="row">' + r[keyField].replace(/ \(regulatory hold\)| \(open supply\)/, "") + "</th><td>" + r.n + "</td><td>" + r.High + " · " + r.Medium + " · " + r.Low + "</td><td>" +
        (r.n === 1 ? ddK(r.rev_min) : csRange(r.rev_min, r.rev_max)) + "</td><td><strong>" + ddK(r.rev_median) + "</strong></td><td>" + csUsd(r.adr_median) + "</td>" +
        extraCols.map((e) => "<td>" + e[1](r) + "</td>").join("") + (status ? '<td class="cell-note">' + (status[r[keyField]] || "") + "</td>" : "") + "</tr>";
    });
    return h + "</tbody></table></div>";
  }

  // Counterexamples: rows of [short, "pattern predicts", "what happened", "lesson"].
  function counterexamples(rows) {
    let h = '<div class="table-scroll"><table class="data-table data-table--wrap cs-table cs-counter"><thead><tr><th>Comp</th><th>The obvious pattern predicts</th><th>What happened</th><th>What it teaches</th></tr></thead><tbody>';
    rows.forEach(([short, predicts, happened, lesson]) => {
      const c = comp(short);
      h += '<tr><th scope="row"><button type="button" class="cs-thumb" data-lightbox="assets/' + c.cover + '" data-caption="' + csEsc(c.title) + '"><img src="assets/' + c.cover + '" alt="" loading="lazy"></button>' +
        '<a href="' + c.url + '" target="_blank" rel="noopener">' + c.short + "</a><br>" + csTierPill(c.tier) + " " + ddK(c.revenue) + '</th><td class="cell-note">' + predicts + '</td><td class="cell-note">' + happened + '</td><td class="cell-note">' + lesson + "</td></tr>";
    });
    return h + "</tbody></table></div>";
  }

  // Compact High / Medium / Low photo comparison: per category, three tier
  // columns of thumbnails with comp name, revenue and a one-line observation.
  // `cats` gives [key, title, interpretation].
  function comparisonHtml(cats) {
    return cats.map(([key, title, interp]) => {
      const cols = CS_TIERS.map((t) => {
        const picks = D.photo_categories[key][t] || [];
        const items = picks.map((p) => {
          const c = comp(p.comp);
          const cap = "Approved " + cfg.label + " comp · " + t + " · " + c.short + " (" + ddK(c.revenue) + "): " + p.caption;
          return '<figure class="cs-cmp__item"><button type="button" class="cs-cmp__img" data-lightbox="assets/' + p.file + '" data-caption="' + csEsc(cap) + '"><img src="assets/' + p.file + '" alt="' + csEsc(p.caption) +
            '" loading="lazy" decoding="async"></button><figcaption><a href="' + c.url + '" target="_blank" rel="noopener">' + c.short + "</a> · " + ddK(c.revenue) + "<br>" + p.caption + "</figcaption></figure>";
        }).join("");
        return '<div class="cs-cmp__col cs-cmp__col--' + t.toLowerCase() + '"><div class="cs-cmp__label">' + t + " · " + band(t) + "</div>" +
          (picks.length ? '<div class="cs-cmp__grid">' + items + "</div>" : '<p class="dd-note">Not shown in this tier’s galleries.</p>') + "</div>";
      }).join("");
      return '<div class="cs-cmp"><h4 class="cs-cmp__title">' + title + '</h4><p class="dd-note">' + interp + '</p><div class="cs-cmp__cols">' + cols + "</div></div>";
    }).join("");
  }

  return { D, comp, driver, concept, amen, band, n, tierBands, tierTable, driversTable, conceptTable, cards, fullTable, groupTable, counterexamples, comparisonHtml };
}

// Buy-box changes: rows of [spec item, "reinforced" | "modified" | "weakened" | "directional", comp evidence, spec now].
function csChanges(rows) {
  let h = '<div class="table-scroll"><table class="data-table data-table--wrap cs-table"><thead><tr><th>Spec item</th><th>Comp verdict</th><th>Approved-comp evidence</th><th>Spec now</th></tr></thead><tbody>';
  rows.forEach(([item, verdict, ev, now]) => {
    h += '<tr><th scope="row">' + item + '</th><td><span class="verdict-pill verdict-pill--' + verdict + '">' + verdict + '</span></td><td class="cell-note">' + ev + '</td><td class="cell-note">' + now + "</td></tr>";
  });
  return h + "</tbody></table></div>";
}

// Side-by-side pair of comps: stats rows + photo rows for compStatsTable /
// compPhotoRowsBlock (render.js). `rows` = [label, fn(c)]; `photos` = [{row, strong, ordinary}]
// with per-row notes/captions supplied by the caller.
function csPair(pair, rows) {
  return rows.map(([label, fn]) => ({ label: label, left: fn(pair.strong), right: fn(pair.ordinary) }));
}

// ---- Group Home kit (5BR+). The cs* names are the Group Home tab's API. ----
const CS = typeof COMPSET_5BR !== "undefined" ? COMPSET_5BR : null;
const CS_BAND = { High: "$300k+", Medium: "$200k–<$300k", Low: "$100k–<$200k" };
const K5 = CS && compsetKit(CS, {
  label: "Group Home",
  bands: CS_BAND,
  locLine: (c) => c.region + " · " + c.main_st_km.toFixed(1) + " km to Main St",
  flags: (c) => [].concat(c.in_product ? [] : ["outside the 5BR+/14+ product"], c.in_snapshot ? [] : ["new since July snapshot"], c.data_quality === "Good Data" ? [] : [c.data_quality.toLowerCase()]),
  fullColumns: [
    ["Revenue", (c) => csUsd(c.revenue)], ["ADR", (c) => csUsd(c.adr)], ["Occ.", (c) => Math.round(c.occ) + "%"],
    ["BR · BA · sleeps · beds", (c) => [c.bedrooms, c.baths, c.sleeps, c.beds].join(" · ")], ["Guests / bath", (c) => c.guests_per_bath.toFixed(1)],
    ["Cleaning fee", (c) => csUsd(c.cleaning_fee)], ["Min stay", (c) => c.min_stay], ["Reference area", (c) => c.region],
    ["Main St · lift (km)", (c) => c.main_st_km.toFixed(1) + " · " + c.lift_km.toFixed(1)], ["Amenities", (c) => c.amen_count],
    ["Visual Score pctl", (c) => Math.round(c.visual_pct)], ["Kids · group reviews", (c) => Math.round(c.kids) + "% · " + Math.round(c.group) + "%"],
    ["Data", (c) => (c.data_quality === "Good Data" ? "Good" : "Possibly good") + (c.in_snapshot ? "" : " · new")],
  ],
});
const csComp = (s) => K5.comp(s), csDriver = (k) => K5.driver(k), csConcept = (k) => K5.concept(k), csAmen = (k) => K5.amen(k);
const csRoute = (prefix) => CS.routes.find((r) => r.route.indexOf(prefix) === 0);
const csTierBands = () => K5.tierBands(), csTierTable = (k) => K5.tierTable(k), csDriversTable = (k) => K5.driversTable(k), csConceptTable = (k) => K5.conceptTable(k);
const csCards = (r) => K5.cards(r), csFullTable = () => K5.fullTable(), csCounterexamples = (r) => K5.counterexamples(r), csComparisonHtml = (c) => K5.comparisonHtml(c);
const csRoutesTable = (status) => K5.groupTable(CS.routes, "route", "Acquisition route", status);

// ---- Ski-Access kit ----
const CSK = typeof COMPSET_SKI !== "undefined" ? COMPSET_SKI : null;
const AREA_SHORT = { "Town Lift / Park City Mountain": "Town Lift", "Deer Valley Snow Park": "Deer Valley Snow Park", "Deer Valley Jordanelle / East Village": "Jordanelle / East Village", "Canyons Village": "Canyons" };
const KS = CSK && compsetKit(CSK, {
  label: "Ski-Access",
  bands: CSK.bands,
  locLine: (c) => AREA_SHORT[c.lift_area] + " " + c.lift_km.toFixed(1) + " km · Main St " + c.main_st_km.toFixed(1) + " km",
  flags: (c) => c.flags || [],
  fullColumns: [
    ["Revenue", (c) => csUsd(c.revenue)], ["ADR", (c) => csUsd(c.adr)], ["Occ.", (c) => Math.round(c.occ) + "%"],
    ["BR · BA · sleeps", (c) => [c.bedrooms, c.baths, c.sleeps].join(" · ")], ["Guests / bath", (c) => c.guests_per_bath.toFixed(1)],
    ["Nearest lift (km)", (c) => AREA_SHORT[c.lift_area] + " " + c.lift_km.toFixed(1)], ["Main St (km)", (c) => c.main_st_km.toFixed(1)],
    ["Finish (photo review)", (c) => c.finish], ["Game room / pool table", (c) => (c.second_space ? "Yes" : "—")], ["Min stay", (c) => c.min_stay],
    ["Visual Score pctl", (c) => Math.round(c.visual_pct)], ["Kids · group reviews", (c) => Math.round(c.kids) + "% · " + Math.round(c.group) + "%"],
    ["Rating", (c) => c.rating + "★ (" + c.reviews + ")"], ["Data", (c) => (c.data_quality === "Good Data" ? "Good" : "Possibly good")],
  ],
});

// Lightbox for the comp cards / thumbnails (buttons carry data-*).
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-lightbox]");
  if (b && typeof openLightbox === "function") openLightbox(b.getAttribute("data-lightbox"), "", b.getAttribute("data-caption"));
});
