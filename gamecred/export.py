"""Run the analyses and export everything the dashboard needs into dashboard/data.js."""
from __future__ import annotations

import datetime as dt
import json
import logging

from . import DASHBOARD_DIR, PROCESSED_DIR
from .analysis.impact import run_scope, stat_correlations
from .build import load_dataset
from .taxonomy import load_taxonomy

log = logging.getLogger("gamecred.export")
ANALYSIS_PATH = PROCESSED_DIR / "analysis.json"
MIN_SUBGENRE_N = 40


def _r(x, nd=3):
    return round(x, nd) if isinstance(x, float) else x


def _slim_game(g: dict) -> dict:
    return {
        "id": g["appid"], "n": g["name"], "y": g["year"], "p": g["price"], "f": int(bool(g["free"])),
        "dev": g["developer"], "pub": g["publisher"], "sg": g["subgenre"], "src": g["source"], "conf": g["confidence"],
        "wiki": g["wiki"], "rv": g["reviews"], "pr": _r(g["pos_ratio"]), "rt": _r(g["rating"]), "rd": g["review_desc"],
        "own": g["owners_mid"], "ccu": g["ccu"], "rev": _r(g["revenue_est"], 0), "revlo": _r(g["revenue_low"], 0),
        "revhi": _r(g["revenue_high"], 0), "mc": g["metacritic"], "ign": g["ign"], "ea": int(bool(g["early_access"])),
        "q": g["quality_pct"], "c": g["commercial_pct"], "k": g["critic_pct"], "gsi": g["gsi"],
        "tags": g["steam_tags"][:12], "st": g["stats"], "ev": g["evidence"],
        # mechanics: id -> [intensity, confidence*10]
        "m": {k: [v["intensity"], int(round(v["confidence"] * 10))] for k, v in g["mechanics"].items()},
        "img": g["header"],
    }


def export() -> dict:
    games = load_dataset()
    tax = load_taxonomy()
    log.info("analysing %d games", len(games))
    scopes = {
        "all": run_scope(games, min_conf=0.0),
        "high_conf": run_scope(games, min_conf=0.7),
        "curated": run_scope([g for g in games if g["source"] == "curated"], min_conf=1.0),
    }
    by_sub = {}
    for h in tax.hybrids():
        sub = [g for g in games if g["subgenre"] == h]
        if len(sub) >= MIN_SUBGENRE_N:
            by_sub[h] = run_scope(sub, with_synergy=False)
    for metric in ("quality_pct", "commercial_pct"):
        scopes[f"all:{metric}"] = run_scope(games, outcome=metric, with_synergy=False)
    analysis = {"scopes": scopes, "subgenres": by_sub, "stats": stat_correlations(games)}
    ANALYSIS_PATH.write_text(json.dumps(analysis))

    taxo = {"families": [
        {"id": fid, "name": f["name"], "desc": f["desc"], "subfamilies": [
            {"id": sid, "name": s["name"], "mechanics": s["mechanics"]} for sid, s in f["subfamilies"].items()]}
        for fid, f in tax.families.items()],
        "mechanics": {m.id: {"name": m.name, "desc": m.desc, "family": m.family, "subfamily": m.subfamily}
                      for m in tax.mechanics.values()}}
    payload = {
        "generated": dt.datetime.now().isoformat(timespec="seconds"),
        "counts": {"games": len(games), "curated": sum(g["source"] == "curated" for g in games),
                   "mechanics": len(tax.mechanics), "families": len(tax.families)},
        "taxonomy": taxo, "games": [_slim_game(g) for g in games], "analysis": analysis,
    }
    DASHBOARD_DIR.mkdir(exist_ok=True)
    js = "window.GAMECRED = " + json.dumps(payload, separators=(",", ":"), default=str) + ";\n"
    (DASHBOARD_DIR / "data.js").write_text(js)
    log.info("wrote dashboard/data.js (%.1f MB)", len(js) / 1e6)
    return payload
