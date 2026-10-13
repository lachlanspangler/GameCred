"""Build the candidate universe of roguelike games from SteamSpy tag listings."""
from __future__ import annotations

import json
import logging

from . import PROCESSED_DIR
from .sources import steamspy

log = logging.getLogger("gamecred.discover")
UNIVERSE_PATH = PROCESSED_DIR / "universe.json"


def discover(min_reviews: int = 50) -> list[dict]:
    seen: dict[int, dict] = {}
    for tag in steamspy.ROGUE_TAGS:
        listing = steamspy.tag_listing(tag)
        log.info("tag %-22s %5d apps", tag, len(listing))
        for k, v in listing.items():
            appid = int(k)
            rec = seen.setdefault(appid, {**v, "appid": appid, "discovered_via": []})
            rec["discovered_via"].append(tag)
    universe = [g for g in seen.values() if (g.get("positive", 0) + g.get("negative", 0)) >= min_reviews]
    universe.sort(key=lambda g: -(g.get("positive", 0) + g.get("negative", 0)))
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    UNIVERSE_PATH.write_text(json.dumps(universe, indent=0))
    log.info("universe: %d apps with >= %d reviews (of %d discovered)", len(universe), min_reviews, len(seen))
    return universe


def load_universe() -> list[dict]:
    return json.loads(UNIVERSE_PATH.read_text()) if UNIVERSE_PATH.exists() else []
