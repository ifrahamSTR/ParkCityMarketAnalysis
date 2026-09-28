"""
Generate the webpage's computed data from the Park City overview notebook's
outputs, so no number on the page is hand-copied:

  ../notebooks/region_stats.json          -> js/region_data.js
  ../notebooks/parkcity_overview_map.html -> assets/overview/parkcity_overview_map.html
  ../Park City - UT.xlsx (via pc_common)  -> data/listings.json

Run the notebook first (python ../notebooks/build_overview_notebook.py, then
nbconvert --execute), then this script, from anywhere:
    python scripts/generate_webpage_data.py
Do not hand-edit js/region_data.js or data/listings.json.
"""
import json
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NB = ROOT.parent / "notebooks"
sys.path.insert(0, str(NB))
from pc_common import load, REGION_ORDER, REGION_SHORT  # noqa: E402

stats = json.loads((NB / "region_stats.json").read_text())

REGION_COLORS = {
    "Old Town & Deer Valley": "#C0473F", "Summit Park & Pinebrook": "#2E7D6B", "Jordanelle & Hideout": "#3C6E9E",
    "Pine Meadow & Rockport": "#7A5C2E", "Snyderville Basin": "#8B5FA7", "Midway": "#D07A1F", "Heber Valley": "#5A6B78",
}


def r0(x):
    return None if x is None else round(float(x))


regions = []
for name in REGION_ORDER:
    s = stats["regions"][name]
    regions.append({
        "id": REGION_SHORT[name], "name": name, "color": REGION_COLORS[name],
        "n": int(s["N"]), "share": round(s["share"], 1),
        "medianRev": r0(s["median_rev"]), "meanRev": r0(s["mean_rev"]), "p75Rev": r0(s["p75_rev"]), "maxRev": r0(s["max_rev"]),
        "medianAdr": r0(s["median_adr"]), "medianOcc": round(s["median_occ"]), "medianBr": s["median_br"],
        "medianSleeps": s["median_sleeps"], "revPerBr": r0(s["rev_per_br"]),
        "top10N": int(s["top10_n"]), "top10Rate": round(s["top10_rate"], 1), "top25Rate": round(s["top25_rate"], 1),
        "smallShare": round(s["small_share"]), "bigShare": round(s["big_share"]),
        "hotTub": round(s["hot_tub"]), "sauna": round(s["sauna"]), "gameRoom": round(s["game_room"]), "firePit": round(s["fire_pit"]),
        "superhost": round(s["superhost"]), "cleaningFee": r0(s["cleaning_fee"]),
        "sizeMedian": {k: r0(v) for k, v in stats["size_median"][name].items()},
        "sizeN": stats["size_n"][name],
    })

segments = {}
for key, s in stats["segments"].items():
    segments[key] = {k: (round(v, 1) if isinstance(v, float) else v) for k, v in s.items()}

scatter = [
    {"x": round(p["lift_km"], 2), "y": r0(p["Revenue Potential"] / p["Bedrooms"]), "br": int(p["Bedrooms"]),
     "rev": r0(p["Revenue Potential"]), "region": REGION_SHORT[p["Region"]], "title": p["Listing_Title"]}
    for p in stats["scatter"]
]

payload = {
    "REVENUE_DISTRIBUTION": {
        "totalCount": stats["n"], "medianRevenue": r0(stats["median"]), "p75": round(stats["p75"], 1), "p90": round(stats["p90"], 1),
        "histogram": stats["histogram"],
    },
    "MARKET_STATS": {
        "n": stats["n"], "median": r0(stats["median"]), "p75": r0(stats["p75"]), "p90": r0(stats["p90"]), "max": r0(stats["max"]),
        "medianAdr": r0(stats["median_adr"]), "medianOcc": round(stats["median_occ"] * 100), "medianRating": stats["median_rating"],
        "bedroomMix": stats["bedroom_mix"], "marketSizeMedian": {k: r0(v) for k, v in stats["market_size_median"].items()},
    },
    "DEMOGRAPHICS": {
        "marketWide": {"n": stats["n"], "kids": stats["demographics_market"]["pct_stayed_with_kids"],
                       "group": stats["demographics_market"]["pct_group_trip"],
                       "pet": stats["demographics_market"]["pct_stayed_with_a_pet"],
                       "other": stats["demographics_market"]["pct_other_reviews"]},
        "byBedroom": [{"label": b["label"], "n": b["n"], "kids": b["pct_stayed_with_kids"], "group": b["pct_group_trip"],
                       "pet": b["pct_stayed_with_a_pet"], "other": b["pct_other_reviews"]} for b in stats["demographics_by_bedroom"]],
        "byRegion": [{"label": b["label"], "n": b["n"], "kids": b["pct_stayed_with_kids"], "group": b["pct_group_trip"],
                      "pet": b["pct_stayed_with_a_pet"], "other": b["pct_other_reviews"]} for b in stats["demographics_by_region"]],
    },
    "REGION_RESEARCH": {
        "regions": regions,
        "segments": segments,
        "liftBands": [{"band": b["lift_band"], "n": int(b["N"]), "medianRev": r0(b["median_rev"]), "medianAdr": r0(b["median_adr"]),
                       "top10Rate": b["top10_rate"], "revPerBr": r0(b["rev_per_br"])} for b in stats["lift_bands"]],
        "liftRho": round(stats["lift_rho"], 2),
        "scatter": scatter,
        "amenities": [{"amenity": a["amenity"], "n": a["N"], "uplift": a["size_controlled_uplift_pct"],
                       "top10": a["top10_prevalence"], "rest": a["rest_prevalence"]} for a in stats["amenities"]],
        "top10": [{"region": t["Region"], "br": int(t["Bedrooms"]), "sleeps": int(t["Sleeps"]), "rev": r0(t["Revenue Potential"]),
                   "adr": r0(t["ADR"]), "occ": round(t["Occupancy"] * 100), "title": t["Listing_Title"], "url": t["Listing URL"],
                   "liftKm": round(t["lift_km"], 1)} for t in stats["top10_listings"]],
    },
}

out = ["/**", " * AUTO-GENERATED by scripts/generate_webpage_data.py from", " * ../notebooks/region_stats.json (parkcity_overview.ipynb). Do not hand-edit.", " */"]
for k, v in payload.items():
    out.append(f"const {k} = {json.dumps(v, ensure_ascii=False)};")
(ROOT / "js" / "region_data.js").write_text("\n".join(out) + "\n")

(ROOT / "assets" / "overview").mkdir(parents=True, exist_ok=True)
shutil.copy(NB / "parkcity_overview_map.html", ROOT / "assets" / "overview" / "parkcity_overview_map.html")

df, P75, P90 = load()
listings = [{
    "id": str(r["Property ID"]), "title": str(r["Listing_Title"]), "url": str(r["Listing URL"]),
    "bedrooms": float(r["Bedrooms"]), "revenue": float(r["Revenue Potential"]), "adr": float(r["ADR"]),
    "occupancy": float(r["Occupancy"]), "city": str(r["City"]), "zip": str(int(r["ZIPCODE"])),
    "lat": float(r["Lat"]), "lng": float(r["Long"]), "region": REGION_SHORT[r["Region"]],
    "tier": {"Top 10%": "top10", "Top 25%": "top25"}.get(r["tier"], "bottom75"),
} for _, r in df.iterrows()]
(ROOT / "data").mkdir(exist_ok=True)
(ROOT / "data" / "listings.json").write_text(json.dumps({
    "generatedFrom": "Park City - UT.xlsx (Cleaned_Data sheet)", "n": len(listings),
    "marketWideThresholds": {"p75": round(float(P75), 2), "p90": round(float(P90), 2)}, "listings": listings}))
print(f"wrote js/region_data.js, assets/overview/parkcity_overview_map.html, data/listings.json ({len(listings)} listings)")
