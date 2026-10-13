"""Collect wiki stats for curated games and the most-reviewed universe games -> data/processed/wikis.json."""
from __future__ import annotations

import json
import logging

from . import PROCESSED_DIR
from .discover import load_universe
from .profiles import load_profiles
from .sources import wiki

log = logging.getLogger("gamecred.wikis")
WIKIS_PATH = PROCESSED_DIR / "wikis.json"


def collect(top_universe: int = 600) -> dict:
    existing = json.loads(WIKIS_PATH.read_text()) if WIKIS_PATH.exists() else {}
    targets = [(int(p["appid"]), p["name"], p.get("wiki")) for p in load_profiles()]
    targets += [(int(g["appid"]), g["name"], None) for g in load_universe()[:top_universe]]
    seen = set()
    for i, (appid, name, url) in enumerate(targets):
        if appid in seen or str(appid) in existing:
            continue
        seen.add(appid)
        info = wiki.discover(name, url)
        rec = {"found": bool(info)}
        if info:
            rec.update({"api": info["api"], "sitename": info["sitename"], "articles": info.get("articles"),
                        "pages": info.get("pages"), "edits": info.get("edits"), "images": info.get("images"),
                        "content": wiki.category_counts(info["api"])})
        existing[str(appid)] = rec
        if i % 25 == 0:
            WIKIS_PATH.write_text(json.dumps(existing))
            log.info("%d/%d wikis checked (%d found)", i, len(targets), sum(r["found"] for r in existing.values()))
    WIKIS_PATH.write_text(json.dumps(existing))
    log.info("done: %d found of %d", sum(r["found"] for r in existing.values()), len(existing))
    return existing


def load() -> dict:
    return json.loads(WIKIS_PATH.read_text()) if WIKIS_PATH.exists() else {}
