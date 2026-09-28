/**
 * Section 2 performance drivers and the compressed Section 3 location
 * analysis: size x ski-access matrix, area reference table, and the location
 * conclusion. Numbers come from REGION_RESEARCH (region_data.js, generated);
 * prose from data.js (DRIVERS_NOTE, MATRIX_READS, LOCATION_CONCLUSION).
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

// Section 3 centerpiece: every bedroom bucket near vs. away from the lifts
// (REGION_RESEARCH.defTest, from the notebook's "Validating the Ski-Access
// definition"). Columns: the two sides, the size-adjusted gap, one-line read.
function matrixCell(n, top10, top25, median, strong, cold) {
  const cls = (n < SMALL_N ? "is-thin " : "") + (strong ? "matrix-hot" : cold ? "matrix-cold" : "");
  return '<td class="' + cls + '"><div class="matrix-big">' + top10 + " of " + n + ' <span>in Top 10%</span></div><div class="matrix-sub">' +
    Math.round(top25) + "% Top 25% · median " + fmtK(median) + (n < SMALL_N ? directionalTag() : "") + "</div></td>";
}

function renderAccessMatrix() {
  const host = document.getElementById("access-matrix");
  if (!host) return;
  const km = REGION_RESEARCH.accessKm;
  let html = '<div class="table-scroll"><table class="data-table matrix-table"><thead><tr><th>Bedrooms</th><th>Within ' + km + " km of a lift</th><th>Beyond " + km +
    " km</th><th>Size-adjusted index<br><span class=\"muted\">near · away</span></th><th>What ski access does</th></tr></thead><tbody>";
  REGION_RESEARCH.defTest.forEach((r) => {
    const total = r.segment === "3BR+";
    html += '<tr class="' + (total ? "matrix-total" : "") + '"><th scope="row">' + r.segment.replace("-", "–") + "</th>" +
      matrixCell(r.nNear, r.top10Near, r.top25Near, r.medianNear, r.top25Near >= 50 && r.nNear >= 3, false) +
      matrixCell(r.nFar, r.top10Far, r.top25Far, r.medianFar, r.top25Far >= 50, r.top10Far === 0 && r.top25Far < 20) +
      "<td><strong>" + r.indexNear.toFixed(2) + "×</strong> · " + r.indexFar.toFixed(2) + '×</td><td class="cell-note">' + MATRIX_READS[r.segment] + "</td></tr>";
  });
  html += "</tbody></table></div>";
  host.innerHTML = html;
}

// Why the Ski-Access box is 3BR+ (not 3-4BR): the definition test, compact.
function renderDefinitionTest() {
  const host = document.getElementById("definition-test");
  if (!host) return;
  const R = REGION_RESEARCH, g = R.regression, row = (seg) => R.defTest.find((r) => r.segment === seg);
  const one = row("1-2BR"), five = row("5BR+");
  const s3 = R.sensitivity.find((x) => x.segment === "3-4BR" && x.km === 3), s5 = R.sensitivity.find((x) => x.segment === "3-4BR" && x.km === 5);
  host.innerHTML = listHtml([
    "<strong>Floor at 3BR.</strong> Ski access lifts 1–2BR homes too (" + one.indexNear.toFixed(2) + "× vs " + one.indexFar.toFixed(2) + "×), but only " +
      Math.round(one.top25Near) + "% of them reach the Top 25%.",
    "<strong>No cap at 4BR.</strong> After controlling for bedrooms, being near a lift is worth about ×" + g.near.mult.toFixed(2) + " (p &lt; 0.001). The extra effect at 5BR+ (×" +
      g.near_x_5br.mult.toFixed(2) + ", p = " + g.near_x_5br.p.toFixed(2) + ") is indistinguishable from zero. There's no sign the premium stops at 5BR+; there are just " + five.nNear +
      " near-lift 5BR+ homes to measure it with.",
    "<strong>Why it's still a different product.</strong> Away from the lifts, 3–4BR homes almost never reach the top band, but " + Math.round(five.top25Far) +
      "% of 5BR+ homes reach the Top 25%. Mid-size homes need the location; large homes don't.",
    "<strong>The 2 km line holds.</strong> At 3 km, " + Math.round(s3.top25Near) + "% of near-lift 3–4BR homes still reach the Top 25%. At 5 km it thins to " + Math.round(s5.top25Near) + "%.",
  ]);
}

// Lift-distance caption: adds the within-size gradient the matrix can't show.
function renderLiftCaption() {
  const host = document.getElementById("lift-caption");
  if (!host) return;
  const gr = REGION_RESEARCH.gradients;
  host.innerHTML =
    "Within 3–4BR, revenue falls steadily with distance (Spearman ρ = " + gr["3-4BR"].rho.toFixed(2) + ", p &lt; 0.001, N=" + gr["3-4BR"].n + "). Within 5BR+ there's no clear gradient (ρ = " +
    gr["5BR+"].rho.toFixed(2) + ", p = " + gr["5BR+"].p.toFixed(2) + ", N=" + gr["5BR+"].n + ").";
}

// Reference-area numbers, collapsed by default (the map popups carry the
// same generated numbers). Kept so the figures are also available as a table.
function renderAreaTable() {
  const host = document.getElementById("area-table");
  if (!host) return;
  let html = '<div class="table-scroll"><table class="data-table"><thead><tr><th>Area</th><th>N</th><th>Median revenue</th><th>Top 10%</th><th>Top 25%</th><th>4BR+ share</th><th>Size-adjusted index</th></tr></thead><tbody>';
  REGION_RESEARCH.regions.forEach((r) => {
    const idxCls = r.sizeIndex >= 1.1 ? "idx-up" : r.sizeIndex <= 0.9 ? "idx-down" : "";
    html += "<tr" + (r.n < SMALL_N ? ' class="is-thin"' : "") + '><th scope="row">' + regionDot(r) + r.name + (r.n < SMALL_N ? directionalTag() : "") + "</th><td>" + r.n + "</td><td>" + fmtCurrency(r.medianRev) +
      "</td><td>" + r.top10N + "</td><td>" + Math.round(r.top25Rate) + "%</td><td>" + r.bigShare + '%</td><td class="' + idxCls + '">' + r.sizeIndex.toFixed(2) + "×</td></tr>";
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
  renderDefinitionTest();
  renderLiftCaption();
  renderAreaTable();
  renderLocationConclusion();
}
