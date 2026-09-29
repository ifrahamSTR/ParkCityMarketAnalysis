/**
 * Section 6, Group Home tab: helpers for the analyst-approved REVENUE COMP SET
 * (COMPSET_5BR in compset_data.js, generated from
 * ../notebooks/parkcity_5br_compset.ipynb). Every figure is read from
 * COMPSET_5BR at render time; nothing here is hand-typed data.
 *
 * Comp images (assets/compset5br/) come from each comp's own Airbnb gallery
 * and are labelled "Approved comp"; images elsewhere in the tab are market
 * reference examples (see ddPhoto in deepdive.js).
 */

const CS = typeof COMPSET_5BR !== "undefined" ? COMPSET_5BR : null;
const CS_TIERS = ["High", "Medium", "Low"];
const CS_BAND = { High: "$300k+", Medium: "$200k–<$300k", Low: "$100k–<$200k" };

const csComp = (short) => CS.comps.find((c) => c.short === short);
const csDriver = (key) => CS.drivers.find((d) => d.key === key);
const csConcept = (name) => CS.concepts.find((c) => c.concept === name);
const csAmen = (name) => CS.amenity_prevalence.find((a) => a.amenity === name);
const csRoute = (prefix) => CS.routes.find((r) => r.route.indexOf(prefix) === 0);
const csRange = (a, b) => ddK(a) + "–" + ddK(b);
const csTierPill = (t) => '<span class="cs-tier cs-tier--' + t.toLowerCase() + '">' + t + "</span>";
const csUsd = (n) => (n == null ? "—" : "$" + Math.round(n).toLocaleString("en-US"));
const csRho = (r) => "ρ " + (r.rho >= 0 ? "+" : "") + r.rho.toFixed(2);

// Format a driver value by its declared unit.
function csFmt(v, fmt) {
  if (v == null) return "—";
  if (fmt === "usd") return csUsd(v);
  if (fmt === "pct") return Math.round(v) + "%";
  if (fmt === "pctl") return Math.round(v) + "th";
  if (fmt === "num1") return v.toFixed(1);
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

// Three tier tiles: band, range, N, median ADR / occupancy.
function csTierBands() {
  return (
    '<div class="cs-bands">' +
    CS_TIERS.map((t) => {
      const s = CS.tiers[t];
      return (
        '<div class="cs-band cs-band--' + t.toLowerCase() + '"><div class="cs-band__label">' + t + " · " + CS_BAND[t] + "</div>" +
        '<div class="cs-band__value">' + csRange(s.rev_min, s.rev_max) + "</div>" +
        '<div class="cs-band__meta">' + s.n + " comps · median " + ddK(s.rev_median) + "<br>median ADR " + csUsd(s.adr_median) + " · " + Math.round(s.occ_median) + "% occupancy</div></div>"
      );
    }).join("") +
    "</div>"
  );
}

// Compact tier profile: the variables that matter, as tier medians.
function csTierTable(keys) {
  const rows = keys.map(csDriver);
  let h = '<div class="table-scroll"><table class="data-table dd-mini cs-table"><thead><tr><th>Tier median</th>' + CS_TIERS.map((t) => "<th>" + csTierPill(t) + "</th>").join("") + "</tr></thead><tbody>";
  rows.forEach((r) => {
    h += '<tr><th scope="row">' + r.label + "</th>" + CS_TIERS.map((t) => "<td>" + csFmt(r[t].median, r.fmt) + "</td>").join("") + "</tr>";
  });
  return h + "</tbody></table></div>";
}

// Driver table: tier medians (with ranges), rank correlation with revenue
// across all 14 comps, and a data-derived read (p<0.05 / <0.2 / other).
function csDriversTable(keys) {
  const lab = { separates: "Separates", directional: "Directional", no: "Doesn't separate" };
  let h = '<div class="table-scroll"><table class="data-table dd-feature cs-table"><thead><tr><th>Variable</th>' + CS_TIERS.map((t) => "<th>" + csTierPill(t) + "</th>").join("") +
    "<th>Rank correlation with revenue (N=14)</th><th>Read</th></tr></thead><tbody>";
  keys.map(csDriver).forEach((r) => {
    h += '<tr><th scope="row">' + r.label + "</th>" +
      CS_TIERS.map((t) => "<td><strong>" + csFmt(r[t].median, r.fmt) + '</strong><br><span class="muted">' + csFmt(r[t].min, r.fmt) + "–" + csFmt(r[t].max, r.fmt) + "</span></td>").join("") +
      "<td>" + csRho(r) + ' <span class="muted">' + ddP(r.p) + '</span></td><td><span class="read-pill read-pill--' + r.read + '">' + lab[r.read] + (r.read !== "no" && r.rho < 0 ? " (inverse)" : "") + "</span></td></tr>";
  });
  return h + "</tbody></table></div>";
}

// Visual concepts: tier medians of each comp's market percentile.
function csConceptTable(names) {
  const lab = { separates: "Separates", directional: "Directional", no: "Doesn't separate" };
  let h = '<div class="table-scroll"><table class="data-table dd-feature cs-table"><thead><tr><th>Visual signal <span class="muted">(market percentile)</span></th>' +
    CS_TIERS.map((t) => "<th>" + csTierPill(t) + "</th>").join("") + "<th>Rank correlation (N=14)</th><th>Read</th></tr></thead><tbody>";
  names.map(csConcept).forEach((r) => {
    h += '<tr><th scope="row">' + r.concept + "</th>" + CS_TIERS.map((t) => "<td>" + Math.round(r[t]) + "</td>").join("") +
      "<td>" + csRho(r) + ' <span class="muted">' + ddP(r.p) + '</span></td><td><span class="read-pill read-pill--' + r.read + '">' + lab[r.read] + (r.read !== "no" && r.rho < 0 ? " (inverse)" : "") + "</span></td></tr>";
  });
  return h + "</tbody></table></div>";
}

// One compact card per comp, grouped High -> Medium -> Low; `roles` maps a
// comp's short name to its analytical role (prose, set in deepdive_content.js).
function csCards(roles) {
  return CS_TIERS.map((t) => {
    const comps = CS.comps.filter((c) => c.tier === t);
    return (
      '<div class="cs-card-group"><h4 class="comp-tier-label">' + csTierPill(t) + " " + CS_BAND[t] + ' <span class="muted">· ' + comps.length + " comps · " +
      csRange(CS.tiers[t].rev_min, CS.tiers[t].rev_max) + '</span></h4><div class="cs-cards">' +
      comps.map((c) => {
        const flags = [];
        if (!c.in_product) flags.push("outside the 5BR+/14+ product");
        if (!c.in_snapshot) flags.push("new since July snapshot");
        if (c.data_quality !== "Good Data") flags.push(c.data_quality.toLowerCase());
        return (
          '<article class="cs-card">' +
          '<button type="button" class="cs-card__img" data-lightbox="assets/' + c.cover + '" data-caption="' + c.title.replace(/"/g, "&quot;") + ' (approved comp, ' + c.tier + ')">' +
          '<img src="assets/' + c.cover + '" alt="' + c.title.replace(/"/g, "&quot;") + '" loading="lazy" decoding="async"></button>' +
          '<div class="cs-card__body"><a class="cs-card__title" href="' + c.url + '" target="_blank" rel="noopener">' + c.short + " ↗</a>" +
          '<div class="cs-card__rev">' + ddK(c.revenue) + ' <span class="muted">· ADR ' + csUsd(c.adr) + " · " + Math.round(c.occ) + "%</span></div>" +
          '<div class="cs-card__line">' + c.bedrooms + "BR / " + c.baths + "BA · sleeps " + c.sleeps + " · " + c.guests_per_bath.toFixed(1) + " guests/bath</div>" +
          '<div class="cs-card__line muted">' + c.region + " · " + c.main_st_km.toFixed(1) + " km to Main St</div>" +
          (roles && roles[c.short] ? '<div class="cs-card__role">' + roles[c.short] + "</div>" : "") +
          (flags.length ? '<div class="cs-card__flag">' + flags.join(" · ") + "</div>" : "") +
          "</div></article>"
        );
      }).join("") +
      "</div></div>"
    );
  }).join("");
}

// Full metrics for all 14 (inside a <details>).
function csFullTable() {
  let h = '<div class="table-scroll"><table class="data-table dd-mini cs-table cs-table--full"><thead><tr><th>Comp</th><th>Tier</th><th>Revenue</th><th>ADR</th><th>Occ.</th><th>BR · BA · sleeps · beds</th>' +
    "<th>Guests / bath</th><th>Cleaning fee</th><th>Min stay</th><th>Reference area</th><th>Main St · lift (km)</th><th>Amenities</th><th>Visual Score pctl</th><th>Kids · group reviews</th><th>Data</th></tr></thead><tbody>";
  CS.comps.forEach((c) => {
    h += '<tr><th scope="row"><a href="' + c.url + '" target="_blank" rel="noopener">' + c.short + "</a></th><td>" + csTierPill(c.tier) + "</td><td>" + csUsd(c.revenue) + "</td><td>" + csUsd(c.adr) + "</td><td>" + Math.round(c.occ) + "%</td><td>" +
      [c.bedrooms, c.baths, c.sleeps, c.beds].join(" · ") + "</td><td>" + c.guests_per_bath.toFixed(1) + "</td><td>" + csUsd(c.cleaning_fee) + "</td><td>" + c.min_stay + "</td><td>" + c.region + "</td><td>" +
      c.main_st_km.toFixed(1) + " · " + c.lift_km.toFixed(1) + "</td><td>" + c.amen_count + "</td><td>" + Math.round(c.visual_pct) + "</td><td>" + Math.round(c.kids) + "% · " + Math.round(c.group) + "%</td><td>" +
      (c.data_quality === "Good Data" ? "Good" : "Possibly good") + (c.in_snapshot ? "" : " · new") + "</td></tr>";
  });
  return h + "</tbody></table></div>";
}

// Acquisition routes: where the comps sit and what each route earns.
function csRoutesTable(status) {
  let h = '<div class="table-scroll"><table class="data-table dd-feature cs-table"><thead><tr><th>Acquisition route</th><th>Comps</th><th>High · Medium · Low</th><th>Revenue range</th><th>Median</th><th>Median ADR</th><th>Status</th></tr></thead><tbody>';
  CS.routes.forEach((r) => {
    h += '<tr><th scope="row">' + r.route.replace(/ \(.*\)$/, "") + "</th><td>" + r.n + "</td><td>" + r.High + " · " + r.Medium + " · " + r.Low + "</td><td>" + csRange(r.rev_min, r.rev_max) +
      "</td><td><strong>" + ddK(r.rev_median) + "</strong></td><td>" + csUsd(r.adr_median) + '</td><td class="cell-note">' + (status[r.route] || "") + "</td></tr>";
  });
  return h + "</tbody></table></div>";
}

// Counterexamples: rows of [short, "pattern predicts", "what happened", "lesson"].
function csCounterexamples(rows) {
  let h = '<div class="table-scroll"><table class="data-table data-table--wrap cs-table cs-counter"><thead><tr><th>Comp</th><th>The obvious pattern predicts</th><th>What happened</th><th>What it teaches</th></tr></thead><tbody>';
  rows.forEach(([short, predicts, happened, lesson]) => {
    const c = csComp(short);
    h += '<tr><th scope="row"><button type="button" class="cs-thumb" data-lightbox="assets/' + c.cover + '" data-caption="' + c.title.replace(/"/g, "&quot;") + '"><img src="assets/' + c.cover + '" alt="" loading="lazy"></button>' +
      '<a href="' + c.url + '" target="_blank" rel="noopener">' + c.short + "</a><br>" + csTierPill(c.tier) + " " + ddK(c.revenue) + '</th><td class="cell-note">' + predicts + '</td><td class="cell-note">' + happened + '</td><td class="cell-note">' + lesson + "</td></tr>";
  });
  return h + "</tbody></table></div>";
}

// Buy-box changes: rows of [spec item, "reinforced" | "modified" | "weakened" | "directional", comp evidence, spec now].
function csChanges(rows) {
  let h = '<div class="table-scroll"><table class="data-table data-table--wrap cs-table"><thead><tr><th>Spec item</th><th>Comp verdict</th><th>Approved-comp evidence</th><th>Spec now</th></tr></thead><tbody>';
  rows.forEach(([item, verdict, ev, now]) => {
    h += '<tr><th scope="row">' + item + '</th><td><span class="verdict-pill verdict-pill--' + verdict + '">' + verdict + '</span></td><td class="cell-note">' + ev + '</td><td class="cell-note">' + now + "</td></tr>";
  });
  return h + "</tbody></table></div>";
}

// Lightbox for the comp cards / counterexample thumbnails (buttons carry data-*).
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-lightbox]");
  if (b && typeof openLightbox === "function") openLightbox(b.getAttribute("data-lightbox"), "", b.getAttribute("data-caption"));
});

// Compact High / Medium / Low photo comparison (replaces the template's
// tall card-per-property layout): per category, three tier columns of
// thumbnails, each with the comp name, revenue and a one-line observation.
// `cats` gives [key, title, interpretation].
function csComparisonHtml(cats) {
  const esc = (s) => String(s).replace(/"/g, "&quot;");
  return cats.map(([key, title, interp]) => {
    const cols = CS_TIERS.map((t) => {
      const items = (CS.photo_categories[key][t] || []).map((p) => {
        const c = csComp(p.comp);
        const cap = "Approved comp · " + t + " · " + c.short + " (" + ddK(c.revenue) + "): " + p.caption;
        return '<figure class="cs-cmp__item"><button type="button" class="cs-cmp__img" data-lightbox="assets/' + p.file + '" data-caption="' + esc(cap) + '"><img src="assets/' + p.file + '" alt="' + esc(p.caption) +
          '" loading="lazy" decoding="async"></button><figcaption><a href="' + c.url + '" target="_blank" rel="noopener">' + c.short + "</a> · " + ddK(c.revenue) + "<br>" + p.caption + "</figcaption></figure>";
      }).join("");
      return '<div class="cs-cmp__col cs-cmp__col--' + t.toLowerCase() + '"><div class="cs-cmp__label">' + t + " · " + CS_BAND[t] + '</div><div class="cs-cmp__grid">' + items + "</div></div>";
    }).join("");
    return '<div class="cs-cmp"><h4 class="cs-cmp__title">' + title + '</h4><p class="dd-note">' + interp + '</p><div class="cs-cmp__cols">' + cols + "</div></div>";
  }).join("");
}
