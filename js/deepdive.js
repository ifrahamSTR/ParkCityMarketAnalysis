/**
 * Section 6 helpers: turn DEEPDIVE (deepdive_data.js, generated from
 * parkcity_buybox_deepdive.ipynb) into tables, photo objects and inline
 * numbers for the two deep dives in deepdive_content.js. Nothing here is
 * hand-typed data; every figure is read from DEEPDIVE at render time.
 *
 * Small samples: any bucket or comparison side with fewer than DD_THIN
 * listings is greyed and tagged "directional".
 */

const DD_THIN = 5;

const ddK = (n) => (n == null ? "—" : "$" + Math.round(n / 1000) + "k");
const ddPct = (n) => (n == null ? "—" : Math.round(n) + "%");
const ddOf = (a, b) => a + " of " + b;
const ddP = (p) => (p == null ? "—" : p < 0.001 ? "p < 0.001" : "p = " + p.toFixed(p < 0.01 ? 3 : 2));
const ddTag = () => ' <span class="tag-directional">directional</span>';

// Look up a generated row by field value (feature label, bucket, area...).
function ddFind(rows, key, value) {
  return rows.find((r) => r[key] === value);
}

// A reference photo from the market population. The caption is the
// analytical point; the listing identity + revenue are appended from
// DEEPDIVE.photos so they can't drift from the data. If the listing is also
// in an approved comp set (COMPSET_5BR / COMPSET_SKI), it says so; otherwise
// it is labelled a market reference, so comp and reference images never blur.
function ddPhoto(box, key, caption, alt) {
  const p = DEEPDIVE.photos[box][key];
  const u = String(p.url).split("?")[0];
  const inSet = (D) => typeof D !== "undefined" && D && D.comps.find((c) => c.url.split("?")[0] === u);
  const sets = [["Group Home", typeof COMPSET_5BR !== "undefined" ? COMPSET_5BR : null], ["Ski-Access", typeof COMPSET_SKI !== "undefined" ? COMPSET_SKI : null]];
  if (box === "ski") sets.reverse();
  const hit = sets.map(([lab, D]) => [lab, inSet(D)]).find(([, c]) => c);
  const role = hit ? "Approved " + hit[0] + " comp · " + hit[1].tier : "Market reference";
  const meta = role + " · " + p.title + " · " + p.bedrooms + "BR/" + p.baths + "BA · " + ddK(p.revenue) + " (July) · " + p.tier;
  return { file: "assets/" + p.file, alt: alt || caption, caption: caption + " <span class=\"photo-meta\">" + meta + "</span>" };
}

// Compact stat strip for a population summary.
function ddStatStrip(sm, label) {
  return (
    '<div class="dd-statstrip">' +
    [
      [sm.n, label || "listings"],
      [ddK(sm.median), "median revenue"],
      [ddK(sm.p25) + "–" + ddK(sm.p75), "P25–P75"],
      [ddOf(sm.top10_n, sm.n), "in the Top 10%"],
      [ddPct(sm.top25_rate), "reach the Top 25%"],
      ["$" + Math.round(sm.adr), "median ADR"],
      [ddPct(sm.occ), "median occupancy"],
    ]
      .map(([v, l]) => '<div><strong>' + v + "</strong><span>" + l + "</span></div>")
      .join("") +
    "</div>"
  );
}

// Bucket table (capacity, distance, etc.): bucket | N | Top 10% | Top 25% | median.
function ddBucketTable(rows, heading) {
  let h = '<table class="data-table dd-mini"><thead><tr><th>' + heading + "</th><th>N</th><th>Top 10%</th><th>Top 25%</th><th>Median</th></tr></thead><tbody>";
  rows.forEach((r) => {
    if (!r.n) return;
    const thin = r.n < DD_THIN;
    h += "<tr" + (thin ? ' class="is-thin"' : "") + '><th scope="row">' + (r.bucket || r.area) + (thin ? ddTag() : "") + "</th><td>" + r.n + "</td><td>" + r.top10_n +
      "</td><td>" + ddOf(r.top25_n, r.n) + "</td><td>" + ddK(r.median) + "</td></tr>";
  });
  return h + "</tbody></table>";
}

// Several bucket tables side by side.
function ddTableRow(tables) {
  return '<div class="dd-table-row">' + tables.map((t) => '<div class="table-scroll">' + t + "</div>").join("") + "</div>";
}

// Amenity / feature table inside the product: with vs without.
// `classes` maps feature label -> [class label, css modifier].
function ddFeatureTable(rows, classes) {
  let h = '<div class="table-scroll"><table class="data-table dd-feature"><thead><tr><th>Feature</th><th>Role</th><th>Top 25% with</th><th>Top 25% without</th><th>Median with · without</th><th>Test</th></tr></thead><tbody>';
  rows.forEach((r) => {
    const c = classes[r.feature] || ["—", ""];
    const thin = r.thin;
    h += "<tr" + (thin ? ' class="is-thin"' : "") + '><th scope="row">' + r.feature + (thin ? ddTag() : "") + (r.kind === "text" ? ' <span class="muted">(listing text)</span>' : "") +
      '</th><td><span class="role-pill role-pill--' + c[1] + '">' + c[0] + "</span></td><td>" + ddOf(r.top25_with, r.n_with) + "</td><td>" + ddOf(r.top25_without, r.n_without) +
      "</td><td><strong>" + ddK(r.median_with) + "</strong> · " + ddK(r.median_without) + "</td><td>" + ddP(r.p_top25) + "</td></tr>";
  });
  return h + "</tbody></table></div>";
}

// Visual-concept table: size-adjusted and fully adjusted Spearman rho.
// `only` (optional): concept labels to show, in the given order.
function ddConceptTable(rows, compareRows, compareLabel, only) {
  if (only) rows = only.map((c) => rows.find((r) => r.concept === c)).filter(Boolean);
  const cmp = {};
  (compareRows || []).forEach((r) => (cmp[r.concept] = r));
  let h = '<div class="table-scroll"><table class="data-table dd-feature"><thead><tr><th>Visual signal</th><th>After bedrooms</th><th>After bedrooms, baths &amp; amenities</th>' +
    (compareRows ? "<th>" + compareLabel + "<br><span class=\"muted\">after full adjustment</span></th>" : "") + "</tr></thead><tbody>";
  rows.forEach((r) => {
    const cell = (rho, p) => '<td class="' + (p < 0.05 ? (rho > 0 ? "idx-up" : "idx-down") : "") + '">' + (rho >= 0 ? "+" : "") + rho.toFixed(2) + ' <span class="muted">' + ddP(p) + "</span></td>";
    h += '<tr><th scope="row">' + r.concept + "</th>" + cell(r.rho_size_adj, r.p_size_adj) + cell(r.rho_full_adj, r.p_full_adj) +
      (compareRows && cmp[r.concept] ? cell(cmp[r.concept].rho_full_adj, cmp[r.concept].p_full_adj) : compareRows ? "<td>—</td>" : "") + "</tr>";
  });
  return h + "</tbody></table></div>";
}

// Guest-profile mini table (review-derived signals).
function ddGuestTable(g, labels) {
  let h = '<table class="data-table dd-mini"><thead><tr><th></th><th>Kids</th><th>Group trip</th><th>Pet</th><th>N</th></tr></thead><tbody>';
  labels.forEach(([key, lab]) => {
    const r = g[key];
    h += '<tr><th scope="row">' + lab + "</th><td>" + ddPct(r.kids) + "</td><td>" + ddPct(r.group) + "</td><td>" + ddPct(r.pet) + "</td><td>" + r.n + "</td></tr>";
  });
  return '<div class="table-scroll">' + h + "</tbody></table></div>";
}

// Stats for a paired case study (left = strong, right = ordinary).
function ddPairStats(pair, extra) {
  const a = pair.strong, b = pair.ordinary;
  const rows = [
    ["Revenue Potential", ddK(a.revenue) + " (" + a.tier + ")", ddK(b.revenue) + " (" + b.tier + ")"],
    ["ADR · occupancy", "$" + Math.round(a.adr) + " · " + ddPct(a.occ), "$" + Math.round(b.adr) + " · " + ddPct(b.occ)],
    ["Bedrooms · baths · sleeps", a.bedrooms + " · " + a.baths + " · " + a.sleeps, b.bedrooms + " · " + b.baths + " · " + b.sleeps],
    ["Guests per bathroom", (a.sleeps / a.baths).toFixed(1), (b.sleeps / b.baths).toFixed(1)],
    ["Hot tub · entertainment amenities", (a.hot_tub ? "Yes" : "No") + " · " + a.ent_stack, (b.hot_tub ? "Yes" : "No") + " · " + b.ent_stack],
    ["Overall Visual Score", a.visual_score == null ? "—" : a.visual_score.toFixed(1), b.visual_score == null ? "—" : b.visual_score.toFixed(1)],
    ["Rating (reviews)", a.rating + "★ (" + a.reviews + ")", b.rating + "★ (" + b.reviews + ")"],
  ].concat(extra ? extra(a, b) : []);
  return rows.map(([label, left, right]) => ({ label: label, left: left, right: right }));
}

// "Buy the real estate vs. add it later" checklist.
// rows: [feature, "buy" | "add" | "either", why, evidence, strength]
function ddChecklist(rows) {
  const lab = { buy: "Buy the real estate", add: "Add at conversion", either: "Buy the space, add the equipment" };
  let h = '<div class="table-scroll"><table class="data-table data-table--wrap dd-checklist"><thead><tr><th>Requirement</th><th>How to get it</th><th>Why</th><th>Evidence</th></tr></thead><tbody>';
  rows.forEach(([feat, how, why, ev, strength]) => {
    h += '<tr><th scope="row">' + feat + '</th><td><span class="how-pill how-pill--' + how + '">' + lab[how] + '</span></td><td class="cell-note">' + why +
      '</td><td class="cell-note">' + ev + ' <span class="strength strength--' + strength + '">' + strength + "</span></td></tr>";
  });
  return h + "</tbody></table></div>";
}

// Recap table: [label, value] rows.
function ddRecap(rows) {
  return '<table class="summary-sheet-table">' + rows.map(([k, v]) => "<tr><td>" + k + "</td><td>" + v + "</td></tr>").join("") + "</table>";
}

// Ranked nice-to-have items from the generated feature rows.
function ddRanked(rows, picks) {
  return picks.map(([feature, note, images, forceThin]) => {
    const r = ddFind(rows, "feature", feature);
    const thin = forceThin || r.thin;
    const uplift = r.median_without ? Math.round((r.median_with / r.median_without - 1) * 100) : null;
    const hit = Math.round((r.top10_with / r.n_with - r.top10_without / r.n_without) * 100);
    return thin
      ? { name: feature, thinData: true, n: r.n_with, note: "N=" + r.n_with + ". " + note, images: images || [] }
      : { name: feature, revenueUplift: (uplift >= 0 ? "+" : "") + uplift + "% median", p90Uplift: (hit >= 0 ? "+" : "") + hit + "pp", n: r.n_with, note: note, images: images || [] };
  });
}
