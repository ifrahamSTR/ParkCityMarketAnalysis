/**
 * Section 6 — Buy-Box Deep Dives (pre-comp-set), attached to BUY_BOXES.
 *
 * Structure follows Charlotte's Lake Buy Box (overview hero -> grouped
 * sections -> recap), with Clearwater's large-home thinking (buy the space
 * vs. add the equipment; Must-Have / Nice-to-Have / Auto-Add) where it fits
 * the 5BR+ product. The two boxes deliberately differ: the Large Group Home
 * is a product/execution spec; the Ski-Access Home is a location spec with a
 * minimum-product standard.
 *
 * Every number is read from DEEPDIVE (deepdive_data.js, generated from
 * ../notebooks/parkcity_buybox_deepdive.ipynb). Photos are reference
 * examples from the market population, chosen after viewing every gallery
 * in both populations — NOT comps. Comp sets are pending analyst input.
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
      " will come from the analyst-curated list. Nothing on this tab is an approved comp: the listings pictured are reference examples from the whole product population, chosen to show execution patterns.</p>",
  });

  // -------------------------------------------------------------------------
  // Buy Box 1 · Large Group Home
  // -------------------------------------------------------------------------
  const group = BUY_BOXES.find((b) => b.id === "group");
  const g = DG.summary;
  Object.assign(group, {
    status: "pre-comp-set",
    overview: {
      statusBadge: "Pre-comp-set specification · comp set and acquisition pricing pending",
      thesis:
        "Buy a real 5–6BR house with the bathrooms and floor plan to host 14–16 people, then run it as a private resort: a hot tub, a genuine entertainment room, and a designed, finished interior. Location is mainly a legality filter here, not the revenue engine.",
      whyItWorks:
        "Inside this product, revenue follows <strong>bathrooms, the entertainment stack and execution</strong>, not headcount: across the product, advertised sleeps barely correlates with revenue. The overall Visual Score doesn't separate winners either (ρ " + gC("Overall Visual Score").rho_full_adj.toFixed(2) +
        " after adjustment). What does is looking like a resort.",
      heroImage: gp("hero", "A multi-zone deck with string lights, a fire pit and lounge seating: the outdoor program that a 14–16-guest group actually uses."),
      chips: [
        { label: "5BR+ · 6BR+ preferred" },
        { label: "≤3.5 guests per bathroom" },
        { label: "Sleeps 14–16" },
        { label: "Hot tub required" },
        { label: "2+ entertainment amenities" },
        { label: "Designed, resort-like interior" },
      ],
      revenueChips: [
        { label: "Product population", value: "N=" + g.n + " · median " + ddK(g.median) },
        { label: "Reach the Top 10%", value: ddOf(g.top10_n, g.n) },
      ],
    },
    pendingSections: [
      { groupTitle: "Acquisition Checklist" },
      {
        title: "Buy the Real Estate for This vs. Add It During Conversion",
        html: () =>
          ddStatStrip(g, "listings in the product") +
          ddChecklist([
            ["5–6+ bedrooms", "buy", "A bedroom count can't be added cheaply; 6BR+ out-earns 5BR.",
              "5BR: " + ddOf(gB("bedrooms", "5BR").top10_n, gB("bedrooms", "5BR").n) + " Top 10% · 6BR+: " + ddOf(gB("bedrooms", "6BR").top10_n + gB("bedrooms", "7BR+").top10_n, gB("bedrooms", "6BR").n + gB("bedrooms", "7BR+").n), "strong"],
            ["Bathrooms: ≤3.5 guests per bath (≈4.5+ baths for 16)", "buy", "The strongest structural signal in the product, and the hardest thing to retrofit.",
              "≤3.5 guests/bath: " + ddOf(gB("guests_per_bath", "≤3.5 guests/bath").top10_n, gB("guests_per_bath", "≤3.5 guests/bath").n) + " Top 10% · 4.6+: " + ddOf(gB("guests_per_bath", "4.6+").top10_n, gB("guests_per_bath", "4.6+").n), "strong"],
            ["A floor plan for 16: great room, dining for 12–16, a second social or game space", "either", "The rooms have to exist; the pool table, arcade and furniture can be added.",
              "2+ entertainment amenities: " + ddOf(gF("2+ entertainment amenities").top25_with, gF("2+ entertainment amenities").n_with) + " Top 25% vs " + ddOf(gF("2+ entertainment amenities").top25_without, gF("2+ entertainment amenities").n_without) + " (" + ddP(gF("2+ entertainment amenities").p_top25) + ")", "strong"],
            ["Deck or yard with room for a hot tub, fire pit and lounge zones", "either", "The footprint and structure are bought; the hot tub and furniture are added.",
              "Hot tub: " + ddOf(gF("Hot tub").top25_with, gF("Hot tub").n_with) + " Top 25% vs " + ddOf(gF("Hot tub").top25_without, gF("Hot tub").n_without) + " (" + ddP(gF("Hot tub").p_top25) + ")", "strong"],
            ["Legal for 14–16 guests at this address", "buy", "Heber City caps occupancy at 16; unincorporated Wasatch County is restrictive by default; Summit Park and Pine Meadow face a proposed ban.", "Section 5 (researched 2026-09-28)", "strong"],
            ["Designed, finished interior (kitchen, great room, bedrooms)", "add", "Addable, but it's the biggest conversion cost. Price it before offering.",
              "Resort-like execution survives full adjustment (ρ " + gC("Resort-like").rho_full_adj.toFixed(2) + ", " + ddP(gC("Resort-like").p_full_adj) + ")", "directional"],
            ["Sauna, pool table, arcade, ping pong", "add", "Equipment that goes into an existing room or yard.",
              "Pool table: " + ddOf(gF("Pool table").top25_with, gF("Pool table").n_with) + " Top 25% · Sauna: " + ddOf(gF("Sauna").top25_with, gF("Sauna").n_with), "directional"],
            ["Sport or pickleball court", "either", "Needs lot area and grading; the court itself is added.", "Pickleball: " + ddOf(gF("Pickleball").top25_with, gF("Pickleball").n_with) + " Top 25% (thin)", "directional"],
            ["Crib, pack 'n play, high chair, board games", "add", "Cheap. Provide them regardless of the evidence.", "No positive signal on its own (see Amenities)", "weak"],
          ]),
      },

      { groupTitle: "Property Profile" },
      {
        title: "Bedrooms, Bathrooms & Capacity",
        body:
          "<p><strong>Bathrooms, not headcount.</strong> Within this product, bathroom count tracks revenue (ρ " + DG.capacity.rho.Baths.toFixed(2) + ") and guests per bathroom tracks it inversely (ρ " + DG.capacity.rho.guests_per_bath.toFixed(2) +
          "). Advertised sleeps barely moves it (ρ " + DG.capacity.rho.Sleeps.toFixed(2) + "): 16-sleepers edge out 14–15 in the table, but headcount isn't the lever, and only " + DG.summary.sleeps_advertised_over_16 +
          " listings even claim more than 16 in the title. <strong>The floor is real:</strong> 5BR+ homes sleeping under 14 are 0 of " + DG.boundary_small_sleeps.n + " in the Top 10%. 6BR+ pulls ahead of 5BR, but on few listings.</p>" +
          "<p><strong>Sleeping layout:</strong> about two beds per bedroom is the norm among winners. Bunk rooms are common: " + DG.capacity.bunk.top25_with + " of " + DG.capacity.bunk.n_with +
          " listings that mention one reach the Top 25%, against " + DG.capacity.bunk.top25_without + " of " + DG.capacity.bunk.n_without +
          " that don't (text-derived, directional). A bunk room is a cheap way to reach 14–16 without adding bathrooms, so check the bathroom count before counting on it.</p>",
        html: () =>
          ddTableRow([
            ddBucketTable(DG.capacity.bedrooms, "Bedrooms"),
            ddBucketTable(DG.capacity.guests_per_bath, "Bathroom pressure"),
            ddBucketTable(DG.capacity.sleeps_boundary, "Sleeps (all 5BR+)"),
          ]),
        images: [
          gp("bunk", "A kids' bunk room. Bunks are the usual route to 14–16 guests, but this listing (3 baths for 16) shows capacity alone isn't enough."),
          gp("dining_12", "Dining for 12+ with the view: a table that seats the whole group is part of the product, not furniture."),
        ],
      },
      {
        title: "Group Usability — Great Room, Kitchen & a Second Space",
        body:
          "<p>Sixteen people need <strong>one room where everyone fits</strong> (a great room open to a long dining table), <strong>a kitchen built for several cooks</strong> (a long island with seating, double ovens) and <strong>somewhere else to go</strong> (a game or media room, or a second living area) so families and groups can coexist. The winners photograph these as distinct spaces; ordinary homes show one living room and a standard kitchen.</p>",
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
          "<p><strong>Style is flexible; execution isn't.</strong> Winners span a dark contemporary mountain home, a true log lodge and a suburban resort home with a pool and courts. What they share is being <em>designed</em>: big glass, vaulted or beamed ceilings, a finished outdoor program. The recurring ordinary product is the builder-grade subdivision house (vinyl siding, stock finishes, a tract lot). It's large and clean, but it isn't an experience.</p>" +
          "<p><strong>Buy the bones, not the finish:</strong> good ceiling heights, glass and an outdoor footprint are real-estate decisions. Furniture and styling can be redone, at a cost.</p>",
        images: [
          gp("arch_contemporary", "Contemporary mountain: dark exterior, clean lines, lit at dusk."),
          gp("arch_lodge", "A traditional log lodge works equally well when it's executed at this level."),
          gp("arch_resort", "A suburban lot turned into a resort: pool, loungers and a play structure. The architecture is ordinary; the program isn't."),
          gp("arch_tract", "Counterexample: a builder-grade subdivision house. Large and well photographed (Visual Score 94), but ordinary revenue."),
        ],
      },
      {
        title: "Outdoor Program",
        body:
          "<p><strong>The hot tub is non-negotiable.</strong> None of the " + gF("Hot tub").n_without + " listings without one reach even the Top 25% (" + ddP(gF("Hot tub").p_top25) + "). Beyond that, winners build <strong>zones</strong>: a lounge with a view, a fire pit circle, a sport or pickleball court, a putting green. Fire pits are common but rarely photographed (only " +
          DG.confirm.fire_pit.confirmed + " of " + DG.confirm.fire_pit.claimed + " claimed fire pits are visible in the gallery), and outdoor dining shows no signal on its own. <strong>Buy the footprint and the deck structure; add the rest.</strong> A hot tub on a plain deck is the minimum, not the standard.</p>",
        images: [
          gp("deck_zones", "A fire-pit lounge on a wraparound deck: an evening zone, separate from the hot tub."),
          gp("hot_tub_view", "A rooftop hot tub framed on the town view: the hot tub sold as part of the view."),
          gp("sport_court", "A private sport court with a mountain backdrop: needs lot area, which is a real-estate decision."),
          gp("hot_tub_plain", "Counterexample: a hot tub on a plain porch. It meets the requirement but builds no experience."),
        ],
      },

      { groupTitle: "Amenities" },
      {
        title: "Amenity Evidence Inside the Product",
        body:
          "<p>Each row compares listings <em>inside this product</em> with and without the feature. These are screening signals, not proven revenue uplift: better-run homes tend to have more of everything. <strong>Photo check:</strong> hot tubs (" +
          DG.confirm.hot_tub.confirmed + " of " + DG.confirm.hot_tub.claimed + ") and game rooms (" + DG.confirm.game_room.confirmed + " of " + DG.confirm.game_room.claimed +
          ") are usually visible in the gallery when claimed. Gyms never are (" + DG.confirm.gym.confirmed + " of " + DG.confirm.gym.claimed + "), so the gym flag is unreliable. <strong>Baseline, not differentiators:</strong> BBQ grill (" + gF("BBQ grill").n_with + " of " + g.n + "), indoor fireplace (" + gF("Indoor fireplace").n_with + ") and air conditioning (" + gF("Air conditioning").n_with + ") are near-universal. Ping pong and arcade games move with the game room (see Must-Have's).</p>",
        html: () =>
          ddFeatureTable(DG.amenities.filter((r) => !["3+ entertainment amenities", "BBQ grill", "Indoor fireplace", "Air conditioning", "Ping pong", "Arcade games"].includes(r.feature)), {
            "Hot tub": ["Must-have", "must"], "2+ entertainment amenities": ["Must-have", "must"], "Game room": ["Must-have space", "must"],
            "Pool table": ["Nice-to-have #1", "nice"], "Sauna": ["Nice-to-have #2", "nice"], "Ping pong": ["Auto-add", "auto"], "Arcade games": ["Auto-add", "auto"],
            "Fire pit": ["Auto-add", "auto"], "Pickleball": ["Nice-to-have (lot)", "nice"], "Gym": ["Unreliable flag", "weak"], "Pool": ["Thin — capex", "weak"],
            "Theater": ["Not supported", "weak"], "Outdoor dining area": ["Auto-add", "auto"], "BBQ grill": ["Baseline", "base"], "Indoor fireplace": ["Baseline", "base"],
            "Pack 'n play / crib": ["Auto-add (cheap)", "auto"], "Air conditioning": ["Baseline", "base"],
          }),
      },
      {
        title: "Must-Have's",
        body:
          "<p>A hot tub, plus <strong>a real entertainment space holding at least two entertainment amenities</strong> (game room, pool table, sauna, pickleball, theater, pool). Homes with two or more reach the Top 25% " +
          ddOf(gF("2+ entertainment amenities").top25_with, gF("2+ entertainment amenities").n_with) + " times, against " +
          ddOf(gF("2+ entertainment amenities").top25_without, gF("2+ entertainment amenities").n_without) + " for those without. The room is the acquisition requirement; the equipment is added.</p>",
        items: ["Hot tub", "Game / entertainment room (the space)", "2+ entertainment amenities", "BBQ grill", "Indoor fireplace"],
        images: [
          gp("game_room_1", "A dedicated game level: ping pong, arcade cabinets, foosball, a bar and a TV lounge in one room."),
          gp("game_room_2", "A pool table and shuffleboard in a second living space, so the kids' zone and the adult lounge can run at once."),
          gp("game_arcade", "Classic arcade cabinets in a log lodge. Cheap to add once the space exists."),
        ],
      },
      {
        ranked: {
          note: "Ranked by Top 25% and median-revenue difference inside the product. Items with fewer than 5 listings on either side are flagged as thin rather than ranked.",
          items: ddRanked(DG.amenities, [
            ["Pool table", "The single strongest amenity signal in the product. Cheap to add once the game-room space exists (pictured under Must-Have's).", []],
            ["Sauna", "A strong luxury signal. A barrel or indoor sauna is an add-on, not a real-estate requirement.", [gp("sauna_1", "An outdoor cabin sauna tucked into the deck."), gp("sauna_2", "A cedar indoor sauna.")]],
            ["Pickleball", "Every listing with a court reaches the Top 25%, but it needs lot area. Directional.", [gp("pickleball", "A pickleball court beside the pool.")], true],
            ["Gym", "Never visible in any gallery, so the flag is unreliable. Not a buying criterion.", [], true],
            ["Pool", "Both listings with a pool are Top 10%, but a pool is heavy capex with a short season. Not a criterion.", [], true],
            ["Theater", "Theater listings don't outperform (1 of 3 reach the Top 25%). Not supported.", [], true],
          ]),
        },
      },
      {
        title: "Auto-Add (Cheap to Provide)",
        body:
          "<p>Low-cost items to provide at conversion regardless of their statistical signal:</p>" +
          "<ul><li><strong>Fire pit and outdoor lounge furniture</strong> — common among winners; the fire pit rarely shows in photos, so photograph it.</li>" +
          "<li><strong>Ping pong, arcade cabinets, board games</strong> — fill the entertainment room.</li>" +
          "<li><strong>Crib, pack 'n play, high chair</strong> — families are a third of these guests. The flag's negative association (" + ddOf(gF("Pack 'n play / crib").top25_with, gF("Pack 'n play / crib").n_with) +
          " Top 25%) reflects which hosts list it, not a penalty.</li>" +
          "<li><strong>Outdoor dining</strong> — shows no signal on its own; provide it as part of the deck program.</li></ul>",
      },

      { groupTitle: "Execution — What Winning Looks Like" },
      {
        title: "Which Visual Signals Separate Winners Inside the Product",
        body:
          "<p>Visual concepts are zero-shot image scores, so treat them as pointers, not measurements. <strong>After adjusting for bedrooms, most design concepts track revenue. After also adjusting for bathrooms and amenities, only “resort-like” holds up</strong> (" + ddP(gC("Resort-like").p_full_adj) + "), with high-end kitchen close behind (" + ddP(gC("High-end kitchen").p_full_adj) +
          "). “Upscale” and “luxury interior” mostly measure a bigger, better-built house. <strong>The overall Visual Score is not a filter:</strong> polished photos of an ordinary house score as high as a true resort home.</p>",
        html: () => ddConceptTable(DG.concepts, DS.concepts, "Ski-Access Home", ["Resort-like", "High-end kitchen", "Unique architecture", "Outdoor entertainment", "Luxury interior", "Upscale appearance", "Modern style", "Overall Visual Score"]),
      },
      {
        title: "Same Size, Same Valley, More Than 3× the Revenue",
        body:
          "<p>Both are 6BR Heber Valley homes sleeping 16, each with a hot tub and a Visual Score above 90; the ordinary one actually scores higher. <strong>The gap is bathrooms and the resort program.</strong> 8 baths against 3.5 is a real-estate difference; four entertainment amenities against two, and the finish, are conversion choices. This is a reference pair from the market population, not a comp.</p>",
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
          ". It has the finish but not the scale: a small lot and one entertainment amenity. <strong>A great kitchen on a tract lot doesn't make a group-home product.</strong></p>",
        images: [
          gp("polished_kitchen", "A modern-farmhouse kitchen that photographs beautifully."),
          gp("polished_yard", "The same home's yard: a pergola hot tub and a putting green squeezed into a small lot."),
        ],
      },

      { groupTitle: "Guest & Location" },
      {
        title: "Traveler ICP",
        body:
          "<p><strong>Multi-family and large-group trips.</strong> Group trips appear in about half of all reviews and kids in about a third. The Top 25% homes lean slightly more toward group trips, the rest slightly more toward kids (directional). <strong>What that implies for the product:</strong> enough bathrooms for two or three families at once, a second social space so adults and kids separate, dining for the whole group, and bunks for the kids. These are review-derived signals, not verified demographics.</p>",
        html: () => ddGuestTable(DG.guest, [["all", "All " + DG.guest.all.n + " listings"], ["top25", "Top 25%"], ["rest", "Below Top 25%"]]),
      },
      {
        title: "Where to Buy — Eligibility First",
        body:
          "<p>Location is a filter for this product, not the engine. 10 of its 11 Top 10% listings are more than 2 km from a lift (see the Section 3 map).</p><ul>" +
          "<li><strong>Heber Valley (" + gArea("Heber Valley").n + " listings, " + gArea("Heber Valley").top10 + " Top 10%)</strong> — the deepest supply. Prefer the edges (the north bench toward Red Ledges, south toward Deer Creek). Confirm city limits: <strong>Heber City caps occupancy at 16</strong>, and unincorporated Wasatch County allows STRs only where zoning and CC&Rs both allow them.</li>" +
          "<li><strong>Snyderville Basin (" + gArea("Snyderville Basin").n + ", " + gArea("Snyderville Basin").top10 + " Top 10%)</strong> — eligible in unincorporated Summit County. Check CC&Rs, since many Basin subdivisions ban nightly rental.</li>" +
          "<li><strong>Summit Park & Pine Meadow (" + (gArea("Summit Park & Pinebrook").n + gArea("Pine Meadow & Rockport").n) + ", " + (gArea("Summit Park & Pinebrook").top10 + gArea("Pine Meadow & Rockport").top10) +
          " Top 10%)</strong> — strong product, but on <strong>regulatory hold</strong> pending Summit County's proposed nightly-rental ban.</li>" +
          "<li><strong>Old Town</strong> — a rare 5BR+ near the lifts fits both boxes; see Buy Box 2. <strong>Avoid Midway</strong> (a shrinking STR overlay zone).</li></ul>",
      },

      COMP_PENDING,
      compPendingSection("the Large Group Home"),

      { groupTitle: "Projections" },
      {
        title: "Product-Population Context (Not an Underwriting Target)",
        body:
          "<p>Descriptive performance of all " + g.n + " listings in the product: median " + ddK(g.median) + ", P25–P75 " + ddK(g.p25) + "–" + ddK(g.p75) + ", median ADR $" + Math.round(g.adr) + " at " + ddPct(g.occ) +
          " occupancy. The underwriting revenue range will come from the analyst comp set. <strong>Purchase price and acquisition underwriting: pending.</strong></p>",
      },

      { groupTitle: "Buy-Box Summary" },
      {
        title: "One-Page Recap",
        body: ddRecap([
          ["Search for", "5BR+ (6BR+ preferred), sleeping 14–16, legal for that occupancy at the address"],
          ["Bathrooms", "≤3.5 guests per bath, about 4.5+ baths for 16. The strongest structural signal, and hard to add"],
          ["Floor plan", "Great room with dining for 12–16, a kitchen with a long island, and a second social or game space"],
          ["Architecture", "Any style. Buy good bones (ceiling height, glass, deck or yard footprint) rather than builder-grade tract product"],
          ["Must-haves", "Hot tub; an entertainment room with 2+ entertainment amenities; BBQ; fireplace"],
          ["Nice-to-haves (ranked)", "Pool table, sauna; pickleball court if the lot allows (thin). Gym, pool and theater are not criteria"],
          ["Auto-add", "Fire pit and outdoor lounge, ping pong and arcade, crib / pack 'n play / high chair, outdoor dining"],
          ["Execution", "Resort-like and designed: the one visual signal that survives adjustment. The Visual Score is not a filter"],
          ["Guest", "Multi-family and large groups (≈50% group trips, ≈35% kids in reviews)"],
          ["Where", "Heber Valley edges and Snyderville (check jurisdiction and CC&Rs). Summit Park and Pine Meadow on hold. Avoid Midway"],
          ["Revenue context", "Product median " + ddK(g.median) + " (P25–P75 " + ddK(g.p25) + "–" + ddK(g.p75) + "). Underwriting range pending the comp set"],
          ["Purchase price", "Pending"],
        ]),
      },
    ],
    pendingNote: "Pre-comp-set deep dive. Photos are reference examples from the market population, not approved comps. The full analysis is in notebooks/parkcity_buybox_deepdive.ipynb.",
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
    pendingNote: "Pre-comp-set deep dive. Photos are reference examples from the market population, not approved comps. The full analysis is in notebooks/parkcity_buybox_deepdive.ipynb.",
  });
})();
