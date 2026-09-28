/**
 * Section 3 cluster research: the parts of the location analysis that go
 * beyond Charlotte's map + bullet list. That covers how the clusters were
 * found, the region scorecard, the size-controlled table, distance to the
 * lifts, region profile cards and the Top 10% roster. Numbers come from
 * REGION_RESEARCH (region_data.js, generated) and prose from data.js
 * (CLUSTER_METHOD, REGION_PROFILES).
 */

const SIZE_KEYS = ["1-2BR", "3BR", "4BR", "5BR+"];

// map.js (which also defines this) isn't loaded on this page -- Section 3
// uses the embedded folium map, not the template's native Leaflet map.
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function regionById(id) {
  return REGION_RESEARCH.regions.find((r) => r.id === id);
}

function regionDot(r) {
  return '<span class="region-dot" style="background:' + r.color + '"></span>';
}

function renderClusterMethod() {
  const host = document.getElementById("cluster-method");
  if (!host) return;
  host.innerHTML = listHtml(CLUSTER_METHOD);
}

// Region scorecard: one row per region, with the best value in each column
// highlighted so the strongest region per metric is visible at a glance.
function renderRegionScorecard() {
  const host = document.getElementById("region-scorecard");
  if (!host) return;
  const regions = REGION_RESEARCH.regions;
  const cols = [
    { key: "n", label: "N", fmt: (r) => r.n + ' <span class="muted">(' + Math.round(r.share) + "%)</span>", best: "max" },
    { key: "medianRev", label: "Median revenue", fmt: (r) => fmtCurrency(r.medianRev), best: "max" },
    { key: "revPerBr", label: "Revenue / bedroom", fmt: (r) => fmtCurrency(r.revPerBr), best: "max" },
    { key: "medianAdr", label: "Median ADR", fmt: (r) => fmtCurrency(r.medianAdr), best: "max" },
    { key: "medianOcc", label: "Median occ.", fmt: (r) => r.medianOcc + "%", best: "max" },
    { key: "top10Rate", label: "Top 10% hit rate", fmt: (r) => Math.round(r.top10Rate) + '% <span class="muted">(' + r.top10N + ")</span>", best: "max" },
    { key: "top25Rate", label: "Top 25% hit rate", fmt: (r) => Math.round(r.top25Rate) + "%", best: "max" },
    { key: "bigShare", label: "4BR+ share", fmt: (r) => r.bigShare + "%", best: "max" },
    { key: "hotTub", label: "Hot tub", fmt: (r) => r.hotTub + "%", best: "max" },
  ];
  const best = {};
  cols.forEach((c) => (best[c.key] = Math.max.apply(null, regions.map((r) => r[c.key]))));
  let html = '<div class="table-scroll"><table class="data-table"><thead><tr><th>Region</th>';
  cols.forEach((c) => (html += "<th>" + c.label + "</th>"));
  html += "</tr></thead><tbody>";
  regions.forEach((r) => {
    html += '<tr><th scope="row">' + regionDot(r) + r.name + "</th>";
    cols.forEach((c) => {
      html += "<td" + (r[c.key] === best[c.key] ? ' class="is-best"' : "") + ">" + c.fmt(r) + "</td>";
    });
    html += "</tr>";
  });
  const m = MARKET_STATS;
  html += '<tr class="data-table__total"><th scope="row">Whole market</th><td>' + m.n + "</td><td>" + fmtCurrency(m.median) +
    "</td><td>—</td><td>" + fmtCurrency(m.medianAdr) + "</td><td>" + m.medianOcc + "%</td><td>10%</td><td>25%</td><td>—</td><td>—</td></tr>";
  html += "</tbody></table></div>";
  host.innerHTML = html;
}

// Size-controlled table: median revenue by region x bedroom bucket, cells
// shaded by their ratio to the market median for that size (the "location
// premium"). Cells with N<2 are shown but greyed so a single listing doesn't
// read as a pattern.
function renderSizeControlledTable() {
  const host = document.getElementById("region-size-table");
  if (!host) return;
  const mkt = MARKET_STATS.marketSizeMedian;
  let html = '<div class="table-scroll"><table class="data-table data-table--heat"><thead><tr><th>Region</th>';
  SIZE_KEYS.forEach((k) => (html += "<th>" + k + ' <span class="muted">(mkt ' + fmtK(mkt[k]) + ")</span></th>"));
  html += "</tr></thead><tbody>";
  REGION_RESEARCH.regions.forEach((r) => {
    html += '<tr><th scope="row">' + regionDot(r) + r.name + "</th>";
    SIZE_KEYS.forEach((k) => {
      const v = r.sizeMedian[k], n = r.sizeN[k];
      if (v == null || !n) {
        html += '<td class="heat heat--empty">—</td>';
        return;
      }
      const ratio = v / mkt[k];
      const cls = n < 2 ? "heat--thin" : ratio >= 1.35 ? "heat--hi2" : ratio >= 1.1 ? "heat--hi1" : ratio <= 0.75 ? "heat--lo2" : ratio <= 0.9 ? "heat--lo1" : "heat--mid";
      html += '<td class="heat ' + cls + '">' + fmtK(v) + '<span class="heat__meta">' + (ratio >= 1 ? "+" : "") + Math.round((ratio - 1) * 100) + "% · n=" + n + "</span></td>";
    });
    html += "</tr>";
  });
  html += "</tbody></table></div>";
  host.innerHTML = html;
}

function renderLiftBands() {
  const host = document.getElementById("lift-bands");
  if (!host) return;
  let html = '<div class="table-scroll"><table class="data-table"><thead><tr><th>Distance to nearest lift base</th><th>N</th><th>Median revenue</th><th>Revenue / bedroom</th><th>Median ADR</th><th>Top 10%</th></tr></thead><tbody>';
  REGION_RESEARCH.liftBands.forEach((b) => {
    if (!b.n) return;
    html += "<tr><th scope=\"row\">" + b.band + "</th><td>" + b.n + "</td><td>" + fmtCurrency(b.medianRev) + "</td><td>" + fmtCurrency(b.revPerBr) +
      "</td><td>" + fmtCurrency(b.medianAdr) + "</td><td>" + Math.round(b.top10Rate) + "%</td></tr>";
  });
  html += "</tbody></table></div>";
  host.innerHTML = html;
  const interp = document.getElementById("lift-interpretation");
  if (interp) {
    const near = REGION_RESEARCH.liftBands[0], far = REGION_RESEARCH.liftBands[3];
    interp.innerHTML =
      "<strong>Lift proximity is real, but it is a step, not a slope.</strong> Listings within 2 km of a lift base earn a median " +
      fmtCurrency(near.revPerBr) + " per bedroom, against " + fmtCurrency(far.revPerBr) +
      " at 10–20 km (Spearman ρ = " + REGION_RESEARCH.liftRho.toFixed(2) + ", p < 0.001). Beyond about 2 km the curve flattens: a Heber or Summit Park group home " +
      "8–15 km out can still reach the Top 10% on headcount and amenities alone. That is why two of the three buy boxes sit outside the walk-to-lift core.";
  }
}

function renderRegionProfiles() {
  const host = document.getElementById("region-profiles-grid");
  if (!host) return;
  host.innerHTML = "";
  REGION_RESEARCH.regions.forEach((r) => {
    const p = REGION_PROFILES[r.id];
    const card = el("article", "region-card");
    card.style.borderTopColor = r.color;
    card.appendChild(el("p", "region-card__eyebrow", regionDot(r) + r.name));
    card.appendChild(el("h4", "region-card__headline", p.headline));
    const chips = el("div", "bb2-chip-row");
    [
      "N=" + r.n,
      "Median " + fmtK(r.medianRev),
      "ADR " + fmtCurrency(r.medianAdr),
      Math.round(r.top10Rate) + "% Top 10%",
      fmtK(r.revPerBr) + " / BR",
    ].forEach((c, i) => chips.appendChild(el("span", "bb2-chip" + (i === 3 ? " bb2-chip--revenue" : ""), c)));
    card.appendChild(chips);
    card.appendChild(el("div", "region-card__body", listHtml(p.bullets)));
    host.appendChild(card);
  });
}

function renderTop10Roster() {
  const host = document.getElementById("top10-roster");
  if (!host) return;
  const byName = {};
  REGION_RESEARCH.regions.forEach((r) => (byName[r.name] = r));
  let html = '<div class="table-scroll"><table class="data-table"><thead><tr><th>#</th><th>Listing</th><th>Region</th><th>Size</th><th>Revenue</th><th>ADR</th><th>Occ.</th><th>Lift</th></tr></thead><tbody>';
  REGION_RESEARCH.top10.forEach((t, i) => {
    const r = byName[t.region];
    html += "<tr><td>" + (i + 1) + '</td><td class="roster-title"><a href="' + t.url + '" target="_blank" rel="noopener">' + escapeHtml(t.title) + "</a></td><td>" +
      regionDot(r) + t.region + "</td><td>" + t.br + "BR · sl " + t.sleeps + "</td><td><strong>" + fmtCurrency(t.rev) + "</strong></td><td>" +
      fmtCurrency(t.adr) + "</td><td>" + t.occ + "%</td><td>" + t.liftKm + " km</td></tr>";
  });
  html += "</tbody></table></div>";
  host.innerHTML = html;
  const counts = {};
  REGION_RESEARCH.top10.forEach((t) => (counts[t.region] = (counts[t.region] || 0) + 1));
  const summary = document.getElementById("top10-roster-summary");
  if (summary) {
    summary.innerHTML =
      "The " + REGION_RESEARCH.top10.length + " listings above the market's P90 (" + fmtCurrency(MARKET_STATS.p90) + ") by region: " +
      Object.keys(counts).sort((a, b) => counts[b] - counts[a]).map((k) => "<strong>" + k + "</strong> " + counts[k]).join(" · ") +
      ". Jordanelle &amp; Hideout and Midway have none. Every Top 10% listing has a hot tub, and 14 of the 15 are 4BR or larger.";
  }
}

// Amenities: shown in Section 2 as the market-wide "what the Top 10%
// share" signal. Prevalence gap plus size-controlled uplift, N>=5 only.
function renderAmenitySignal() {
  const host = document.getElementById("amenity-signal");
  if (!host) return;
  const label = (a) => a.replace(/_/g, " ").replace("pack n play travel crib", "pack 'n play / crib").replace(/\b\w/g, (c) => c.toUpperCase());
  const rows = REGION_RESEARCH.amenities.filter((a) => a.top10 >= 20).slice(0, 8);
  let html = '<div class="table-scroll"><table class="data-table"><thead><tr><th>Amenity</th><th>Top 10% have it</th><th>Rest of market</th><th>Size-controlled revenue uplift</th><th>N</th></tr></thead><tbody>';
  rows.forEach((a) => {
    html += '<tr><th scope="row">' + label(a.amenity) + '</th><td><span class="bar-cell"><span class="bar-cell__fill" style="width:' + a.top10 + '%"></span><span>' +
      Math.round(a.top10) + '%</span></span></td><td>' + Math.round(a.rest) + '%</td><td>' + (a.uplift >= 0 ? "+" : "") + Math.round(a.uplift) + "%</td><td>" + a.n + "</td></tr>";
  });
  html += "</tbody></table></div>";
  host.innerHTML = html;
}

function renderClusterResearch() {
  renderClusterMethod();
  renderRegionScorecard();
  renderSizeControlledTable();
  renderLiftBands();
  renderRegionProfiles();
  renderTop10Roster();
  renderAmenitySignal();
}
