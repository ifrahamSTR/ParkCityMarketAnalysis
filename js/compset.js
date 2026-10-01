/**
 * Section 6: components for the analyst-approved REVENUE COMP SETS, one kit
 * per comp set so both tabs share the same presentation:
 *   COMPSET_5BR (compset_data.js, parkcity_5br_compset.ipynb)     -> Group Home tab
 *   COMPSET_SKI (compset_ski_data.js, parkcity_ski_compset.ipynb) -> Ski-Access tab
 *
 * The page shows plain-English conclusions only. Correlations, p-values and
 * visual-model scores stay in the notebooks; figures shown here (revenue,
 * nightly rate, occupancy, counts) are read from the generated data.
 *
 * Comp images come from each comp's own Airbnb gallery and are labelled
 * "Approved comp"; other photos in a tab are labelled by ddPhoto (deepdive.js).
 */

const CS_TIERS = ["High", "Medium", "Low"];
const csRange = (a, b) => (Math.round(a / 1000) === Math.round(b / 1000) ? ddK(a) : ddK(a) + "–" + ddK(b));
const csTierName = (t) => (t === "Ceiling" ? "Ceiling / Overlap" : t);
const csTierPill = (t) => '<span class="cs-tier cs-tier--' + t.toLowerCase() + '">' + csTierName(t) + "</span>";
const csUsd = (n) => (n == null ? "—" : "$" + Math.round(n).toLocaleString("en-US"));
const csEsc = (s) => String(s).replace(/"/g, "&quot;");

// cfg: { label, bands: {tier: text}, tiers: [...card/band tiers], locLine(c), flags(c), fullColumns: [[header, fn(c)]] }
function compsetKit(D, cfg) {
  const tiers = cfg.tiers || CS_TIERS;
  const comp = (short) => D.comps.find((c) => c.short === short);
  const amen = (name) => D.amenity_prevalence.find((a) => a.amenity === name);
  const band = (t) => cfg.bands[t];
  const T = (t) => D.tiers[t];

  // A photo already chosen for the visual comparison (category, comp[, position]).
  function pic(cat, short, pos) {
    const all = Object.values(D.photo_categories[cat] || {}).flat();
    const p = all.find((x) => x.comp === short && (pos == null || x.photo_position === pos));
    const c = comp(short);
    return { file: "assets/" + p.file, alt: p.caption, caption: "Approved " + cfg.label + " comp · " + csTierName(c.tier) + " · " + c.short + ": " + p.caption };
  }
  function cover(short, caption) {
    const c = comp(short);
    return { file: "assets/" + c.cover, alt: c.title, caption: "Approved " + cfg.label + " comp · " + csTierName(c.tier) + " · " + c.short + (caption ? ": " + caption : "") };
  }

  // Tier tiles: band, revenue range, count, typical nightly rate and occupancy.
  function tierBands() {
    return '<div class="cs-bands cs-bands--' + tiers.length + '">' + tiers.map((t) => {
      const s = T(t);
      return '<div class="cs-band cs-band--' + t.toLowerCase() + '"><div class="cs-band__label">' + csTierName(t) + " · " + band(t) + "</div>" +
        '<div class="cs-band__value">' + csRange(s.rev_min, s.rev_max) + "</div>" +
        '<div class="cs-band__meta">' + s.n + (s.n === 1 ? " comp" : " comps") + " · " + csUsd(s.adr_median) + " a night · " + Math.round(s.occ_median) + "% of nights</div></div>";
    }).join("") + "</div>";
  }

  // Plain tier table: rows = [label, fn(tierSummary, tier) -> text, what it means].
  function tierFacts(rows, cols) {
    cols = cols || tiers;
    let h = '<div class="table-scroll"><table class="data-table dd-mini cs-table cs-facts"><thead><tr><th></th>' + cols.map((t) => "<th>" + csTierPill(t) + "</th>").join("") + "<th>What it means</th></tr></thead><tbody>";
    rows.forEach(([label, fn, meaning]) => {
      h += '<tr><th scope="row">' + label + "</th>" + cols.map((t) => "<td>" + fn(T(t), t) + "</td>").join("") + '<td class="cell-note">' + meaning + "</td></tr>";
    });
    return h + "</tbody></table></div>";
  }

  // One compact card per comp, grouped by tier; `roles` maps a comp's short
  // name to a one-line role (prose, set in deepdive_content.js).
  function cards(roles) {
    return tiers.map((t) => {
      const comps = D.comps.filter((c) => c.tier === t);
      if (!comps.length) return "";
      return '<div class="cs-card-group"><h4 class="comp-tier-label">' + csTierPill(t) + " " + band(t) + ' <span class="muted">· ' + comps.length + (comps.length === 1 ? " comp" : " comps") + "</span></h4>" +
        '<div class="cs-cards">' + comps.map((c) => {
          const flags = cfg.flags(c);
          return '<article class="cs-card">' +
            '<button type="button" class="cs-card__img" data-lightbox="assets/' + c.cover + '" data-caption="' + csEsc(c.title) + " (approved " + cfg.label + " comp, " + csTierName(c.tier) + ')">' +
            '<img src="assets/' + c.cover + '" alt="' + csEsc(c.title) + '" loading="lazy" decoding="async"></button>' +
            '<div class="cs-card__body"><a class="cs-card__title" href="' + c.url + '" target="_blank" rel="noopener">' + c.short + " ↗</a>" +
            '<div class="cs-card__rev">' + ddK(c.revenue) + ' <span class="muted">· ' + csUsd(c.adr) + " a night · " + Math.round(c.occ) + "% of nights</span></div>" +
            '<div class="cs-card__line">' + c.bedrooms + "BR / " + c.baths + "BA · sleeps " + c.sleeps + "</div>" +
            '<div class="cs-card__line muted">' + cfg.locLine(c) + "</div>" +
            (roles && roles[c.short] ? '<div class="cs-card__role">' + roles[c.short] + "</div>" : "") +
            (flags.length ? '<div class="cs-card__flag">' + flags.join(" · ") + "</div>" : "") +
            "</div></article>";
        }).join("") + "</div></div>";
    }).join("");
  }

  function fullTable() {
    let h = '<div class="table-scroll"><table class="data-table dd-mini cs-table cs-table--full"><thead><tr><th>Comp</th><th>Tier</th>' + cfg.fullColumns.map((col) => "<th>" + col[0] + "</th>").join("") + "</tr></thead><tbody>";
    D.comps.forEach((c) => {
      h += '<tr><th scope="row"><a href="' + c.url + '" target="_blank" rel="noopener">' + c.short + "</a></th><td>" + csTierPill(c.tier) + "</td>" + cfg.fullColumns.map((col) => "<td>" + col[1](c) + "</td>").join("") + "</tr>";
    });
    return h + "</tbody></table></div>";
  }

  // Grouped rows (acquisition routes, walkability, ski areas).
  // `extra`: optional [header, fn(row)] columns placed before the status column.
  function groupTable(rows, keyField, header, status, extra) {
    extra = extra || [];
    const cnt = tiers.filter((t) => rows.some((r) => r[t]));
    let h = '<div class="table-scroll"><table class="data-table dd-feature cs-table"><thead><tr><th>' + header + "</th><th>Comps</th><th>" + cnt.map(csTierName).join(" · ") + "</th><th>Revenue</th><th>Typical nightly rate</th>" +
      extra.map((e) => "<th>" + e[0] + "</th>").join("") + (status ? "<th>What it means</th>" : "") + "</tr></thead><tbody>";
    rows.forEach((r) => {
      h += '<tr><th scope="row">' + r[keyField].replace(/ \(regulatory hold\)| \(open supply\)/, "") + "</th><td>" + r.n + "</td><td>" + cnt.map((t) => r[t] || 0).join(" · ") + "</td><td>" +
        csRange(r.rev_min, r.rev_max) + "</td><td>" + csUsd(r.adr_median) + "</td>" + extra.map((e) => "<td>" + e[1](r) + "</td>").join("") + (status ? '<td class="cell-note">' + (status[r[keyField]] || "") + "</td>" : "") + "</tr>";
    });
    return h + "</tbody></table></div>";
  }

  // High / Medium / Low photo comparison: per category, one column per tier.
  // `cats` gives [key, title, one-line takeaway].
  function comparisonHtml(cats, cmpTiers) {
    cmpTiers = cmpTiers || CS_TIERS;
    return cats.map(([key, title, interp]) => {
      const cols = cmpTiers.map((t) => {
        const picks = D.photo_categories[key][t] || [];
        const items = picks.map((p) => {
          const c = comp(p.comp);
          const cap = "Approved " + cfg.label + " comp · " + csTierName(t) + " · " + c.short + " (" + ddK(c.revenue) + "): " + p.caption;
          return '<figure class="cs-cmp__item"><button type="button" class="cs-cmp__img" data-lightbox="assets/' + p.file + '" data-caption="' + csEsc(cap) + '"><img src="assets/' + p.file + '" alt="' + csEsc(p.caption) +
            '" loading="lazy" decoding="async"></button><figcaption><a href="' + c.url + '" target="_blank" rel="noopener">' + c.short + "</a> · " + ddK(c.revenue) + "<br>" + p.caption + "</figcaption></figure>";
        }).join("");
        return '<div class="cs-cmp__col cs-cmp__col--' + t.toLowerCase() + '"><div class="cs-cmp__label">' + csTierName(t) + " · " + band(t) + "</div>" +
          (picks.length ? '<div class="cs-cmp__grid">' + items + "</div>" : '<p class="dd-note">Not shown in this tier’s galleries.</p>') + "</div>";
      }).join("");
      return '<div class="cs-cmp"><h4 class="cs-cmp__title">' + title + '</h4><p class="dd-note">' + interp + '</p><div class="cs-cmp__cols">' + cols + "</div></div>";
    }).join("");
  }

  return { D, comp, amen, band, T, pic, cover, tierBands, tierFacts, cards, fullTable, groupTable, comparisonHtml };
}

// Side-by-side pair of comps for compStatsTable (render.js): rows = [label, fn(c)].
function csPair(pair, rows) {
  return rows.map(([label, fn]) => ({ label: label, left: fn(pair.strong), right: fn(pair.ordinary) }));
}

// One-Page Recap in the team's BuyBox Template V.2 layout: categories in the
// template's order, one short answer per subcategory.
// sections = [[category, [[subcategory, answer], ...]], ...]
function csTemplate(sections) {
  let h = '<div class="table-scroll"><table class="bb-template"><thead><tr><th>Category</th><th>Subcategory</th><th>Park City answer</th></tr></thead><tbody>';
  sections.forEach(([cat, rows]) => {
    rows.forEach(([sub, val], i) => {
      h += "<tr>" + (i === 0 ? '<th scope="rowgroup" rowspan="' + rows.length + '" class="bb-template__cat">' + cat + "</th>" : "") +
        '<td class="bb-template__sub">' + sub + "</td><td>" + val + "</td></tr>";
    });
  });
  return h + "</tbody></table></div>";
}

// ---- Group Home kit (5BR+) ----
const CS = typeof COMPSET_5BR !== "undefined" ? COMPSET_5BR : null;
const CS_BAND = { High: "$300k+", Medium: "$200k–<$300k", Low: "$100k–<$200k" };
const K5 = CS && compsetKit(CS, {
  label: "Group Home",
  bands: CS_BAND,
  locLine: (c) => c.region + " · " + c.main_st_km.toFixed(1) + " km to Main St",
  flags: (c) => [].concat(c.in_product ? [] : ["sleeps under 14"], c.in_snapshot ? [] : ["new listing"]),
  fullColumns: [
    ["Revenue", (c) => csUsd(c.revenue)], ["Nightly rate", (c) => csUsd(c.adr)], ["Nights filled", (c) => Math.round(c.occ) + "%"],
    ["BR · BA · sleeps", (c) => [c.bedrooms, c.baths, c.sleeps].join(" · ")], ["Guests per bath", (c) => c.guests_per_bath.toFixed(1)],
    ["Area", (c) => c.region], ["Km to Main St", (c) => c.main_st_km.toFixed(1)], ["Tracked amenities", (c) => c.amen_count],
    ["Reviews with kids · group trips", (c) => Math.round(c.kids) + "% · " + Math.round(c.group) + "%"],
  ],
});

const csRoute = (prefix) => CS.routes.find((r) => r.route.indexOf(prefix) === 0);

// ---- Ski-Access kit ----
const CSK = typeof COMPSET_SKI !== "undefined" ? COMPSET_SKI : null;
const AREA_SHORT = { "Town Lift / Park City Mountain": "Town Lift", "Deer Valley Snow Park": "Deer Valley Snow Park", "Deer Valley Jordanelle / East Village": "Jordanelle / East Village", "Canyons Village": "Canyons" };
const KS = CSK && compsetKit(CSK, {
  label: "Ski-Access",
  bands: Object.assign({}, CSK.bands, { Ceiling: "$300k+" }),
  tiers: ["Ceiling", "High", "Medium", "Low"],
  locLine: (c) => AREA_SHORT[c.lift_area] + " · " + c.main_st_km.toFixed(1) + " km to Main St",
  flags: () => [],
  fullColumns: [
    ["Revenue", (c) => csUsd(c.revenue)], ["Nightly rate", (c) => csUsd(c.adr)], ["Nights filled", (c) => Math.round(c.occ) + "%"],
    ["BR · BA · sleeps", (c) => [c.bedrooms, c.baths, c.sleeps].join(" · ")], ["Guests per bath", (c) => c.guests_per_bath.toFixed(1)],
    ["Nearest lift", (c) => AREA_SHORT[c.lift_area] + " · " + c.lift_km.toFixed(1) + " km"], ["Km to Main St", (c) => c.main_st_km.toFixed(1)],
    ["Interior finish", (c) => c.finish], ["Game room / pool table", (c) => (c.second_space ? "Yes" : "—")],
    ["Reviews with kids · group trips", (c) => Math.round(c.kids) + "% · " + Math.round(c.group) + "%"],
  ],
});

// Lightbox for cards / thumbnails (buttons carry data-*).
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-lightbox]");
  if (b && typeof openLightbox === "function") openLightbox(b.getAttribute("data-lightbox"), "", b.getAttribute("data-caption"));
});
