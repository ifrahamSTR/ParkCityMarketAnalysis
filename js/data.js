/**
 * Content/config layer for the Park City, UT STR buy-box page.
 *
 * Same template as the Charlotte, NC site, but Park City earns its own
 * structure: with only 145 listings, the seven geographic clusters are
 * REFERENCE geography, not buy boxes. The data supports two products,
 * defined by size x ski access (see parkcity_overview.ipynb, "Distilling the
 * structure"):
 *   - Large Group Home: 5BR+, sleeps 14+, location-flexible
 *   - Ski-Access Home: 3-4BR within 2 km of a lift base
 * Together these hold all 15 of the market's Top 10% listings.
 *
 * Prose and config only. Every computed number shown in tables/cards comes
 * from js/region_data.js (generated). Where prose below quotes a number, it
 * was checked against the notebook output for the 2026-07-29 snapshot.
 *
 * Section 6 (Buy-Box Deep Dive) is intentionally blank.
 */

function photo(relPath, alt, caption) {
  return { file: "assets/" + relPath, alt: alt, caption: caption };
}

const MARKET_NAME = "Park City, UT";

// ---------------------------------------------------------------------------
// Section 1 — preliminary buy-box direction
// ---------------------------------------------------------------------------
const BUY_BOXES = [
  {
    id: "group",
    segmentKey: "group",
    rank: "Primary",
    label: "Large Group Home",
    name: "5BR+ group homes, sleeping 14+",
    thesis:
      "Headcount carries this product, not location. 10 of its 11 Top 10% listings sit more than 2 km from a lift, spread across Heber Valley, Summit Park, Snyderville and Pine Meadow. The winners also add a hot tub and an entertainment stack.",
    spec: [
      ["Size", "5BR+, sleeps 14–16 (Heber City caps occupancy at 16)"],
      ["Must-haves", "Hot tub (0 of 5 without one reached the Top 10%). 2+ entertainment amenities: game room, pool table, sauna, pickleball or theater (69% Top 10% with them, 15% without)."],
      ["Where", "Heber Valley edges (the north bench and toward Deer Creek), Snyderville Basin, and Old Town where available. <strong>Hold:</strong> Summit Park and Pine Meadow, pending Summit County's proposed nightly-rental ban. <strong>Avoid:</strong> Midway."],
    ],
  },
  {
    id: "ski",
    segmentKey: "ski",
    rank: "Secondary",
    label: "Ski-Access Home",
    name: "3–4BR within 2 km of a lift base",
    thesis:
      "This is the one place a mid-size home competes: 73% reach the Top 25%, against 15% for the same homes farther out. It earns on ADR (median $491) from walk-to-lift ski demand. It's a different search and a different underwrite from the group home: location-first and adult-skewed.",
    spec: [
      ["Size", "3–4BR, sleeps 6–15 (median 10)"],
      ["Must-haves", "Walkable or ski-in access to Main Street / Town Lift, Deer Valley or Canyons. Hot tub (87% of the segment)."],
      ["Where", "Old Town / Main Street and Deer Valley first: all 4 of the segment's Top 10% listings are here. The Deer Valley gondola side of Jordanelle is directional (3 of 4 reach the Top 25%). Park City zoning decides eligibility; HR-1, R-1, Estate and most RD zones allow nightly rental."],
    ],
  },
];

const NOT_TARGETS =
  "<strong>Not a target:</strong> 1–2BR anywhere (0 of 53 reach the Top 10%, even at the lifts), and 3–4BR beyond 2 km of a lift (0 of 46).";

// ---------------------------------------------------------------------------
// Section 2 — Market context
// ---------------------------------------------------------------------------
const MARKET_OVERVIEW = {
  heroImage: photo(
    "overview/parkcity-main-street.jpg",
    "Historic Main Street in Park City, Utah, with colorful wood-frame storefronts climbing the hill under a partly cloudy sky",
    "Historic Main Street, Park City. Photo: Saalebaer, Wikimedia Commons (CC0)."
  ),
  chips: [
    { label: "Largest Ski Resort in the U.S. — 7,300 acres" },
    { label: "2002 Olympic Host · 2034 Winter Games Return" },
    { label: "Deer Valley Doubled to 4,300+ Acres" },
    { label: "~35 mi / 40–45 min from SLC Airport" },
  ],
  attractions: [
    "<strong>Park City Mountain &amp; Canyons</strong> (Vail): 41 lifts, with the new Canyons Village Skyway gondola for 2026/27.",
    "<strong>Deer Valley</strong>: Expanded Excellence added the East Village base on the Jordanelle side (4,500 acres for 2026/27).",
    "<strong>Historic Main Street</strong>: dining and galleries, with the Town Lift straight onto the mountain.",
    "<strong>Summer in the Heber Valley</strong>: Jordanelle and Deer Creek reservoirs, Homestead Crater, Soldier Hollow.",
  ],
  visitorStats: {
    headline: "3.7M overnight visitors · $1.6B visitor spending (Park City, 2023)",
    breakdown: [
      { value: "$2.2B", label: "Total Economic Impact (Park City)" },
      { value: "$1.65B", label: "Summit County Visitor Spend — #2 in Utah" },
      { value: "$477", label: "Wasatch County Avg Hotel Rate (2025), Highest in Utah" },
      { value: "52%", label: "Summit Co. Share of Utah Snow-Sports Economy" },
    ],
  },
  watchOuts: [
    "❄️ <strong>2025/26 was Utah's worst snow year on record</strong> (skier days −26.5%). The trailing revenue in this dataset includes that winter, so it likely understates a normal year.",
    "🎬 <strong>Sundance has left for Boulder from 2027.</strong> The late-January demand spike is gone; it was strongest in the Old Town ski-access core.",
  ],
  sources: [
    { label: "Park City Mountain", url: "https://www.parkcitymountain.com/the-mountain/about-the-mountain/mountain-info.aspx" },
    { label: "Deer Valley", url: "https://www.deervalley.com/media-room/062926-ee-updates" },
    { label: "Park Record (tourism impact)", url: "https://www.parkrecord.com/2024/11/07/park-city-pulse-character-and-tourism-grow-together/" },
    { label: "Park Record (Summit Co. spend)", url: "https://www.parkrecord.com/2024/09/06/summit-county-ranks-second-in-the-state-for-visitor-spending/" },
    { label: "KPCW (Wasatch hotel rate)", url: "https://www.kpcw.org/wasatch-county/2026-03-19/wasatch-county-averages-highest-hotel-nightly-rate-in-utah" },
    { label: "TownLift (2025/26 skier days)", url: "https://townlift.com/2026/08/skier-days-fell-26-5-in-utahs-worst-snow-year-handing-summit-county-the-states-largest-room-tax-decline/" },
    { label: "Sundance Institute", url: "https://www.sundance.org/blogs/2027-sundance-film-festival-to-take-place-january-21-31-in-boulder-colorado/" },
  ],
};

const DRIVERS_NOTE =
  "Size is the first filter: 5BR+ homes reach the Top 10% at ten times the rate of everything else. Among 4BR+ homes, a hot tub is effectively mandatory, and a stack of three or more entertainment amenities is the strongest single separator. Amenity rows compare 4BR+ homes with and without the feature, so size isn't credited to the amenity. Rows with fewer than 15 listings on one side are directional.";

// ---------------------------------------------------------------------------
// Section 3 — Location (compressed). The map is the embedded folium map from
// parkcity_overview.ipynb; the seven areas are reference geography only.
// ---------------------------------------------------------------------------
const MAP_CONFIG = {
  stateAbbr: "UT",
  marketInterpretation:
    "Check a tier and an area together to isolate a slice, e.g. <em>Top 10%</em> + <em>Heber Valley</em>. The red rings are the 2 km ski-access zone. The seven areas are clusters of listing coordinates, named for the places they cover. They're reference geography for this analysis, not separate strategies.",
};

// One short role per area for the reference table (small-N areas are
// flagged in the table itself).
const AREA_ROLES = {
  oldtown: "Ski-access core, with a premium at every size",
  summitpark: "Group homes (2 in the Top 10%), on regulatory hold",
  jordanelle: "Ski-access, gondola side; no 5BR+ homes",
  pinemeadow: "Small cabins over-earn; regulatory hold",
  snyderville: "Group homes only; condos underperform",
  midway: "Not a target: no Top 10%, and a shrinking STR zone",
  heber: "Largest group-home supply (5 in the Top 10%); small units weak",
};

const LOCATION_CONCLUSION = [
  "<strong>Location matters for mid-size homes, not large ones.</strong> A 3–4BR near a lift is a top performer, while the same home 10 km out is ordinary. At 5BR+, headcount carries it wherever it is.",
  "<strong>Old Town &amp; Deer Valley is the only real location premium:</strong> it earns 1.45× what its size predicts. Heber, Snyderville and Midway run at 0.80–0.87×, because of small-unit supply rather than their big homes.",
  "<strong>Screen location through regulation first.</strong> Summit Park and Pine Meadow hold 3 of the 11 Top 10% group homes but sit in Summit County's proposed ban areas, and Midway has shrunk its STR zone.",
];

// ---------------------------------------------------------------------------
// Section 4 — Demographics
// ---------------------------------------------------------------------------
const DEMOGRAPHICS_NOTE =
  "These are review-derived signals, not verified demographics. Group trips climb with size, from under 6% of reviews at 1–2BR to about half at 5BR+, and kids appear in about a third of 5BR+ reviews. The two products serve different guests: the Large Group Home is a family and group-trip product (35% kids, 50% group trips), while the Ski-Access Home skews adult (21% kids).";

// ---------------------------------------------------------------------------
// Section 5 — Regulations, as one overview plus a compact jurisdiction table.
// Researched 2026-09-28; "unverified" = secondary source only.
// ---------------------------------------------------------------------------
const STR_REGULATIONS = {
  tier: "Mixed: Moderate in the Resort Cores, Restrictive and Tightening at the Edges",
  summary:
    "A license is required everywhere, and there is no primary-residence rule for whole-home rentals. Eligibility is address-level: zoning, HOA/CC&Rs and jurisdiction all have to allow nightly rental. Utah HB 256 (2025) lets cities and counties use listings as evidence and ask platforms to remove non-compliant ones. Lodging tax runs about 13–15% all-in (estimated), collected by Airbnb and Vrbo.",
  rows: [
    {
      j: "Park City",
      areas: "Old Town & Deer Valley",
      tier: "Moderate", tierKey: "moderate",
      rules: "Per-unit license with inspection. Allowed in HR-1, R-1, Estate and most RD zones. Prohibited in the SF zone (except Prospector Village), HRL McHenry and named RD subdivisions. The Bonanza Park ban is still pending.",
      affects: "Ski-Access Home",
    },
    {
      j: "Unincorporated Summit County",
      areas: "Snyderville · Summit Park · Pine Meadow",
      tier: "Restrictive trend", tierKey: "restrictive",
      rules: "$350 license (owner and manager). No ADU or guest-house rentals. <strong>Proposed June 2026 bans</strong> in Summit Park, Tollgate Canyon (the Pine Meadow area), Rockport Estates, Samak and others; no final vote found as of late September.",
      affects: "Group Home (hold in the ban areas)",
    },
    {
      j: "Heber City",
      areas: "Heber Valley",
      tier: "Moderate", tierKey: "moderate",
      rules: "Detached single-family homes only. 1 guest per 200 sq ft, <strong>maximum 16</strong>. Manager within 10 miles; paved on-site parking only. Edge parcels may fall in unincorporated Wasatch County, which is restrictive by default.",
      affects: "Group Home",
    },
    {
      j: "Wasatch Co. · MIDA · Hideout",
      areas: "Jordanelle & Hideout",
      tier: "Moderate / unclear", tierKey: "moderate",
      rules: "The county allows STRs only where both zoning and CC&Rs allow them. The MIDA project area (East Village) has its own license with conflicting guidance. Hideout requires a license, an annual inspection and a manager within 30 minutes.",
      affects: "Ski-Access (gondola side)",
    },
    {
      j: "Midway",
      areas: "Midway",
      tier: "Restrictive", tierKey: "restrictive",
      rules: "STRs only inside the overlay zone (TROD), which was <strong>reduced on Sept 1, 2026</strong>. Requires a Midway-licensed manager. Only 17% of the city's STR units were licensed.",
      affects: "Not a target",
    },
    {
      j: "Kamas · Coalville",
      areas: "Outlying listings",
      tier: "Restrictive", tierKey: "restrictive",
      rules: "Kamas: moratorium on new licenses since March 2025. Coalville: citywide cap of 5% of households, at most 3 STRs per 500 ft. Pine Meadow and Hideout are separate jurisdictions despite their mailing addresses.",
      affects: "Not a target",
    },
  ],
  sources: [
    { label: "Utah HB 256", url: "https://le.utah.gov/Session/2025/bills/enrolled/HB0256.pdf" },
    { label: "Park City Code 4-5-3", url: "https://parkcity.municipalcodeonline.com/book/print?type=ordinances&name=4-5-3_Regulation_Of_Nightly_Rentals" },
    { label: "Park City RD district", url: "https://parkcity.municipalcodeonline.com/book/print?type=ordinances&name=15-2.13_Residential_Development_%28RD%29_District" },
    { label: "KPCW: Summit Co. proposed bans", url: "https://www.kpcw.org/summit-county/2026-06-05/summit-county-considers-nightly-rental-ban-in-some-neighborhoods" },
    { label: "Summit Co. licensing", url: "https://www.summitcountyutah.gov/274/Business-Licensing" },
    { label: "Heber Code 5.26", url: "https://heber.municipalcodeonline.com/book/print?type=ordinances&name=5.26_Short_Term_Rentals" },
    { label: "Hideout 4.07", url: "https://hideout.municipalcodeonline.com/book/print?type=ordinances&name=4.07_Regulation_Of_Short_Term_(Nightly)_Rentals" },
    { label: "MIDA", url: "https://www.midaut.org/planning-zoning-and-permits" },
    { label: "Park Record: Midway TROD", url: "https://www.parkrecord.com/2026/09/08/midway-reduces-short-term-rental-zone-after-complaints-from-property-owners/" },
    { label: "KPCW: Kamas moratorium", url: "https://www.kpcw.org/summit-county/2025-03-17/kamas-pauses-new-short-term-rentals-adds-tax-for-guests" },
    { label: "Coalville Dev. Code", url: "https://media.rainpos.com/3855/CoalvilleCityDevCode_061024_20240610112643.pdf" },
  ],
  verifiedNote:
    "Researched 2026-09-28. Not verified: combined lodging-tax rates, Park City and Hideout fees, MIDA EO 2025-09, and whether Summit County has voted on the bans since August 2026. Not legal advice; confirm every candidate address.",
};

// ---------------------------------------------------------------------------
// Section 7 — coverage
// ---------------------------------------------------------------------------
const COVERAGE_ROWS = [
  { segmentKey: "group", label: "Large Group Home (primary)", status: "Pending deep dive", note: "Hold the Summit Park and Pine Meadow candidates until Summit County votes." },
  { segmentKey: "ski", label: "Ski-Access Home (secondary)", status: "Pending deep dive", note: "N=15; the Jordanelle gondola side is directional." },
  { segmentKey: "small", label: "1–2BR, anywhere", status: "Excluded", note: "None reach the Top 10%; the best reaches $97k." },
  { segmentKey: "mid_offcore", label: "3–4BR beyond 2 km of a lift", status: "Excluded", note: "None reach the Top 10%; the best reaches $92k." },
];
