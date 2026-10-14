"""Run the analyses and export everything the dashboard needs into dashboard/data.js."""
from __future__ import annotations

import datetime as dt
import json
import logging

from . import DASHBOARD_DIR, DOCS_DIR, PROCESSED_DIR
from .analysis.archetypes import archetypes
from .analysis.money import heatmap, market, mechanic_money
from .analysis.extras import rubric, temporal_holdout, trends
from .analysis.impact import run_scope, stat_correlations
from .analysis.irr import compute as irr_compute
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
        "img": g["header"], "ds": g.get("design_score"), "e": g.get("community_pct"), "wa": g.get("wiki_articles"), "we": g.get("wiki_edits"),
        "wc": g.get("wiki_content") or {},
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
    # Design score: out-of-fold prediction from mechanics + covariates (all-roguelike model).
    oof = (scopes["all"].get("ridge") or {}).pop("oof", {})
    for sc in list(scopes.values()) + list(by_sub.values()):
        (sc.get("ridge") or {}).pop("oof", None)
    for g in games:
        g["design_score"] = round(oof[g["appid"]], 2) if g["appid"] in oof else None
    for metric in ("quality_pct", "commercial_pct"):
        scopes[f"all:{metric}"] = run_scope(games, outcome=metric, with_synergy=False)
    for sc in list(scopes.values()):
        (sc.get("ridge") or {}).pop("oof", None)
    analysis = {"scopes": scopes, "subgenres": by_sub, "stats": stat_correlations(games),
                "archetypes": archetypes(games), "money": {"mechanics": mechanic_money(games), **market(games)},
                "heatmap": heatmap(games), "trends": trends(games), "holdout": temporal_holdout(games), "irr": irr_compute()}
    rub_dir = DOCS_DIR / "rubrics"
    rub_dir.mkdir(exist_ok=True)
    (rub_dir / "all_roguelikes.md").write_text(rubric(scopes["high_conf"], "All roguelikes (high-confidence tags)"))
    for h, sc in by_sub.items():
        (rub_dir / f"{h}.md").write_text(rubric(sc, tax.mechanics[h].name))
    ANALYSIS_PATH.write_text(json.dumps(analysis, default=str))
    from .findings import write as write_findings
    from .textbook import write as write_textbook
    write_textbook(games, analysis)
    write_findings(games, analysis)
    from .ideas import write as write_ideas
    analysis["auto_ideas"] = write_ideas(games, analysis)

    taxo = {"families": [
        {"id": fid, "name": f["name"], "desc": f["desc"], "subfamilies": [
            {"id": sid, "name": s["name"], "mechanics": s["mechanics"]} for sid, s in f["subfamilies"].items()]}
        for fid, f in tax.families.items()],
        "mechanics": {m.id: {"name": m.name, "desc": m.desc, "family": m.family, "subfamily": m.subfamily,
                             "kw": list(m.keywords) + [m.name.lower()] + [t.lower() for t in m.steam_tags]}
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
