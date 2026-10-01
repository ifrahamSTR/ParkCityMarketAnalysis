/**
 * Section 4 — Why location changes the rate. A short destination primer: one
 * clickable map (Leaflet) with six combined areas and a side panel, a
 * one-row season strip, and the bridge into the two buy boxes.
 *
 * Only areas that matter to later conclusions are shown. Each "In our comps"
 * line is computed from the approved comp sets (COMPSET_5BR, COMPSET_SKI);
 * the destination facts come from the sources listed in DEST_SOURCES
 * (researched 2026-09-30).
 */

const DEST_SOURCES = [
  { label: "Deer Valley Expanded Excellence", url: "https://expandedexcellence.deervalley.com/major-terrain-expansion/" },
  { label: "Vail Resorts (Park City Mountain, Sunrise Gondola)", url: "https://news.vailresorts.com/parkcityopening" },
  { label: "Park Record (Canyons Skyway Gondola, 2026-27)", url: "https://www.parkrecord.com/2026/09/28/vail-resorts-says-new-park-city-mountain-lifts-will-be-ready-by-2027-28-season/" },
  { label: "Visit Utah (Utah Olympic Park)", url: "https://www.visitutah.com/things-to-do/utah-olympic-legacy/utah-olympic-park" },
  { label: "Visit Utah (Heber Valley)", url: "https://www.visitutah.com/articles/heber-valleys-swiss-roots" },
  { label: "KPCW (Summit County nightly-rental ban proposal)", url: "https://www.kpcw.org/summit-county/2026-06-05/summit-county-considers-nightly-rental-ban-in-some-neighborhoods" },
  { label: "KPCW (seasonality, 2026)", url: "https://www.kpcw.org/summit-county/2026-06-22/park-city-chamber-low-snow-winter-drives-summer-visitation-increase" },
  { label: "Park Record (lodging report, Sep 2026)", url: "https://www.parkrecord.com/2026/09/26/lodging-report-shows-successful-summer-uncertain-predictions-for-winter/" },
  { label: "Variety (Sundance to Boulder)", url: "https://variety.com/2025/film/news/sundance-boulder-2027-1236348874/" },
  { label: "KPCW (Snow League, Jan 2027)", url: "https://www.kpcw.org/park-city/2026-03-31/shaun-white-to-bring-freestyle-competition-to-park-city-over-former-sundance-weekend" },
];

function destinationAreas() {
  const usd = (n) => "$" + Math.round(n).toLocaleString("en-US");
  const k = (n) => "$" + Math.round(n / 1000) + "k";
  const rng = (a, b) => (Math.round(a / 1000) === Math.round(b / 1000) ? k(a) : k(a) + "–" + k(b));
  const route = (p) => COMPSET_5BR.routes.find((r) => r.route.indexOf(p) === 0);
  const g = COMPSET_SKI.geo;
  const walk = g.by_walk[0];
  const dvArea = g.by_area.find((r) => r.group === "Deer Valley Snow Park");
  const hold = route("Summit"), pcr = route("Park City");
  const sny = COMPSET_5BR.comps.filter((c) => c.region === "Snyderville Basin");
  const heber = COMPSET_5BR.comps.filter((c) => c.region === "Heber Valley");
  const med = (a) => { const v = a.slice().sort((x, y) => x - y); return v.length % 2 ? v[(v.length - 1) / 2] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2; };
  return [
    {
      id: "oldtown", name: "Old Town / Main Street & Town Lift", kind: "core", boxes: ["Ski-Access", "Group Home"],
      zones: [{ lat: 40.6426, lng: -111.4949, r: 1000, tip: "Old Town", dir: "left" }],
      why: "Ski the Town Lift, then walk to Main Street's restaurants and bars. No car needed.",
      season: "Winter ski + town trips; summer events on Main Street.",
      matters: "The top nightly rates in both comp sets: about " + usd(walk.adr_median) + " for walkable Ski-Access comps and " + usd(pcr.adr_median) + " for Old Town / Deer Valley group homes.",
    },
    {
      id: "deervalley", name: "Deer Valley", kind: "core", boxes: ["Ski-Access"],
      zones: [{ lat: 40.6285, lng: -111.4840, r: 1300, tip: "Deer Valley", dir: "bottom" }],
      why: "Premium, ski-only resort with luxury lodging; summer concerts and biking.",
      season: "Winter premium ski; summer concerts.",
      matters: "Premium ski demand a short way from Main Street. Its Snow Park comp earns " + k(dvArea.rev_min) + " at " + usd(dvArea.adr_median) + " a night.",
    },
    {
      id: "canyons", name: "Canyons Village / Snyderville / Kimball Junction", kind: "gateway", boxes: ["Context"],
      zones: [{ lat: 40.7050, lng: -111.5420, r: 3200, tip: "Canyons / Kimball Jct", dir: "left" }],
      why: "Park City Mountain's second base, plus the Kimball Junction shops, Utah Olympic Park and trails. Easy off I-80.",
      season: "Winter resort base; year-round family activities.",
      matters: "Convenient, but a drive from Main Street. " + (sny.length ? "Both Snyderville group-home comps are Low (" + rng(Math.min.apply(null, sny.map((c) => c.revenue)), Math.max.apply(null, sny.map((c) => c.revenue))) + ")" : "") + ", and no Ski-Access comp sits at Canyons.",
    },
    {
      id: "jordanelle", name: "East Village / Jordanelle", kind: "gateway", boxes: ["Ski-Access"],
      zones: [{ lat: 40.6180, lng: -111.4300, r: 2600, tip: "East Village / Jordanelle", dir: "right" }],
      why: "Deer Valley's new East Village base, with a gondola off US-40, plus summer boating on Jordanelle Reservoir.",
      season: "Winter ski + summer reservoir.",
      matters: "Close to a lift but far from town. These comps charge " + usd(g.jordanelle_adr[0]) + "–" + usd(g.jordanelle_adr[1]) + " a night, even as new luxury builds. Still a young, unproven rate environment.",
    },
    {
      id: "heber", name: "Heber Valley & Midway", kind: "valley", boxes: ["Group Home"],
      zones: [{ lat: 40.5100, lng: -111.4400, r: 5200, tip: "Heber & Midway", dir: "right" }],
      why: "Its own outdoor destination: Deer Creek and Jordanelle reservoirs, the Heber Valley Railroad, Soldier Hollow, Homestead Crater, Swiss Days. About 25 minutes from the Park City resorts.",
      season: "Summer family trips; winter as a lower-cost ski base.",
      matters: "The deepest large-home supply, but a lower rate ceiling: Heber group-home comps charge about " + usd(med(heber.map((c) => c.adr))) + " a night, and " + heber.filter((c) => c.tier === "Low").length + " of " + heber.length + " are Low tier.",
    },
    {
      id: "outer", name: "Summit Park & Pine Meadow (outer mountain homes)", kind: "retreat", boxes: ["Group Home"],
      zones: [{ lat: 40.7420, lng: -111.6020, r: 2300, tip: "Summit Park", dir: "left" }, { lat: 40.8000, lng: -111.5100, r: 2300, tip: "Pine Meadow", dir: "right" }],
      why: "Forested mountain neighborhoods 15–25 minutes from Canyons. Guests choose the house itself: decks, hot tubs, space and privacy.",
      season: "Winter ski base + cool summer retreat.",
      matters: "Group homes here earn " + rng(hold.rev_min, hold.rev_max) + " at about " + usd(hold.adr_median) + " a night; the property itself is the draw. <strong>On regulatory hold:</strong> Summit County's proposed nightly-rental bans cover these areas.",
    },
  ];
}

const DEST_KIND = { core: ["Resort core", "#C0473F"], gateway: ["Resort gateway", "#D07A1F"], valley: ["Valley destination", "#3C6E9E"], retreat: ["Mountain retreat", "#2E7D6B"] };

function renderDestinationSection() {
  const host = document.getElementById("destination-body");
  if (!host || typeof L === "undefined" || typeof COMPSET_5BR === "undefined") return;
  const areas = destinationAreas();
  host.innerHTML =
    '<div class="dest-layout"><div id="dest-map" class="dest-map" role="application" aria-label="Map of Park City demand areas"></div>' +
    '<div class="dest-side"><div class="dest-chips">' + areas.map((a) => '<button type="button" class="dest-chip" data-id="' + a.id + '" style="--dot:' + DEST_KIND[a.kind][1] + '">' + a.name + "</button>").join("") + '<button type="button" class="dest-chip dest-chip--all" data-id="all" style="--dot:#9aa5ad">Whole market</button></div>' +
    '<div id="dest-panel" class="dest-panel" aria-live="polite"></div></div></div>';

  const map = L.map("dest-map", { scrollWheelZoom: false, zoomSnap: 0.25 });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 16, attribution: "&copy; OpenStreetMap contributors" }).addTo(map);
  const layers = {};
  areas.forEach((a) => {
    const color = DEST_KIND[a.kind][1];
    layers[a.id] = a.zones.map((z) => {
      const c = L.circle([z.lat, z.lng], { radius: z.r, color: color, weight: 2, fillColor: color, fillOpacity: 0.12 }).addTo(map).on("click", () => select(a.id, true));
      c.bindTooltip(z.tip, { permanent: true, direction: z.dir, className: "dest-tip", offset: [0, 0] });
      return c;
    });
  });
  // Context only: lift bases and Main Street.
  (typeof DEST_LIFTS !== "undefined" ? DEST_LIFTS : []).forEach((p) => L.circleMarker([p[0], p[1]], { radius: 4, color: "#fff", weight: 1, fillColor: "#C0473F", fillOpacity: 1 }).bindTooltip(p[2]).addTo(map));
  const allBounds = L.latLngBounds(areas.flatMap((a) => a.zones.map((z) => [z.lat, z.lng]))).pad(0.12);
  map.fitBounds(allBounds);

  function select(id, zoom) {
    if (id === "all") { map.flyToBounds(allBounds, { duration: 0.6 }); return; }
    const a = areas.find((x) => x.id === id);
    if (zoom) map.flyToBounds(L.latLngBounds(layers[id].map((l) => l.getBounds())).pad(0.6), { maxZoom: 13.5, duration: 0.6 });
    Object.entries(layers).forEach(([key, ls]) => ls.forEach((l) => l.setStyle({ weight: key === id ? 4 : 2, fillOpacity: key === id ? 0.28 : 0.1 })));
    host.querySelectorAll(".dest-chip").forEach((b) => b.classList.toggle("is-active", b.dataset.id === id));
    document.getElementById("dest-panel").innerHTML =
      '<p class="dest-panel__kind" style="color:' + DEST_KIND[a.kind][1] + '">' + DEST_KIND[a.kind][0] + "</p><h3>" + a.name + "</h3>" +
      "<dl><dt>Why guests choose it</dt><dd>" + a.why + "</dd><dt>Main season / trip type</dt><dd>" + a.season + "</dd><dt>Why it matters here</dt><dd>" + a.matters + "</dd></dl>" +
      '<p class="dest-panel__boxes">' + a.boxes.map((b) => '<span class="dest-box dest-box--' + b.toLowerCase().replace(/[^a-z]/g, "") + '">' + (b === "Context" ? "Context" : b === "Group Home" ? "Large Group Home" : "Ski-Access Home") + "</span>").join("") + "</p>";
  }
  host.querySelectorAll(".dest-chip").forEach((b) => b.addEventListener("click", () => select(b.dataset.id, true)));
  select("oldtown");

  // Season strip.
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const season = ["ski", "ski", "ski", "shoulder", "shoulder", "summer", "summer", "summer", "summer", "shoulder", "shoulder", "ski"];
  document.getElementById("dest-season").innerHTML =
    '<div class="dest-strip">' + months.map((m, i) => '<div class="dest-strip__m dest-strip__m--' + season[i] + '"><span>' + m + "</span></div>").join("") + "</div>" +
    '<div class="dest-strip__legend"><span class="dest-key dest-key--ski"></span>Winter: ski demand (busiest) <span class="dest-key dest-key--summer"></span>Summer: hiking, biking, reservoirs <span class="dest-key dest-key--shoulder"></span>Spring and fall shoulder: quiet</div>' +
    '<p class="caption"><strong>Two things to price in:</strong> winter revenue depends on snow (the 2025–26 low-snow winter cut March–April lodging occupancy by about a quarter), and Sundance left after its 2026 festival. The Snow League takes over the same January weekend in 2027.</p>';

  document.getElementById("dest-sources").innerHTML = "Sources (researched 2026-09-30): " + DEST_SOURCES.map((s) => '<a href="' + s.url + '" target="_blank" rel="noopener">' + s.label + "</a>").join(" · ");
}

// Lift bases for context (same coordinates as the Section 3 map).
const DEST_LIFTS = [
  [40.6474, -111.4985, "Park City Mountain — Town Lift"], [40.6526, -111.5082, "Park City Mountain — Mountain Village"],
  [40.6855, -111.5565, "Park City Mountain — Canyons Village"], [40.6373, -111.4783, "Deer Valley — Snow Park"],
  [40.6360, -111.4516, "Deer Valley — Jordanelle Gondola"], [40.6207, -111.4415, "Deer Valley — East Village"],
];
