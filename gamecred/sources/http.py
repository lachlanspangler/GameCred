"""Cached, rate-limited, retrying HTTP JSON fetcher shared by all sources."""
from __future__ import annotations

import json
import logging
import time
from pathlib import Path

import requests

from .. import RAW_DIR

log = logging.getLogger("gamecred.http")
_session = requests.Session()
_session.headers["User-Agent"] = "GameCred/0.1 (research; contact via github.com/lachlanspangler/GameCred)"
_last_call: dict[str, float] = {}


def cache_path(source: str, key: str) -> Path:
    p = RAW_DIR / source / f"{key}.json"
    p.parent.mkdir(parents=True, exist_ok=True)
    return p


def get_json(source: str, key: str, url: str, *, min_interval: float = 1.0, max_age_days: float | None = None,
             retries: int = 5, params: dict | None = None):
    """Return parsed JSON for url, using data/raw/<source>/<key>.json as cache.

    A cached response is reused unless older than max_age_days. Corrupt cache files are
    deleted and refetched (self-healing). Transient failures back off exponentially.
    """
    p = cache_path(source, key)
    if p.exists():
        fresh = max_age_days is None or (time.time() - p.stat().st_mtime) < max_age_days * 86400
        if fresh:
            try:
                return json.loads(p.read_text())
            except json.JSONDecodeError:
                log.warning("corrupt cache %s; refetching", p)
                p.unlink()
    delay = 2.0
    for attempt in range(retries):
        wait = min_interval - (time.time() - _last_call.get(source, 0))
        if wait > 0:
            time.sleep(wait)
        _last_call[source] = time.time()
        try:
            r = _session.get(url, params=params, timeout=30)
            if r.status_code == 429 or r.status_code >= 500:
                raise requests.HTTPError(f"HTTP {r.status_code}")
            r.raise_for_status()
            data = r.json()
            p.write_text(json.dumps(data))
            return data
        except (requests.RequestException, ValueError) as e:
            log.warning("%s %s attempt %d failed: %s", source, key, attempt + 1, e)
            time.sleep(delay)
            delay = min(delay * 2, 120)
    return None
