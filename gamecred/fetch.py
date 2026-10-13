"""Fetch raw data for every game in the universe (+ curated games). Resumable: cache-first."""
from __future__ import annotations

import logging
import threading
import time

from .discover import load_universe
from .profiles import load_profiles
from .sources import gamalytic, steam, steamspy

log = logging.getLogger("gamecred.fetch")


def target_appids(limit: int | None = None) -> list[int]:
    curated = [int(p["appid"]) for p in load_profiles() if p.get("appid")]
    uni = [int(g["appid"]) for g in load_universe()]
    seen, out = set(), []
    for a in curated + uni:
        if a not in seen:
            seen.add(a)
            out.append(a)
    return out[:limit] if limit else out


def _worker(name: str, fn, appids: list[int], progress: dict):
    for i, a in enumerate(appids):
        try:
            fn(a)
        except Exception as e:  # never let one bad app kill the run
            log.warning("%s %s failed: %s", name, a, e)
        progress[name] = i + 1


def fetch_all(limit: int | None = None) -> None:
    appids = target_appids(limit)
    log.info("fetching %d apps", len(appids))
    jobs = {"steamspy": steamspy.appdetails, "steam_app": steam.appdetails, "steam_reviews": steam.review_summary}
    if gamalytic.available():
        jobs["gamalytic"] = gamalytic.game
    progress = {k: 0 for k in jobs}
    threads = [threading.Thread(target=_worker, args=(k, fn, appids, progress), daemon=True) for k, fn in jobs.items()]
    for t in threads:
        t.start()
    while any(t.is_alive() for t in threads):
        time.sleep(30)
        log.info("progress %s / %d", progress, len(appids))
    log.info("fetch complete")
