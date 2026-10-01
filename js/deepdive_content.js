/**
 * Section 6 — Buy-Box Deep Dives, attached to BUY_BOXES.
 *
 * Each tab is structured around what its approved comps show, with Charlotte's
 * One-Page Recap template (csRecap) at the end:
 *   Group Home: minimum standard -> location sets the revenue band ->
 *     execution within the location -> comps -> examples -> recap.
 *   Ski-Access: location first, then the minimum product, comps and recap.
 *
 * Written for acquisitions: conclusion first, then the number that matters,
 * then photos. No statistical notation or visual-model scores on the page;
 * those stay in the notebooks:
 *   parkcity_buybox_deepdive.ipynb (product population, DEEPDIVE)
 *   parkcity_5br_compset.ipynb     (Group Home comps, COMPSET_5BR)
 *   parkcity_ski_compset.ipynb     (Ski-Access comps, COMPSET_SKI)
 * Every number is read from the generated data. Photos are labelled either
 * "Approved ... comp" or "Market reference" (ddPhoto / compset.js).
 */

(function () {
  const DG = DEEPDIVE.group, DS = DEEPDIVE.ski;
  const gp = (k, c, a) => ddPhoto("group", k, c, a);
  const sp = (k, c, a) => ddPhoto("ski", k, c, a);
  const n0 = (x) => Math.round(x);
  const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };

  // =========================================================================
  // Buy Box 1 · Large Group Home
  // Three layers, driven by the approved comps: the house qualifies (minimum
  // standard) -> the address sets the revenue band -> execution (bathrooms
  // first) sets where a home lands inside its band.
  // =========================================================================
  const group = BUY_BOXES.find((b) => b.id === "group");
  const K5T = CS.tiers;
  const OPEN = csRoute("Heber"), HOLD = csRoute("Summit"), PCR = csRoute("Park City");
  const gc = (s) => K5.comp(s), ga = (a) => K5.amen(a);
  const pcUp = K5T.High.park_city_side + K5T.Medium.park_city_side, nUp5 = K5T.High.n + K5T.Medium.n;
  const heberLux = gc("Heber Luxury Home"), pines = gc("Park City Pines"), pent = gc("Main St Penthouse"), resort = gc("Heber Resort Home"), dvv = gc("Deer Valley Views (Heber)"), hh = gc("Heber Heights"), tm = gc("Triple Master DV");
  const pcComps = CS.comps.filter((c) => !c.route.startsWith("Heber")), openComps = CS.comps.filter((c) => c.route.startsWith("Heber"));
  const pcMin = Math.min.apply(null, pcComps.map((c) => c.revenue)), pcMax = Math.max.apply(null, pcComps.map((c) => c.revenue));
  const pcAdr = med(pcComps.map((c) => c.adr));
  const gpbOf = (list, t) => med(list.filter((c) => c.tier === t).map((c) => c.guests_per_bath));
  const nOf = (list, t) => list.filter((c) => c.tier === t).length;
  const bandText5 = CS_TIERS.map((t) => t + " " + csRange(K5T[t].rev_min, K5T[t].rev_max) + " (" + K5T[t].n + ")").join(" · ");
  const areaText = "Heber / Snyderville " + csRange(OPEN.rev_min, OPEN.rev_max) + " (mostly " + csRange(K5T.Low.rev_min, K5T.Low.rev_max) + ") · Park City side " + csRange(pcMin, pcMax);

  // Section 1 card (numbers generated).
  group.name = "5BR+ homes sleeping 14+, lift-flexible";
  group.thesis = "The house gets you into the buy box; the address sets the revenue band. " + pcUp + " of the " + nUp5 + " comps above $200k are on the Park City side, and the higher-revenue homes win on nightly rate.";
  group.spec = group.spec.map((r) => (r[0] === "Screening signals"
    ? [r[0], "Enough bathrooms (4.5+ for 16), a great room and dining for the group, a game room, and deck space for a hot tub."]
    : r)).filter((r) => r[0] !== "Where").concat([
    ["Approved comps", areaText + ". Purchase price pending."],
    ["Where", "Park City side for $200k+: Old Town / Deer Valley (rare) or Summit Park / Pine Meadow (<strong>on hold</strong>). Heber / Snyderville is the open supply at the lower band. <strong>Avoid</strong> Midway."],
  ]);

  const ROLES5 = {
    "Park City Pines": "Exceptional product, 8 km from a lift",
    "Ski Views · Main St": "Old Town, 7 baths for 14",
    "Main St Penthouse": "Sleeps 10: the address carries it",
    "Heber Luxury Home": "The one Heber comp above Low: 8 baths",
    "Aspen Bliss": "Remote log lodge, high rate",
    "Views at Matterhorn": "Indoor sport court + game room",
    "Triple Master DV": "Deer Valley, almost no amenities",
    "Heber Mountain Home": "3 baths for 16",
    "Heber Resort Home": "Most amenities in the set",
    "Cabriolet Family Escape": "Fills nights at a low rate",
    "Ski & Tee Chalet": "Right product, few nights sold",
    "Heber Heights": "8BR / 6.5BA in Heber",
    "MTN Lake Retreat": "Lowest nightly rate in the set",
    "Deer Valley Views (Heber)": "Beautifully finished; it's in Heber",
  };
  const twoLists = (left, right, leftTitle, rightTitle) =>
    '<div class="cs-two"><div class="cs-two__col cs-two__col--buy"><h4>' + leftTitle + "</h4><ul>" + left.map((x) => "<li>" + x + "</li>").join("") + "</ul></div>" +
    '<div class="cs-two__col cs-two__col--add"><h4>' + rightTitle + "</h4><ul>" + right.map((x) => "<li>" + x + "</li>").join("") + "</ul></div></div>";
  const threeLists = (cols) => '<div class="cs-three">' + cols.map(([title, cls, items]) => '<div class="cs-three__col cs-three__col--' + cls + '"><h4>' + title + "</h4><ul>" + items.map((x) => "<li>" + x + "</li>").join("") + "</ul></div>").join("") + "</div>";

  Object.assign(group, {
    status: "comp-set",
    overview: {
      statusBadge: "14 approved revenue comps · purchase price pending",
      thesis: "A 5BR+ home built for 14–16 guests. <strong>The house gets you into the buy box. The address sets the revenue band.</strong>",
      whyItWorks:
        "Heber and Snyderville comps mostly earn " + csRange(K5T.Low.rev_min, K5T.Low.rev_max) + " at about " + csUsd(OPEN.adr_median) + " a night. Park City-side comps earn " + csRange(pcMin, pcMax) + " at about " + csUsd(pcAdr) + " a night. Homes fill a similar share of nights everywhere; the difference is the rate the address supports.",
      heroImage: gp("hero", "A multi-zone deck with string lights, a fire pit and lounge seating."),
      chips: [{ label: "5BR+, sleeps 14–16" }, { label: "4.5+ baths for 16" }, { label: "Great room + group dining" }, { label: "Game room + hot tub" }, { label: "Park City side for $200k+" }],
      revenueChips: [
        { label: "Heber / Snyderville", value: csRange(OPEN.rev_min, OPEN.rev_max) },
        { label: "Summit Park / Pine Meadow (hold)", value: csRange(HOLD.rev_min, HOLD.rev_max) },
        { label: "Old Town / Deer Valley", value: csRange(PCR.rev_min, PCR.rev_max) },
      ],
    },
    pendingSections: [
      { groupTitle: "What the Property Must Have" },
      {
        title: "Minimum Property Standard",
        body: "<p>These make a home a credible large-group rental. <strong>They don't decide whether it earns $130k or $330k; the address does</strong> (next section). Any architectural style works if the bones and the group layout are right; avoid builder-grade tract houses.</p>",
        html: () => twoLists(
          ["5+ bedrooms (5 is enough), legal for 14–16 guests", "Enough bathrooms: 4.5+ for 16 guests", "A great room and a dining table for the whole group", "A kitchen several people can cook in", "A second social space for a game room", "A deck or yard with room for a hot tub and seating"],
          ["Hot tub", "Pool table, ping pong, arcade", "Outdoor dining set and a fire pit or fire table", "Sauna", "Furniture, finish and styling", "Crib, pack 'n play, high chair"],
          "Must already exist (buy it)", "Can add at conversion"),
        images: [
          K5.pic("living", "Ski Views · Main St"), K5.pic("living", tm.short), K5.pic("living", pent.short), K5.pic("entertainment", "Views at Matterhorn", 5),
          K5.pic("sleeping", tm.short), K5.pic("sleeping", "Ski Views · Main St"), K5.pic("outdoor", pines.short), K5.pic("outdoor", "Aspen Bliss", 4),
        ],
      },

      { groupTitle: "Location Sets the Revenue Band" },
      {
        title: "Location & Revenue",
        body:
          "<p><strong>Location is the main difference between the tiers.</strong> " + OPEN.Low + " of the " + OPEN.n + " Heber / Snyderville comps are Low; " + pcUp + " of the " + nUp5 + " comps above $200k are on the Park City side. Ski access isn't the reason: the top comp is " + pines.lift_km.toFixed(0) + " km from a lift.</p>" +
          "<p><strong>Higher-revenue homes charge much higher nightly rates</strong> (" + csUsd(K5T.High.adr_median) + " a night for High, " + csUsd(K5T.Low.adr_median) + " for Low). They don't fill many more nights (" + n0(K5T.High.occ_median) + "% vs " + n0(K5T.Low.occ_median) + "%).</p>",
        html: () => K5.groupTable(CS.routes, "route", "Area", {
          "Heber Valley / Snyderville (open supply)": "The open supply, at the lower band. Heber City caps occupancy at 16.",
          "Summit Park / Pine Meadow (regulatory hold)": "<strong>On hold:</strong> Summit County's proposed nightly-rental ban covers these areas.",
          "Park City: Old Town / Deer Valley": "The top band, but 5BR+ homes are rare here.",
        }, [["Nights filled", (r) => n0(r.occ_median) + "%"]]),
        chartsRow: [{ file: "assets/" + CS.charts.adr_occ, alt: "Nightly rate against occupancy for the 14 comps", caption: "Each dot is a comp: up = higher nightly rate, right = more nights filled; dashed lines = equal revenue." }],
        mapEmbed: { url: "assets/" + CS.map + "?v=20261001", className: "embedded-map--compact", title: "Map of the 14 approved Group Home comps by tier" },
      },

      { groupTitle: "Execution Within the Location" },
      {
        title: "Bathrooms",
        body:
          "<p><strong>The stronger comps generally have less bathroom sharing, even within the same area. For a 16-person home, aim for roughly 4.5+ bathrooms.</strong> It's the one feature that's hard to add after purchase. The High comps also lean toward adult group trips (" + n0(K5T.High.group_median) + "% of reviews), the guests least willing to share a bathroom.</p>",
        html: () => '<div class="table-scroll"><table class="data-table dd-mini cs-table"><thead><tr><th>Guests per bathroom</th><th>Stronger homes in the area</th><th>Weaker homes in the area</th></tr></thead><tbody>' +
          '<tr><th scope="row">Heber / Snyderville</th><td>' + gpbOf(openComps, "Medium").toFixed(1) + " (the one Medium comp)</td><td>" + gpbOf(openComps, "Low").toFixed(1) + " (" + nOf(openComps, "Low") + " Low comps)</td></tr>" +
          '<tr><th scope="row">Park City side</th><td>' + gpbOf(pcComps, "High").toFixed(1) + " (" + nOf(pcComps, "High") + " High comps)</td><td>" + gpbOf(pcComps, "Medium").toFixed(1) + " (" + nOf(pcComps, "Medium") + " Medium comps)</td></tr></tbody></table></div>",
        images: [K5.pic("sleeping", "Ski Views · Main St"), K5.pic("sleeping", "Aspen Bliss"), K5.cover(heberLux.short, "the only Heber comp above Low, with 8 baths for 16")],
      },
      {
        title: "Amenities",
        body: "<p><strong>Every comp has a hot tub, and Low comps carry about as many amenities as High ones. More amenities don't overcome a weaker location.</strong> The High homes also sit in stronger locations, so read these as product standards, not as reasons a home earns more.</p>",
        chartsRow: [
          { file: "assets/" + CS.charts.prevalence, alt: "Bar chart of amenity prevalence by comp tier", caption: "How common each amenity is, by tier." },
          { file: "assets/" + CS.charts.presence, alt: "Grid of amenities for each approved comp", caption: "Which amenities each comp has, High → Low." },
        ],
      },
      {
        html: () => threeLists([
          ["Baseline", "base", ["Hot tub (" + ga("Hot tub").all_n + " of 14)", "A game / entertainment room", "Fire pit (" + ga("Fire pit").all_n + " of 14)", "BBQ grill, indoor fireplace"]],
          ["Useful additions", "add", ["Outdoor dining (every High comp)", "Pool table, ping pong, arcade", "Sauna", "Crib, pack 'n play"]],
          ["Not worth paying for", "skip", ["Pickleball court, pool, playground (only Low comps have them)", "Mini golf, golf simulator", "Gym, theater"]],
        ]),
      },

      { groupTitle: "Approved Revenue Comps" },
      {
        title: "High / Medium / Low",
        body: "<p>The analyst's 14 approved comps. All sit at the top of the market: even Low is around the market's Top 10%.</p>",
        html: () => K5.tierBands() + K5.cards(ROLES5) + '<details class="ref-details"><summary>All 14 comps in one table</summary>' + K5.fullTable() + "</details>",
      },

      { groupTitle: "Examples & Counterexamples" },
      {
        title: "What the Comps Teach",
        notes: [
          { text: "<strong>More amenities don't overcome a weaker location.</strong> " + resort.short + " has the most amenities in the set (pool, pickleball, playground, mini golf, game room) and earns " + ddK(resort.revenue) + ", with " + resort.baths + " baths for " + resort.sleeps + " guests.",
            images: [K5.pic("outdoor", resort.short), K5.pic("entertainment", resort.short)] },
          { text: "<strong>Bigger or more polished doesn't break the Heber band.</strong> " + hh.short + " has " + hh.bedrooms + " bedrooms and " + hh.baths + " baths (" + ddK(hh.revenue) + "). " + dvv.short + " has one of the best-finished kitchens in the set and the lowest revenue (" + ddK(dvv.revenue) + ").",
            images: [K5.cover(hh.short, "8BR / 6.5BA in Heber"), K5.pic("living", dvv.short)] },
          { text: "<strong>A strong address carries a thin product.</strong> " + tm.short + " has almost no amenities beyond a hot tub and earns " + ddK(tm.revenue) + " in Deer Valley. " + pent.short + " sleeps only " + pent.sleeps + " and earns " + ddK(pent.revenue) + " on Main Street.",
            images: [K5.pic("living", tm.short), K5.pic("outdoor", pent.short)] },
          { text: "<strong>An exceptional product can win away from skiing, on the Park City side.</strong> " + pines.short + " is " + pines.lift_km.toFixed(0) + " km from a lift and the top earner (" + ddK(pines.revenue) + "): a treetop deck, fire, sauna, putting green and a hot tub by the game room.",
            images: [K5.pic("outdoor", pines.short), K5.pic("entertainment", pines.short, 7)] },
        ],
      },

      { groupTitle: "Buy-Box Summary" },
      {
        title: "One-Page Recap",
        body: csRecap(
          [
            ["Bedrooms / Baths", "5+ bedrooms (5 is enough) · 4.5+ bathrooms for 16 guests"],
            ["Ideal Sleep Count", "14–16, legal at the address (Heber City caps at 16)"],
            ["Architectural Style", "Any style: good bones, not builder-grade tract product"],
            ["Backyard Size", "Room for a hot tub, outdoor dining and a fire zone; no court or pool needed"],
            ["Must-Have's", "Hot tub, game room, fire pit, BBQ, fireplace; great room and dining for the group"],
            ["Nice-to-Have's", "Outdoor dining, pool table, sauna. Pickleball, pool, playground, gym and theater are not worth paying for"],
            ["View", "Not a criterion"],
            ["Waterfront", "Not relevant"],
            ["Privacy / Seclusion", "Not necessary"],
            ["Ideal Location(s)", "Park City side for $200k+ (Old Town / Deer Valley, or Summit Park / Pine Meadow once the hold clears). Heber / Snyderville at the lower band. Avoid Midway"],
            ["Traveler ICP", "Large adult groups and multi-family trips"],
            ["Property Comp Sets", bandText5 + ". The address sets the band; higher-revenue homes charge higher nightly rates"],
          ],
          "the house gets you into the buy box and the address sets the revenue band. Buy a real 5BR+ with enough bathrooms, on the Park City side if possible; add the hot tub, game room and evening deck at conversion.",
          [
            ["Geography", "Park City side preferred; Heber / Snyderville priced for the lower band"],
            ["Bedrooms", "5BR+"],
            ["Bathrooms", "4.5+ for 16 guests"],
            ["STR capacity", "14–16 guests, legal at the address"],
            ["Size", "Enough for a great room, dining for 12+ and a separate game room"],
            ["Ski access", "Not required"],
            ["Lot", "Deck or yard with space for a hot tub, dining and fire"],
            ["Interior", "Great room + group kitchen + second social space"],
            ["Basement", "A lower level for the game room is ideal"],
            ["Sleeping layout", "Real bedrooms for adults; bunks only with enough bathrooms"],
            ["Outdoor product", "Hot tub + outdoor dining + fire table"],
            ["Entertainment", "Pool table, ping pong, arcade in a dedicated room"],
            ["Pool", "Not needed"],
            ["Design", "Finished, any style; finish alone doesn't lift a Heber home"],
          ],
          [
            ["Revenue Potential", "Heber / Snyderville " + csRange(OPEN.rev_min, OPEN.rev_max) + " (mostly " + csRange(K5T.Low.rev_min, K5T.Low.rev_max) + ") · Summit Park / Pine Meadow " + csRange(HOLD.rev_min, HOLD.rev_max) + " (on hold) · Old Town / Deer Valley " + csRange(PCR.rev_min, PCR.rev_max)],
            ["Purchase Price", "Pending"],
          ]
        ),
      },
    ],
    pendingNote: "Photos are from the approved comps' own galleries. Revenue figures are gross benchmarks, not an underwriting model. The full analysis is in the notebooks (parkcity_5br_compset.ipynb, parkcity_buybox_deepdive.ipynb).",
  });

  // =========================================================================
  // Buy Box 2 · Ski-Access Home
  // =========================================================================
  const ski = BUY_BOXES.find((b) => b.id === "ski");
  const KT = CSK.tiers, KG = CSK.geo;
  const kc = (s) => KS.comp(s);
  const walkRow = KG.by_walk[0];
  const jordRow = KG.by_walk.find((r) => r.group.indexOf("Jordanelle") === 0);
  const ceil = kc("Ski Views · Main St"), dog6 = kc("Dog-Friendly 6BR"), chic = kc("Chic Town Lift Retreat"), mst = kc("Main St & Trails"), reese = kc("Reese Williams House");
  const dvw = kc("Deer Valley Walk-In"), ev4 = kc("East Village 4BR"), chateau = kc("Jordanelle Château"), views3 = kc("Old Town 3BR Views"), steps = kc("Steps to Main Street"), skiin = kc("Ski-in/out Old Town");
  const HML = ["High", "Medium", "Low"];
  const bandTextS = HML.map((t) => t + " " + csRange(KT[t].rev_min, KT[t].rev_max) + " (" + KT[t].n + ")").join(" · ");
  const pairRows = [
    ["Revenue", (c) => ddK(c.revenue) + " (" + c.tier + ")"], ["Nightly rate · nights filled", (c) => csUsd(c.adr) + " · " + n0(c.occ) + "%"],
    ["Bedrooms · baths · sleeps", (c) => c.bedrooms + " · " + c.baths + " · " + c.sleeps], ["Nearest lift", (c) => AREA_SHORT[c.lift_area] + ", " + c.lift_km.toFixed(1) + " km"],
    ["Distance to Main Street", (c) => c.main_st_km.toFixed(1) + " km"], ["Interior finish", (c) => c.finish], ["Game room / pool table", (c) => (c.second_space ? "Yes" : "No")],
    ["Rating (reviews)", (c) => c.rating + "★ (" + c.reviews + ")"],
  ];
  const pairPhotos = (key, notes) => CSK.pairs[key].photos.map((p) => {
    const pr = CSK.pairs[key], n = notes[p.row];
    return { note: n[0],
      left: { file: "assets/" + p.strong, alt: n[1], caption: "Approved Ski-Access comp · " + pr.strong.tier + " · " + pr.strong.short + ": " + n[1] },
      right: { file: "assets/" + p.ordinary, alt: n[2], caption: "Approved Ski-Access comp · " + pr.ordinary.tier + " · " + pr.ordinary.short + ": " + n[2] } };
  });
  const walkLowTypical = med(CSK.comps.filter((c) => c.tier === "Low" && c.walk_band === walkRow.group).map((c) => c.revenue));

  // Section 1 card (numbers generated).
  ski.thesis = "Buy the location, then the minimum product. Walk to the lift <em>and</em> to dinner: every High comp is within about 1 km of Main Street, and none of the " + KG.not_walkable_n + " comps farther out reach High.";
  ski.spec = [
    ["Size", "3BR and up; 3–4BR core. A fourth bedroom adds little; a 5BR+ pays only when it's walkable and built to the group-home standard."],
    ["Screening signals", "Within about 1 km of Main Street; enough bathrooms; hot tub, fireplace, deck and parking (every comp has them); an upscale finish or a game room."],
    ["Approved comps", bandTextS + ", plus a " + ddK(ceil.revenue) + " 5BR ceiling reference. Purchase price pending."],
    ["Where", "Old Town / Town Lift and Deer Valley Snow Park. Jordanelle / East Village comps are all Low. Eligibility follows Park City zoning (HR-1, R-1, Estate, most RD)."],
  ];

  const ROLESS = {
    "Ski Views · Main St": "Ceiling: a walkable 5BR built to the group-home standard (also a Group Home comp)",
    "Chic Town Lift Retreat": "Top 3–4BR comp: a 3BR with an upscale finish",
    "Main St & Trails": "Dated finish, but walkable with a game room",
    "Deer Valley Walk-In": "Luxury remodel near Deer Valley Snow Park",
    "Steps to Main Street": "On Main Street, 4.5 baths, plain finish, few nights sold",
    "Dog-Friendly 6BR": "Most bedrooms, but a drive to dinner",
    "East Village 4BR": "Current finish, Jordanelle rate",
    "Jordanelle Château": "Luxury new build, lowest nightly rate",
    "Ski-in/out Old Town": "“Ski-in/out” label, sleeps " + skiin.sleeps + ", few nights sold",
    "Old Town 3BR Views": "Great view, 1990s interior, sleeps " + views3.sleeps,
    "Reese Williams House": "Walkable, but 2 baths for 10",
    "Gondola Lake Chalet": "Lowest comp: Jordanelle new build",
  };

  Object.assign(ski, {
    status: "comp-set",
    overview: {
      statusBadge: "12 approved revenue comps · purchase price pending",
      thesis:
        "<strong>Buy the walk first:</strong> a 3–4BR within about 1 km of Main Street, at the Town Lift or Deer Valley Snow Park. <strong>Then make sure the house can fill it:</strong> enough bathrooms, a hot tub, fireplace, deck and parking, and either an upscale finish or a second space such as a game room.",
      whyItWorks:
        "Being near a lift isn't enough: the Jordanelle homes are about 1 km from the gondola and all sit in the Low tier, at about half the Old Town nightly rate. The High homes win by filling far more nights than the Medium homes (" + n0(KT.High.occ_median) + "% vs " + n0(KT.Medium.occ_median) + "%) at a solid rate.",
      heroImage: sp("hero", "A deck looking straight onto the ski runs: the location is the amenity."),
      chips: [{ label: "3–4BR (3BR is enough)" }, { label: "Walk to Main St (≤ ~1 km)" }, { label: "Town Lift or Deer Valley Snow Park" }, { label: "Enough bathrooms" }, { label: "Hot tub · fireplace · deck · parking" }, { label: "Upscale finish or a game room" }],
      revenueChips: ["High", "Medium", "Low", "Ceiling"].map((t) => ({ label: t === "Ceiling" ? "Ceiling (5BR overlap)" : "Comp tier · " + t, value: csRange(KT[t].rev_min, KT[t].rev_max) + " (" + KT[t].n + ")" })),
    },
    pendingSections: [
      { groupTitle: "What to Buy vs. Add Later" },
      {
        title: "Buy the Real Estate vs. Add at Conversion",
        html: () => ddChecklist([
          ["Walk to Main Street (within about 1 km), at the Town Lift or Deer Valley Snow Park", "buy", "The whole thesis. It can't be added later.", "Every High comp is walkable; none of the " + KG.not_walkable_n + " comps farther out reach High.", "strong"],
          ["Legal nightly rental", "buy", "Park City zoning: HR-1, R-1, Estate and most RD zones. MIDA / Hideout rules on the Jordanelle side.", "Section 5", "strong"],
          ["Enough bathrooms: 3+ baths for 10 guests", "buy", "One of the clearest differences, and hard to add in an Old Town footprint.", "High comps: " + KT.High.baths_median + " baths. Low: " + KT.Low.baths_median + ". The only 2-bath comp is Low.", "strong"],
          ["3–4BR sleeping 8–10", "buy", "The top 3–4BR comp is a 3BR. Both comps sleeping 6–7 are Low.", "A fourth bedroom adds little.", "directional"],
          ["Deck or balcony, fireplace, on-site parking", "buy", "Structural, and every comp has them.", "The entry ticket, not what separates the tiers.", "strong"],
          ["Hot tub", "either", "Needs a deck that can carry it.", "Every comp has one.", "strong"],
          ["An upscale finish or a second space (game room, pool table, media room)", "either", "Buy the space; add the finish and equipment.", "Every walkable High comp has one; no walkable Medium or Low comp does.", "directional"],
          ["Sauna", "add", "A luxury add-on.", "Only the top homes have one.", "directional"],
          ["Ski entry: bench, hooks, boot dryers", "add", "Cheap, and ski guests use it.", "No difference either way.", "weak"],
        ]),
      },

      { groupTitle: "Geo Considerations" },
      {
        title: "Walk to the Lift and to Dinner",
        body:
          "<p><strong>Near a lift isn't enough; guests need to walk to dinner.</strong> Every High comp is within about 1 km of Main Street. The three Jordanelle homes are about 1 km from the gondola but " + n0(jordRow.main_st_km_median) + "+ km from town, and all are Low. Inside the walk, being even closer doesn't earn more, and “ski-in/ski-out” labels don't help.</p>",
        html: () => KS.groupTable(KG.by_walk, "group", "Walkability", {
          "Walk to Main St (≤1.1 km)": "Where every High comp is. Necessary, not sufficient.",
          "Near a lift, not walkable to town (2–3 km)": "A drive to dinner; few nights sold.",
          "Jordanelle side (4+ km to Main St)": "Fills nights, at about half the rate.",
        }),
        mapEmbed: { url: "assets/" + CSK.map + "?v=20261001", className: "embedded-map--compact", title: "Map of the 12 approved Ski-Access comps by tier, with lift bases and Main Street" },
        images: [
          sp("aerial_main_st", "The strongest listings sell the walk: an aerial with the house pinned by Main Street."),
          sp("deck_view", "An Old Town deck over town and the mountain."),
        ],
      },
      {
        title: "Which Ski Area",
        body: "<p><strong>Old Town / Town Lift and Deer Valley Snow Park hold every High comp.</strong> Jordanelle / East Village comps charge " + csUsd(KG.jordanelle_adr[0]) + "–" + csUsd(KG.jordanelle_adr[1]) + " a night, even as luxury new builds. Canyons has no comp.</p>",
        html: () => KS.groupTable(KG.by_area, "group", "Nearest ski area", null),
        images: [
          sp("jordanelle_view", "The Jordanelle draw: a big Deer Valley view."),
          sp("jordanelle_hot_tub", "A great hot-tub photo over the reservoir, at one of the lowest rates in the set."),
        ],
      },

      { groupTitle: "Property Profile" },
      {
        title: "Bedrooms & Bathrooms",
        body: "<p><strong>More bathrooms are one of the clearest differences between stronger and weaker Ski-Access comps.</strong> 3BR is enough: the top 3–4BR comp is a 3BR. Both comps sleeping only 6–7 are Low.</p>",
        html: () => KS.tierFacts([
          ["Bedrooms", (s) => s.bedrooms_median + "BR", "No difference: 3–4BR is the core"],
          ["Bathrooms", (s) => s.baths_median, "Clear difference: more bathrooms at the top"],
          ["Guests per bathroom", (s) => s.gpb_median.toFixed(1), "Less sharing at the top"],
          ["Sleeps", (s) => s.sleeps_median, "8–10 is the target; 6–7 is too small"],
        ], HML),
      },
      {
        title: "Living Room & Fireplace",
        body: "<p>Every comp has a fireplace. <strong>Inside the walk, the High homes have a luxury remodel or a game room; the weaker Old Town homes have neither.</strong> Any style works.</p>",
        images: [
          sp("living_fireplace_lux", "A stone fireplace wall and open stair."),
          sp("kitchen_lux", "A contemporary kitchen with a pro range."),
          sp("living_fireplace_trad", "Weaker: a dated living room on Main Street."),
          sp("kitchen_trad", "Weaker: equipped, but 2000s styling."),
        ],
      },
      {
        title: "Hot Tub, Deck & Arrival",
        body: "<p>A hot tub on a deck is standard in every comp; the view doesn't carry the rate. Parking is a must in Old Town, and every comp has it. A ski bench and hooks at the door are cheap to add.</p>",
        images: [
          sp("hot_tub_view", "A hot tub with the ski slopes beyond."),
          sp("balcony", "A covered balcony over Old Town."),
          sp("garage", "A garage: parking is part of the real estate here."),
          sp("villa_gallery", "A ski bench and hooks by the door."),
        ],
      },

      { groupTitle: "Amenities" },
      {
        title: "Amenity Prevalence By Tier",
        body:
          "<p>Left: how common each feature is in each tier. Right: which features each comp has, from the ceiling comp down to Low.</p><ul class=\"tight-list\">" +
          "<li><strong>Every comp has</strong> a hot tub, fireplace, deck and parking.</li>" +
          "<li><strong>The High homes add</strong> a pool table and outdoor dining; no Medium or Low comp has a pool table.</li>" +
          "<li><strong>No difference:</strong> garage, ski storage, bunk rooms and “ski-in/ski-out” claims.</li></ul>",
        chartsRow: [
          { file: "assets/" + CSK.charts.prevalence, alt: "Bar chart of feature prevalence by Ski-Access comp tier", caption: "How common each feature is, by tier (the ceiling comp is in the grid on the right)." },
          { file: "assets/" + CSK.charts.presence, alt: "Grid of features for each approved Ski-Access comp", caption: "Which features each comp has, ceiling → Low." },
        ],
      },
      {
        title: "Must-Have's",
        body: "<p>The minimum standard every approved comp meets, plus enough bathrooms.</p>",
        items: ["Hot tub", "Indoor fireplace", "Deck / patio / balcony", "On-site parking", "3+ baths for 10 guests"],
      },
      {
        ranked: {
          note: "Median revenue with vs. without the feature, across Park City's ski-access homes.",
          items: ddRanked(DS.amenities, [
            ["Game room", "Every walkable High comp has a game room, pool table or media room, or an upscale finish. Buy the space; add the table.", [sp("game_room", "A small game room with a pool table.")], true],
            ["Sauna", "Only the top homes have one. A cheap luxury add.", [], true],
            ["Air conditioning", "Nearly every comp has it.", [], false],
          ]),
        },
      },
      {
        title: "Auto-Add",
        body: "<ul class=\"tight-list\"><li>Ski entry: bench, hooks, boot dryers</li><li>Outdoor dining set on the deck</li><li>Pool table once the room exists</li></ul>",
      },

      { groupTitle: "Traveler Demographics" },
      {
        title: "Traveler ICP",
        body: "<p><strong>Adult ski groups and families of 8–10.</strong> Kids show up in about a fifth of reviews in every tier, and group trips vary without a clear pattern: the guest is the same, the house is what differs. Build for adults: real beds, enough bathrooms, a hot tub and fireplace, and a walk to dinner.</p>",
        html: () => '<div class="table-scroll"><table class="data-table dd-mini"><thead><tr><th>Reviews that mention…</th>' + HML.map((t) => "<th>" + csTierPill(t) + "</th>").join("") + "</tr></thead><tbody>" +
          '<tr><th scope="row">A group trip</th>' + HML.map((t) => "<td>" + n0(KT[t].group_median) + "%</td>").join("") + "</tr>" +
          '<tr><th scope="row">Kids</th>' + HML.map((t) => "<td>" + n0(KT[t].kids_median) + "%</td>").join("") + "</tr></tbody></table></div>",
      },

      { groupTitle: "Comp Set" },
      {
        title: "Ceiling / Overlap Reference: " + ceil.short,
        body:
          "<p><strong>" + ddK(ceil.revenue) + " at " + csUsd(ceil.adr) + " a night.</strong> A 5BR / " + ceil.baths + "-bath home sleeping " + ceil.sleeps + ", " + ceil.main_st_km.toFixed(1) + " km from Main Street. It combines both Park City strategies: the walkable ski location and the Large Group Home product (rooftop hot tub, sauna, game room). It's also a High comp in the Group Home set.</p>" +
          "<p>It's a ceiling, not a target, so it's kept out of the High / Medium / Low tiers below. The other large home, " + dog6.short + " (" + ddK(dog6.revenue) + ", " + dog6.main_st_km.toFixed(1) + " km from Main Street), shows the opposite: size without the walk doesn't pay.</p>",
        images: CSK.photo_categories.ceiling.Ceiling.map((p) => ({ file: "assets/" + p.file, alt: p.caption, caption: "Approved Ski-Access comp · Ceiling · " + ceil.short + ": " + p.caption })),
      },
      {
        title: "Revenue Comp Tiers",
        body: "<p>The analyst's approved comps: the ceiling reference plus 11 comps tiered by revenue.</p>",
        html: () => KS.tierBands() + KS.tierFacts([
          ["Nightly rate", (s) => csUsd(s.adr_median), "Medium charges the most, but can't fill nights"],
          ["Nights filled", (s) => n0(s.occ_median) + "%", "High fills about two-thirds of nights at a solid rate"],
          ["Walkable to Main Street", (s) => s.walkable + " of " + s.n, "Every High comp is walkable"],
          ["Jordanelle side", (s) => s.jordanelle + " of " + s.n, "The Jordanelle homes are all Low"],
        ], HML),
      },
      {
        title: "The 12 Approved Comps",
        html: () => KS.cards(ROLESS) + '<details class="ref-details"><summary>All 12 comps in one table</summary>' + KS.fullTable() + "</details>",
      },
      {
        title: "Nightly Rate vs. Occupancy",
        body:
          "<p><strong>High homes fill about " + n0(KT.High.occ_median) + "% of nights at about " + csUsd(KT.High.adr_median) + ".</strong> Medium homes charge more (" + csUsd(KT.Medium.adr_median) + ") but fill only " + n0(KT.Medium.occ_median) + "%. Low homes fill nights, but at about " + csUsd(KT.Low.adr_median) + ", mostly on the Jordanelle side. The ceiling comp wins on rate (" + csUsd(ceil.adr) + ").</p>",
        chartsRow: [{ file: "assets/" + CSK.charts.adr_occ, alt: "Nightly rate against occupancy for the 12 comps", caption: "Each marker is a comp: up = higher nightly rate, right = more nights filled; shape = walkability; dashed lines = equal revenue." }],
      },
      {
        title: "Comp-Set Visual Comparison",
        body: "<p>Photos from the approved comps' own galleries. <strong>Why can two homes near skiing earn so differently?</strong></p>",
        html: () => KS.comparisonHtml([
          ["setting", "Location", "High homes are a walk from Main Street and show it. Low homes are a drive from town, or have the address but not the house."],
          ["living", "Living Room & Fireplace", "High homes have a luxury remodel or a game room. Weaker homes are plainer or dated, or brand new on the Jordanelle side."],
          ["sleeping", "Bedrooms & Bathrooms", "The difference is the number of bathrooms. A nice bathroom doesn't fix a Jordanelle address."],
          ["outdoor", "Hot Tub & Deck", "Every comp has a hot tub. Some of the biggest views are on Low comps: the view doesn't carry the rate."],
          ["second", "Game Room & Second Space", "Every High comp has a pool table or media room. The one weaker comp with a game room is a drive from town."],
        ]),
      },

      { groupTitle: "Analyst Notes" },
      {
        title: "Notes / Insights",
        notes: [
          { text: "<strong>Near the lift isn't near town.</strong> " + chateau.short + " is a luxury new build with ski and reservoir views, " + chateau.lift_km.toFixed(0) + " km from the gondola, and it has the lowest nightly rate in the set (" + csUsd(chateau.adr) + ").",
            images: [KS.cover(chateau.short, "a luxury new build on the Jordanelle side"), KS.pic("outdoor", chateau.short)] },
          { text: "<strong>Less flashy can win.</strong> " + mst.short + " has a dated living room and a plain hot tub, but it's walkable and has a game room. It fills " + n0(mst.occ) + "% of nights and earns " + ddK(mst.revenue) + ".",
            images: [KS.pic("living", mst.short), KS.pic("second", mst.short, 7)] },
          { text: "<strong>The address without the house.</strong> " + views3.short + " is " + views3.main_st_km.toFixed(1) + " km from Main Street with a great view, but has a 1990s interior and sleeps only " + views3.sleeps + ": " + ddK(views3.revenue) + " at " + csUsd(views3.adr) + " a night.",
            images: [KS.pic("living", views3.short), KS.pic("outdoor", views3.short)] },
          { text: "<strong>Size without the walk doesn't pay.</strong> " + dog6.short + " has the most bedrooms and a game room, but it's a drive to dinner. It fills only " + n0(dog6.occ) + "% of nights.",
            images: [KS.pic("setting", dog6.short), KS.pic("second", dog6.short)] },
          { text: "<strong>The label doesn't carry it.</strong> " + skiin.short + " says “ski-in/out” and is steps from Main Street, but sleeps " + skiin.sleeps + " with no second space: " + ddK(skiin.revenue) + ", " + n0(skiin.occ) + "% of nights.",
            images: [KS.cover(skiin.short, "an Old Town house marketed as ski-in/out")] },
        ],
      },

      { groupTitle: "Comp Deep-Dive" },
      {
        title: "Location Sets the Rate: Deer Valley vs. the Jordanelle Side",
        body: "<p>Two finished 4BR homes about 1 km from a Deer Valley lift. <strong>" + dvw.short + " charges " + csUsd(dvw.adr) + "; " + ev4.short + " charges " + csUsd(ev4.adr) + "</strong> and fills more nights. Main Street is " + dvw.main_st_km.toFixed(1) + " km from one and " + ev4.main_st_km.toFixed(1) + " km from the other.</p>",
        pairLabels: [dvw.title, ev4.title],
        compStats: csPair(CSK.pairs.rate, pairRows),
        compPhotoRows: pairPhotos("rate", {
          living: ["<strong>Living room:</strong> both finished and current. Not a finish gap.", "Stone fireplace and open stair.", "Stone-wall fireplace in a new build."],
          kitchen: ["<strong>Kitchen:</strong> both current.", "Rift-oak kitchen open to the dining table.", "White shaker kitchen with a dark island."],
          outdoor: ["<strong>Outdoor:</strong> a hot tub facing Deer Valley, against a gallery that shows no deck or hot tub at all.", "Hot tub facing Deer Valley.", "A coffee-table close-up: no outdoor photo in this gallery."],
        }),
      },
      {
        title: "The House Fills the Nights: Same Walk to Main Street",
        body: "<p>Two 4BR Old Town houses sleeping 10, the same distance from Main Street, at nearly the same rate. <strong>" + mst.short + " fills " + n0(mst.occ) + "% of nights; " + reese.short + " fills " + n0(reese.occ) + "%.</strong> The difference: " + mst.baths + " baths vs " + reese.baths + ", and a game room vs none.</p>",
        pairLabels: [mst.title, reese.title],
        compStats: csPair(CSK.pairs.occupancy, pairRows),
        compPhotoRows: pairPhotos("occupancy", {
          exterior: ["<strong>Arrival:</strong> a house over a two-car garage, against a historic house up a flight of stairs.", "Two-car garage.", "Restored historic house above the street."],
          living: ["<strong>Living room:</strong> the higher earner has the plainer room.", "Wood-burning fireplace, maple built-ins.", "Leather sectional and a gas stove."],
          hot_tub: ["<strong>Hot tub:</strong> both plain. Not the reason.", "A side-yard tub.", "A deck tub."],
          second: ["<strong>Second space:</strong> a garage game room, against no second space.", "Game room with a pool table.", "The dining table: no second space shown."],
        }),
      },

      { groupTitle: "Projections" },
      {
        title: "Revenue Potential & Representative Listings",
        body:
          "<ul><li><strong>Walkable 3–4BR, done right</strong> (enough baths, an upscale finish or a game room): " + csRange(KT.High.rev_min, KT.High.rev_max) + ". The realistic target.</li>" +
          "<li><strong>Walkable but under-done, or a drive from town:</strong> " + csRange(KT.Medium.rev_min, KT.Medium.rev_max) + " (Medium) or about " + ddK(walkLowTypical) + " (walkable Low).</li>" +
          "<li><strong>Jordanelle side:</strong> " + csRange(jordRow.rev_min, jordRow.rev_max) + ", whatever the finish.</li>" +
          "<li><strong>Walkable 5BR+ built to the group-home standard:</strong> " + ddK(ceil.revenue) + ", one example. A ceiling, not a target.</li></ul>" +
          "<p>Representative comps: <a href=\"" + chic.url + "\" target=\"_blank\" rel=\"noopener\">" + chic.short + " ↗</a> (High) · <a href=\"" + steps.url + "\" target=\"_blank\" rel=\"noopener\">" + steps.short + " ↗</a> (Medium) · <a href=\"" + ev4.url + "\" target=\"_blank\" rel=\"noopener\">" + ev4.short + " ↗</a> (Low).</p>" +
          "<p class=\"dd-note\">Gross revenue benchmarks from the approved comps, not an underwriting model. Purchase price: pending.</p>",
      },

      { groupTitle: "Buy-Box Summary" },
      {
        title: "One-Page Recap",
        body: csRecap(
          [
            ["Bedrooms / Baths", "3+ bedrooms (3–4 ideal) · 3+ bathrooms for 10 guests"],
            ["Ideal Sleep Count", "8–10 (6–7 is too small)"],
            ["Architectural Style", "Any style; upscale and finished inside"],
            ["Backyard Size", "A deck or balcony with a hot tub is enough; no yard needed"],
            ["Must-Have's", "Hot tub, indoor fireplace, deck / patio / balcony, on-site parking"],
            ["Nice-to-Have's", "Game room / pool table or media room (strong), outdoor dining, sauna, air conditioning"],
            ["View", "Nice, but doesn't lift revenue"],
            ["Waterfront", "Not relevant; Jordanelle reservoir views don't lift the rate"],
            ["Privacy / Seclusion", "Not necessary; walkability matters more"],
            ["Ideal Location(s)", "Within about 1 km of Main Street: Old Town / Town Lift and Deer Valley Snow Park. Jordanelle / East Village at Low-tier pricing only"],
            ["Traveler ICP", "Adult ski groups and families of 8–10"],
            ["Property Comp Sets", bandTextS + ", plus the " + ddK(ceil.revenue) + " 5BR ceiling reference"],
          ],
          "buy the walk to the lift and to dinner first, with enough bathrooms; then add the finish, the game room and the ski entry.",
          [
            ["Geography", "Old Town / Town Lift or Deer Valley Snow Park"],
            ["Bedrooms", "3–4BR"],
            ["Bathrooms", "3+ (about 2.5 guests per bath at the top)"],
            ["STR capacity", "8–10 guests"],
            ["Size", "Enough for a real living room with a fireplace, and ideally a second space"],
            ["Walkability", "Within about 1 km of Main Street: walk to the lift and to dinner"],
            ["Ski access", "Town Lift or Deer Valley Snow Park; ignore “ski-in/ski-out” labels"],
            ["Parking", "On-site parking or a garage; check snow-season access"],
            ["Interior", "Upscale and finished: fireplace living room, updated kitchen"],
            ["Sleeping layout", "Real beds for adults"],
            ["Outdoor product", "Hot tub on a deck or balcony"],
            ["Entertainment", "A game room, pool table or media room"],
            ["Design", "Finished and upscale, any style; a dated interior holds back even a great location"],
          ],
          [
            ["Revenue Potential", "Low " + csRange(KT.Low.rev_min, KT.Low.rev_max) + " · Medium " + csRange(KT.Medium.rev_min, KT.Medium.rev_max) + " · High " + csRange(KT.High.rev_min, KT.High.rev_max) + " · Ceiling " + ddK(ceil.revenue) + " (overlap reference)"],
            ["Purchase Price", "Pending"],
          ]
        ),
      },
    ],
    pendingNote: "Photos are labelled as approved comps or market references. The full analysis is in the notebooks (parkcity_ski_compset.ipynb, parkcity_buybox_deepdive.ipynb).",
  });
})();
