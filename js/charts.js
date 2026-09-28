/**
 * Chart.js chart rendering: the market-wide Revenue Potential distribution
 * (Section 2), revenue-per-bedroom vs. lift distance (Section 3), and the
 * review-composition charts (Section 4). All data from region_data.js
 * (generated from parkcity_overview.ipynb).
 */
const CHART_PALETTE = {
  bottom75: "#8b94a3",
  top25: "#075646",
  top10: "#d99132",
};

// Demographics palette (Section 4) — kept within the site's own brand
// palette rather than the raw teal/yellow/orange/slate colors in Walid's
// example chart images.
const DEMOGRAPHICS_PALETTE = {
  kids: "#d99132",
  group: "#e0b34c",
  pet: "#075646",
  other: "#8b94a3",
};

Chart.defaults.font.family = "'Inter', 'Segoe UI', system-ui, sans-serif";
Chart.defaults.font.size = 13;
Chart.defaults.color = "#485a55";

function chartOptions(title) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: { display: true, text: title, font: { size: 14, weight: "600" } },
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const bin = REVENUE_DISTRIBUTION.histogram[ctx.dataIndex];
            return ctx.parsed.y + " listings ($" + Math.round(bin.binStart / 1000) + "k-$" + Math.round(bin.binEnd / 1000) + "k)";
          },
        },
      },
    },
    scales: {
      x: { ticks: { maxRotation: 60, minRotation: 45 } },
      y: { title: { display: true, text: "Listings" } },
    },
  };
}

function renderRevenueDistributionChart() {
  const ctx = document.getElementById("chart-revenue-distribution");
  if (!ctx) return;
  const dist = REVENUE_DISTRIBUTION;
  const labels = dist.histogram.map((b) => "$" + Math.round(b.binStart / 1000) + "k");
  const colors = dist.histogram.map((b) => {
    const mid = (b.binStart + b.binEnd) / 2;
    if (mid >= dist.p90) return CHART_PALETTE.top10;
    if (mid >= dist.p75) return CHART_PALETTE.top25;
    return CHART_PALETTE.bottom75;
  });
  const counts = dist.histogram.map((b) => b.count);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Listings by Revenue Potential",
          data: counts,
          backgroundColor: colors,
          borderWidth: 0,
        },
      ],
    },
    options: chartOptions("Market-wide Revenue Potential distribution (n=" + dist.totalCount + ")"),
  });

  const legend = document.getElementById("chart-revenue-distribution-legend");
  if (legend) {
    legend.innerHTML =
      '<span class="legend-row"><span class="legend-swatch" style="background:' + CHART_PALETTE.bottom75 + '"></span>Bottom 75% (below $' + Math.round(dist.p75).toLocaleString() + ")</span>" +
      '<span class="legend-row"><span class="legend-swatch" style="background:' + CHART_PALETTE.top25 + '"></span>Next 15% / top 25% ($' + Math.round(dist.p75).toLocaleString() + "-$" + Math.round(dist.p90).toLocaleString() + ")</span>" +
      '<span class="legend-row"><span class="legend-swatch" style="background:' + CHART_PALETTE.top10 + '"></span>Top 10% (P90 = $' + Math.round(dist.p90).toLocaleString() + "+)</span>";
  }
  const interp = document.getElementById("chart-revenue-distribution-interpretation");
  if (interp) {
    interp.textContent =
      "The market's revenue distribution is heavily right-skewed: most listings cluster well below $90K, and the top 10% (P90 = " +
      fmtCurrency(dist.p90) +
      ") pulls away sharply from the median (" +
      fmtCurrency(dist.medianRevenue) +
      "). All 15 top-band listings are one of two products, large group homes or near-lift 3BR+ homes; see Section 1.";
  }
}

// ---------------------------------------------------------------------------
// Section 4 — Traveller Demographics. Review-derived guest-composition
// signals from DEMOGRAPHICS in data.js (kids/group/pet/other shares).
// ---------------------------------------------------------------------------
function renderDemographicsPieChart() {
  const ctx = document.getElementById("chart-demographics-pie");
  if (!ctx) return;
  const m = DEMOGRAPHICS.marketWide;
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Stayed with kids", "Group trip", "Stayed with a pet", "Other"],
      datasets: [
        {
          data: [m.kids, m.group, m.pet, m.other],
          backgroundColor: [DEMOGRAPHICS_PALETTE.kids, DEMOGRAPHICS_PALETTE.group, DEMOGRAPHICS_PALETTE.pet, DEMOGRAPHICS_PALETTE.other],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: "Average review composition — all listings (n=" + m.n + ")", font: { size: 14, weight: "600" } },
        legend: { position: "bottom" },
        tooltip: { callbacks: { label: (c) => c.label + ": " + c.parsed + "%" } },
      },
    },
  });
  const legend = document.getElementById("chart-demographics-pie-legend");
  if (legend) {
    legend.innerHTML =
      '<span class="legend-row"><span class="legend-swatch" style="background:' + DEMOGRAPHICS_PALETTE.kids + '"></span>Stayed with kids (' + m.kids + '%)</span>' +
      '<span class="legend-row"><span class="legend-swatch" style="background:' + DEMOGRAPHICS_PALETTE.group + '"></span>Group trip (' + m.group + '%)</span>' +
      '<span class="legend-row"><span class="legend-swatch" style="background:' + DEMOGRAPHICS_PALETTE.pet + '"></span>Stayed with a pet (' + m.pet + '%)</span>' +
      '<span class="legend-row"><span class="legend-swatch" style="background:' + DEMOGRAPHICS_PALETTE.other + '"></span>Other (' + m.other + '%)</span>';
  }
}

function renderDemographicsStackedBarChart() {
  const ctx = document.getElementById("chart-demographics-bedroom");
  if (!ctx) return;
  const rows = DEMOGRAPHICS.byBedroom;
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: rows.map((r) => r.label + " (n=" + r.n + ")"),
      datasets: [
        { label: "Stayed with kids", data: rows.map((r) => r.kids), backgroundColor: DEMOGRAPHICS_PALETTE.kids },
        { label: "Group trip", data: rows.map((r) => r.group), backgroundColor: DEMOGRAPHICS_PALETTE.group },
        { label: "Stayed with a pet", data: rows.map((r) => r.pet), backgroundColor: DEMOGRAPHICS_PALETTE.pet },
        { label: "Other", data: rows.map((r) => r.other), backgroundColor: DEMOGRAPHICS_PALETTE.other },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: "Guest demographic composition by bedroom count", font: { size: 14, weight: "600" } },
        legend: { position: "bottom" },
        tooltip: { callbacks: { label: (c) => c.dataset.label + ": " + c.parsed.y + "%" } },
      },
      scales: {
        x: { stacked: true },
        y: { stacked: true, title: { display: true, text: "% of reviews" }, max: 100 },
      },
    },
  });
}

// ---------------------------------------------------------------------------
// Section 3 -- revenue per bedroom vs. distance to the nearest lift base,
// one point per listing, colored by region (same colors as the map).
// ---------------------------------------------------------------------------
function renderLiftScatterChart() {
  const ctx = document.getElementById("chart-lift-scatter");
  if (!ctx) return;
  // Colored by size group, not area: the point of this chart is that the
  // distance effect belongs to mid-size homes.
  const groups = [
    { label: "1–2BR", test: (br) => br <= 2, color: "#8b94a3" },
    { label: "3–4BR", test: (br) => br >= 3 && br <= 4, color: "#075646" },
    { label: "5BR+", test: (br) => br >= 5, color: "#d99132" },
  ];
  const datasets = groups.map((g) => ({
    label: g.label,
    data: REGION_RESEARCH.scatter.filter((p) => g.test(p.br)).map((p) => ({ x: p.x, y: p.rev, title: p.title, br: p.br })),
    backgroundColor: g.color + "cc",
    borderColor: "#ffffff",
    borderWidth: 0.6,
    pointRadius: 4.5,
    pointHoverRadius: 7,
  }));
  new Chart(ctx, {
    type: "scatter",
    data: { datasets: datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: false },
        legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 11 } } },
        tooltip: {
          callbacks: {
            label: (c) => c.raw.title + " — " + c.raw.br + "BR, $" + Math.round(c.raw.y / 1000) + "k, " + c.raw.x.toFixed(1) + " km",
          },
        },
      },
      scales: {
        x: { title: { display: true, text: "km to nearest lift base" }, min: 0 },
        y: { type: "logarithmic", title: { display: true, text: "Revenue potential (log scale)" }, ticks: { callback: (v) => ([10000, 20000, 50000, 100000, 200000, 300000].includes(v) ? "$" + v / 1000 + "k" : "") } },
      },
    },
  });
}
