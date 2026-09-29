/**
 * Content/config layer for the Park City, UT STR buy-box page.
 *
 * Same template as the Charlotte, NC site, but Park City earns its own
 * structure: with only 145 listings, the seven geographic clusters are
 * REFERENCE geography, not buy boxes. The data supports two products,
 * defined by size x ski access (see parkcity_overview.ipynb, "Distilling the
 * structure" and "Validating the Ski-Access definition"):
 *   - Large Group Home: 5BR+, sleeps 14+, location-flexible (product-first)
 *   - Ski-Access Home: 3BR+ within 2 km of a lift base (location-first)
 * The boxes are unranked (ranking needs the Section 6 deep dives) and may
 * overlap on the rare 5BR+ near a lift. Together they hold all 15 Top 10%
 * listings.
 *
 * Prose and config only. Every computed number shown in tables/cards comes
 * from js/region_data.js (generated). Where prose below quotes a number, it
 * was checked against the notebook output for the 2026-07-29 snapshot.
 *
 * Section 6 (Buy-Box Deep Dive): pre-comp-set deep dives, attached to BUY_BOXES
 * by js/deepdive_content.js from the generated js/deepdive_data.js.
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
    label: "Buy Box 1 · Large Group Home",
    name: "5BR+ homes sleeping 14+, anywhere legal",
    thesis:
      "Buy the product. Headcount and amenities carry these homes, and lift access isn't required: 10 of their 11 Top 10% listings sit more than 2 km from a lift.",
    spec: [
      ["Size", "5BR+, sleeping 14–16 (Heber City caps occupancy at 16)"],
      ["Screening signals", "A hot tub (every Top 10% listing has one) and 2+ entertainment amenities: game room, pool table, sauna, pickleball or theater."],
      // "Approved comps" and "Where" rows, and the thesis, are set from the
      // approved revenue comp set (COMPSET_5BR) in deepdive_content.js.
    ],
  },
  {
    id: "ski",
    segmentKey: "ski",
    label: "Buy Box 2 · Ski-Access Home",
    name: "3BR+ within 2 km of a lift base",
    thesis:
      "Buy the location. Near a lift, a 3–4BR reaches the Top 25% 73% of the time, against 15% for the same homes farther out. The premium shows up as ADR at similar occupancy.",
    spec: [
      ["Size", "3BR and up, with no upper cap. The core of this box is 3–4BR (15 of the 17 listings)."],
      ["Screening signals", "Walkable or ski-in access to Main Street / Town Lift, Deer Valley or Canyons, plus a hot tub (88% of the segment)."],
      ["Where", "Old Town / Main Street and Deer Valley hold all 5 of this box's Top 10% listings. The Jordanelle gondola side is directional. Eligibility follows Park City zoning (HR-1, R-1, Estate and most RD zones)."],
    ],
  },
];

const OVERLAP_NOTE =
  "<strong>The boxes can overlap.</strong> A 5BR+ home near a lift fits both. Only 2 exist in the data, so the Group Home economics are its base case and the location is upside that can't be sized yet.";

const NOT_TARGETS =
  "<strong>Not a target:</strong> 1–2BR anywhere (0 of 53 reach the Top 10%), 3–4BR beyond 2 km (0 of 46), and 5BR+ sleeping fewer than 14 away from the lifts (0 of 4).";

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
  "<strong>These are screening signals, not proven revenue uplift.</strong> Each row shows how often listings with and without a feature reach the Top 10%. Amenity rows compare 4BR+ homes only, so size isn't credited to the amenity, but better-run, better-designed homes may simply have more amenities. Rows with fewer than 15 listings on one side are directional.";

// ---------------------------------------------------------------------------
// Section 3 — Location (compressed). The map is the embedded folium map from
// parkcity_overview.ipynb; the seven areas are reference geography only.
// ---------------------------------------------------------------------------
const MAP_CONFIG = {
  stateAbbr: "UT",
  marketInterpretation:
    "<strong>Click an area outline</strong> for its numbers. The seven areas are clusters of listing coordinates, used as reference geography only. The red rings mark the 2 km ski-access zone. Filter by tier and area in the bottom-left panel.",
};

// One-word read per bedroom bucket for the size x ski-access table.
const MATRIX_READS = {
  "1-2BR": "Helps, but never reaches target level",
  "3BR": "Transforms it (only 6 near a lift)",
  "4BR": "Transforms it",
  "3-4BR": "Required: none reach the Top 10% without it",
  "5BR+": "Can't measure (only 2 near a lift)",
  "3BR+": "The Ski-Access box",
};

const LOCATION_CONCLUSION = [
  "<strong>Mid-size homes (3–4BR):</strong> the location is the product. Search within about 2 km of a lift; beyond that, pass.",
  "<strong>Large homes (5BR+, sleeping 14+):</strong> search anywhere zoning allows. Treat lift proximity as upside, not a requirement.",
  "<strong>Screen for regulation before geography.</strong> Summit Park and Pine Meadow hold 3 of the 11 Top 10% group homes but sit in Summit County's proposed ban areas.",
];

// ---------------------------------------------------------------------------
// Section 4 — Demographics
// ---------------------------------------------------------------------------
const DEMOGRAPHICS_NOTE =
  "These are review-derived signals, not verified demographics. Group trips climb with size, from under 6% of reviews at 1–2BR to about half at 5BR+, and kids appear in about a third of 5BR+ reviews. The two products serve different guests: the Large Group Home is a family and group-trip product (35% kids, 50% group trips), while the Ski-Access Home skews adult (20% kids).";

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
