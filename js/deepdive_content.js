/**
 * Section 6 — Buy-Box Deep Dives, attached to BUY_BOXES.
 *
 * Structure follows Charlotte's Lake Buy Box (overview hero -> grouped
 * sections -> comp set -> recap), with Clearwater's large-home thinking (buy
 * the space vs. add the equipment; Must-Have / Nice-to-Have / Auto-Add).
 *
 * Buy Box 1 (Large Group Home) has two evidence layers, kept apart:
 *   - product population: DEEPDIVE (deepdive_data.js, parkcity_buybox_deepdive.ipynb)
 *   - analyst-approved revenue comp set: COMPSET_5BR (compset_data.js,
 *     parkcity_5br_compset.ipynb), rendered with the helpers in compset.js
 * Buy Box 2 (Ski-Access Home) has the same two layers: DEEPDIVE and
 *   COMPSET_SKI (compset_ski_data.js, parkcity_ski_compset.ipynb).
 *
 * Every number is read from the generated data. Photos are labelled either
 * "Approved Group Home comp" or "Market reference" (ddPhoto in deepdive.js).
 */

(function () {
  const DG = DEEPDIVE.group, DS = DEEPDIVE.ski;
  const gF = (f) => ddFind(DG.amenities, "feature", f);
  const sF = (f) => ddFind(DS.amenities, "feature", f);
  const gB = (k, b) => ddFind(DG.capacity[k], "bucket", b);
  const sB = (k, b) => ddFind(DS.capacity[k], "bucket", b);
  const sL = (k, b) => ddFind(DS.location[k], k === "by_area" ? "area" : "bucket", b);
  const gC = (c) => ddFind(DG.concepts, "concept", c);
  const sC = (c) => ddFind(DS.concepts, "concept", c);
  const gArea = (r) => DG.areas.find((a) => a.Region === r) || { n: 0, top10: 0, top25: 0 };
  const gp = (k, c, a) => ddPhoto("group", k, c, a);
  const sp = (k, c, a) => ddPhoto("ski", k, c, a);
  const PAIR_G = DEEPDIVE.pairs.group, PAIR_S = DEEPDIVE.pairs.ski;

  // -------------------------------------------------------------------------
  // Buy Box 1 · Large Group Home — product population (DEEPDIVE, July
  // snapshot) + the analyst-approved revenue comp set (COMPSET_5BR).
  // -------------------------------------------------------------------------
  const group = BUY_BOXES.find((b) => b.id === "group");
  const g = DG.summary;
  const T = CS.tiers, DEC = CS.decomposition, POS = CS.position;
  const OPEN = csRoute("Heber"), HOLD = csRoute("Summit"), PCR = csRoute("Park City");
  const cc = csComp, cA = csAmen, cD = csDriver, cK = csConcept;
  const upComps = CS.comps.filter((c) => c.tier !== "Low");
  const lowComps = CS.comps.filter((c) => c.tier === "Low");
  const upMaxGpb = Math.max.apply(null, upComps.map((c) => c.guests_per_bath));
  const lowOverGpb = lowComps.filter((c) => c.guests_per_bath > upMaxGpb);
  const lowUnderGpb = lowComps.length - lowOverGpb.length;
  const n6 = (t) => CS.comps.filter((c) => c.tier === t && c.bedrooms >= 6).length;
  const allHigh5 = CS.comps.filter((c) => c.tier === "High").every((c) => c.bedrooms === 5);
  const pcUp = T.High.park_city_side + T.Medium.park_city_side, nUp = T.High.n + T.Medium.n;
  const amenOf = (a) => cA(a).High_n + " of " + T.High.n + " High · " + cA(a).Medium_n + " of " + T.Medium.n + " Medium · " + cA(a).Low_n + " of " + T.Low.n + " Low";
  const pctOf = (share) => Math.round(share) + "%";
  const cStats = (s) => ddK(cc(s).revenue) + ", ADR " + csUsd(cc(s).adr) + " at " + Math.round(cc(s).occ) + "%";
  const bandText = CS_TIERS.map((t) => t + " " + csRange(T[t].rev_min, T[t].rev_max) + " (" + T[t].n + ")").join(" · ");
  const lowMode = (m) => (CS.low_modes[m] || []).length;
  const heberLux = cc("Heber Luxury Home"), pines = cc("Park City Pines"), pent = cc("Main St Penthouse");

  // Section 1 card: the comp set refines the thesis and "Where" (numbers generated).
  group.thesis =
    "Buy the product: lift access isn't required, and the top comp is " + pines.lift_km.toFixed(0) + " km from a lift. The approved comps add the constraint: the product gets a home into the comp set, the market side sets the tier. " +
    pcUp + " of the " + nUp + " comps above $200k are on the Park City side.";
  group.name = "5BR+ homes sleeping 14+, lift-flexible";
  group.spec = group.spec.map((r) => (r[0] === "Screening signals"
    ? [r[0], "Bathrooms first (≤3.5 guests per bath; every Medium/High comp meets it), a hot tub (all 14 comps), a real entertainment room and an evening deck with outdoor dining and fire."]
    : r)).filter((r) => r[0] !== "Where").concat([
    ["Approved comps", bandText + ". Purchase price pending."],
    ["Where", "Heber Valley and Snyderville are the open supply; " + OPEN.Low + " of their " + OPEN.n + " comps are Low tier (median " + ddK(OPEN.rev_median) + "). $200k+ needs a Park City-side address: Old Town / Deer Valley (rare 5BR+ inventory) or Summit Park / Pine Meadow (<strong>on hold</strong> pending Summit County's proposed ban). <strong>Avoid</strong> Midway."],
  ]);

  const ROLES = {
    "Park City Pines": "Product-built High: full après deck, " + pines.lift_km.toFixed(0) + " km from a lift",
    "Ski Views · Main St": "Old Town location + 7 baths for 14",
    "Main St Penthouse": "Exception: sleeps " + pent.sleeps + ". A Main Street location ceiling, not a group-home base case",
    "Heber Luxury Home": "The one Heber comp above Low: " + heberLux.baths + " baths + " + heberLux.ent_stack + " entertainment amenities",
    "Aspen Bliss": "Top-tier ADR, low occupancy: a remote log lodge",
    "Views at Matterhorn": "Indoor sport court + game room; Summit Park",
    "Triple Master DV": "Deer Valley + " + cc("Triple Master DV").baths + " baths, almost no amenities",
    "Heber Mountain Home": "3 baths for 16 caps it",
    "Heber Resort Home": "Most amenities in the set, still Low (flagged Exclude_Comp in the export; kept as supplied)",
    "Cabriolet Family Escape": "Fills nights (" + Math.round(cc("Cabriolet Family Escape").occ) + "%) at the lowest-but-one rate",
    "Ski & Tee Chalet": "Meets the structural spec; lowest occupancy in the set",
    "Heber Heights": "8BR / 6.5BA: size doesn't break the Heber rate",
    "MTN Lake Retreat": "Lowest ADR in the set",
    "Deer Valley Views (Heber)": "Top kitchen score in the set, lowest revenue. It's in Heber",
  };

  Object.assign(group, {
    status: "comp-set",
    overview: {
      statusBadge: "Revenue comp set complete · 14 analyst-approved comps · purchase-price underwriting pending",
      thesis:
        "Buy a 5BR+ house with the bathrooms to host 14–16 people (≤3.5 guests per bath), a hot tub, a real entertainment room and an evening deck, then run it as a private resort. " +
        "<strong>The product gets a home into the comp set; the market side sets the tier.</strong> In Heber and Snyderville, the approved comps earn " + csRange(T.Low.rev_min, T.Low.rev_max) + ". " +
        pcUp + " of the " + nUp + " comps above $200k are on the Park City side.",
      whyItWorks:
        "Across the approved comps, " + pctOf(DEC.high_vs_low.adr_share) + " of the Low-to-High revenue gap is ADR (" + DEC.high_vs_low.adr_ratio.toFixed(1) + "× the rate), and only " + pctOf(DEC.high_vs_low.occ_share) +
        " is occupancy. Sleeps, bedroom count, amenity count and the Visual Score don't separate the tiers. What does is <strong>where the house is, how many bathrooms it has, and whether it has an après program</strong>.",
      heroImage: gp("hero", "A multi-zone deck with string lights, a fire pit and lounge seating: the outdoor program that a 14–16-guest group actually uses."),
      chips: [
        { label: "5BR+ (6BR+ adds nothing in the comps)" },
        { label: "≤3.5 guests per bathroom" },
        { label: "Sleeps 14–16" },
        { label: "Hot tub (" + cA("Hot tub").all_n + " of 14 comps)" },
        { label: "Entertainment room + après deck" },
        { label: "Park City side for $200k+" },
      ],
      revenueChips: CS_TIERS.map((t) => ({ label: "Comp tier · " + t, value: csRange(T[t].rev_min, T[t].rev_max) + " (" + T[t].n + ")" })),
    },
    pendingSections: [
      { groupTitle: "Acquisition Checklist" },
      {
        title: "Buy the Real Estate for This vs. Add It During Conversion",
        body: "<p>Each requirement carries two layers of evidence: the <strong>product population</strong> (all " + g.n + " Park City 5BR+ homes sleeping 14+, July snapshot) and the <strong>approved comp set</strong> (14 analyst-selected revenue comps, September pull).</p>",
        html: () =>
          ddStatStrip(g, "listings in the product") +
          ddChecklist([
            ["5BR+ (don't pay up for a 6th bedroom)", "buy", "A bedroom count can't be added cheaply, but past five it doesn't earn more.",
              "Population: 5BR " + ddOf(gB("bedrooms", "5BR").top10_n, gB("bedrooms", "5BR").n) + " Top 10%. Comps: " + (allHigh5 ? "all 3 High comps are 5BR" : "") + "; 6BR+ is " + n6("Medium") + " of " + T.Medium.n + " Medium and " + n6("Low") + " of " + T.Low.n + " Low (" + csRho(cD("Bedrooms")) + ")", "strong"],
            ["Bathrooms: ≤3.5 guests per bath (≈4.5+ baths for 16)", "buy", "The strongest structural signal, and the hardest thing to retrofit. Necessary, not sufficient.",
              "Population: ≤3.5 guests/bath " + ddOf(gB("guests_per_bath", "≤3.5 guests/bath").top10_n, gB("guests_per_bath", "≤3.5 guests/bath").n) + " Top 10%. Comps: every Medium/High comp is at ≤" + upMaxGpb.toFixed(1) + "; the " + lowOverGpb.length + " comps above that are all Low", "strong"],
            ["A Park City-side address, legal for 14–16 guests, for Medium/High revenue", "buy", "The address sets the rate. Heber City caps occupancy at 16; Summit Park and Pine Meadow face a proposed ban; Old Town / Deer Valley follow Park City zoning.",
              "Comps: " + pcUp + " of " + nUp + " above $200k are Park City side; Heber/Snyderville median ADR " + csUsd(OPEN.adr_median) + " vs " + csUsd(PCR.adr_median) + " in Old Town / Deer Valley. Section 5 for the rules", "strong"],
            ["A floor plan for 16: great room, dining for 12–16, a second social or game space", "either", "The rooms have to exist; the pool table, arcade and furniture can be added.",
              "Population: 2+ entertainment amenities " + ddOf(gF("2+ entertainment amenities").top25_with, gF("2+ entertainment amenities").n_with) + " Top 25% vs " + ddOf(gF("2+ entertainment amenities").top25_without, gF("2+ entertainment amenities").n_without) +
              ". Comps: an entry ticket, not a tier-lifter (median " + cD("ent_stack").High.median + " entertainment amenities in High and " + cD("ent_stack").Low.median + " in Low)", "strong"],
            ["A deck with room for a hot tub, outdoor dining, fire and lounge zones", "either", "The footprint and structure are bought; the hot tub, sauna and furniture are added.",
              "Population: hot tub " + ddOf(gF("Hot tub").top25_with, gF("Hot tub").n_with) + " Top 25% vs " + ddOf(gF("Hot tub").top25_without, gF("Hot tub").n_without) +
              ". Comps: hot tub in all 14; outdoor dining + fire pit in every High comp; après program " + csRho(cD("apres")) + " (" + ddP(cD("apres").p) + ")", "strong"],
            ["Designed, finished interior (kitchen, great room, bedrooms)", "add", "Addable, but the biggest conversion cost. Price it before offering. Finish alone doesn't lift a home out of Low.",
              "Population: resort-like survives adjustment (ρ " + gC("Resort-like").rho_full_adj.toFixed(2) + "). Comps: no visual concept separates the tiers; the highest kitchen score in the set belongs to the lowest comp", "directional"],
            ["Sauna, pool table, arcade, ping pong", "add", "Equipment that goes into an existing room or yard.",
              "Comps: sauna " + amenOf("Sauna") + "; pool table " + amenOf("Pool table"), "directional"],
            ["Pickleball court, pool, playground", "either", "Needs lot area; not worth paying for.", "Comps: pickleball " + amenOf("Pickleball") + "; pool only in " + cA("Pool").Low_n + " Low comps", "weak"],
            ["Crib, pack 'n play, high chair, board games", "add", "Cheap. Provide them regardless of the evidence.", "No positive signal on its own (see Amenities)", "weak"],
          ]),
      },

      { groupTitle: "Property Profile" },
      {
        title: "Bedrooms, Bathrooms & Capacity",
        body:
          "<p><strong>Bathrooms, not headcount.</strong> Within the product population, bathroom count tracks revenue (ρ " + DG.capacity.rho.Baths.toFixed(2) + ") and guests per bathroom tracks it inversely (ρ " + DG.capacity.rho.guests_per_bath.toFixed(2) +
          "). Advertised sleeps barely moves it (ρ " + DG.capacity.rho.Sleeps.toFixed(2) + "). <strong>The floor is real:</strong> 5BR+ homes sleeping under 14 are 0 of " + DG.boundary_small_sleeps.n + " in the Top 10%.</p>" +
          "<p><strong>Comp check.</strong> The approved comps confirm the bathroom finding and overturn the 6BR+ preference. Guests per bath is the one capacity variable that separates the tiers (" + csRho(cD("guests_per_bath")) + ", " + ddP(cD("guests_per_bath").p) +
          "; median " + cD("guests_per_bath").High.median.toFixed(1) + " High, " + cD("guests_per_bath").Medium.median.toFixed(1) + " Medium, " + cD("guests_per_bath").Low.median.toFixed(1) + " Low). Bedrooms (" + csRho(cD("Bedrooms")) + "), sleeps (" + csRho(cD("Sleeps")) + ") and beds (" + csRho(cD("Bed_Count")) +
          ") don't. All three High comps are 5BR.</p>",
        html: () =>
          ddTableRow([
            ddBucketTable(DG.capacity.bedrooms, "Bedrooms (population)"),
            ddBucketTable(DG.capacity.guests_per_bath, "Bathroom pressure (population)"),
            ddBucketTable(DG.capacity.sleeps_boundary, "Sleeps, all 5BR+ (population)"),
          ]),
        images: [
          gp("bunk", "A kids' bunk room. Bunks are the usual route to 14–16 guests, but this listing (3 baths for 16) shows capacity alone isn't enough."),
          gp("dining_12", "Dining for 10 with the view: a table that seats the whole group is part of the product, not furniture."),
        ],
      },
      {
        title: "Group Usability — Great Room, Kitchen & a Second Space",
        body:
          "<p>Sixteen people need <strong>one room where everyone fits</strong> (a great room open to a long dining table), <strong>a kitchen built for several cooks</strong> (a long island with seating, double ovens) and <strong>somewhere else to go</strong> (a game or media room, or a second living area) so families and groups can coexist. " +
          "<strong>Comp check:</strong> every tier's galleries show a group-sized great room and dining for 10–12. It is table stakes for the comp set, not what separates High from Low (see the visual comparison below).</p>",
        images: [
          gp("great_room", "A great room scaled for the group, with seating for a dozen and the view as the focal point."),
          gp("kitchen_strong", "The kitchen standard among winners: a long island with bar seating for eight, pendant lighting, double ovens."),
          gp("dining_long", "Vaulted dining for 10 under exposed beams, with a wall of glass onto the forest."),
          gp("living_ordinary", "Counterexample: a pleasant but ordinary living room, sized for a family rather than a group of 14."),
        ],
      },
      {
        title: "Architecture & Design",
        body:
          "<p><strong>Style is flexible; execution isn't.</strong> Strong homes span a dark contemporary mountain home, a true log lodge and an Old Town modern farmhouse. What they share is being <em>designed</em>: big glass, vaulted or beamed ceilings, a finished outdoor program. The recurring ordinary product is the builder-grade subdivision house.</p>" +
          "<p><strong>Comp check:</strong> style spans every tier (contemporary builds are High, Medium and Low). The suburban resort home pictured below, with pool, courts and play structure, is a <em>Low</em> comp at " + ddK(cc("Heber Resort Home").revenue) +
          ". Its program got it into the comp set, but not past the Heber rate. <strong>Buy the bones, not the finish:</strong> ceiling heights, glass and an outdoor footprint are real-estate decisions.</p>",
        images: [
          gp("arch_contemporary", "Contemporary mountain: dark exterior, clean lines, lit at dusk."),
          gp("arch_lodge", "A traditional log lodge works equally well when it's executed at this level."),
          gp("arch_resort", "A suburban lot turned into a resort: pool, loungers and a play structure. In the comps it earns Low-tier revenue."),
          gp("arch_tract", "Counterexample: a builder-grade subdivision house. Large and well photographed (Visual Score 94), but ordinary revenue."),
        ],
      },
      {
        title: "Outdoor Program",
        body:
          "<p><strong>The hot tub is non-negotiable.</strong> None of the " + gF("Hot tub").n_without + " product listings without one reach even the Top 25% (" + ddP(gF("Hot tub").p_top25) + "), and all 14 approved comps have one. " +
          "<strong>Comp check: what separates the tiers is the kind of outdoor program.</strong> Every High comp has outdoor dining and a fire pit (outdoor dining: " + amenOf("Outdoor dining") + "). Their decks are elevated evening spaces: a rooftop over Main Street, a treetop deck with hammocks and a fire table. " +
          "Backyard-lot amenities point the other way: pickleball, a pool and a playground appear only in Low comps. <strong>Buy the deck footprint; add the evening program.</strong></p>",
        images: [
          gp("deck_zones", "A fire-pit lounge on a wraparound deck: an evening zone, separate from the hot tub."),
          gp("hot_tub_view", "A rooftop hot tub framed on the town view: the hot tub sold as part of the view."),
          gp("sport_court", "A backyard pickleball court with a mountain backdrop. It needs lot area, and in the comps it only appears in the Low tier."),
          gp("hot_tub_plain", "Counterexample: a hot tub on a plain porch. It meets the requirement but builds no experience."),
        ],
      },

      { groupTitle: "Amenities" },
      {
        title: "Amenity Prevalence — Approved Comp Set",
        body:
          "<p>Left: how often each tracked amenity appears in each tier. Right: which amenities each comp has, High → Medium → Low in revenue order, with the tracked-amenity count at the end of each row. Flags are the export's host-reported <code>HAS_*</code> fields (movie theater is in none of the comps, so it's left off).</p>" +
          "<ul class=\"tight-list\"><li><strong>Table stakes:</strong> the hot tub is in all 14. The game room (" + amenOf("Game room") + ") and pool table (" + amenOf("Pool table") + ") are common in every tier.</li>" +
          "<li><strong>What High adds:</strong> an evening program. Outdoor dining and a fire pit are in every High comp; the sauna is in " + cA("Sauna").High_n + " of " + T.High.n + ".</li>" +
          "<li><strong>What only Low has:</strong> backyard-lot amenities, namely pickleball (" + cA("Pickleball").Low_n + "), a pool (" + cA("Pool").Low_n + ") and a playground (" + cA("Playground").Low_n + "). <strong>" + cc("Heber Resort Home").short + "</strong> has the most amenities in the set (" + cc("Heber Resort Home").amen_count + ") and earns " + ddK(cc("Heber Resort Home").revenue) + ".</li>" +
          "<li><strong>Count isn't the lever:</strong> median tracked amenities " + cD("amen_count").High.median + " High, " + cD("amen_count").Medium.median + " Medium, " + cD("amen_count").Low.median + " Low (" + csRho(cD("amen_count")) + "). Two comps with a single tracked amenity sit in Medium and Low. The difference is which amenities, and where the house is.</li></ul>",
        chartsRow: [
          { file: "assets/" + CS.charts.prevalence, alt: "Grouped bar chart of amenity prevalence by comp revenue tier", caption: "Amenity prevalence by tier, approved comps (High N=" + T.High.n + ", Medium N=" + T.Medium.n + ", Low N=" + T.Low.n + ")." },
          { file: "assets/" + CS.charts.presence, alt: "Heatmap of amenity presence for each of the 14 approved comps", caption: "Amenity presence by comp, High → Medium → Low. Colored = present." },
        ],
      },
      {
        title: "Amenity Evidence Inside the Product",
        body:
          "<p>The population layer: each row compares <em>all</em> 5BR+/14+ listings with and without the feature (July snapshot). These are screening signals, not proven revenue uplift. <strong>Photo check:</strong> hot tubs (" +
          DG.confirm.hot_tub.confirmed + " of " + DG.confirm.hot_tub.claimed + ") and game rooms (" + DG.confirm.game_room.confirmed + " of " + DG.confirm.game_room.claimed +
          ") usually show in the gallery when claimed. Gyms never do (" + DG.confirm.gym.confirmed + " of " + DG.confirm.gym.claimed + "), so the gym flag is unreliable, and that includes the two High comps that list one. <strong>Baseline:</strong> BBQ grill (" + gF("BBQ grill").n_with + " of " + g.n + "), indoor fireplace (" + gF("Indoor fireplace").n_with + ") and air conditioning (" + gF("Air conditioning").n_with + ").</p>",
        html: () =>
          ddFeatureTable(DG.amenities.filter((r) => !["3+ entertainment amenities", "BBQ grill", "Indoor fireplace", "Air conditioning", "Ping pong", "Arcade games"].includes(r.feature)), {
            "Hot tub": ["Must-have", "must"], "2+ entertainment amenities": ["Must-have", "must"], "Game room": ["Must-have space", "must"],
            "Pool table": ["Nice-to-have #1", "nice"], "Sauna": ["Nice-to-have #2", "nice"], "Ping pong": ["Auto-add", "auto"], "Arcade games": ["Auto-add", "auto"],
            "Fire pit": ["Auto-add", "auto"], "Pickleball": ["Not a criterion", "weak"], "Gym": ["Unreliable flag", "weak"], "Pool": ["Not a criterion", "weak"],
            "Theater": ["Not supported", "weak"], "Outdoor dining area": ["Auto-add (après)", "auto"], "BBQ grill": ["Baseline", "base"], "Indoor fireplace": ["Baseline", "base"],
            "Pack 'n play / crib": ["Auto-add (cheap)", "auto"], "Air conditioning": ["Baseline", "base"],
          }),
      },
      {
        title: "Must-Have's",
        body:
          "<p>A hot tub, plus <strong>a real entertainment space holding at least two entertainment amenities</strong> (game room, pool table, sauna, theater, golf simulator). In the product population, homes with two or more reach the Top 25% " +
          ddOf(gF("2+ entertainment amenities").top25_with, gF("2+ entertainment amenities").n_with) + " times, against " +
          ddOf(gF("2+ entertainment amenities").top25_without, gF("2+ entertainment amenities").n_without) + " without. In the comps it is the entry ticket, not a tier-lifter. The room is the acquisition requirement; the equipment is added.</p>",
        items: ["Hot tub", "Game / entertainment room (the space)", "2+ entertainment amenities", "Outdoor dining + fire on the deck", "BBQ grill", "Indoor fireplace"],
        images: [
          gp("game_room_1", "A dedicated game level: ping pong, arcade cabinets, foosball, a bar and a TV lounge in one room."),
          gp("game_room_2", "A pool table and shuffleboard in a second living space, so the kids' zone and the adult lounge can run at once."),
          gp("game_arcade", "Classic arcade cabinets in a log lodge. Cheap to add once the space exists."),
        ],
      },
      {
        ranked: {
          note: "Ranked by Top 25% and median-revenue difference inside the product population, with the comp-set prevalence in each note. Items with fewer than 5 listings on either side are flagged as thin rather than ranked.",
          items: ddRanked(DG.amenities, [
            ["Pool table", "The strongest amenity signal in the product population. Comps: " + amenOf("Pool table") + ". Cheap to add once the room exists.", []],
            ["Sauna", "A strong luxury signal. Comps: " + amenOf("Sauna") + ". A barrel or indoor sauna is an add-on, not a real-estate requirement.", [gp("sauna_1", "An outdoor cabin sauna tucked into the deck."), gp("sauna_2", "A cedar indoor sauna.")]],
            ["Pickleball", "Every population listing with a court reaches the Top 25%, but in the comps the court appears only in the Low tier (" + cA("Pickleball").Low_n + " of " + T.Low.n + "). Not a criterion.", [gp("pickleball", "A pickleball court beside the pool.")], true],
            ["Gym", "Never visible in any gallery, so the flag is unreliable. Not a buying criterion.", [], true],
            ["Pool", "Heavy capex with a short season; in the comps it appears only in Low (" + cA("Pool").Low_n + " of " + T.Low.n + "). Not a criterion.", [], true],
            ["Theater", "Theater listings don't outperform (1 of 3 reach the Top 25%), and no comp has one. Not supported.", [], true],
          ]),
        },
      },
      {
        title: "Auto-Add (Cheap to Provide)",
        body:
          "<p>Low-cost items to provide at conversion regardless of their statistical signal:</p>" +
          "<ul><li><strong>Outdoor dining, fire table and lounge furniture</strong> — the evening program every High comp has; photograph it.</li>" +
          "<li><strong>Ping pong, arcade cabinets, board games</strong> — fill the entertainment room.</li>" +
          "<li><strong>Crib, pack 'n play, high chair</strong> — families are a third of these guests. The flag's negative association (" + ddOf(gF("Pack 'n play / crib").top25_with, gF("Pack 'n play / crib").n_with) +
          " Top 25%) reflects which hosts list it, not a penalty.</li></ul>",
      },

      { groupTitle: "Execution — What Winning Looks Like" },
      {
        title: "Which Visual Signals Separate Winners Inside the Product",
        body:
          "<p>Population layer. Visual concepts are zero-shot image scores, so treat them as pointers, not measurements. After adjusting for bedrooms, most design concepts track revenue. <strong>After also adjusting for bathrooms and amenities, only “resort-like” holds up</strong> (" + ddP(gC("Resort-like").p_full_adj) + "), with high-end kitchen close behind (" + ddP(gC("High-end kitchen").p_full_adj) +
          "). <strong>Inside the approved comps, none of them separates the tiers</strong> (see Visual Enrichment under Revenue Comp Set). Design moves a home from the market into the comp set, not from Low to High.</p>",
        html: () => ddConceptTable(DG.concepts, DS.concepts, "Ski-Access Home", ["Resort-like", "High-end kitchen", "Unique architecture", "Outdoor entertainment", "Luxury interior", "Upscale appearance", "Modern style", "Overall Visual Score"]),
      },
      {
        title: "Same Size, Same Valley, More Than 3× the Revenue",
        body:
          "<p>Both are 6BR Heber Valley homes sleeping 16, each with a hot tub and a Visual Score above 90; the ordinary one actually scores higher. <strong>The gap is bathrooms and the resort program.</strong> 8 baths against 3.5 is a real-estate difference; four entertainment amenities against two, and the finish, are conversion choices. " +
          "The left home is an approved Medium comp (" + heberLux.short + ", " + ddK(heberLux.revenue) + " in September). It is the only Heber comp above the Low tier. The right home is a market reference outside the comp set. Figures below are from the July snapshot.</p>",
        pairLabels: [PAIR_G.strong.title, PAIR_G.ordinary.title],
        compStats: ddPairStats(PAIR_G),
        compPhotoRows: [
          { note: "<strong>Exterior:</strong> a contemporary mountain build on a stone-terraced lot, against a standard two-story subdivision house.", left: gp("pair_ext_strong", "Contemporary exterior on a terraced lot."), right: gp("pair_ext_ordinary", "Builder-grade subdivision exterior.") },
          { note: "<strong>Great room:</strong> a double-height room around a fireplace wall, against a standard living room at the foot of the stairs.", left: gp("pair_living_strong", "Double-height great room."), right: gp("pair_living_ordinary", "A standard living room.") },
          { note: "<strong>Kitchen:</strong> a long island seating eight under a hood, against a stock kitchen with a six-seat table.", left: gp("pair_kitchen_strong", "Island seating for eight."), right: gp("pair_kitchen_ordinary", "Stock kitchen and six-seat table.") },
        ],
      },
      {
        title: "Polished Isn't the Same as the Product",
        body:
          "<p>One of the highest Visual Scores in the product belongs to a " + DEEPDIVE.photos.group.polished_kitchen.bedrooms + "BR home with a crisp modern-farmhouse kitchen and a putting green, earning " + ddK(DEEPDIVE.photos.group.polished_kitchen.revenue) +
          ". It has the finish but not the scale: a small lot and one entertainment amenity. <strong>A great kitchen on a tract lot doesn't make a group-home product.</strong> The comp set shows the same thing: " + cc("Deer Valley Views (Heber)").short + " has the highest high-end-kitchen score of the 14 and the lowest revenue.</p>",
        images: [
          gp("polished_kitchen", "A modern-farmhouse kitchen that photographs beautifully."),
          gp("polished_yard", "The same home's yard: a pergola hot tub and a putting green squeezed into a small lot."),
        ],
      },

      { groupTitle: "Revenue Comp Set" },
      {
        title: "The Approved Comp Set at a Glance",
        body:
          "<p>The 14 comps are the analyst's selection, used exactly as supplied. Tiers follow the analyst's bands on the export's own Revenue Potential (" + POS.data_date + " pull). <strong>This is the top of the market:</strong> " +
          POS.comps_in_product + " of the comps are the " + POS.comps_in_product + " highest earners of the " + POS.product_n + "-listing product population. No product listing left out earned more than " + ddK(POS.best_excluded_snapshot) + " in July. Every comp sits at or above the export's " + Math.round(POS.export_pct_min) +
          "th revenue percentile. So <strong>“Low” here means the floor of a winning product</strong>, around the market's P90 (" + ddK(POS.market_p90_snapshot) + ").</p>" +
          "<p class=\"dd-note\">N is " + T.High.n + " / " + T.Medium.n + " / " + T.Low.n + ", so every tier comparison is descriptive and correlations are directional. " + POS.new_listings + " comps (" + CS.comps.filter((c) => !c.in_snapshot).map((c) => c.short).join(", ") + ") were listed after the July market snapshot. Their photos were fetched and scored with the same visual pipeline. " +
          POS.possibly_good_data.join(", ") + " carry the export's “Possibly Good Data” flag. " + POS.exclude_flag_in_export.join(", ") + " is marked Exclude_Comp in the export but was supplied in the set and is kept.</p>",
        html: () => csTierBands() + csTierTable(["ADR", "occ", "Baths", "guests_per_bath", "Bedrooms", "Sleeps", "ent_stack", "main_st_km", "kids", "group"]),
      },
      {
        title: "The 14 Approved Comps",
        body: "<p>Grouped by tier, in revenue order. Photos are each comp's own Airbnb cover image. The line under each card is its analytical role.</p>",
        html: () => csCards(ROLES) + '<details class="ref-details"><summary>Full metrics for all 14 comps</summary>' + csFullTable() + "</details>",
      },
      {
        title: "What Separates High, Medium and Low",
        body:
          "<ul class=\"tight-list\"><li><strong>Rate separates; nights mostly don't.</strong> ADR is the strongest separator (" + csRho(cD("ADR")) + ", " + ddP(cD("ADR").p) + "); occupancy is directional at best.</li>" +
          "<li><strong>Bathroom pressure separates; capacity doesn't.</strong> Guests per bath " + csRho(cD("guests_per_bath")) + "; bedrooms, sleeps and beds show nothing.</li>" +
          "<li><strong>The après program separates; the amenity count doesn't.</strong> Outdoor dining + fire pit + sauna " + csRho(cD("apres")) + "; tracked amenities " + csRho(cD("amen_count")) + "; backyard-lot amenities run the wrong way (" + csRho(cD("lot_amen")) + ").</li>" +
          "<li><strong>The guest mix separates.</strong> High comps draw adult group trips (" + Math.round(T.High.group_median) + "% of reviews, " + Math.round(T.High.kids_median) + "% kids), Low comps draw families (" + Math.round(T.Low.group_median) + "%, " + Math.round(T.Low.kids_median) + "% kids). This is an outcome of location and product, not a lever on its own.</li>" +
          "<li><strong>The Visual Score doesn't.</strong> Low comps' median Visual Score is " + Math.round(cD("pct_visual_score").Low.median) + "th percentile, High comps' " + Math.round(cD("pct_visual_score").High.median) + "th.</li></ul>",
        html: () => csDriversTable(["ADR", "occ", "guests_per_bath", "Baths", "Bedrooms", "Sleeps", "Bed_Count", "apres", "ent_stack", "amen_count", "lot_amen", "main_st_km", "lift_km", "Cleaning Fee", "Min_Stay", "kids", "group", "pct_visual_score"]),
      },
      {
        title: "Rate, Not Nights: ADR vs. Occupancy",
        body:
          "<p><strong>High earns mainly through a premium rate.</strong> High comps earn " + DEC.high_vs_low.revenue_ratio.toFixed(1) + "× the Low tier (geometric means). About " + pctOf(DEC.high_vs_low.adr_share) + " of that gap is ADR (" + DEC.high_vs_low.adr_ratio.toFixed(1) + "×) and " + pctOf(DEC.high_vs_low.occ_share) + " is occupancy.</p>" +
          "<ul class=\"tight-list\"><li><strong>Low → Medium is a pure rate step:</strong> ADR " + DEC.mid_vs_low.adr_ratio.toFixed(2) + "×, occupancy " + DEC.mid_vs_low.occ_ratio.toFixed(2) + "×. Medium comps sell <em>fewer</em> nights than Low at a much higher rate.</li>" +
          "<li><strong>Medium → High adds occupancy:</strong> ADR " + DEC.high_vs_mid.adr_ratio.toFixed(2) + "×, occupancy " + DEC.high_vs_mid.occ_ratio.toFixed(2) + "×. " + pines.short + " is the clearest case, at " + cStats("Park City Pines") + ".</li>" +
          "<li><strong>How the Low tier falls short:</strong> " + lowMode("Rate below every Medium/High comp") + " of " + T.Low.n + " Low comps price below every Medium/High comp (under " + csUsd(CS.low_cuts.adr) + "). " +
          (CS.low_modes["Rate and occupancy both below"] || []).join(", ") + " is low on both, and " + (CS.low_modes["Occupancy below every Medium/High comp"] || []).join(", ") + " prices like a Medium comp but fills only " + Math.round(cc("Ski & Tee Chalet").occ) + "% of nights. " +
          cc("Cabriolet Family Escape").short + " and " + cc("MTN Lake Retreat").short + " fill 66–72% of nights and still land Low: filling nights doesn't substitute for rate.</li>" +
          "<li><strong>What buys the rate:</strong> the Park City side (median ADR " + csUsd(PCR.adr_median) + " in Old Town / Deer Valley and " + csUsd(HOLD.adr_median) + " in Summit Park / Pine Meadow, against " + csUsd(OPEN.adr_median) + " in Heber / Snyderville), bathrooms for the group, and the après deck. Amenity count and the Visual Score don't.</li></ul>",
        chartsRow: [
          { file: "assets/" + CS.charts.adr_occ, alt: "Scatter of ADR against occupancy for the 14 approved comps, colored by tier, with equal-revenue curves", caption: "ADR vs. occupancy for the approved comps; dashed lines are equal revenue." },
        ],
      },
      {
        title: "Location: When the Address Creates the Premium",
        body:
          "<p>This is still a product-first box: lift access isn't needed. " + pines.short + ", the top comp, is " + pines.lift_km.toFixed(1) + " km from the nearest lift, and the Medium tier's median distance to a lift is " + cD("lift_km").Medium.median.toFixed(0) + " km. <strong>But the market side sets the ceiling.</strong> " +
          pcUp + " of the " + nUp + " comps above $200k are on the Park City side, and " + OPEN.Low + " of the " + OPEN.n + " Heber / Snyderville comps are Low. The one exception, " + heberLux.short + ", needed the most bathrooms in the set (" + heberLux.baths + ") and a " + heberLux.ent_stack + "-amenity stack to reach " + ddK(heberLux.revenue) + ".</p>" +
          "<ul class=\"tight-list\"><li><strong>When location creates the premium:</strong> Old Town. " + pent.short + " reaches High with only " + pent.sleeps + " guests and no entertainment room, because it's " + pent.main_st_km.toFixed(1) + " km from Main Street.</li>" +
          "<li><strong>When the property creates it:</strong> " + pines.short + " (Summit Park, " + pines.main_st_km.toFixed(0) + " km from Main Street) reaches High on its product and outdoor program alone.</li>" +
          "<li><strong>The catch:</strong> the Park City-side comps are either in Old Town / Deer Valley, where 5BR+ inventory is rare and overlaps the Ski-Access box, or in Summit Park / Pine Meadow, which is on regulatory hold (Section 5).</li></ul>",
        html: () => csRoutesTable({
          "Heber Valley / Snyderville (open supply)": "Eligible with checks: Heber City caps occupancy at 16; confirm city vs. county; check Snyderville CC&Rs.",
          "Summit Park / Pine Meadow (regulatory hold)": "<strong>Hold.</strong> Summit County's proposed nightly-rental ban covers these areas.",
          "Park City: Old Town / Deer Valley": "Eligible under Park City zoning; 5BR+ is rare and overlaps Buy Box 2.",
        }),
        mapEmbed: { url: "assets/" + CS.map + "?v=20260929-pc5", className: "embedded-map--compact", title: "Map of the 14 approved 5BR+ revenue comps, colored by High, Medium and Low tier, with lift bases" },
      },
      {
        title: "Visual Enrichment: Where to Look vs. What to Learn",
        body:
          "<p>Each comp's visual concepts are expressed as a percentile of the whole market, so the tiers can be compared. <strong>Inside the approved comps, the visual scores don't separate the tiers.</strong> They told us where to look; the photos below tell us what to learn.</p><ul class=\"tight-list\">" +
          "<li><strong>Resort-like</strong> runs " + Math.round(cK("Resort-like").High) + " / " + Math.round(cK("Resort-like").Medium) + " / " + Math.round(cK("Resort-like").Low) + " (High / Medium / Low). It separates the product from the market (population layer), not the comps from each other.</li>" +
          "<li><strong>The Visual Score runs slightly backwards:</strong> " + pines.short + " is the top earner at the market's " + Math.round(pines.visual_pct) + "th percentile, and the Low tier's median is the highest of the three.</li>" +
          "<li><strong>Scenic view is inverse</strong> (" + csRho(cK("Scenic view")) + "). Open Heber valley and pasture views are common in the Low tier.</li>" +
          "<li><strong>Gallery composition is the one visible difference.</strong> High galleries give " + Math.round(CS.gallery["Outdoor / hot tub / view"].High) + "% of their photos to outdoor spaces (Low " + Math.round(CS.gallery["Outdoor / hot tub / view"].Low) + "%). Low galleries give " +
          Math.round(CS.gallery["Game room / sauna / gym"].Low) + "% to game rooms and gyms (High " + Math.round(CS.gallery["Game room / sauna / gym"].High) + "%). High sells the setting; Low sells the equipment.</li></ul>",
        html: () => csConceptTable(["Resort-like", "Luxury interior", "High-end kitchen", "Upscale appearance", "Unique architecture", "Outdoor entertainment", "Professional photography", "Scenic view", "Secluded setting", "Overall Visual Score"]),
      },
      {
        title: "Comp-Set Visual Comparison",
        body: "<p>Photos from the approved comps' own galleries, chosen after viewing all 14 in full. Qualitative observations, not causal conclusions. The question is what the High tier physically does differently.</p>",
        html: () => csComparisonHtml(
          [
            ["setting", "Setting & Arrival", "Architecture spans the tiers: contemporary builds are High, Medium and Low. The setting doesn't. High comps sit in Old Town or in forest; the Low tier is mostly open Heber subdivisions (and so is the one Heber Medium comp)."],
            ["living", "Great Room, Kitchen & Dining", "Every tier has a group-sized great room and dining for 10–12. Finish doesn't separate the tiers either: the highest-scoring kitchen in the set belongs to the lowest comp. A dated finish (slate, honey oak) is the one visible drag."],
            ["sleeping", "Bedrooms & Bathrooms", "Bedrooms look alike across the tiers. Bathrooms are what differs, in the numbers (" + cD("guests_per_bath").High.median.toFixed(1) + " guests per bath in High against " + cD("guests_per_bath").Low.median.toFixed(1) + " in Low) and in the galleries: only " +
              (CS.gallery_bath_listings.High + CS.gallery_bath_listings.Medium + CS.gallery_bath_listings.Low) + " comps photograph a bathroom, and none is Low."],
            ["entertainment", "Game & Entertainment", "The Low tier has the biggest entertainment programs in the set: a golf simulator, an arcade lounge, a large basement rec room. High galleries barely show a game room. Entertainment gets a home into the comp set; it doesn't move it up."],
            ["outdoor", "Hot Tub & Outdoor Program", "Every comp has a hot tub; where it sits is what differs. High puts it in an elevated evening setting (a rooftop over Main Street or facing the ski runs, a treetop deck). Low puts it in a backyard with a pool, a court or a pasture view."],
          ]
        ),
      },
      {
        title: "Counterexamples",
        body: "<p>The comps that break the obvious pattern say more about the buy box than the averages do.</p>",
        html: () =>
          csCounterexamples([
            ["Heber Resort Home", "The most amenities in the set (" + cc("Heber Resort Home").amen_count + " tracked: pool, pickleball, playground, mini golf, game room) should put it near the top.",
              "Low, " + cStats("Heber Resort Home") + ". Only " + cc("Heber Resort Home").baths + " baths for " + cc("Heber Resort Home").sleeps + " (" + cc("Heber Resort Home").guests_per_bath.toFixed(1) + " per bath).",
              "Amenities got it into the comp set; bathrooms and the Heber rate cap it. Don't pay for a backyard amenity park."],
            ["Deer Valley Views (Heber)", "One of the most finished interiors in the set (luxury interior " + Math.round(cc("Deer Valley Views (Heber)").concept_pct["Luxury interior"]) + "th percentile, high-end kitchen " + Math.round(cc("Deer Valley Views (Heber)").concept_pct["High-end kitchen"]) + "th), with “Deer Valley” in the title.",
              "The lowest comp, " + cStats("Deer Valley Views (Heber)") + ". It's in Heber, " + cc("Deer Valley Views (Heber)").main_st_km.toFixed(0) + " km from Main Street, with " + cc("Deer Valley Views (Heber)").amen_count + " tracked amenity.",
              "Finish without program or location doesn't command a rate. Check the address, not the title."],
            ["Park City Pines", "The lowest Visual Score in the set (" + Math.round(pines.visual_pct) + "th percentile), " + pines.lift_km.toFixed(0) + " km from a lift.",
              "The top comp, " + cStats("Park City Pines") + ", tied with Cabriolet for the highest occupancy in the set.",
              "The product can create High without ski access: a treetop deck, fire, sauna, putting green and a hot tub by the game room, on the Park City side."],
            ["Main St Penthouse", "Sleeps " + pent.sleeps + ", below the product's 14+ floor, with no entertainment room.",
              "High, " + cStats("Main St Penthouse") + ".",
              "Location can create High without group capacity. Treat it as a Main Street ceiling reference (Ski-Access logic), not a base-case group home."],
            ["Triple Master DV", "Nothing tracked beyond the hot tub and crib gear.",
              "Medium, " + cStats("Triple Master DV") + ".",
              "Deer Valley plus " + cc("Triple Master DV").baths + " baths (" + cc("Triple Master DV").guests_per_bath.toFixed(1) + " guests per bath) earns Medium without an entertainment stack."],
            ["Heber Heights", cc("Heber Heights").bedrooms + " bedrooms, " + cc("Heber Heights").baths + " baths (" + cc("Heber Heights").guests_per_bath.toFixed(1) + " guests per bath), sauna and fire pit: the most house in the set.",
              "Low, " + cStats("Heber Heights") + ".", "Bedrooms and baths beyond the spec don't break the Heber rate ceiling."],
            ["Ski & Tee Chalet", "It meets the whole structural spec: " + cc("Ski & Tee Chalet").baths + " baths (" + cc("Ski & Tee Chalet").guests_per_bath.toFixed(1) + " guests per bath), golf simulator, arcade and pool table.",
              "Low, " + cStats("Ski & Tee Chalet") + ". Its rate is Medium-like; its occupancy is the lowest in the set.",
              "A right-spec home in Snyderville isn't a Medium-tier guarantee. The data can't say why it doesn't fill, so underwrite the open-supply routes at Low-tier revenue."],
          ]),
      },
      {
        title: "What the Comps Change in the Buy Box",
        body: "<p>Each spec item is tested against the approved comps: <strong>reinforced</strong>, <strong>modified</strong>, <strong>weakened</strong> (as a differentiator) or left <strong>directional</strong>. Nothing is added because it sounds good.</p>",
        html: () =>
          csChanges([
            ["Bedrooms: 5BR+ vs 6BR+", "modified", (allHigh5 ? "All 3 High comps are 5BR. " : "") + "6BR+ is " + n6("Medium") + " of " + T.Medium.n + " Medium and " + n6("Low") + " of " + T.Low.n + " Low; " + csRho(cD("Bedrooms")) + ".", "5BR+. Drop the 6BR+ preference; don't pay for a sixth bedroom."],
            ["Sleeps 14–16", "reinforced", "Sleeps doesn't separate tiers (" + csRho(cD("Sleeps")) + "). The one comp under 14 (" + pent.short + ") is a Main Street location asset.", "14–16 legal occupancy as eligibility, not a lever."],
            ["Bathrooms", "reinforced", "Every Medium/High comp is at ≤" + upMaxGpb.toFixed(1) + " guests per bath; the " + lowOverGpb.length + " comps above that are Low. " + lowUnderGpb + " Low comps also meet it.", "≤3.5 guests per bath (≈4.5+ baths for 16): necessary, not sufficient."],
            ["Hot tub", "reinforced", "In all 14 comps.", "Required; table stakes."],
            ["Entertainment room", "weakened", "Game room: " + amenOf("Game room") + ". Median entertainment amenities " + cD("ent_stack").High.median + " High vs " + cD("ent_stack").Low.median + " Low.", "Keep the room as an entry requirement (population evidence); don't expect it to lift a home past Low."],
            ["Pool table", "directional", amenOf("Pool table") + ".", "Auto-add once the room exists."],
            ["Sauna", "directional", amenOf("Sauna") + ".", "Cheap add; part of the après program."],
            ["Outdoor program", "reinforced", "Outdoor dining: " + amenOf("Outdoor dining") + "; fire pit in every High comp; après program " + csRho(cD("apres")) + " (" + ddP(cD("apres").p) + ").", "An evening deck: outdoor dining, fire, hot tub, ideally a sauna. Buy the deck footprint."],
            ["Pool, pickleball, playground", "weakened", "Only in Low comps (pickleball " + cA("Pickleball").Low_n + ", pool " + cA("Pool").Low_n + ", playground " + cA("Playground").Low_n + " of " + T.Low.n + ").", "Not criteria. Don't pay for a lot because of a court or pool."],
            ["Resort-like execution", "weakened", "Resort-like " + Math.round(cK("Resort-like").High) + " / " + Math.round(cK("Resort-like").Medium) + " / " + Math.round(cK("Resort-like").Low) + " percentile (" + csRho(cK("Resort-like")) + ").", "A design direction from the population layer; not a filter, and not what separates the comps."],
            ["High-end kitchen", "weakened", "High-end kitchen " + Math.round(cK("High-end kitchen").High) + " / " + Math.round(cK("High-end kitchen").Medium) + " / " + Math.round(cK("High-end kitchen").Low) + " percentile; the top kitchen score is the lowest comp's.", "A finished kitchen with a group island is table stakes."],
            ["Architecture", "reinforced", "Contemporary, log lodge, Old Town farmhouse and stucco tract all appear; styles span the tiers.", "Any style. Buy bones, glass and deck footprint."],
            ["View", "weakened", "Scenic view " + csRho(cK("Scenic view")) + ": open valley views are common in Low.", "Not a criterion."],
            ["Privacy / seclusion", "directional", "Secluded setting " + Math.round(cK("Secluded setting").High) + " / " + Math.round(cK("Secluded setting").Medium) + " / " + Math.round(cK("Secluded setting").Low) + " percentile: no pattern.", "Not a criterion."],
            ["Location", "modified", pcUp + " of " + nUp + " $200k+ comps are Park City side; " + OPEN.Low + " of " + OPEN.n + " Heber / Snyderville comps are Low. The top comp is " + pines.lift_km.toFixed(0) + " km from a lift.", "Lift-flexible, not market-flexible. Underwrite Heber / Snyderville at Low-tier revenue; Medium/High needs a Park City-side address."],
            ["Group dining & living", "reinforced", "Dining for 10–12 and a group great room appear in every tier.", "Required; table stakes."],
            ["Parking", "directional", "Not in the comp data.", "Confirm paved on-site parking (a Heber City rule, Section 5)."],
            ["Guest", "modified", "High comps: " + Math.round(T.High.group_median) + "% group-trip reviews, " + Math.round(T.High.kids_median) + "% kids. Low comps: " + Math.round(T.Low.group_median) + "%, " + Math.round(T.Low.kids_median) + "%.", "Price and design for adult group trips; families fill the Low tier."],
          ]),
      },

      { groupTitle: "Guest & Location" },
      {
        title: "Traveler ICP",
        body:
          "<p><strong>Multi-family and large-group trips</strong> across the product: group trips appear in about half of all reviews and kids in about a third. <strong>The approved comps sharpen it:</strong> High comps draw adult groups (" + Math.round(T.High.group_median) + "% group-trip reviews, " + Math.round(T.High.kids_median) +
          "% kids), while the Low tier is the family product (" + Math.round(T.Low.kids_median) + "% kids). <strong>What that implies:</strong> enough bathrooms for adults who won't share, an evening deck, dining for the whole group, and bunks where kids are the market. These are review-derived signals, not verified demographics.</p>",
        html: () =>
          ddTableRow([
            ddGuestTable(DG.guest, [["all", "All " + DG.guest.all.n + " listings"], ["top25", "Top 25%"], ["rest", "Below Top 25%"]]),
            '<table class="data-table dd-mini"><thead><tr><th>Approved comps</th><th>Kids</th><th>Group trip</th><th>N</th></tr></thead><tbody>' +
              CS_TIERS.map((t) => '<tr><th scope="row">' + csTierPill(t) + "</th><td>" + Math.round(T[t].kids_median) + "%</td><td>" + Math.round(T[t].group_median) + "%</td><td>" + T[t].n + "</td></tr>").join("") + "</tbody></table>",
          ]),
      },
      {
        title: "Where to Buy",
        body:
          "<p>The comp set changes this from “eligibility first” to <strong>“eligibility decides the revenue tier”</strong> (routes table and map under Revenue Comp Set).</p><ul>" +
          "<li><strong>Heber Valley (" + gArea("Heber Valley").n + " product listings)</strong> — the deepest supply, and the Low-tier route: " + csRange(T.Low.rev_min, T.Low.rev_max) + " unless the home is exceptional (" + heberLux.short + "). <strong>Heber City caps occupancy at 16</strong>, and unincorporated Wasatch County allows STRs only where zoning and CC&Rs both allow them.</li>" +
          "<li><strong>Snyderville Basin (" + gArea("Snyderville Basin").n + ")</strong> — eligible in unincorporated Summit County (check CC&Rs); both comps here are Low.</li>" +
          "<li><strong>Summit Park & Pine Meadow (" + (gArea("Summit Park & Pinebrook").n + gArea("Pine Meadow & Rockport").n) + ")</strong> — " + HOLD.n + " comps here, " + HOLD.High + " High and " + HOLD.Medium + " Medium, but on <strong>regulatory hold</strong> pending Summit County's proposed nightly-rental ban.</li>" +
          "<li><strong>Old Town / Deer Valley</strong> — " + PCR.High + " High and " + PCR.Medium + " Medium comps; 5BR+ inventory is rare and overlaps Buy Box 2. <strong>Avoid Midway</strong> (a shrinking STR overlay zone).</li></ul>",
      },

      { groupTitle: "Projections" },
      {
        title: "Revenue Context from the Approved Comps",
        body:
          "<p><strong>The range is read by acquisition route, not averaged.</strong> A simple mean of all 14 comps is " + ddK(CS.simple_mean) + ". That is a Medium-tier number only 1 of the " + OPEN.n + " open-supply comps reaches, and it blends the analyst's deliberate tiering with three different acquisition routes.</p><ul>" +
          "<li><strong>Heber Valley / Snyderville (open supply):</strong> base case is the Low tier, <strong>" + csRange(T.Low.rev_min, T.Low.rev_max) + " (median " + ddK(T.Low.rev_median) + ")</strong>, for a home that meets the spec. Upside to ~" + ddK(heberLux.revenue) + " has one precedent (" + heberLux.short + ": " + heberLux.baths + " baths, " + heberLux.ent_stack + " entertainment amenities, the highest Heber ADR at " + csUsd(heberLux.adr) + ").</li>" +
          "<li><strong>Park City side, outside Old Town:</strong> Medium, <strong>" + csRange(T.Medium.rev_min, T.Medium.rev_max) + "</strong>, with " + pines.short + " (" + ddK(pines.revenue) + ") as the execution ceiling. Today these comps sit in Summit Park / Pine Meadow, which is on hold.</li>" +
          "<li><strong>Old Town / Deer Valley:</strong> " + csRange(PCR.rev_min, PCR.rev_max) + " (median " + ddK(PCR.rev_median) + "), driven by the Main Street location. Treat it as a ceiling reference shared with Buy Box 2.</li></ul>" +
          "<p class=\"dd-note\">Revenue Potential is a gross benchmark from the " + POS.data_date + " comp export, not an underwriting model. Comp tiers describe performance within this approved set. The product population (median " + ddK(g.median) + ", July) stays as descriptive context. <strong>Purchase price and acquisition underwriting: pending.</strong></p>",
      },

      { groupTitle: "Buy-Box Summary" },
      {
        title: "One-Page Recap",
        body: ddRecap([
          ["Search for", "5BR+ (don't pay up for 6+), sleeping 14–16, legal for that occupancy at the address"],
          ["Bathrooms", "≤3.5 guests per bath, about 4.5+ baths for 16. Every Medium/High comp meets it; necessary, not sufficient"],
          ["Floor plan", "Great room with dining for 12–16, a kitchen with a long island, and a second social or game space"],
          ["Architecture", "Any style. Buy good bones (ceiling height, glass, deck footprint) rather than builder-grade tract product"],
          ["Must-haves", "Hot tub; an entertainment room with 2+ entertainment amenities; outdoor dining and fire on the deck; BBQ; fireplace"],
          ["Nice-to-haves", "Sauna, pool table (both cheap adds). Pickleball, pool, playground, gym and theater are not criteria"],
          ["Auto-add", "Outdoor dining and fire table, ping pong and arcade, crib / pack 'n play / high chair"],
          ["Execution", "Designed and finished, but design alone doesn't separate the comps. The Visual Score is not a filter"],
          ["Guest", "Adult group trips at the top (" + Math.round(T.High.group_median) + "% group reviews in High); families in the Low tier (" + Math.round(T.Low.kids_median) + "% kids)"],
          ["Where", "Lift-flexible, not market-flexible. Heber / Snyderville = Low-tier revenue; Park City side for Medium/High (Summit Park and Pine Meadow on hold; Old Town rare). Avoid Midway"],
          ["Approved comp tiers", bandText],
          ["Revenue context", "Open supply: " + csRange(T.Low.rev_min, T.Low.rev_max) + " base (median " + ddK(T.Low.rev_median) + "), ~" + ddK(heberLux.revenue) + " upside precedent. Park City side: " + csRange(T.Medium.rev_min, T.Medium.rev_max) + ", ceiling " + ddK(pines.revenue)],
          ["Rate vs nights", pctOf(DEC.high_vs_low.adr_share) + " of the Low-to-High gap is ADR"],
          ["Purchase price", "Pending"],
        ]),
      },
    ],
    pendingNote: "Revenue comp-set images are from the 14 approved comps' own galleries. Photos elsewhere on this tab are labelled either market reference or approved comp. The full analysis is in notebooks/parkcity_5br_compset.ipynb (comp set) and notebooks/parkcity_buybox_deepdive.ipynb (product population).",
  });


  // -------------------------------------------------------------------------
  // Buy Box 2 · Ski-Access Home — product population (DEEPDIVE, 17 listings)
  // + the analyst-approved revenue comp set (COMPSET_SKI, 12 comps). Structure
  // follows Charlotte's Lake box: buy the scarce location, then the minimum
  // product that monetizes it.
  // -------------------------------------------------------------------------
  const ski = BUY_BOXES.find((b) => b.id === "ski");
  const s = DS.summary, core = DS.core_34br, off = DS.location.boundary_2_5km_34br;
  const town = sL("by_area", "Town Lift / Park City Mountain"), jord = sL("by_area", "Deer Valley Jordanelle / East Village");
  const ms1 = sL("by_main_st", "≤0.75 km of Main St"), ms2 = sL("by_main_st", "0.75–1.5 km"), ms3 = sL("by_main_st", "1.5 km+");

  const K = KS, KD = CSK, KT = KD.tiers, KG = KD.geo, KW = KD.walk_split, KC = KD.capacity, KDEC = KD.decomposition, KPOS = KD.position;
  const kc = K.comp, kd = K.driver, ka = K.amen, kk = K.concept;
  const kUsd = csUsd;
  const walkRow = KG.by_walk[0];
  const jordRow = KG.by_walk.find((r) => r.group.indexOf("Jordanelle") === 0);
  const offRow = KG.by_walk.find((r) => r.group.indexOf("Near a lift") === 0);
  const kBucket = (k, b) => KC[k].find((r) => r.bucket === b);
  const kUp = (r) => r.High + r.Medium;
  const kUpOf = (k, b) => kUp(kBucket(k, b)) + " of " + kBucket(k, b).n;
  const kStats = (sh) => ddK(kc(sh).revenue) + ", ADR " + kUsd(kc(sh).adr) + " at " + Math.round(kc(sh).occ) + "%";
  const kAmenOf = (a) => ka(a).High_n + " of " + KT.High.n + " High · " + ka(a).Medium_n + " of " + KT.Medium.n + " Medium · " + ka(a).Low_n + " of " + KT.Low.n + " Low";
  const kUpperAmen = (a) => ka(a).High_n + ka(a).Medium_n;
  const kNUp = KT.High.n + KT.Medium.n;
  const kBand = CS_TIERS.map((t) => t + " " + (KT[t].n === 1 ? ddK(KT[t].rev_min) : csRange(KT[t].rev_min, KT[t].rev_max)) + " (" + KT[t].n + ")").join(" · ");
  const skiViews = kc("Ski Views · Main St"), dog6 = kc("Dog-Friendly 6BR"), chic = kc("Chic Town Lift Retreat"), mst = kc("Main St & Trails"), reese = kc("Reese Williams House");
  const dvw = kc("Deer Valley Walk-In"), ev4 = kc("East Village 4BR"), chateau = kc("Jordanelle Château"), views3 = kc("Old Town 3BR Views"), steps = kc("Steps to Main Street"), skiin = kc("Ski-in/out Old Town");
  const walkLow = KD.comps.filter((c) => c.walk_band === walkRow.group && c.tier === "Low");
  const walkLowRev = walkLow.map((c) => c.revenue).sort((a, b) => a - b);
  const kMedian = (a) => (a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2);
  const kMean = KD.comps.reduce((a, c) => a + c.revenue, 0) / KD.comps.length;
  const upGpbMax = Math.max.apply(null, KD.comps.filter((c) => c.tier !== "Low").map((c) => c.guests_per_bath));
  const LS = KW.lux_or_second;
  const skiPhoto = (file, alt, caption) => ({ file: "assets/" + file, alt: alt, caption: caption });
  const pairRows = [
    ["Revenue Potential", (c) => ddK(c.revenue) + " (" + c.tier + ")"], ["ADR · occupancy", (c) => kUsd(c.adr) + " · " + Math.round(c.occ) + "%"],
    ["Bedrooms · baths · sleeps", (c) => c.bedrooms + " · " + c.baths + " · " + c.sleeps], ["Guests per bathroom", (c) => c.guests_per_bath.toFixed(1)],
    ["Nearest lift", (c) => AREA_SHORT[c.lift_area] + ", " + c.lift_km.toFixed(1) + " km"], ["Distance to Main Street", (c) => c.main_st_km.toFixed(2) + " km"],
    ["Finish (photo review)", (c) => c.finish], ["Game room / pool table", (c) => (c.second_space ? "Yes" : "No")],
    ["Overall Visual Score (market pctl)", (c) => Math.round(c.visual_pct) + "th"], ["Rating (reviews)", (c) => c.rating + "★ (" + c.reviews + ")"],
  ];
  const pairPhotoRows = (key, notes) => KD.pairs[key].photos.map((p) => ({
    note: notes[p.row][0],
    left: skiPhoto(p.strong, notes[p.row][1], "Approved Ski-Access comp · " + KD.pairs[key].strong.tier + " · " + KD.pairs[key].strong.short + ": " + notes[p.row][1]),
    right: skiPhoto(p.ordinary, notes[p.row][2], "Approved Ski-Access comp · " + KD.pairs[key].ordinary.tier + " · " + KD.pairs[key].ordinary.short + ": " + notes[p.row][2]),
  }));

  // Section 1 card: the comp set refines thesis, signals and "Where" (numbers generated).
  ski.thesis =
    "Buy the location, then the minimum product. The approved comps sharpen what the location means: walk to the lift <em>and</em> to dinner. " + kUp(walkRow) + " of the " + walkRow.n +
    " comps within about 1 km of Main Street reach $178k+; none of the " + KG.not_walkable_n + " farther out do.";
  ski.spec = [
    ["Size", "3BR and up; 3–4BR core. A fourth bedroom adds nothing in the comps, and 5BR+ pays only when it is walkable and built to the group-home standard."],
    ["Screening signals", "Within about 1 km of Main Street; no more than about 3 guests per bath; hot tub, fireplace, deck and parking (all 12 comps have them); a luxury finish or a real second space."],
    ["Approved comps", kBand + ". Purchase price pending."],
    ["Where", "Old Town / Town Lift and Deer Valley Snow Park. The Jordanelle / East Village comps are all Low (" + csRange(jordRow.rev_min, jordRow.rev_max) + ", ADR " + kUsd(KG.jordanelle_adr[0]) + "–" + kUsd(KG.jordanelle_adr[1]) + "). Eligibility follows Park City zoning (HR-1, R-1, Estate and most RD zones)."],
  ];

  const KROLES = {
    "Ski Views · Main St": "The ceiling: a walkable 5BR built to the group-home standard (also an approved Group Home comp)",
    "Chic Town Lift Retreat": "Top 3–4BR comp: a 3BR with a luxury finish and 2 guests per bath",
    "Main St & Trails": "Dated finish, but walkable with a garage game room: fills " + Math.round(mst.occ) + "% of nights",
    "Deer Valley Walk-In": "Luxury remodel near Snow Park; the Deer Valley rate",
    "Steps to Main Street": "Top of Low: 4.5 baths on Main Street, dated finish, " + Math.round(steps.occ) + "% occupancy",
    "Dog-Friendly 6BR": "Most bedrooms, but " + dog6.main_st_km.toFixed(1) + " km from Main Street: " + Math.round(dog6.occ) + "% occupancy",
    "East Village 4BR": "Current finish, Jordanelle rate",
    "Jordanelle Château": "Luxury new build with ski and reservoir views; lowest ADR in the set",
    "Ski-in/out Old Town": "“Ski-in/out” on Main Street; sleeps " + skiin.sleeps + ", " + Math.round(skiin.occ) + "% occupancy",
    "Old Town 3BR Views": "Best Old Town view, 1990s interior, sleeps " + views3.sleeps,
    "Reese Williams House": "Same walk to Main Street as a Medium comp; 2 baths for 10",
    "Gondola Lake Chalet": "Lowest comp: Jordanelle new build",
  };

  Object.assign(ski, {
    status: "comp-set",
    overview: {
      statusBadge: "Revenue comp set complete · 12 analyst-approved comps · purchase-price underwriting pending",
      thesis:
        "<strong>Buy the walk first:</strong> a 3–4BR within about 1 km of Main Street, at the Town Lift or Deer Valley Snow Park. <strong>Then buy the minimum product that fills it:</strong> no more than about 3 guests per bath, a hot tub, fireplace, deck and parking (every comp has them), and either a luxury finish or a real second space such as a game room. " +
        "Like Charlotte's lake frontage, the location can't be added later. Unlike the lake, the rest of the house decides whether the location gets used.",
      whyItWorks:
        "In the approved comps, <strong>no home more than about 1 km from Main Street reaches the Medium tier</strong> (0 of " + KG.not_walkable_n + "). The Jordanelle side prices at " + kUsd(KG.jordanelle_adr[0]) + "–" + kUsd(KG.jordanelle_adr[1]) + " a night even though it sits about 1 km from the gondola. " +
        "Inside the walkable zone, the step from Low to Medium is mostly <strong>nights, not rate</strong> (" + Math.round(KDEC.walkable_mid_vs_low.occ_share) + "% occupancy, " + Math.round(KDEC.walkable_mid_vs_low.adr_share) + "% ADR). Every walkable Medium/High comp has a luxury finish or a game room, and no walkable Low comp has either.",
      heroImage: sp("hero", "A snow-covered deck looking straight onto the Park City Mountain ski runs: the location is the amenity."),
      chips: [
        { label: "3–4BR (3BR can reach Medium)" },
        { label: "Walk to Main St (≤ ~1 km)" },
        { label: "Town Lift or Deer Valley Snow Park" },
        { label: "≤ ~3 guests per bath" },
        { label: "Hot tub · fireplace · deck · parking" },
        { label: "Luxury finish or a game room" },
      ],
      revenueChips: CS_TIERS.map((t) => ({ label: "Comp tier · " + t, value: (KT[t].n === 1 ? ddK(KT[t].rev_min) : csRange(KT[t].rev_min, KT[t].rev_max)) + " (" + KT[t].n + ")" })),
    },
    pendingSections: [
      { groupTitle: "Acquisition Checklist" },
      {
        title: "Buy the Real Estate for This vs. Add It During Conversion",
        body: "<p>Each requirement carries two layers of evidence: the <strong>product population</strong> (all " + s.n + " Park City 3BR+ homes within 2 km of a lift, July snapshot) and the <strong>approved comp set</strong> (the analyst's 12 revenue comps, the same homes at $75k+).</p>",
        html: () =>
          ddStatStrip(s, "listings in the product") +
          ddChecklist([
            ["Walk to Main Street (within about 1 km), at the Town Lift or Deer Valley Snow Park", "buy", "The whole thesis. It can't be added later, and lift distance alone doesn't deliver it.",
              "Population: within 0.75 km of Main St " + ddOf(ms1.top25_n, ms1.n) + " Top 25%. Comps: " + kUp(walkRow) + " of " + walkRow.n + " walkable homes reach Medium/High; 0 of " + KG.not_walkable_n + " beyond 2 km of Main St. The Jordanelle comps are " + KG.jordanelle_lift_km[0].toFixed(1) + "–" + KG.jordanelle_lift_km[1].toFixed(1) + " km from the gondola and rate " + kUsd(KG.jordanelle_adr[0]) + "–" + kUsd(KG.jordanelle_adr[1]), "strong"],
            ["Legal nightly rental at the address", "buy", "Park City zoning decides it: HR-1, R-1, Estate and most RD zones allow nightly rental; SF, HRL McHenry and named RD subdivisions don't. On the Jordanelle side, MIDA and Hideout rules apply.", "Section 5", "strong"],
            ["Bathrooms: no more than about 3 guests per bath (3+ baths for 10)", "buy", "The strongest single variable in the comps, and the hardest to add in a tight Old Town footprint.",
              "Population: 2 or fewer baths " + ddOf(sB("baths", "2 or fewer").top25_n, sB("baths", "2 or fewer").n) + " Top 25%. Comps: bathrooms " + csRho(kd("Baths")) + " (" + ddP(kd("Baths").p) + "), " + csRho({ rho: kd("Baths").rho_core }) + " in the 3–4BR core; no comp above " + upGpbMax.toFixed(1) + " guests per bath reaches Medium", "strong"],
            ["3–4BR, sleeping 8–10 (5BR+ only if walkable)", "buy", "A fourth bedroom adds nothing in the comps. Both comps sleeping 6–7 are Low. A walkable 5BR is the ceiling; a non-walkable 6BR is Low.",
              "Comps: 3BR " + kUpOf("bedrooms", "3BR") + " Medium/High · 4BR " + kUpOf("bedrooms", "4BR") + " · sleeps 6–7 " + kUpOf("sleeps", "6–7"), "directional"],
            ["Deck or balcony, fireplace, off-street parking", "buy", "Structural. A gas fireplace insert is possible; parking in Old Town usually isn't.",
              "Population: every Top 25% home has them. Comps: all 12 have a patio or balcony, a fireplace and on-site parking, so they are the entry ticket, not the differentiator", "strong"],
            ["Hot tub", "either", "Needs a deck with structural and electrical capacity; the tub is added.", "In all 12 comps. Placement varies (a rooftop over Old Town, a side-yard pad); it doesn't separate the tiers", "strong"],
            ["A luxury finish or a real second space (game room, pool table, media room)", "either", "The space and the bones are bought; the finish and equipment are added. Inside the walkable zone, this is what separates Medium from Low.",
              "Comps (walkable, N=" + walkRow.n + "): " + LS.upper_with + " of " + LS.upper_n + " Medium/High have one, " + LS.low_with + " of " + LS.low_n + " Low (" + ddP(LS.p) + "). Pool table " + kAmenOf("Pool table"), "directional"],
            ["Sauna", "add", "A luxury add-on for the top homes.", "Comps: " + kAmenOf("Sauna"), "directional"],
            ["Ski storage: entry bench, hooks, boot dryers", "add", "Cheap, and it's what a ski guest actually uses.", "Comps: mentioned by " + ka("Ski storage / mudroom (mentioned)").all_n + " of 12, spread across the tiers", "weak"],
          ]),
      },

      { groupTitle: "Location — the Core Mechanism" },
      {
        title: "Lift Access & Walkability",
        body:
          "<p><strong>Walkable beats “ski-in/ski-out”.</strong> Within the 2 km zone, distance to the lift itself shows no gradient. Distance to <strong>Main Street</strong> matters more. Homes within about 0.75 km of Main Street reach the Top 25% " + ddOf(ms1.top25_n, ms1.n) +
          " times (" + ms1.top10_n + " in the Top 10%), at a median ADR of $" + Math.round(ms1.adr) + ". Listings that <em>say</em> ski-in/ski-out don't outperform (median " + ddK(DS.location.ski_in_out.median_with) + " vs " + ddK(DS.location.ski_in_out.median_without) +
          "), and listings that mention a shuttle or bus have no Top 10% homes (" + ddOf(DS.location.shuttle.top10_with, DS.location.shuttle.n_with) + ").</p>" +
          "<p><strong>Comp check:</strong> walkability works as a <em>threshold</em>, not a gradient. Half the comps within about 1 km of Main Street reach Medium/High (" + kUp(walkRow) + " of " + walkRow.n + "), every comp beyond 2 km is Low, and inside the walkable zone distance to Main Street no longer predicts revenue (" + csRho(KG.rho_main) + "). <strong>The spec: walk to the lift and walk to dinner.</strong></p>",
        html: () => ddTableRow([ddBucketTable(DS.location.by_main_st, "Distance to Main Street (population)"), ddBucketTable(DS.location.by_distance, "Distance to nearest lift (population)")]),
        images: [
          sp("aerial_main_st", "The strongest listings sell the location in their own photos: an aerial with the house pinned on Main Street."),
          sp("deck_view", "An Old Town deck overlooking town and the mountain: walkable to both."),
        ],
      },
      {
        title: "Which Ski Area",
        body:
          "<p><strong>Old Town / Town Lift and Deer Valley Snow Park hold all " + s.top10_n + " Top 10% listings</strong> in the population. The Town Lift / Park City Mountain side has " + ddOf(town.top25_n, town.n) + " in the Top 25% at a median ADR of $" + Math.round(town.adr) +
          "; the <strong>Deer Valley Jordanelle / East Village</strong> side has " + ddOf(jord.top25_n, jord.n) + " in the Top 25% but no Top 10% listings, at $" + Math.round(jord.adr) + ". Canyons Village has a single listing and no comp.</p>" +
          "<p><strong>Comp check:</strong> the " + jordRow.n + " Jordanelle comps are all Low (" + csRange(jordRow.rev_min, jordRow.rev_max) + "). They fill the most nights in the set (median " + Math.round(jordRow.occ_median) + "%) at the lowest rates (" + kUsd(KG.jordanelle_adr[0]) + "–" + kUsd(KG.jordanelle_adr[1]) + "), and two are luxury new builds. " +
          "The data covers one East Village season, so treat the side as a Low-tier underwrite until it has history. <strong>Regulation follows the ski area:</strong> Old Town and Deer Valley fall under Park City's per-unit license and zoning map; the Jordanelle side falls under MIDA and Hideout rules (verify parcel by parcel).</p>",
        html: () => ddTableRow([ddBucketTable(DS.location.by_area, "Nearest ski area (population)")]),
        images: [
          sp("jordanelle_view", "The Jordanelle-side draw: a big Deer Valley view from the deck."),
          sp("jordanelle_hot_tub", "A hot tub over the Jordanelle Reservoir. A great photo, but among the lowest rates in the comp set."),
        ],
      },
      {
        title: "Geo Considerations — Where the Approved Comps Sit",
        body:
          "<p>Charlotte's Lake box asked whether a home was on the water. The Park City equivalent is <strong>whether guests can walk to the lift and to dinner.</strong> The map shows the 12 comps with the 2 km lift zones and a ~1.1 km ring around Main Street.</p><ul class=\"tight-list\">" +
          "<li><strong>Walk to Main Street (≤1.1 km):</strong> " + walkRow.n + " comps, " + kUp(walkRow) + " Medium/High, median " + ddK(walkRow.rev_median) + " at " + kUsd(walkRow.adr_median) + ".</li>" +
          "<li><strong>Near a lift, not walkable to town:</strong> the 6BR in a suburban subdivision north of Old Town, " + dog6.lift_km.toFixed(1) + " km from a lift and " + dog6.main_st_km.toFixed(1) + " km from Main Street, is Low at " + Math.round(dog6.occ) + "% occupancy despite an " + kUsd(dog6.adr) + " rate.</li>" +
          "<li><strong>Jordanelle side:</strong> about 1 km from the gondola, 4–5 km from Main Street, all Low at " + kUsd(jordRow.adr_median) + " median ADR. The two Jordanelle Château and Gondola Lake Chalet listings use a byte-identical hot-tub photo, so they are likely units in the same development.</li>" +
          "<li><strong>Views don't substitute for the walk.</strong> The scenic-view score runs <em>inverse</em> to revenue in the comps (" + csRho(kk("Scenic view")) + "): the reservoir and valley views are on the Jordanelle side.</li>" +
          "<li><strong>Parking is eligibility, not a differentiator:</strong> all 12 list on-site parking; " + ka("Garage (mentioned)").all_n + " mention a garage, including " + ka("Garage (mentioned)").Low_n + " of the " + KT.Low.n + " Low comps. Snow-season arrival (steep Old Town streets, shared driveways) isn't in the data, so check it on site.</li></ul>",
        html: () => K.groupTable(KG.by_walk, "group", "Walkability", null, [["Median occupancy", (r) => Math.round(r.occ_median) + "%"], ["Median km to Main St", (r) => r.main_st_km_median.toFixed(1)]]) +
          K.groupTable(KG.by_area, "group", "Nearest ski area", null, [["Median occupancy", (r) => Math.round(r.occ_median) + "%"]]),
        mapEmbed: { url: "assets/" + KD.map + "?v=20260929-pc6", className: "embedded-map--compact", title: "Map of the 12 approved Ski-Access revenue comps, colored by High, Medium and Low tier, with lift bases, 2 km zones and Main Street" },
      },

      { groupTitle: "Minimum Product to Monetize the Location" },
      {
        title: "Bedrooms, Bathrooms & Sleeps",
        body:
          "<p>Population: the evidence is strongest at <strong>3–4BR</strong> (" + core.n + " of the " + s.n + " listings), and homes with 2 or fewer baths reach the Top 25% " + ddOf(sB("baths", "2 or fewer").top25_n, sB("baths", "2 or fewer").n) + " times.</p>" +
          "<p><strong>Comp check.</strong> <strong>Bathrooms are the strongest single variable in the comp set</strong> (" + csRho(kd("Baths")) + ", " + ddP(kd("Baths").p) + "; " + csRho({ rho: kd("Baths").rho_core }) + " in the 3–4BR core). None of the " + kBucket("gpb", "3.5+").n + " comps at 3.5+ guests per bath reaches Medium, and every Medium/High comp is at or below " + upGpbMax.toFixed(1) + ". " +
          "<strong>Bedrooms don't separate:</strong> 3BR " + kUpOf("bedrooms", "3BR") + ", 4BR " + kUpOf("bedrooms", "4BR") + ", and the top 3–4BR comp is a 3BR (" + chic.short + ", " + ddK(chic.revenue) + "). <strong>Sleeps has a floor, not a slope:</strong> both comps sleeping 6–7 are Low; the Medium comps sleep 8–10. This is a ski group of 8–10, not a headcount play.</p>",
        html: () =>
          ddTableRow([ddBucketTable(DS.capacity.bedrooms, "Bedrooms (population)"), ddBucketTable(DS.capacity.baths, "Bathrooms (population)"), ddBucketTable(DS.capacity.sleeps, "Sleeps (population)")]) +
          '<div class="table-scroll"><table class="data-table dd-mini cs-table"><thead><tr><th>Approved comps</th><th>Comps</th><th>High · Medium · Low</th><th>Median revenue</th><th>Median ADR · occupancy</th></tr></thead><tbody>' +
          [["bedrooms", "Bedrooms"], ["baths", "Bathrooms"], ["gpb", "Guests per bath"], ["sleeps", "Sleeps"]].map(([k, lab]) => KC[k].filter((r) => r.n).map((r) =>
            '<tr><th scope="row">' + lab + ": " + r.bucket + "</th><td>" + r.n + "</td><td>" + r.High + " · " + r.Medium + " · " + r.Low + "</td><td>" + ddK(r.rev_median) + "</td><td>" + kUsd(r.adr_median) + " · " + Math.round(r.occ_median) + "%</td></tr>").join("")).join("") +
          "</tbody></table></div>",
      },
      {
        title: "Living Room, Fireplace & Kitchen",
        body:
          "<p><strong>A fireplace and a finished interior, in any style.</strong> In the product population, traditional Old Town interiors earn alongside modern ones. " +
          "<strong>Comp check:</strong> all 12 comps have a fireplace, so the fireplace is table stakes. Finish matters <em>inside the walkable zone</em>: " + KW.luxury_finish.upper_with + " of the " + KW.luxury_finish.upper_n + " walkable Medium/High comps have a luxury finish (photo review), against " + KW.luxury_finish.low_with + " of " + KW.luxury_finish.low_n + " walkable Low comps. " +
          "The exception proves the rule: " + mst.short + " has a dated living room and a converted-garage game room. Finish doesn't lift the Jordanelle side, where two luxury new builds are Low.</p>",
        images: [
          sp("living_fireplace_lux", "A stacked-stone fireplace wall, open stair and vaulted ceiling: après-ski as the focal point."),
          sp("living_fireplace_trad", "A traditional living room with a corner fireplace. Top 10% in the July market, but Low in the approved comps: inside the walkable zone, the dated finish is the drag."),
          sp("kitchen_trad", "A traditional wood kitchen with a pro range and island: equipped, but 2000s styling. Fine as a baseline, not a differentiator."),
          sp("kitchen_lux", "A contemporary kitchen with a pro range. The other style that works."),
        ],
      },
      {
        title: "Outdoor, Après & Arrival",
        body:
          "<p><strong>A hot tub on a deck or balcony</strong> is the standard; every comp has one. <strong>Comp check:</strong> placement doesn't separate the tiers. The ceiling comp's tub is on a rooftop over Old Town, while " + mst.short + "'s is a plain round tub in a side yard, and both earn well; the best hot-tub view in the set (over the Jordanelle Reservoir) is on a Low comp. " +
          "Garages turn up in Medium and Low alike (the ceiling comp has none), so parking is an eligibility check, not a revenue lever. <strong>A practical ski entry</strong> (bench, hooks, boot storage) is cheap to add.</p>",
        images: [
          sp("hot_tub_view", "A hot tub under a stone wall with the ski slopes beyond: après is the product."),
          sp("balcony", "A covered balcony over Old Town. Small, but it's the outdoor space these homes need."),
          sp("garage", "A garage in Old Town. Parking is part of the real estate here."),
          sp("villa_gallery", "A simple ski entry: a bench and hooks by the door. Cheap to add."),
        ],
      },

      { groupTitle: "Amenities" },
      {
        title: "Amenity Prevalence — Approved Comp Set",
        body:
          "<p>Left: how often each feature appears in each tier. Right: which features each comp has, High → Medium → Low in revenue order. Flags come from the platform amenity list and the listing text (“mentioned”), as in the product-population table below.</p>" +
          "<ul class=\"tight-list\"><li><strong>Table stakes:</strong> hot tub, fireplace, patio or balcony and on-site parking are in all 12 comps; BBQ and air conditioning in nearly all.</li>" +
          "<li><strong>What the upper tiers add:</strong> a pool table (" + kAmenOf("Pool table") + "), outdoor dining (" + kAmenOf("Outdoor dining") + "; among walkable comps " + KW.f_outdoor_dining.upper_with + " of " + KW.f_outdoor_dining.upper_n + " upper vs " + KW.f_outdoor_dining.low_with + " of " + KW.f_outdoor_dining.low_n + " Low) and a sauna (" + kAmenOf("Sauna") + "). The one Low comp with a game room is the non-walkable 6BR.</li>" +
          "<li><strong>No signal:</strong> garage (" + kAmenOf("Garage (mentioned)") + "), ski storage, bunk rooms, a listed mountain view, and the “ski-in/ski-out” claim.</li>" +
          "<li><strong>Read it with the location:</strong> amenities separate the tiers only among walkable homes. On the Jordanelle side, nothing in the heatmap lifts a comp out of Low.</li></ul>",
        chartsRow: [
          { file: "assets/" + KD.charts.prevalence, alt: "Grouped bar chart of feature prevalence by Ski-Access comp tier", caption: "Feature prevalence by tier, approved Ski-Access comps (High N=" + KT.High.n + ", Medium N=" + KT.Medium.n + ", Low N=" + KT.Low.n + ")." },
          { file: "assets/" + KD.charts.presence, alt: "Heatmap of feature presence for each of the 12 approved Ski-Access comps", caption: "Feature presence by comp, High → Medium → Low. Colored = present." },
        ],
      },
      {
        title: "Amenity Evidence Inside the Product",
        body:
          "<p>The population layer (all " + s.n + " listings, July). The few homes outside the Top 25% are the same small set of basic condos and homes, each missing a hot tub, a fireplace or a deck, which is why those three split identically. <strong>Read them as one minimum standard, not three independent effects.</strong> Inside the comp set they are universal, and the pool table / game room is what varies.</p>",
        html: () =>
          ddFeatureTable(DS.amenities, {
            "Hot tub": ["Must-have", "must"], "Indoor fireplace": ["Must-have", "must"], "Patio or balcony": ["Must-have", "must"], "Garage": ["Eligibility check", "base"],
            "Ski storage / mudroom": ["Auto-add", "auto"], "Air conditioning": ["Baseline", "base"], "Game room": ["Nice-to-have #1", "nice"], "Sauna": ["Nice-to-have #2", "nice"],
            "Fire pit": ["Optional", "auto"], "Outdoor dining area": ["No signal", "weak"], "Mentions a bunk room": ["Optional", "weak"], "Mentions a primary suite": ["Baseline", "base"],
          }),
        items: ["Hot tub", "Indoor fireplace", "Deck / patio / balcony", "Off-street parking", "No more than ~3 guests per bath"],
      },
      {
        ranked: {
          note: "Population comparisons (N=" + s.n + ") are thin, so each note adds the approved-comp prevalence. Directional reads, not rankings to underwrite.",
          items: ddRanked(DS.amenities, [
            ["Game room", "Comps: pool table " + kAmenOf("Pool table") + ". Inside the walkable zone, a game room or a luxury finish is what separates Medium from Low. Buy the space; add the table.", [sp("game_room", "A small game room with a pool table: the second space the upper tiers have.")], true],
            ["Sauna", "Comps: " + kAmenOf("Sauna") + ". A luxury add-on for the top homes.", [], true],
            ["Air conditioning", "Comps: " + kAmenOf("Air conditioning") + ". Near-universal; not a separator.", [], false],
            ["Garage", "Comps: " + kAmenOf("Garage (mentioned)") + ". Parking is eligibility in Old Town, not a revenue lever.", [], false],
          ]),
        },
      },

      { groupTitle: "Execution — How Much Design?" },
      {
        title: "Finished Interior, Not an Architectural Statement",
        body:
          "<p>Population layer: <strong>only “luxury interior” holds up after adjustment</strong> (ρ " + sC("Luxury interior").rho_full_adj.toFixed(2) + ", " + ddP(sC("Luxury interior").p_full_adj) +
          "). Unique architecture, resort-like and outdoor entertainment show nothing. <strong>Comp check:</strong> across all 12 comps no visual score separates the tiers, because the Jordanelle new builds score well and earn little. Among walkable comps, luxury interior (" + Math.round(kk("Luxury interior").walk_upper) + " vs " + Math.round(kk("Luxury interior").walk_low) +
          ") and upscale appearance (" + Math.round(kk("Upscale appearance").walk_upper) + " vs " + Math.round(kk("Upscale appearance").walk_low) + ") are higher in the Medium/High comps. <strong>The spec is a clean, updated, well-finished interior, not a showpiece.</strong> The Visual Score is not a filter.</p>",
        html: () => ddConceptTable(DS.concepts, DG.concepts, "Large Group Home", ["Luxury interior", "Upscale appearance", "Staged interior", "High-end kitchen", "Resort-like", "Unique architecture", "Outdoor entertainment", "Overall Visual Score"]),
      },
      {
        title: "Same Ski Area, 4.5× the Revenue",
        body:
          "<p>Both are 3BR homes a few hundred meters from a Park City Mountain lift. <strong>The strong one has 4 baths, a hot tub, a deck on the ski runs and a finished interior, and sits a short walk from Main Street.</strong> The ordinary one has 2 baths, no hot tub and a basic interior, and sits near the Mountain Village base about 1.5 km from Main Street. " +
          "The left home is an approved Medium comp (" + chic.short + "); the right is a market reference below the comp set's $75k floor. Figures are from the July snapshot.</p>",
        pairLabels: [PAIR_S.strong.title, PAIR_S.ordinary.title],
        compStats: ddPairStats(PAIR_S, (a, b) => [["Distance to Main Street", a.main_st_km.toFixed(1) + " km", b.main_st_km.toFixed(1) + " km"], ["Distance to lift", a.lift_km.toFixed(1) + " km", b.lift_km.toFixed(1) + " km"]]),
        compPhotoRows: [
          { note: "<strong>Living room:</strong> a vaulted room with a stone fireplace and ski-run windows, against a basic condo-style living room.", left: sp("pair_living_strong", "Vaulted living room with a fireplace."), right: sp("pair_living_ordinary", "A basic living room.") },
          { note: "<strong>Kitchen:</strong> marble and white cabinetry, against dated wood-and-black-granite finishes.", left: sp("pair_kitchen_strong", "An updated kitchen."), right: sp("pair_kitchen_ordinary", "A dated kitchen.") },
          { note: "<strong>Outdoor:</strong> a private deck facing the runs. The ordinary listing's eight gallery photos include no outdoor space at all; this laundry room is one of them.", left: sp("pair_outdoor_strong", "A deck facing the ski runs."), right: sp("pair_outdoor_ordinary", "A laundry room: this gallery has no outdoor photo.") },
        ],
      },
      {
        title: "Near the Lift Isn't Enough",
        images: [
          sp("condo_dated", "Counterexample: a dated condo about half a kilometer from the lift. Sauna and hot tub, but sleeping 15 in a condo with an '80s finish."),
          sp("villa_new", "Counterexample: a brand-new Jordanelle-side build with a bunk room and hot tub. New construction doesn't carry it on the lower-ADR side of Deer Valley."),
        ],
      },

      { groupTitle: "Revenue Comp Set" },
      {
        title: "The Approved Comp Set at a Glance",
        body:
          "<p>The 12 comps are the analyst's selection, used exactly as supplied. They are exactly the " + KPOS.rule_n + " product listings at or above $75,000 (checked, not used to select). The best excluded listing earns " + kUsd(KPOS.best_excluded) + ". The comp floor sits just above the market's P75 (" + ddK(KPOS.market_p75) + "), so <strong>“Low” here means the lower end of a winning location</strong>, not a weak listing.</p>" +
          "<p><strong>Tiers follow the revenue breaks:</strong> the two largest gaps in the set (" + ddK(KD.tiering.gaps[0].gap) + " below the ceiling comp, " + ddK(KD.tiering.gaps[1].gap) + " below the Medium group) define them, and an exhaustive natural-breaks search gives the same 1 / 3 / 8 split. " +
          "High is a single ceiling comp, a 5BR, so most of the comparison is Medium vs Low.</p>" +
          "<p class=\"dd-note\">N is 12, so every comparison is descriptive and correlations are directional. " + KPOS.possibly_good_data + " of the 12 carry the dataset's “Possibly Good Data” flag. " + skiViews.short + " is also an approved Group Home comp (High there at " + ddK(KPOS.in_5br_comp_set[0].revenue_5br) + " in the September pull; " + ddK(skiViews.revenue) + " here in the July snapshot). “Finish” is a photo-review judgment from all 96 gallery photos. " +
          "The dataset's Cleaning Fee field is an annual total, not a per-stay fee, and two comps report no bed count, so neither is used to compare tiers.</p>",
        html: () => K.tierBands() + K.tierTable(["ADR", "occ", "Baths", "guests_per_bath", "Bedrooms", "Sleeps", "main_st_km", "luxury_finish", "second_space", "kids", "group"]),
      },
      {
        title: "The 12 Approved Comps",
        body: "<p>Grouped by tier, in revenue order. Photos are from each comp's own Airbnb gallery. The line under each card is its analytical role.</p>",
        html: () => K.cards(KROLES) + '<details class="ref-details"><summary>Full metrics for all 12 comps</summary>' + K.fullTable() + "</details>",
      },
      {
        title: "What Separates High, Medium and Low",
        body:
          "<ul class=\"tight-list\"><li><strong>Bathrooms and rate separate</strong>: bathrooms " + csRho(kd("Baths")) + ", ADR " + csRho(kd("ADR")) + ". Both still show in the 3–4BR core (" + csRho({ rho: kd("Baths").rho_core }) + " and " + csRho({ rho: kd("ADR").rho_core }) + ").</li>" +
          "<li><strong>A second space separates</strong>: game room or pool table " + csRho(kd("second_space")) + " (" + kd("second_space").High.n_true + " of " + KT.High.n + " High, " + kd("second_space").Medium.n_true + " of " + KT.Medium.n + " Medium, " + kd("second_space").Low.n_true + " of " + KT.Low.n + " Low).</li>" +
          "<li><strong>Distance doesn't, once the home is walkable.</strong> Distance to Main Street shows " + csRho(kd("main_st_km")) + " across the set, because four Low comps sit within about 0.2 km of Main Street; the threshold is covered under Geo Considerations.</li>" +
          "<li><strong>Bedrooms, sleeps, the guest mix and the Visual Score don't separate</strong> the 3–4BR tiers. The group-trip signal (" + csRho(kd("group")) + ") comes mostly from the 5BR ceiling comp (" + Math.round(skiViews.group) + "% group-trip reviews) and " + dvw.short + " (" + Math.round(dvw.group) + "%); the Medium and Low medians are both about " + Math.round(KT.Low.group_median) + "%.</li></ul>",
        html: () => K.driversTable(["ADR", "occ", "Baths", "guests_per_bath", "Bedrooms", "Sleeps", "main_st_km", "lift_km", "luxury_finish", "second_space", "f_sauna", "f_garage", "f_ac", "kids", "group", "Min_Stay", "pct_visual_score"], "3–4BR only (N=10)"),
      },
      {
        title: "Rate and Nights: ADR vs. Occupancy",
        body:
          "<p><strong>Across the whole set, the stronger homes earn mainly through rate.</strong> High earns " + KDEC.high_vs_low.revenue_ratio.toFixed(1) + "× the Low tier, and " + Math.round(KDEC.high_vs_low.adr_share) + "% of that gap is ADR. Medium earns " + KDEC.mid_vs_low.revenue_ratio.toFixed(1) + "× Low: " + Math.round(KDEC.mid_vs_low.adr_share) + "% rate, " + Math.round(KDEC.mid_vs_low.occ_share) + "% nights.</p>" +
          "<p><strong>But that blends two different gaps.</strong></p><ul class=\"tight-list\">" +
          "<li><strong>Location sets the rate.</strong> " + (KD.low_modes["Rate below every Medium/High comp"] || []).length + " Low comps price below every Medium/High comp (under " + kUsd(KD.low_floors.adr) + "): the three Jordanelle homes and " + views3.short + ". They fill 61–69% of nights and still land Low.</li>" +
          "<li><strong>The product fills the nights.</strong> Inside the walkable zone, Medium earns " + KDEC.walkable_mid_vs_low.revenue_ratio.toFixed(1) + "× Low with only " + KDEC.walkable_mid_vs_low.adr_ratio.toFixed(2) + "× the rate: " + Math.round(KDEC.walkable_mid_vs_low.occ_share) + "% of the gap is occupancy. " +
          (KD.low_modes["Occupancy below every Medium/High comp"] || []).join(", ") + " price like Medium comps but fill fewer nights than any Medium/High comp (under " + Math.round(KD.low_floors.occ) + "%); " + (KD.low_modes["Both below"] || []).join(", ") + " is below on both.</li>" +
          "<li><strong>The ceiling is rate.</strong> " + skiViews.short + " charges " + kUsd(skiViews.adr) + ", the highest in the set, at " + Math.round(skiViews.occ) + "% occupancy, lower than the Medium tier.</li></ul>",
        chartsRow: [{ file: "assets/" + KD.charts.adr_occ, alt: "Scatter of ADR against occupancy for the 12 approved Ski-Access comps, colored by tier and shaped by walkability", caption: "ADR vs. occupancy; dashed lines are equal revenue, marker shape is walkability." }],
      },
      {
        title: "Location Sets the Rate: Deer Valley vs. the Jordanelle Side",
        body:
          "<p>Both are 4BR homes with 3.5–4 baths about 1 km from a Deer Valley lift base, with current interiors. <strong>" + dvw.short + " earns " + ddK(dvw.revenue) + " at " + kUsd(dvw.adr) + "; " + ev4.short + " fills more nights (" + Math.round(ev4.occ) + "% vs " + Math.round(dvw.occ) + "%) at " + kUsd(ev4.adr) + ".</strong> " +
          "The gap is rate, and the rate is the address: Main Street is " + dvw.main_st_km.toFixed(1) + " km from one and " + ev4.main_st_km.toFixed(1) + " km from the other. The finish can be fixed after purchase; the address can't.</p>",
        pairLabels: [dvw.title, ev4.title],
        compStats: csPair(KD.pairs.rate, pairRows),
        compPhotoRows: pairPhotoRows("rate", {
          living: ["<strong>Living room:</strong> both are double-height rooms around a stone fireplace wall. This isn't a finish gap.", "Double-height ledgestone fireplace and open stair.", "Double-height great room with a stone-wall linear fireplace."],
          kitchen: ["<strong>Kitchen:</strong> both are current: rift oak and a pro range against white shaker and quartz.", "Rift-oak kitchen open to the dining table.", "White shaker kitchen with a dark island."],
          outdoor: ["<strong>Outdoor:</strong> a hot tub facing Deer Valley, against a gallery with no deck or hot tub in its eight slots; this coffee-table close-up is one of them, and a review graphic is another.", "Hot tub against a ledgestone wall facing Deer Valley.", "A coffee-table close-up: this gallery shows no outdoor space."],
        }),
      },
      {
        title: "The Product Fills the Nights: Two Homes on the Same Walk to Main Street",
        body:
          "<p>Both are 4BR Old Town houses sleeping 10, " + mst.main_st_km.toFixed(2) + " km from Main Street, each with a hot tub, at nearly the same rate (" + kUsd(mst.adr) + " vs " + kUsd(reese.adr) + "). <strong>" + mst.short + " fills " + Math.round(mst.occ) + "% of nights; " + reese.short + " fills " + Math.round(reese.occ) + "%.</strong></p>" +
          "<ul class=\"tight-list\"><li><strong>Bathrooms:</strong> " + mst.baths + " against " + reese.baths + " (" + mst.guests_per_bath.toFixed(1) + " vs " + reese.guests_per_bath.toFixed(1) + " guests per bath). Reese is the only comp with 2 baths.</li>" +
          "<li><strong>A second space:</strong> a converted-garage game room with a pool table and ping pong, against none.</li>" +
          "<li><strong>Not finish:</strong> the photo review rates " + mst.short + "'s interior " + mst.finish + " and " + reese.short + "'s " + reese.finish + ". The less-updated house is the higher earner.</li>" +
          "<li><strong>Marketing:</strong> three of " + mst.short + "'s first four photos locate the house: annotated aerials of the walk to Main Street and the ski-in route, and a snapshot from the slope. It sells the location it bought.</li></ul>",
        pairLabels: [mst.title, reese.title],
        compStats: csPair(KD.pairs.occupancy, pairRows),
        compPhotoRows: pairPhotoRows("occupancy", {
          exterior: ["<strong>Arrival:</strong> an Old Town house over a two-car garage, against a restored historic house up a flight of stairs from the street.", "Twilight front with a two-car garage.", "Restored historic house above the street."],
          living: ["<strong>Living room:</strong> the higher earner has the plainer room: a wood-burning fireplace and maple built-ins, against a leather sectional and a gas stove.", "Wood-burning fireplace and maple built-ins.", "Leather sectional and a corner gas stove."],
          hot_tub: ["<strong>Hot tub:</strong> both are plain tubs, one on a side-yard pad, one on a rear deck. Neither is the reason.", "A round tub on a side-yard pad.", "A hot tub on a rear composite deck."],
          second: ["<strong>Second space:</strong> a garage game room with a pool table, against no second space in the gallery; this dining table is the nearest thing.", "Converted-garage game room with a pool table.", "The dining table: the gallery shows no second space."],
        }),
      },
      {
        title: "Where the Two Buy Boxes Meet: the 5BR and 6BR Comps",
        body:
          "<p>Two comps are larger homes. They show when large-home capacity stacks on top of the ski premium.</p><ul class=\"tight-list\">" +
          "<li><strong>" + skiViews.short + " (5BR / " + skiViews.baths + " baths, sleeps " + skiViews.sleeps + ", " + skiViews.main_st_km.toFixed(1) + " km from Main Street): " + ddK(skiViews.revenue) + ".</strong> It combines both Park City mechanisms: the walkable Old Town rate (" + kUsd(skiViews.adr) + ", the highest in the set) and the Group Home product (7 baths, a rooftop hot tub, a sauna, a game room). " +
          "That is " + ddK(skiViews.rev_per_br) + " per bedroom, about the same as the best 3BR (" + ddK(KD.capacity.rev_per_br[chic.short]) + "): the extra bedrooms were paid at full value. It is also a High comp in the approved Group Home set.</li>" +
          "<li><strong>" + dog6.short + " (6BR / " + dog6.baths + " baths, sleeps " + dog6.sleeps + ", " + dog6.main_st_km.toFixed(1) + " km from Main Street): " + ddK(dog6.revenue) + ".</strong> A suburban two-story north of Old Town, with a game room and hot tub. The rate is there (" + kUsd(dog6.adr) + ") but the nights aren't (" + Math.round(dog6.occ) + "%, the lowest in the set): " + ddK(dog6.rev_per_br) + " per bedroom. Its sleeps count (" + dog6.sleeps + ") is the same as a 4BR's.</li></ul>" +
          "<p><strong>Read:</strong> capacity pays on top of the ski premium only when the home is walkable <em>and</em> built to the Group Home standard. A rare walkable 5BR+ is upside; a large home just outside the walk is an under-filled 4BR. This isn't a third buy box: it is the overlap of the two.</p>",
      },
      {
        title: "Visual Enrichment: Where to Look vs. What to Learn",
        body:
          "<p>Each comp's visual concepts are a percentile of the whole market. <strong>Across the 12, no visual score separates the tiers</strong>: the Jordanelle new builds score as well as the Old Town winners. The walkable columns compare like with like, and there the upper tiers look more finished. " +
          "Scenic view is <em>inverse</em> (" + csRho(kk("Scenic view")) + "): the biggest views are on the Jordanelle side. The scores told us where to look; the photos below show what to learn.</p>",
        html: () => K.conceptTable(["Luxury interior", "Upscale appearance", "High-end kitchen", "Staged interior", "Fireplace", "Resort-like", "Unique architecture", "Mountain view", "Scenic view", "Curb appeal", "Overall Visual Score"],
          [["Walkable Medium/High", (r) => Math.round(r.walk_upper)], ["Walkable Low", (r) => Math.round(r.walk_low)]]),
      },
      {
        title: "Comp-Set Visual Comparison",
        body: "<p>Photos from the approved comps' own galleries, chosen after reviewing all 96. Qualitative observations, not causal conclusions. The question: <strong>why can two homes both be close to skiing while one earns far more?</strong></p>",
        html: () => K.comparisonHtml([
          ["setting", "Setting: Walk to Dinner", "Every Medium/High comp is within about 1 km of Main Street. The Low tier splits: homes that are a drive from town (Jordanelle, the subdivision north of Old Town), and Old Town homes that have the address but not the product."],
          ["living", "Living Room & Fireplace", "Every comp has a fireplace. Walkable Medium/High comps mostly have a luxury remodel; the exception (" + mst.short + ") has a game room instead. Low includes both dated Old Town rooms and brand-new Jordanelle ones."],
          ["kitchen", "Kitchen & Dining", "Kitchens are equipped in every tier (pro ranges appear in Low too). What differs is the era of the finish, and only inside the walkable zone."],
          ["sleeping", "Bedrooms & Bathrooms", "The difference is the bathroom count, not the photos: " + upGpbMax.toFixed(1) + " guests per bath at most in Medium/High, up to " + KT.Low.gpb_max.toFixed(1) + " in Low. One of the nicest bathrooms in the set (a freestanding tub with a view) is on a Low Jordanelle comp."],
          ["outdoor", "Hot Tub, Deck & View", "Every comp has a hot tub. Some of the biggest views in the set, over the Jordanelle Reservoir and across Old Town, are on Low comps; a plain side-yard tub sits on a Medium one. The view doesn't carry the rate."],
          ["second", "Game Room & Second Space", "Three of the four upper comps have a pool table and the fourth (" + chic.short + ") has a media room. The one Low comp with a game room is the non-walkable 6BR. The ceiling comp's game room isn't in its first eight photos."],
          ["arrival", "Arrival: Garage, Parking & Ski Entry", "All 12 have on-site parking and most mention a garage, in Medium and Low alike. The ceiling comp has a single driveway pad. Parking is eligibility; a ski bench is a cheap add."],
        ]),
      },
      {
        title: "Counterexamples",
        body: "<p>The comps that break the obvious pattern define the boundaries of the buy box.</p>",
        html: () =>
          K.counterexamples([
            ["Main St & Trails", "A dated finish (wood-burning fireplace, maple built-ins), a plain side-yard hot tub and only " + mst.baths + " baths for " + mst.sleeps + ".",
              "Medium, " + kStats("Main St & Trails") + ", the second-highest occupancy in the set.", "Walkable, a garage game room, and a gallery that sells the walk to Main Street outweigh the finish. Less flashy can win if the location and the second space are there."],
            ["Jordanelle Château", "A luxury new build with ski-run and reservoir views, a freestanding soaking tub and a hot tub over the lake, " + chateau.lift_km.toFixed(1) + " km from the gondola.",
              "Low, " + kStats("Jordanelle Château") + ", the lowest rate in the set.", "Near the lift isn't near town. The Jordanelle side caps the rate whatever the product."],
            ["Old Town 3BR Views", views3.main_st_km.toFixed(2) + " km from Main Street, " + views3.baths + " baths, and a view deck over Old Town and Park City Mountain.",
              "Low, " + kStats("Old Town 3BR Views") + ".", "A 1990s interior sleeping only " + views3.sleeps + " prices like the Jordanelle side even on the best address. Location is necessary, not sufficient."],
            ["Steps to Main Street", steps.baths + " baths, " + steps.main_st_km.toFixed(2) + " km from Main Street, a garage and a pro kitchen.",
              "Top of Low, " + kStats("Steps to Main Street") + ".", "Bathrooms without a finish or a second space don't fill nights. Four of its eight photos are the kitchen, and none shows its hot tub."],
            ["Reese Williams House", "The same walk to Main Street as a Medium comp, a restored historic house with a hot tub.",
              "Low, " + kStats("Reese Williams House") + ".", "Great ski access, weak bathrooms: 2 baths for 10 guests (" + reese.guests_per_bath.toFixed(1) + " per bath)."],
            ["Ski-in/out Old Town", "“Ski-in/out” in the title and " + skiin.main_st_km.toFixed(2) + " km from Main Street.",
              "Low, " + kStats("Ski-in/out Old Town") + ".", "The label doesn't carry it (as in the population). Sleeping only " + skiin.sleeps + ", with no second space, it prices well but doesn't fill."],
            ["Dog-Friendly 6BR", "The most bedrooms in the set, a game room, a hot tub, " + dog6.lift_km.toFixed(1) + " km from a lift.",
              "Low, " + kStats("Dog-Friendly 6BR") + ", the lowest occupancy in the set.", "Capacity and a game room without the walk to town don't fill a ski home."],
            ["Chic Town Lift Retreat", "A 3BR sleeping " + chic.sleeps + ", the smallest capacity in the upper tiers, with a gallery that never shows its hot tub.",
              "The top 3–4BR comp, " + kStats("Chic Town Lift Retreat") + ".", "3BR is enough: walkable, a luxury finish and " + chic.guests_per_bath.toFixed(1) + " guests per bath."],
          ]),
      },
      {
        title: "What the Comps Change in the Buy Box",
        body: "<p>Each pre-comp hypothesis tested against the approved comps: <strong>reinforced</strong>, <strong>modified</strong>, <strong>weakened</strong> (as a differentiator) or left <strong>directional</strong>.</p>",
        html: () =>
          csChanges([
            ["Location is the mechanism", "reinforced", "0 of " + KG.not_walkable_n + " comps beyond 2 km of Main Street reach Medium; " + kUp(walkRow) + " of " + walkRow.n + " walkable comps do.", "Buy the location first."],
            ["What “ski access” means", "modified", "The Jordanelle comps are " + KG.jordanelle_lift_km[0].toFixed(1) + "–" + KG.jordanelle_lift_km[1].toFixed(1) + " km from a lift and all Low; lift distance " + csRho(kd("lift_km")) + ".", "Walk to the lift <em>and</em> to dinner: within about 1 km of Main Street, at the Town Lift or Deer Valley Snow Park."],
            ["Walkable beats “ski-in/ski-out”", "reinforced", "Of the two comps claiming ski-in/out, one is Medium and one is Low; the label adds nothing.", "Ignore the label; measure the walk."],
            ["Jordanelle / East Village", "reinforced", "All " + jordRow.n + " Low, ADR " + kUsd(KG.jordanelle_adr[0]) + "–" + kUsd(KG.jordanelle_adr[1]) + ", including two luxury new builds.", "Underwrite at Low-tier revenue, if at all."],
            ["3–4BR core; 3BR+ search", "modified", "3BR " + kUpOf("bedrooms", "3BR") + " Medium/High, 4BR " + kUpOf("bedrooms", "4BR") + "; the top 3–4BR comp is a 3BR.", "3BR is enough; don't pay for a fourth bedroom. Keep 3BR+ as the search."],
            ["5BR+ near the lifts", "modified", "Walkable 5BR built to the group standard: " + ddK(skiViews.revenue) + ". Non-walkable 6BR: " + ddK(dog6.revenue) + ".", "Upside only when walkable and executed; otherwise capacity is unpaid."],
            ["2.5+ bathrooms", "reinforced", "Bathrooms " + csRho(kd("Baths")) + " (" + ddP(kd("Baths").p) + "); no comp above " + upGpbMax.toFixed(1) + " guests per bath reaches Medium; the one 2-bath comp is Low.", "No more than about 3 guests per bath (3+ baths for 10). Buy it."],
            ["Sleeps", "modified", "Both comps sleeping 6–7 are Low; the Medium comps sleep 8–10.", "Sleeps 8–10. A floor, not a lever."],
            ["Hot tub · fireplace · deck", "reinforced", "In all 12 comps.", "Required; table stakes."],
            ["Game room / pool table", "modified", "Pool table " + kAmenOf("Pool table") + "; in the walkable zone, a luxury finish or a second space is " + LS.upper_with + " of " + LS.upper_n + " vs " + LS.low_with + " of " + LS.low_n + ".", "Upgraded from bonus to strong nice-to-have: buy a home with the space for it."],
            ["Finished interior", "reinforced", "Walkable Medium/High: luxury finish " + KW.luxury_finish.upper_with + " of " + KW.luxury_finish.upper_n + "; walkable Low " + KW.luxury_finish.low_with + " of " + KW.luxury_finish.low_n + ". Doesn't lift the Jordanelle side.", "Luxury remodel or a second space; any style."],
            ["Garage / parking", "weakened", "All 12 have on-site parking; garage mentioned in " + kAmenOf("Garage (mentioned)") + ".", "Eligibility check (Old Town), not a revenue lever."],
            ["Views", "weakened", "Scenic view " + csRho(kk("Scenic view")) + "; some of the biggest views are on Low comps (the Jordanelle Reservoir, an Old Town view deck).", "Not a criterion."],
            ["Sauna", "directional", kAmenOf("Sauna") + ".", "Cheap luxury add."],
            ["Ski storage / mudroom", "directional", "Mentioned by " + ka("Ski storage / mudroom (mentioned)").all_n + " comps, one per tier.", "Auto-add."],
            ["Visual Score", "reinforced", "Overall Visual Score " + csRho(kd("pct_visual_score")) + "; High " + Math.round(kd("pct_visual_score").High.median) + "th, Low median " + Math.round(kd("pct_visual_score").Low.median) + "th percentile.", "Not a filter."],
            ["Guest", "reinforced", "Kids about " + Math.round(KT.Low.kids_median) + "% and group trips about " + Math.round(KT.Low.group_median) + "% of reviews in both Medium and Low.", "Adult ski groups and families of 8–10."],
          ]),
      },

      { groupTitle: "Guest" },
      {
        title: "Traveler ICP",
        body:
          "<p><strong>Adult ski groups and families of 8–10.</strong> Kids appear in about a fifth of reviews, much less than for the group home. <strong>The approved comps confirm it and add one thing:</strong> Medium and Low draw the same mix (kids " + Math.round(KT.Medium.kids_median) + "% vs " + Math.round(KT.Low.kids_median) + "%, group trips " + Math.round(KT.Medium.group_median) + "% vs " + Math.round(KT.Low.group_median) + "%), so the guest isn't what separates them. The house is. " +
          "Only the 5BR ceiling comp (" + Math.round(skiViews.group) + "%) and " + dvw.short + " (" + Math.round(dvw.group) + "%) skew heavily to group trips. <strong>What that implies:</strong> real beds and bathrooms for adults who won't share, a hot tub and fireplace for après, a second room to spread out in, gear storage at the door, and a walk to dinner. Review-derived signals, not verified demographics.</p>",
        html: () =>
          ddTableRow([
            ddGuestTable(DS.guest, [["all", "All " + DS.guest.all.n + " listings"], ["top25", "Top 25%"], ["rest", "Below Top 25%"]]),
            '<table class="data-table dd-mini"><thead><tr><th>Approved comps</th><th>Kids</th><th>Group trip</th><th>N</th></tr></thead><tbody>' +
              CS_TIERS.map((t) => '<tr><th scope="row">' + csTierPill(t) + "</th><td>" + Math.round(KT[t].kids_median) + "%</td><td>" + Math.round(KT[t].group_median) + "%</td><td>" + KT[t].n + "</td></tr>").join("") + "</tbody></table>",
          ]),
      },

      { groupTitle: "Projections" },
      {
        title: "Revenue Context from the Approved Comps",
        body:
          "<p><strong>Read the range by location and execution, not as an average.</strong> The simple mean of the 12 comps is " + ddK(kMean) + ". That blends a 5BR ceiling, Jordanelle homes and walkable Old Town homes, and describes none of them.</p><ul>" +
          "<li><strong>Walkable 3–4BR, executed</strong> (a luxury finish or a second space, no more than about 3 guests per bath): the Medium tier, <strong>" + csRange(KT.Medium.rev_min, KT.Medium.rev_max) + " (median " + ddK(KT.Medium.rev_median) + ")</strong>. This is the realistic target for the box.</li>" +
          "<li><strong>Walkable 3–4BR, under-executed:</strong> " + csRange(walkLowRev[0], walkLowRev[walkLowRev.length - 1]) + " (median " + ddK(kMedian(walkLowRev)) + ", " + walkLow.length + " comps). This is the downside if the conversion misses, and the upside case for buying one of these and fixing it (bathrooms permitting).</li>" +
          "<li><strong>Jordanelle / East Village:</strong> " + csRange(jordRow.rev_min, jordRow.rev_max) + " (median " + ddK(jordRow.rev_median) + ") whatever the finish.</li>" +
          "<li><strong>Walkable 5BR+ built to the group-home standard:</strong> " + ddK(skiViews.revenue) + ", a single precedent shared with Buy Box 1. A ceiling, not a target.</li></ul>" +
          "<p><strong>Representative comps across the range:</strong> <a href=\"" + chic.url + "\" target=\"_blank\" rel=\"noopener\">" + chic.short + " ↗</a> (Medium, " + ddK(chic.revenue) + ") · <a href=\"" + steps.url + "\" target=\"_blank\" rel=\"noopener\">" + steps.short + " ↗</a> (top of Low, " + ddK(steps.revenue) +
          ") · <a href=\"" + ev4.url + "\" target=\"_blank\" rel=\"noopener\">" + ev4.short + " ↗</a> (Jordanelle Low, " + ddK(ev4.revenue) + ").</p>" +
          "<p class=\"dd-note\">Revenue Potential is a gross benchmark from the July market snapshot, not an underwriting model or pro forma. Comp tiers describe performance within this approved set. The product population (median " + ddK(s.median) + ") stays as descriptive context. <strong>Purchase price and acquisition underwriting: pending.</strong></p>",
      },

      { groupTitle: "Buy-Box Summary" },
      {
        title: "One-Page Recap",
        body: ddRecap([
          ["Search for", "3BR+ (3–4BR core) within about 1 km of Main Street, at the Town Lift / Park City Mountain or Deer Valley Snow Park, legal for nightly rental"],
          ["Geography", "Old Town / Town Lift and Deer Valley Snow Park. Jordanelle / East Village underwrites at Low-tier revenue (" + csRange(jordRow.rev_min, jordRow.rev_max) + "). Canyons: no comp"],
          ["Walkability", "Walk to the lift and to dinner. A threshold, not a gradient: 0 of " + KG.not_walkable_n + " comps beyond 2 km of Main Street reach Medium. Ignore “ski-in/ski-out” labels"],
          ["BR / BA", "3BR is enough (the top 3–4BR comp is a 3BR); don't pay for a fourth bedroom. No more than about 3 guests per bath (3+ baths for 10), the strongest variable in the comps"],
          ["Sleeps", "8–10. Both comps sleeping 6–7 are Low. Not a headcount play"],
          ["Parking", "On-site parking or a garage (every comp has one). An eligibility check, not a revenue lever. Check snow-season access on site"],
          ["Outdoor / hot tub", "A hot tub on a deck or balcony (all 12 comps). Placement and view don't separate the tiers"],
          ["Must-have amenities", "Hot tub, indoor fireplace, patio / deck / balcony, off-street parking, BBQ"],
          ["Nice-to-haves", "A game room / pool table or media room (strong: pool table in " + kUpperAmen("Pool table") + " of " + kNUp + " upper comps vs " + ka("Pool table").Low_n + " of " + KT.Low.n + " Low); sauna; air conditioning"],
          ["Auto-add", "Ski entry (bench, hooks, boot dryers); outdoor dining furniture on the deck; the pool table once the room exists"],
          ["Design / execution", "Inside the walkable zone: a luxury remodel <em>or</em> a real second space (" + LS.upper_with + " of " + LS.upper_n + " walkable upper comps, " + LS.low_with + " of " + LS.low_n + " walkable Low). Any style. Visual Score is not a filter"],
          ["Guest", "Adult ski groups and families of 8–10 (≈" + Math.round(KT.Low.kids_median) + "% kids, ≈" + Math.round(KT.Low.group_median) + "% group trips in reviews)"],
          ["Approved revenue comps", kBand],
          ["High / Medium / Low", "High = a walkable 5BR built to the Group Home standard (a ceiling, not a target). Medium = walkable and executed: the realistic target. Low = walkable but under-executed (" + csRange(walkLowRev[0], walkLowRev[walkLowRev.length - 1]) + "), or the Jordanelle side / not walkable"],
          ["Rate vs nights", "Location sets the rate (Jordanelle " + kUsd(KG.jordanelle_adr[0]) + "–" + kUsd(KG.jordanelle_adr[1]) + "); inside the walk, the product fills the nights (" + Math.round(KDEC.walkable_mid_vs_low.occ_share) + "% of the walkable Low→Medium gap is occupancy)"],
          ["Purchase price", "Pending"],
        ]),
      },
    ],
    pendingNote: "Revenue comp-set images are from the 12 approved comps' own galleries. Photos elsewhere on this tab are labelled either market reference or approved comp. The full analysis is in notebooks/parkcity_ski_compset.ipynb (comp set) and notebooks/parkcity_buybox_deepdive.ipynb (product population).",
  });
})();
