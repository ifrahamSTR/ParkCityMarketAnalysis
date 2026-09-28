/**
 * Section 2 performance drivers and the compressed Section 3 location
 * analysis: size x ski-access matrix, area reference table, and the location
 * conclusion. Numbers come from REGION_RESEARCH (region_data.js, generated);
 * prose from data.js (DRIVERS_NOTE, AREA_ROLES, LOCATION_CONCLUSION).
 *
 * Small samples: any comparison resting on fewer than SMALL_N listings is
 * rendered muted and marked "directional".
 */

const SMALL_N = 15;

// map.js isn't loaded on this page (Section 3 uses the embedded folium map).
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function regionDot(r) {
  return '<span class="region-dot" style="background:' + r.color + '"></span>';
}

function directionalTag() {
  return ' <span class="tag-directional" title="Fewer than ' + SMALL_N + ' listings">directional</span>';
}

// Section 2 — what separates top performers. One row per driver, with vs.
// without, Top 10% rate and median revenue.
function renderDrivers() {
  const host = document.getElementById("drivers-table");
  if (!host) return;
  let html = '<div class="table-scroll"><table class="data-table"><thead><tr><th>Driver</th><th>Compared within</th><th>Top 10% rate<br><span class="muted">with · without</span></th><th>Median revenue<br><span class="muted">with · without</span></th><th>N<br><span class="muted">with · without</span></th></tr></thead><tbody>';
  REGION_RESEARCH.drivers.forEach((d) => {
    const thin = Math.min(d.nWith, d.nWithout) < SMALL_N;
    html += "<tr" + (thin ? ' class="is-thin"' : "") + '><th scope="row">' + d.driver + (thin ? directionalTag() : "") + "</th><td>" + d.base +
      "</td><td><strong>" + Math.round(d.top10With) + "%</strong> · " + Math.round(d.top10Without) + "%</td><td><strong>" + fmtK(d.medianWith) + "</strong> · " + fmtK(d.medianWithout) +
      "</td><td>" + d.nWith + " · " + d.nWithout + "</td></tr>";
  });
  html += "</tbody></table></div>";
  host.innerHTML = html;
}

// Section 3 — bedroom count x ski access (within REGION_RESEARCH.accessKm
// of a lift base). This one table answers "does geography still matter once
// size is considered" and "does ski access matter".
function renderAccessMatrix() {
  const host = document.getElementById("access-matrix");
  if (!host) return;
  const km = REGION_RESEARCH.accessKm;
  const cell = (size, access) => REGION_RESEARCH.matrix.find((m) => m.size === size && m.access === access);
  let html = '<div class="table-scroll"><table class="data-table matrix-table"><thead><tr><th>Bedrooms</th><th>Within ' + km + " km of a lift</th><th>Beyond " + km + " km</th></tr></thead><tbody>";
  ["1-2BR", "3-4BR", "5BR+"].forEach((size) => {
    html += '<tr><th scope="row">' + size.replace("-", "–") + "</th>";
    [true, false].forEach((access) => {
      const c = cell(size, access);
      const cls = (c.n < SMALL_N ? "is-thin " : "") + (c.top25Rate >= 50 ? "matrix-hot" : c.top10N === 0 && c.top25Rate < 20 ? "matrix-cold" : "");
      html += '<td class="' + cls + '"><div class="matrix-big">' + c.top10N + " of " + c.n + ' <span>in Top 10%</span></div><div class="matrix-sub">' +
        Math.round(c.top25Rate) + "% Top 25% · median " + fmtK(c.medianRev) + (c.n < SMALL_N ? directionalTag() : "") + "</div></td>";
    });
    html += "</tr>";
  });
  html += "</tbody></table></div>";
  host.innerHTML = html;
  const t = REGION_RESEARCH.tests;
  const cap = document.getElementById("access-matrix-caption");
  if (cap) {
    cap.innerHTML =
      "Ski access changes the outcome for mid-size homes: 3–4BR homes near a lift beat the same homes farther out (Top 10% p = " + t.ski_top10_p.toFixed(3) +
      ", Top 25% p &lt; 0.001, Fisher exact). 5BR+ homes succeed without it: 10 of the 11 top-band 5BR+ listings are beyond 2 km. The near-lift 5BR+ cell has only 2 listings.";
  }
}

// Lift-distance caption under the scatter (band stats from the notebook).
function renderLiftCaption() {
  const host = document.getElementById("lift-caption");
  if (!host) return;
  const b = REGION_RESEARCH.liftBands;
  host.innerHTML =
    "Revenue per bedroom steps down past about 2 km: " + fmtK(b[0].revPerBr) + " within 2 km (N=" + b[0].n + "), then about " + fmtK((b[1].revPerBr + b[2].revPerBr) / 2) +
    " at 2–10 km and " + fmtK(b[3].revPerBr) + " at 10–20 km (Spearman ρ = " + REGION_RESEARCH.liftRho.toFixed(2) + "). It's a step at the lifts, not a steady slope.";
}

// Section 3 — the seven areas as one compact reference table.
function renderAreaTable() {
  const host = document.getElementById("area-table");
  if (!host) return;
  let html = '<div class="table-scroll"><table class="data-table data-table--wrap"><thead><tr><th>Area</th><th>N</th><th>Median revenue</th><th>Top 10%</th><th>Top 25%</th><th>4BR+ share</th><th>Size-adjusted index</th><th>Role in the thesis</th></tr></thead><tbody>';
  REGION_RESEARCH.regions.forEach((r) => {
    const idxCls = r.sizeIndex >= 1.1 ? "idx-up" : r.sizeIndex <= 0.9 ? "idx-down" : "";
    html += "<tr" + (r.n < SMALL_N ? ' class="is-thin"' : "") + '><th scope="row">' + regionDot(r) + r.name + (r.n < SMALL_N ? directionalTag() : "") + "</th><td>" + r.n + "</td><td>" + fmtCurrency(r.medianRev) +
      "</td><td>" + r.top10N + "</td><td>" + Math.round(r.top25Rate) + "%</td><td>" + r.bigShare + '%</td><td class="' + idxCls + '">' + r.sizeIndex.toFixed(2) +
      '×</td><td class="cell-note">' + AREA_ROLES[r.id] + "</td></tr>";
  });
  html += "</tbody></table></div>";
  host.innerHTML = html;
}

function renderLocationConclusion() {
  const host = document.getElementById("location-conclusion");
  if (!host) return;
  host.innerHTML = listHtml(LOCATION_CONCLUSION);
}

function renderClusterResearch() {
  renderDrivers();
  renderAccessMatrix();
  renderLiftCaption();
  renderAreaTable();
  renderLocationConclusion();
}
