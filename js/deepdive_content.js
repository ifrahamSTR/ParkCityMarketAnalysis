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
 * Buy Box 2 (Ski-Access Home) is still pre-comp-set.
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

  const COMP_PENDING = {
    groupTitle: "Comp Set Analysis",
  };
  const compPendingSection = (what) => ({
    title: "Comp Set Analysis — pending analyst-provided comp set",
    body:
      "<p>The revenue comp set, design comp set and High / Mid / Low comp tiers for " + what +
      " will come from the analyst-curated list. Nothing on this tab is an approved " + what.replace(/^the /, "") + " comp: the listings pictured are reference examples from the whole product population, chosen to show execution patterns. A few are also approved Group Home comps and are labelled as such.</p>",
  });

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
  // Buy Box 2 · Ski-Access Home
  // -------------------------------------------------------------------------
  const ski = BUY_BOXES.find((b) => b.id === "ski");
  const s = DS.summary, core = DS.core_34br, off = DS.location.boundary_2_5km_34br;
  const town = sL("by_area", "Town Lift / Park City Mountain"), jord = sL("by_area", "Deer Valley Jordanelle / East Village");
  const ms1 = sL("by_main_st", "≤0.75 km of Main St"), ms2 = sL("by_main_st", "0.75–1.5 km"), ms3 = sL("by_main_st", "1.5 km+");
  Object.assign(ski, {
    status: "pre-comp-set",
    overview: {
      statusBadge: "Pre-comp-set specification · comp set and acquisition pricing pending",
      thesis:
        "The lift creates the opportunity; the house only has to be good enough to capture it. Buy a 3–4BR within an easy walk of the Town Lift / Main Street or a Deer Valley base. Make sure it has 2.5+ baths, a hot tub, a fireplace and a deck. A finished interior matters; an architectural statement doesn't.",
      whyItWorks:
        "Near the lifts, " + ddPct(s.top25_rate) + " of these homes reach the Top 25%. The same 3–4BR homes 2–5 km out reach it " + ddPct(off.top25_rate) +
        " of the time, at a median ADR of $" + Math.round(off.adr) + " against $" + Math.round(core.adr) + ". The location earns the rate, and a minimum product keeps it.",
      heroImage: sp("hero", "A snow-covered deck looking straight onto the Park City Mountain ski runs: the location is the amenity."),
      chips: [
        { label: "3BR+ (3–4BR core)" },
        { label: "Walk to Town Lift / Main St or Deer Valley" },
        { label: "2.5+ baths" },
        { label: "Hot tub · fireplace · deck or balcony" },
        { label: "Finished interior, any style" },
      ],
      revenueChips: [
        { label: "Product population", value: "N=" + s.n + " · median " + ddK(s.median) },
        { label: "Reach the Top 25%", value: ddOf(s.top25_n, s.n) },
      ],
    },
    pendingSections: [
      { groupTitle: "Acquisition Checklist" },
      {
        title: "Buy the Real Estate for This vs. Add It During Conversion",
        html: () =>
          ddStatStrip(s, "listings in the product") +
          ddChecklist([
            ["Within about 2 km of a lift, ideally a walk to the Town Lift / Main Street", "buy", "This is the whole thesis, and it can't be added later.",
              "Within 0.75 km of Main St: " + ddOf(ms1.top25_n, ms1.n) + " Top 25%. 3–4BR at 2–5 km from a lift: " + ddOf(off.top25_n, off.n), "strong"],
            ["Legal nightly rental at the address", "buy", "Park City zoning decides it: HR-1, R-1, Estate and most RD zones allow nightly rental; SF, HRL McHenry and named RD subdivisions don't. On the Jordanelle side, MIDA and Hideout rules apply.", "Section 5", "strong"],
            ["3–4BR (5BR+ if available)", "buy", "4BR edges out 3BR. The few 5BR+ homes here perform very well but are rare.",
              "3BR: " + ddOf(sB("bedrooms", "3BR").top25_n, sB("bedrooms", "3BR").n) + " Top 25% · 4BR: " + ddOf(sB("bedrooms", "4BR").top25_n, sB("bedrooms", "4BR").n), "directional"],
            ["2.5+ bathrooms", "buy", "Hard to add in a tight Old Town footprint.",
              "2 or fewer baths: " + ddOf(sB("baths", "2 or fewer").top25_n, sB("baths", "2 or fewer").n) + " Top 25% · 2.5+: " + ddOf(sB("baths", "2.5–3").top25_n + sB("baths", "3.5+").top25_n, sB("baths", "2.5–3").n + sB("baths", "3.5+").n), "directional"],
            ["Deck or balcony, fireplace, garage / off-street parking", "buy", "Structural. A gas fireplace insert is possible; parking in Old Town usually isn't.",
              "Every Top 25% home here has a hot tub, a fireplace and a patio or balcony; all " + sF("Garage").n_with + " listings that mention a garage reach the Top 25%", "directional"],
            ["Hot tub", "either", "Needs a deck with structural and electrical capacity; the tub is added.", ddOf(sF("Hot tub").top25_with, sF("Hot tub").n_with) + " with one reach the Top 25%, against " + ddOf(sF("Hot tub").top25_without, sF("Hot tub").n_without), "directional"],
            ["Finished interior (kitchen, living, bedrooms)", "add", "Interior finish is the one visual signal that holds up here.", "Luxury interior ρ " + sC("Luxury interior").rho_full_adj.toFixed(2) + " after full adjustment (" + ddP(sC("Luxury interior").p_full_adj) + ")", "directional"],
            ["Ski storage: entry bench, hooks, boot dryers", "add", "Cheap, and it's what a ski guest actually uses.", "Mentioned by " + ddOf(sF("Ski storage / mudroom").top25_with, sF("Ski storage / mudroom").n_with) + " Top 25% (thin)", "weak"],
          ]),
      },

      { groupTitle: "Location — the Core Mechanism" },
      {
        title: "Lift Access & Walkability",
        body:
          "<p><strong>Walkable beats “ski-in/ski-out”.</strong> Within the 2 km zone, distance to the lift itself shows no gradient. Distance to <strong>Main Street</strong> matters more. Homes within about 0.75 km of Main Street reach the Top 25% " + ddOf(ms1.top25_n, ms1.n) +
          " times (" + ms1.top10_n + " in the Top 10%), at a median ADR of $" + Math.round(ms1.adr) + ". Those 0.75–1.5 km out reach it " + ddOf(ms2.top25_n, ms2.n) + " times, and the three that miss sit up by the Park City Mountain base. The 1.5 km+ group is mostly the Jordanelle side (see below). Listings that <em>say</em> ski-in/ski-out don't outperform (median " + ddK(DS.location.ski_in_out.median_with) + " vs " + ddK(DS.location.ski_in_out.median_without) +
          "). Listings that mention a shuttle or bus have no Top 10% homes (" + ddOf(DS.location.shuttle.top10_with, DS.location.shuttle.n_with) + "), a sign they aren't truly walkable. <strong>The spec: walk to the lift and walk to dinner.</strong></p>",
        html: () => ddTableRow([ddBucketTable(DS.location.by_main_st, "Distance to Main Street"), ddBucketTable(DS.location.by_distance, "Distance to nearest lift")]),
        images: [
          sp("aerial_main_st", "The strongest listings sell the location in their own photos: an aerial with the house pinned on Main Street."),
          sp("deck_view", "An Old Town deck overlooking town and the mountain: walkable to both."),
        ],
      },
      {
        title: "Which Ski Area",
        body:
          "<p><strong>Old Town / Town Lift and Deer Valley Snow Park hold all " + s.top10_n + " Top 10% listings.</strong> The Town Lift / Park City Mountain side has " + ddOf(town.top25_n, town.n) + " in the Top 25% at a median ADR of $" + Math.round(town.adr) +
          ". The <strong>Deer Valley Jordanelle / East Village</strong> side has " + ddOf(jord.top25_n, jord.n) + " in the Top 25% but no Top 10% listings, at $" + Math.round(jord.adr) +
          ". It's newer product, with bigger views and a longer drive to dinner, and the data covers only one East Village season, in a record-low snow year. Treat it as secondary until it has more history. Canyons Village has a single listing here.</p>" +
          "<p><strong>Regulation follows the ski area:</strong> Old Town and Deer Valley fall under Park City's per-unit license and zoning map. The Jordanelle side falls under MIDA and Hideout rules (conflicting guidance, so verify parcel by parcel). Canyons is unincorporated Summit County, which isn't on the proposed ban list.</p>",
        html: () => ddTableRow([ddBucketTable(DS.location.by_area, "Nearest ski area")]),
        images: [
          sp("jordanelle_view", "The Jordanelle-side draw: a big Deer Valley view from the deck."),
          sp("jordanelle_hot_tub", "A hot tub over the Jordanelle Reservoir. A great photo, but lower ADR than Old Town."),
        ],
      },

      { groupTitle: "Minimum Product to Monetize the Location" },
      {
        title: "Bedrooms, Bathrooms & Sleeps",
        body:
          "<p>The evidence is strongest at <strong>3–4BR</strong> (" + core.n + " of the " + s.n + " listings). 4BR edges out 3BR, and the two 5BR+ homes here both perform (too few to generalize). <strong>Bathrooms are the floor that matters:</strong> homes with 2 or fewer baths reach the Top 25% " +
          ddOf(sB("baths", "2 or fewer").top25_n, sB("baths", "2 or fewer").n) + " times. Advertised sleeps shows no gradient: this is a ski group of 6–10, not a headcount play.</p>",
        html: () => ddTableRow([ddBucketTable(DS.capacity.bedrooms, "Bedrooms"), ddBucketTable(DS.capacity.baths, "Bathrooms"), ddBucketTable(DS.capacity.sleeps, "Sleeps")]),
      },
      {
        title: "Living Room, Fireplace & Kitchen",
        body:
          "<p><strong>A fireplace and a finished interior, in any style.</strong> Traditional Old Town interiors (wood kitchens, stone fireplaces, Craftsman trim) earn Top 10% revenue alongside modern ones. What they share is a real fireplace at the center of the living room, a kitchen that is clearly updated, and no dated condo finishes. Every Top 25% home here has a fireplace.</p>",
        images: [
          sp("living_fireplace_lux", "A stacked-stone fireplace wall, open stair and vaulted ceiling: après-ski as the focal point."),
          sp("living_fireplace_trad", "A traditional living room with a fireplace and mountain-facing windows. Not modern, and still Top 10%."),
          sp("kitchen_trad", "A traditional wood kitchen with a pro range and island. Updated, not trendy."),
          sp("kitchen_lux", "A contemporary kitchen with a pro range. The other style that works."),
        ],
      },
      {
        title: "Outdoor, Après & Arrival",
        body:
          "<p><strong>A hot tub on a deck or balcony with a view of the mountain or town</strong> is the standard; every Top 25% home here has one. The garage and off-street parking matter in Old Town, where street parking is scarce (all " + sF("Garage").n_with +
          " listings that mention a garage reach the Top 25%, text-derived). <strong>A practical ski entry</strong> (bench, hooks, boot storage) is cheap to add.</p>",
        images: [
          sp("hot_tub_view", "A hot tub under a stone wall with the ski slopes beyond: après is the product."),
          sp("balcony", "A covered balcony over Old Town. Small, but it's the outdoor space these homes need."),
          sp("garage", "A garage in Old Town. Parking is part of the real estate here."),
          sp("villa_gallery", "A simple ski entry: a bench and hooks by the door. Cheap to add."),
        ],
      },

      { groupTitle: "Amenities" },
      {
        title: "Amenity Evidence Inside the Product",
        body:
          "<p>The few ski-access homes outside the Top 25% are the same small set of basic condos and homes, each missing a hot tub, a fireplace or a deck. That's why those three split identically. <strong>Read them as one minimum standard, not three independent effects.</strong> Entertainment amenities matter far less here than in the group home: a game room or sauna is a bonus, not the product.</p>",
        html: () =>
          ddFeatureTable(DS.amenities, {
            "Hot tub": ["Must-have", "must"], "Indoor fireplace": ["Must-have", "must"], "Patio or balcony": ["Must-have", "must"], "Garage": ["Buy if possible", "nice"],
            "Ski storage / mudroom": ["Auto-add", "auto"], "Air conditioning": ["Nice-to-have", "nice"], "Game room": ["Nice-to-have", "nice"], "Sauna": ["Nice-to-have", "nice"],
            "Fire pit": ["Optional", "auto"], "Outdoor dining area": ["No signal", "weak"], "Mentions a bunk room": ["Optional", "weak"], "Mentions a primary suite": ["Baseline", "base"],
          }),
        items: ["Hot tub", "Indoor fireplace", "Deck / patio / balcony", "2.5+ bathrooms", "Off-street parking"],
      },
      {
        ranked: {
          note: "Inside the ski-access product (N=" + s.n + "), every comparison is thin. These are directional reads, not rankings to underwrite.",
          items: ddRanked(DS.amenities, [
            ["Garage", "Every home that mentions a garage reaches the Top 25%. In Old Town, parking is a real-estate feature.", [], false],
            ["Air conditioning", "Summer matters more after the low-snow winter; a modest signal.", [], false],
            ["Game room", "All four with one reach the Top 25%, but it's a bonus here, not the product.", [sp("game_room", "A small game room with a pool table: fine as a bonus.")], true],
            ["Sauna", "A luxury bonus on a few top homes. Directional.", [], true],
          ]),
        },
      },

      { groupTitle: "Execution — How Much Design?" },
      {
        title: "Finished Interior, Not an Architectural Statement",
        body:
          "<p>Here the location does most of the work, and it shows in the visual signals. <strong>Only “luxury interior” holds up after adjustment</strong> (ρ " + sC("Luxury interior").rho_full_adj.toFixed(2) + ", " + ddP(sC("Luxury interior").p_full_adj) +
          "). Unique architecture, resort-like and outdoor entertainment show nothing, unlike the group home, where resort-like execution is the signal that survives. <strong>The spec is a clean, updated, well-finished interior, not a showpiece.</strong> The Visual Score is not a filter here either.</p>",
        html: () => ddConceptTable(DS.concepts, DG.concepts, "Large Group Home", ["Luxury interior", "Upscale appearance", "Staged interior", "High-end kitchen", "Resort-like", "Unique architecture", "Outdoor entertainment", "Overall Visual Score"]),
      },
      {
        title: "Same Ski Area, 4.5× the Revenue",
        body:
          "<p>Both are 3BR homes a few hundred meters from a Park City Mountain lift. <strong>The strong one has 4 baths, a hot tub, a deck on the ski runs and a finished interior, and sits a short walk from Main Street.</strong> The ordinary one has 2 baths, no hot tub and a basic interior, and sits near the Mountain Village base about 1.5 km from Main Street. Part of the gap is walkability, and part is the minimum product. Both are fixable only at purchase except the finish. This is a reference pair, not a comp.</p>",
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

      { groupTitle: "Guest" },
      {
        title: "Traveler ICP",
        body:
          "<p><strong>Adult ski groups and families of 6–10.</strong> Kids appear in about a fifth of reviews, much less than for the group home, and the rest are group trips and unlabeled stays. <strong>What that implies for the product:</strong> real beds over bunks, a bathroom for every two or three guests, a hot tub and fireplace for après, gear storage at the door, and a walk to dinner. These are review-derived signals, not verified demographics.</p>",
        html: () => ddGuestTable(DS.guest, [["all", "All " + DS.guest.all.n + " listings"], ["top25", "Top 25%"], ["rest", "Below Top 25%"]]),
      },

      COMP_PENDING,
      compPendingSection("the Ski-Access Home"),

      { groupTitle: "Projections" },
      {
        title: "Product-Population Context (Not an Underwriting Target)",
        body:
          "<p>Descriptive performance of all " + s.n + " listings in the product: median " + ddK(s.median) + ", P25–P75 " + ddK(s.p25) + "–" + ddK(s.p75) + ", median ADR $" + Math.round(s.adr) + " at " + ddPct(s.occ) +
          " occupancy. The 3–4BR core has a median of " + ddK(core.median) + ". The underwriting range will come from the analyst comp set. <strong>Purchase price and acquisition underwriting: pending.</strong></p>",
      },

      { groupTitle: "Buy-Box Summary" },
      {
        title: "One-Page Recap",
        body: ddRecap([
          ["Search for", "3BR+ (3–4BR core) within about 2 km of a lift, ideally a walk to the Town Lift / Main Street or Deer Valley Snow Park"],
          ["Location", "Walk to the lift and to dinner. Main Street proximity beats a “ski-in/ski-out” label. Jordanelle / East Village is secondary for now"],
          ["Legality", "Park City zoning and a per-unit license (HR-1, R-1, Estate and most RD zones); MIDA and Hideout rules on the Jordanelle side"],
          ["Bathrooms", "2.5+ baths"],
          ["Must-haves", "Hot tub, fireplace, deck or balcony, off-street parking. One minimum standard"],
          ["Interior", "Finished and updated, in any style. Traditional works as well as modern"],
          ["Nice-to-haves", "Garage, air conditioning; a game room or sauna as a bonus"],
          ["Auto-add", "Ski entry (bench, hooks, boot dryers)"],
          ["Guest", "Adult ski groups and families of 6–10 (≈20% kids in reviews)"],
          ["Revenue context", "Product median " + ddK(s.median) + " (P25–P75 " + ddK(s.p25) + "–" + ddK(s.p75) + "). Underwriting range pending the comp set"],
          ["Purchase price", "Pending"],
        ]),
      },
    ],
    pendingNote: "Pre-comp-set deep dive. Photos are reference examples from the market population, not approved Ski-Access comps; any that are approved Group Home comps are labelled. The full analysis is in notebooks/parkcity_buybox_deepdive.ipynb.",
  });
})();
